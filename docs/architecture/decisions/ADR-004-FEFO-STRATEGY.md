# ADR-004: Batch Allocation Strategy (FEFO) and Concurrency Control (Pessimistic Row Locks)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, inventory domain lead, pharmacist advisor, product owner |
| Related BRQs | BRQ-04, BRQ-05, BRQ-07 |
| Related BR-G | BR-G-06, BR-G-07, BR-G-08, BR-G-10, BR-G-27, BR-G-31 |
| Related CS | CS-01, CS-02, CS-10, CS-11 |
| Related ADRs | ADR-003 |
| Supersedes | — |

## 1. Context

When a sale, a stock transfer dispatch, or a supplier return removes stock of a medicine, the system must decide **which batches** supply the quantity and must do so **safely under concurrency**: up to 20 cashiers per branch can sell simultaneously (NFR-G-02), and the same last unit may be scanned by two cashiers at once (CS-01). Expired batches and batches inside the do-not-sell window must never be allocated for sale (BR-G-07). This ADR covers two coupled decisions: the allocation **policy** and the **locking** mechanism.

## 2. Decision Drivers

1. **Patient safety and waste reduction** — dispense the earliest-expiring sellable stock first.
2. **Zero oversell / zero negative balance** (NFR-G-06) as a hard gate.
3. **Latency** — sale completion p95 ≤ 800 ms (NFR-G-02).
4. **Pharmacist flexibility** — a pharmacist may need a specific batch (e.g., patient preference, a recalled batch being avoided, matching a prescription label) with permission and audit.
5. **Deadlock avoidance** with multi-line sales touching overlapping batches.
6. **Simplicity and testability** of the allocation algorithm.

## 3. Considered Options

### 3.1 Allocation policy

| Option | Pros | Cons |
|---|---|---|
| **A1 — FEFO (First Expired, First Out)** (chosen as default) | Minimizes expiry write-offs; industry norm for perishable medicines; deterministic; aligns with owner vision ("FEFO-based stock allocation") | Ignores purchase cost order (COGS may differ from FIFO); requires reliable expiry data at receiving |
| **A2 — FIFO (First In, First Out by receipt date)** | Matches some accounting conventions; simple | Can dispense later-expiring stock while earlier-expiring stock expires on the shelf — increases waste and expiry risk |
| **A3 — Manual selection always** | Full user control | Slow at POS; error-prone; inconsistent; violates throughput goals; higher risk of selling near-expiry stock arbitrarily |

### 3.2 Concurrency control

| Option | Pros | Cons |
|---|---|---|
| **B1 — Optimistic concurrency** (`xmin` row version, retry on conflict) | No blocking; good when conflicts are rare | Hot medicines at busy branches conflict frequently → retries inflate p99 latency; multi-line retries complex; user-visible failures under load |
| **B2 — Pessimistic row locks** `SELECT … FROM batch_balances … FOR UPDATE` in deterministic order (chosen) | Conflicts serialize only on the affected batch rows; no retry storms; predictable behavior; check constraint gives final guarantee | Locks held for the transaction duration — transactions must be short; deadlock possible if ordering not respected |
| **B3 — SERIALIZABLE isolation** for allocation transactions | Strongest guarantees without explicit locks | Serialization failures (SQLSTATE 40001) under contention require full-transaction retries; predicate locking overhead across many tables in the sale transaction; harder to reason about |

## 4. Decision

### 4.1 Policy
1. **FEFO is the default** for sales, transfer dispatch, and supplier returns (BR-G-06). Ordering key: `ExpiryDate ASC, Batch.CreatedAt ASC, Batch.Id ASC` (fully deterministic).
2. **Eligible batches** for sale (SPEC-04 BR-04-001): not quarantined (`QuarantinedAt IS NULL`), `ExpiryDate > branch business date + DoNotSellWindowDays` (BR-G-07, BR-G-27), sellable quantity `OnHand − Reserved > 0`; the stored status is not used for the decision. `Quarantined` batches are never eligible. Supplier returns are restricted to batches received from that supplier (BR-G-31) and may include expired batches (returning expired stock is a legitimate supplier-return reason).
3. **Override:** a user with `inventory.batches.override-fefo` may select a specific eligible batch; the override is recorded on the allocation and audited (BR-G-16). Ineligible batches can never be selected.
4. Allocation may split one line across several batches; each split is a `SaleLineAllocation` (or transfer/return allocation) with its own unit cost.

### 4.2 Locking
1. Inside the business transaction (READ COMMITTED), the Inventory facade:
   1. Selects candidate batch ids by FEFO order (no lock).
   2. Locks the needed `batch_balances` rows with `SELECT … FOR UPDATE` **ordered by `batch_id` ascending** across all lines of the document (deterministic order prevents deadlocks).
   3. Re-validates eligibility and quantities after locks are acquired; if insufficient, the transaction is rolled back with `INVENTORY.INSUFFICIENT_STOCK` (or `INVENTORY.BATCH_NOT_SELLABLE`).
   4. Decrements `OnHand`, inserts movements (ADR-003), commits.
2. The DB check constraint `on_hand >= 0` is the final guard (BR-G-10, BR-G-08).
3. `lock_timeout` is set (initial value 3 s) for allocation transactions; timeout returns a retryable `COMMON.LOCK_TIMEOUT` (HTTP 503 with `Retry-After: 1`, aligned with SYSTEM-ARCHITECTURE §8 and SPEC-04 FR-04-026) and the client retries with the same `Idempotency-Key` (CS-11).
4. No external calls (payment gateways, file storage, notifications) occur while locks are held; side effects go through the outbox.

## 5. Consequences

**Positive**
- Deterministic, explainable allocation; minimal expiry waste.
- CS-01 behavior is guaranteed: the second concurrent sale waits, re-validates, and fails cleanly.
- No retry storms under contention; predictable latency.

**Negative**
- COGS follows FEFO allocation, not FIFO; finance reports must state this (SPEC-09).
- Lock contention on very hot batches serializes those sales; acceptable at target volumes but must be load-tested.
- Developers must follow the lock-ordering rule; enforced by routing all allocation through the facade.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Deadlocks from inconsistent lock ordering | Single facade method locks all batches for a document in `batch_id` order; deadlock detection test in CS-01 suite |
| Long transactions holding locks (e.g., slow receipt printing) | Printing and notifications after commit; transaction timing metrics; `lock_timeout` |
| Wrong expiry entered at receiving undermines FEFO | VR rules at goods receipt (expiry must be in future, plausibility warnings); batch metadata correction with permission `inventory.batches.update-metadata` and audit |
| Business date / time zone errors make expired stock sellable | Business date computed from branch time zone (BR-G-23); boundary tests at midnight Cairo time (CS-02) |
| Month-only expiry dates on packs | Data-entry rule to be defined in SPEC-04 (candidate: last day of month) — see open decisions |

## 7. Revisit Triggers

- Measured p99 sale completion > 1.5 s due to lock waits at production load.
- A regulatory requirement (REG-03) mandates unit-level serialization or a different dispensing order.
- Business request for FIFO costing in finance independent of physical allocation (would add a costing layer, not change allocation).

## 8. Related Documents

- [ADR-003](ADR-003-INVENTORY-LEDGER.md)
- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §4, §7, §9, §10 (Reserved semantics)
- SPEC-04 Batch & Inventory, SPEC-06 Sales & POS in [specs/](../../specs/)
