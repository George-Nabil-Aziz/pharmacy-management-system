# Integration Test Plan

**Version:** 1.0 (2026-11-10) · **Parent:** [MASTER-TEST-STRATEGY.md](MASTER-TEST-STRATEGY.md)
**Scope:** backend integration, API, database, concurrency, fault-injection, and idempotency tests for all ten modules. UI-driven journeys are in [E2E-TEST-PLAN.md](E2E-TEST-PLAN.md).

## 1. Purpose

These tests verify that application handlers, EF Core, PostgreSQL (constraints, locks, RLS), the outbox, and background jobs behave together as specified. Story testing notes declare about 690 `Integration`, 140 `API`, 35 `Concurrency`, 4 `FaultInjection` and 4 `Multi-node` scenarios; this plan defines how they are executed and gives the cross-module workflows that no single story owns.

## 2. Test harness

| Element | Decision |
|---|---|
| Runner | xUnit v3, one test project per module (`tests/Modules/<Module>.IntegrationTests`) plus `tests/Workflows.IntegrationTests` for cross-module workflows |
| Database | PostgreSQL 17 via Testcontainers. One container per test assembly; schema created by running the real EF Core migration bundle. **RLS enabled and forced**; the app connects as `pms_app` (no `BYPASSRLS`), migrations as `pms_owner` |
| Isolation | Each test class gets a fresh organization (UUIDv7) rather than truncation where possible; Respawn resets between classes for global tables |
| HTTP | `WebApplicationFactory<Program>` with real middleware pipeline; test JWTs issued by the real token service with a test signing key |
| Clock | `FakeTimeProvider` injected; branch time zone `Africa/Cairo` unless the test states otherwise |
| Object storage | MinIO Testcontainer |
| Jobs | Hangfire with in-memory test server, or direct job invocation through the job class (deterministic) |
| Outbox | Dispatcher invoked synchronously by the test (`DrainOutboxAsync()`) to make async effects deterministic |
| Fault injection | EF Core `DbCommandInterceptor` that throws on the Nth command matching a predicate (e.g., the first `INSERT INTO sales.payments`) |
| Concurrency | `Barrier`/`TaskCompletionSource` to release N requests at once; each request uses its own `DbContext`/connection |
| Invariants | `InvariantFixture` runs INV-01..INV-10 (MASTER-TEST-STRATEGY §4) on teardown of every inventory/sales/procurement test |
| Traceability | `[Trait("TS","TS-06-080")]`, `[Trait("CS","CS-01")]` on each test |

## 3. Module contract tests

Every published module contract (in `Modules/<X>/Contracts`) has a consumer-driven contract test in the consuming module's test project.

| Provider → Consumer | Contract | Key assertions |
|---|---|---|
| Inventory → Sales, Prescriptions | `IInventoryAllocation.AllocateAndLock` / `Preview` | FEFO order (ExpiryDate, CreatedAt, Id); exclusions (expired, do-not-sell window, Quarantined, zero sellable); all-or-nothing; shortages listed |
| Inventory → Sales | `PostOutbound`, `ReturnToBatch` | Movements typed `Sale`, `SaleVoid`, `SalesReturn`; restock refused into expired/quarantined batch |
| Inventory → Procurement | inbound find-or-create batch, `SupplierReturn` allocation | Batch merge key; supplier-restricted allocation (BR-G-31) |
| Catalog → Sales, Inventory, Procurement | medicine lookup, price resolution, classification | Branch override → org default; inactive medicine rejected for new documents |
| Organization → all | document number sequence | Gapless per branch/type/year under concurrency (TS-02-044) |
| Identity → all | permission + branch authorization | 403/404 semantics |
| Patients → Sales, Prescriptions | allergy check | Exact-ingredient match; acknowledgement recorded |
| Prescriptions → Sales | dispensing validation | Remaining quantity, verification status, Rx/controlled enforcement |
| Audit (SPEC-10) → all | audit writer | Same-transaction write; rollback removes audit row |

## 4. Database tests

| Area | Tests |
|---|---|
| Migrations | Bundle applies on empty DB; applies on previous release snapshot; idempotent re-run; down-migration where declared |
| Constraints | Each CHECK (balances ≥ 0, quantities > 0, money scale), UNIQUE (barcode per org, batch merge key, document number) has a violating-insert test mapped to its domain error code |
| RLS | Schema inspection: every tenant table `relrowsecurity` and `relforcerowsecurity` true with SELECT/INSERT/UPDATE/DELETE policies; data test: with EF global filters **disabled** via test hook, queries as org A return zero rows of org B (CS-08 defense in depth); `SET LOCAL app.organization_id` missing → zero rows / insert rejected |
| Append-only | UPDATE/DELETE on `stock_movements`, `cash_movements`, `audit_logs`, `supplier_ledger_entries` rejected by trigger/privileges |
| Partitions | Monthly partitions for movements and audit logs created ahead by job; insert into next month succeeds |
| Query plans | Nightly: EXPLAIN for FEFO candidate query, POS search, ledger page, audit search uses the documented indexes (no seq scan at volume dataset) |

## 5. Concurrency tests (CS-01 and related)

| ID | Scenario | Expected | Source |
|---|---|---|---|
| INT-C-01 | 2 cashiers, last unit, simultaneous completion | Exactly one 201; other 409 `INVENTORY.INSUFFICIENT_STOCK`; OnHand 0; one `Sale` movement | TS-06-080, TS-04-026 |
| INT-C-02 | 50 parallel completions for 10 units × 100 runs | Zero oversell; zero negative; sum of sold = 10 each run | TS-06-081 |
| INT-C-03 | 1,000 runs × 20 concurrent multi-line allocations with overlapping medicines in opposite line order | 0 unhandled deadlocks (deterministic BatchId lock order); retries bounded | TS-04-027, TS-06-086 |
| INT-C-04 | Lock wait > 3 s | 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1`; no partial state | TS-06-086 |
| INT-C-05 | Concurrent returns against the same sale line | Serialized; total returned ≤ sold | TS-06-125 |
| INT-C-06 | Void vs return race | One wins; the other 409 | TS-06-117 |
| INT-C-07 | Cash session close vs in-flight sale | Sale either included or rejected 409 `SALES.CASH_SESSION_NOT_OPEN` | TS-06-057 |
| INT-C-08 | Concurrent approvals of the same adjustment/stocktake | One posts; other 409; one set of movements | TS-04-087, TS-04-043 |
| INT-C-09 | Quarantine during in-flight sale on same batch | Quarantine waits for lock; later sales exclude batch | TS-04-119 |
| INT-C-10 | 50 parallel dispensing sales vs 1 remaining pack | Exactly one success | TS-08-068 |
| INT-C-11 | Gapless numbering: 20 workers × 500 postings, 10% rollbacks | No gaps, no duplicates | TS-02-044, TS-06-089 |
| INT-C-12 | Refresh token: 2 parallel refreshes with same token × 100 | Exactly one success per run | TS-01-017 |

## 6. Sales workflow tests (CS-02, CS-05, CS-09)

| ID | Workflow | Key assertions | Source |
|---|---|---|---|
| INT-S-01 | Sell from a medicine whose only batch is expired (branch business date) | 409 `INVENTORY.INSUFFICIENT_STOCK` / `INVENTORY.BATCH_NOT_SELLABLE` for explicit batch; no movement | TS-06-067, TS-06-091, TS-04-023 |
| INT-S-02 | Batch inside do-not-sell window (setting 30 days) | Excluded from FEFO; explicit selection rejected | TS-04-024 |
| INT-S-03 | Midnight boundary: batch expiring today in Cairo while UTC date is yesterday | Treated as expired per branch business date (BR-G-23) | TS-04-004 |
| INT-S-04 | Payments do not cover total / card not confirmed | 422; no sale, no movement, no number consumed (CS-09) | TS-06-076, TS-06-078 |
| INT-S-05 | Client total differs from server re-price | 409 `SALES.PRICE_CHANGED` with fresh quote; nothing persisted | SPEC-06 |
| INT-S-06 | Partial return, second partial return, over-return | Bounds enforced per line; refund amounts pro-rated with discounts; dispositions `PendingInspection` | TS-06-123, TS-06-124 |
| INT-S-07 | Restock disposition into expired or quarantined original batch | Rejected; `Discarded` allowed | TS-06-145 |
| INT-S-08 | Void after a return exists / after session closed | 409 | SPEC-06 |
| INT-S-09 | Discount above role limit without/with manager override | 403 / success with `ManagerOverride` audited | US-06-07 |

## 7. Procurement and transfer tests (CS-03, CS-06)

| ID | Workflow | Key assertions | Source |
|---|---|---|---|
| INT-P-01 | PO approved for 100 packs; receipt 1 for 60, receipt 2 for 40 | PO `PartiallyReceived` then `Received`; two receipts; batches created/merged; movements = receipts | TS-05-053 |
| INT-P-02 | Receipt with expired batch / below minimum shelf life | Rejected unless `procurement.receipts.override-shelf-life` | US-05-05 |
| INT-P-03 | Receipt reversal after partial consumption | Rejected; reversal before consumption creates `ReceiptReversal` | US-05-07 |
| INT-P-04 | Supplier return from batch of another supplier | Rejected (BR-G-31) | SPEC-05 |
| INT-P-05 | Transfer: request → approve (reserve) → dispatch (TransferOut) → receive short | Source reserved then deducted; destination linked batch created with same number/expiry/cost; short quantity handled per SPEC-04 (transit-loss adjustment draft) | TS-04-049, TS-04-148, TS-04-153, TS-04-158 |
| INT-P-06 | Transfer of medicine near expiry inside destination do-not-sell window | Policy check per SPEC-04 | SPEC-04 |

## 8. Prescription tests (CS-04, CS-13)

| ID | Workflow | Key assertions | Source |
|---|---|---|---|
| INT-R-01 | Rx for 60 tablets; visit 1 dispenses 30, visit 2 dispenses 30 | Status `PartiallyDispensed` then `FullyDispensed`; two `DispensingRecord`s linked to sale lines and batches | TS-08-065 |
| INT-R-02 | Dispense more than remaining | 422; nothing persisted | TS-06-159 |
| INT-R-03 | Rx-only medicine sold without prescription (enforcement ON) | Blocked (CS-13) | TS-06-156, TS-08-074 |
| INT-R-04 | Controlled medicine by non-pharmacist / without verified Rx | Blocked; with pharmacist + verified Rx → register entry in same transaction | TS-06-157, TS-06-158, TS-08-075, TS-08-077 |
| INT-R-05 | Void of a dispensing sale | Dispensed quantities restored on prescription items | US-08-14 |

## 9. Fault-injection tests (CS-10)

Each posting operation has a test that injects a failure **after** its stock or money rows are written but **before** commit, and asserts:

- HTTP 500 or 503 with Problem Details;
- zero rows remain from the operation (sale, lines, allocations, movements, payments, cash movements, document number, audit, outbox);
- balances are unchanged and INV-01..10 hold;
- a retry with the same Idempotency-Key then succeeds exactly once.

| Operation | Source |
|---|---|
| Sale completion | TS-06-085 |
| Sale void | TS-06-121 |
| Sales return + refund | TS-06-129 |
| Goods receipt posting | TS-05-029 |
| Stock adjustment / write-off / stocktake posting | TS-04-039, TS-04-040, TS-04-066 |
| Transfer dispatch / receive | TS-04-151 |
| Opening balance posting | TS-04-179 |
| Dispensing | TS-08-072 |

## 10. Idempotency tests (CS-11)

For every endpoint in the idempotency list (API-DESIGN §9):

| ID | Case | Expected |
|---|---|---|
| INT-I-01 | Same key, same body, sequential | Second call returns the stored status/body; one effect |
| INT-I-02 | Same key, different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| INT-I-03 | Same key, concurrent (100 duplicates) | One effect; others replay or 409 in-flight; never two effects (TS-06-083) |
| INT-I-04 | Missing key | 428 `COMMON.PRECONDITION_REQUIRED` |
| INT-I-05 | Key from another user/organization | Treated as a different key (scoped by org + user) |
| INT-I-06 | Key older than 24 h | Treated as new (record purged by cleanup job) |

Sources: TS-04-041…043, TS-05-028, TS-05-033, TS-06-082, TS-06-083, TS-06-118, TS-06-127, TS-06-132, TS-07-100, TS-07-107, TS-07-114, TS-08-072, TS-03-084.

## 11. Outbox, events, and background jobs

| Area | Assertions |
|---|---|
| Outbox | Events written in the same transaction; not dispatched if rolled back; at-least-once dispatch with idempotent consumers (duplicate delivery test) |
| Low-stock / near-expiry jobs | Run per organization with tenant context; de-duplication (one low-stock notification per medicine per branch per 24 h) |
| Expiry flagging | Uses branch business date; idempotent re-run |
| Reconciliation | Injected drift (test-only direct balance update as owner) is detected and a `ReconciliationFinding` + notification is produced |
| Prescription expiry | Expired status after validity days; no effect on already dispensed quantities |
| Audit chain verification | Detects a tampered row (owner-role manual update in test) |
| Multi-node cache invalidation | Permission/assignment/token revocation effective on second node ≤ 60 s (TS-01-021, TS-01-052, TS-01-071, TS-01-073) |

## 12. Financial consistency tests

Property-based tests (FsCheck) on randomized datasets assert the reconciliation identities defined in SPEC-09 (RC-xx), for example:

- Net sales = gross − discounts − returns per row; voided sales contribute 0.00 (TS-09-019).
- COGS = −Σ movement value of `Sale`/`SaleVoid`/`SalesReturn` (TS-09-036).
- Cash session expected cash identity holds (TS-09-046).
- The daily summary projection equals the recomputed values from the OLTP data (TS-09-013).

There is also a golden-file set: fixed scenarios with exact expected totals for sale, return, Z-report, gross profit, and valuation (MASTER-TEST-STRATEGY §10).

## 13. Exit criteria

- 100% of `Integration`, `API`, `Concurrency`, `FaultInjection`, `Database`, `Property` scenarios of in-scope stories are automated and passing.
- INT-C-01…12, INT-S, INT-P (in-scope), INT-R, §9, and §10 are green in CI for the release.
- INV-01..10 have never been violated in the release's CI history (last 14 days).
