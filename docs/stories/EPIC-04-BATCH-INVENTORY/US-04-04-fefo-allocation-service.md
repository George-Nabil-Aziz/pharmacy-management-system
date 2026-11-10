# US-04-04: FEFO allocation service

| Field | Value |
|---|---|
| Story ID | US-04-04 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |
| Related Business Rules | BR-G-06, BR-G-07, BR-G-10, BR-G-23, BR-G-27, BR-G-31, BR-04-001, BR-04-007, BR-04-009, BR-04-010, BR-04-012 |
| Dependencies | US-04-01, US-04-02 |

## User Story
As a sales, transfer, or supplier-return workflow, I want a FEFO allocation contract that picks and locks eligible batches deterministically so that the earliest-expiring sellable stock leaves first and no unit is ever oversold.

## Business Value
Minimizes expiry losses and guarantees zero oversell (NFR-G-06) and zero sale of expired stock (BR-G-07).

## Preconditions
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

## Acceptance Criteria
### US-04-04-AC1: Deterministic FEFO ordering
- **Given** medicine M has eligible batches X (expiry 2027-01-31, created 10:00), Y (2027-01-31, created 09:00), Z (2026-12-31)
- **When** a `Sale` allocation for M is requested
- **Then** candidates are ordered Z, Y, X; when two batches share expiry and CreatedAt, the lower Batch.Id comes first

### US-04-04-AC2: Line split across batches
- **Given** Z has sellable 5 and Y has sellable 20
- **When** 12 units are requested
- **Then** allocations are Z = 5 and Y = 7, each with batchNumber, expiryDate, unitCost, and sellingPriceOverride

### US-04-04-AC3: Ineligible batches excluded (CS-02)
- **Given** business date 2026-11-09, DoNotSellWindowDays 30, and batches E (expiry 2026-11-09), W (expiry 2026-12-09), Q (Quarantined, 2027-05-31), R (OnHand 4, Reserved 4), V (expiry 2026-12-10, sellable 3)
- **When** a `Sale` or `TransferReservation` allocation of 3 is requested
- **Then** only V is allocated; a request of 4 fails with `INVENTORY.INSUFFICIENT_STOCK` listing sellable 3

### US-04-04-AC4: Business date from branch time zone, independent of nightly flag (CS-02)
- **Given** batch E expires 2026-11-09, the branch time zone is `Africa/Cairo`, the clock is 2026-11-08T22:30Z (00:30 local on 2026-11-09), and the 00:05 flagging job has not run (status still `Active`)
- **When** a `Sale` allocation is requested
- **Then** E is excluded; at 2026-11-08T21:30Z (23:30 local on 2026-11-08) E is allocatable

### US-04-04-AC5: All-or-nothing with shortages
- **Given** line L1 (medicine M, 10 units, sellable 10) and line L2 (medicine N, 6 units, sellable 2)
- **When** allocation is requested in allocate mode
- **Then** it returns 409 `INVENTORY.INSUFFICIENT_STOCK` with `shortages` = [{lineKey L2, medicineId N, requested 6, sellable 2}] and nothing is allocated or written

### US-04-04-AC6: Concurrent sale of the last unit (CS-01, with EPIC-06)
- **Given** batch B is the only eligible batch of M with OnHand 1
- **When** two transactions request 1 unit of M simultaneously and each posts a `Sale` movement and commits
- **Then** exactly one succeeds; the other waits on the row lock, re-reads OnHand 0, and fails with `INVENTORY.INSUFFICIENT_STOCK`; final OnHand 0 and exactly one `Sale` movement exists

### US-04-04-AC7: Lock ordering prevents deadlock
- **Given** transaction T1 requests lines [M (batches 7, 3)] then [N (batch 5)] and T2 requests [N] then [M] concurrently
- **When** both allocate
- **Then** each issues one `FOR UPDATE` over the union ordered by BatchId ascending (3, 5, 7); no deadlock (40P01) occurs in 1,000 repetitions

### US-04-04-AC8: Same medicine on two lines
- **Given** M has one eligible batch with sellable 5
- **When** lines L1 (M, 3) and L2 (M, 3) are requested
- **Then** the request fails with `INVENTORY.INSUFFICIENT_STOCK` showing L2 requested 3, sellable 2 (no double counting)

### US-04-04-AC9: Supplier-return purpose
- **Given** M has batches from supplier S: S1 (Expired, sellable-by-balance 4), S2 (Quarantined, 6), and batch T1 from supplier T
- **When** a `SupplierReturn` allocation of 8 for supplier S is requested
- **Then** S1 = 4 and S2 = 4 are allocated in FEFO order and T1 is never considered; without `supplierId` the request is 400 `COMMON.VALIDATION_FAILED`

### US-04-04-AC10: Preview without locks
- **Given** a user with `inventory.stock.read`
- **When** `POST /api/v1/branches/A/inventory/fefo-preview` is called while another transaction holds a lock on the batch
- **Then** the preview returns within 500 ms without waiting for the lock, with proposed allocations and per-batch sellable; a user without `inventory.stock.read` gets 403 `IDENTITY.PERMISSION_DENIED`, and an unassigned branch gets 403 `IDENTITY.BRANCH_ACCESS_DENIED`

### US-04-04-AC11: Selling price override returned
- **Given** batch Y has SellingPriceOverride 95.0000
- **When** Y is allocated
- **Then** its allocation carries `sellingPriceOverride` 95.0000 and allocations from batches without override carry null

## Validation Rules
- Lines 1–200; quantity 1–1,000,000 (VR-04-001); `supplierId` required iff purpose `SupplierReturn`; medicines of the organization (else 404 `COMMON.NOT_FOUND`).

## Authorization Rules
- Allocation: internal contract, caller authorizes its own action (e.g., `sales.pos.sell`). Preview endpoint: `inventory.stock.read` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Not enough sellable stock | 409 `INVENTORY.INSUFFICIENT_STOCK` with shortages |
| Lock wait > 3 s | 503 `COMMON.LOCK_TIMEOUT` |
| Medicine of another organization | 404 `COMMON.NOT_FOUND` |
| Preview without permission / unassigned branch | 403 `IDENTITY.PERMISSION_DENIED` / 403 `IDENTITY.BRANCH_ACCESS_DENIED` |

## Edge Cases
- Stock received after the candidate query is not considered in that call (SPEC-04 E-06).
- Quarantine committed while waiting for the lock removes the batch after re-read (E-07).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-021 | Unit | Property-based: allocations sum to request, follow expiry/CreatedAt/Id order, never include ineligible batch | US-04-04-AC1, US-04-04-AC2 |
| TS-04-022 | Integration | Split allocation across two batches with costs and overrides | US-04-04-AC2, US-04-04-AC11 |
| TS-04-023 | Integration | CS-02: expired-on-business-date, do-not-sell window, quarantined, fully reserved batches excluded | US-04-04-AC3 |
| TS-04-024 | Integration | CS-02: Cairo midnight boundary with injected clock before the flagging job runs | US-04-04-AC4 |
| TS-04-025 | Integration | Multi-line shortage returns all shortages; no writes | US-04-04-AC5 |
| TS-04-026 | Concurrency | CS-01: 2 concurrent transactions for the last unit → one success, one INSUFFICIENT_STOCK, OnHand 0, one movement | US-04-04-AC6 |
| TS-04-027 | Concurrency | CS-01: 1,000 runs × 20 concurrent allocations on 1 unit; overlapping multi-line orders; 0 deadlocks, 0 negatives | US-04-04-AC6, US-04-04-AC7 |
| TS-04-028 | Unit | Same medicine on two lines shares remaining quantity | US-04-04-AC8 |
| TS-04-029 | Integration | SupplierReturn purpose filters supplier, includes Expired/Quarantined; missing supplierId → 400 | US-04-04-AC9 |
| TS-04-030 | Integration | Preview does not block on held locks and writes nothing | US-04-04-AC10 |
| TS-04-031 | API | Preview: 403 without permission, 403 unassigned branch (CS-07), 404 other-org medicine (CS-08) | US-04-04-AC10 |
| TS-04-032 | Performance | NFR-04-001: 10 lines × 50 candidates p95 ≤ 50 ms at 500,000 batches | US-04-04-AC1 |
