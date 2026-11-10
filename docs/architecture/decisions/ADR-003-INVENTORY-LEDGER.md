# ADR-003: Inventory Ledger — Append-Only Stock Movement Ledger with Transactionally Maintained Batch Balances

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, inventory domain lead, product owner |
| Related BRQs | BRQ-04, BRQ-05, BRQ-10, BRQ-12 |
| Related BR-G | BR-G-03, BR-G-04, BR-G-05, BR-G-08, BR-G-09, BR-G-10, BR-G-25 |
| Related ADRs | ADR-001, ADR-004, ADR-007 |
| Supersedes | — |

## 1. Context

Inventory is tracked per **Batch** (one medicine, one branch, one batch number, one expiry date, one unit cost). Every quantity change must be traceable to its source document (BR-G-05), must never be silently edited (BR-G-25), and must be consistent with the current on-hand quantity used for selling decisions (BRQ-05). Reports need both "what is on hand now" (POS, NFR-G-01: 500,000 batches per organization) and "what happened, when, and why" (movement history, inventory valuation at a point in time, COGS).

The owner's Master SDD §8 already separates Medicine, Batch, Inventory Balance, and Stock Movement, and requires balances to be "maintained transactionally and reconciled against the movement ledger". This ADR formalizes that.

## 2. Decision Drivers

1. **Correctness under concurrency** — zero oversell, zero negative balance (NFR-G-06, CS-01).
2. **Read performance** — sellable quantity per medicine must be computable in milliseconds at POS.
3. **Full traceability** — every change linked to document, line, user, time, business date.
4. **Point-in-time reporting** — inventory valuation and stock as of any past date.
5. **Simplicity of the write path** — one transaction, no asynchronous projection on the critical path.
6. **Auditability and immutability** — ledger rows never updated or deleted.

## 3. Considered Options

### Option A — Balance-only (mutable quantity column per batch, optional free-text history)
- **Pros:** Simplest; fastest reads and writes.
- **Cons:** No reliable trace of why quantity changed; impossible to reconstruct historical valuation; corrections overwrite history (violates BR-G-05, BR-G-25); disputes and shrinkage investigations unsupported.

### Option B — Event-sourced inventory (events are the only source of truth; balances are asynchronous projections)
- **Pros:** Complete history by construction; rebuildable projections; temporal queries natural.
- **Cons:** Sellable quantity derived from an eventually consistent projection cannot safely gate sales — oversell risk unless the aggregate is rehydrated per allocation (costly for medicines with many batches); requires event store infrastructure, snapshotting, versioning, and upcasting; steep learning curve for the team; reporting tooling must read projections.

### Option C — Ledger + balance (chosen): append-only `StockMovement` plus `BatchBalance` updated in the same transaction
- **Pros:** Authoritative, strongly consistent balance for allocation (row lock + check constraint); full immutable history for audit and reports; each movement stores `BalanceAfter` enabling fast point-in-time reads per batch; simple relational model; reconciliation detects drift.
- **Cons:** Two writes per change (movement + balance) — dual-write is safe only because both are in one transaction; risk of drift if any code path bypasses the inventory service; ledger table grows large (partitioning required eventually).

### Option D — Ledger only, balance computed on read (`SUM(quantity_delta)`)
- **Pros:** Single source of truth; no drift.
- **Cons:** Aggregation over large ledgers at POS time breaches NFR-G-01; locking for allocation has no single row to lock (would need advisory locks); poor scalability.

## 4. Decision

Adopt **Option C**:

1. **`inventory.stock_movements`** is append-only: no `UPDATE`/`DELETE` granted to the application role; corrections are compensating movements (e.g., `ReceiptReversal`, `SaleVoid`). Columns per conventions §6.2, including signed `QuantityDelta` in base units, `UnitCost`, `BalanceAfter`, source document references, `BusinessDate`, `UserId`, `CorrelationId`.
2. **`inventory.batch_balances`** (one row per batch) holds `OnHand` and `Reserved` with check constraints `on_hand >= 0`, `reserved >= 0`, `reserved <= on_hand`.
3. **Single write path:** all quantity changes go through the Inventory module's public facade (`IInventoryLedger` / allocation service), which in the caller's transaction (ADR-001): locks balance rows (ADR-004), validates, updates `BatchBalance`, inserts `StockMovement` with `BalanceAfter`. No other module writes these tables.
4. **Atomicity:** the movement, the balance update, the business document, and the audit entry commit together (BR-G-09, BR-G-16, BR-G-19).
5. **Reconciliation:** a nightly Hangfire job (ADR-007) verifies, per batch, `OnHand = Σ QuantityDelta` and the last movement's `BalanceAfter = OnHand`. Any mismatch raises a critical notification and an audit entry; it is **never auto-corrected** — an authorized stock adjustment is required.
6. **Valuation:** per-batch actual unit cost (from goods receipt; transfers carry source cost per BR-G-04). COGS uses the allocated batch's unit cost (`SaleLineAllocation.UnitCost`).
7. **Growth:** `stock_movements` is range-partitioned monthly by `business_date` from the first release (DATABASE-DESIGN §11), carries a per-batch gap-free `BatchSequence` (SPEC-04 FR-04-006), and has indexes `(organization_id, branch_id, batch_id, occurred_at)` and `(organization_id, source_document_type, source_document_id)`.

## 5. Consequences

**Positive**
- Strongly consistent, lockable balance for POS and allocation.
- Complete, immutable trace for audits, investigations, and point-in-time valuation.
- Reconciliation offers continuous verification of the invariant.

**Negative**
- Every inventory-affecting feature depends on the Inventory facade; facade API design is critical-path work in the Catalog & Inventory phase.
- Ledger storage growth requires partitioning and archival strategy (retention pending REG-05).
- Historical corrections produce visible compensating rows that users must be trained to read.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Code path updates balance without movement | Only the facade has write access (architecture test); DB trigger optionally asserts movement exists in same transaction (evaluated in hardening phase) |
| Drift from bugs or manual DB edits | Nightly reconciliation; DB role without UPDATE/DELETE on ledger; audit of DBA access |
| Ledger table size degrades queries | Partitioning by business date; covering indexes; reports on projections (`DailyBranchSummary`) |
| `BalanceAfter` wrong under concurrent writes to same batch | Row lock on `BatchBalance` held while computing `BalanceAfter` (ADR-004) |

## 7. Revisit Triggers

- Ledger exceeds ~200 million rows in a single partitioned table or reconciliation exceeds its nightly window.
- Requirement for real-time cross-system inventory streaming (would favor publishing ledger rows as outbox events, not changing the model).
- Regulatory traceability (REG-03) requiring unit-level serialization, which would add a serial-number dimension beneath batches.

## 8. Related Documents

- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §6, §6.2, §6.3
- [ADR-004](ADR-004-FEFO-STRATEGY.md) — allocation and locking
- [ADR-007](ADR-007-BACKGROUND-JOBS.md) — reconciliation job
- SPEC-04 Batch & Inventory in [specs/](../../specs/)
- Source input: `docs/2. Master SDD.md` §8
