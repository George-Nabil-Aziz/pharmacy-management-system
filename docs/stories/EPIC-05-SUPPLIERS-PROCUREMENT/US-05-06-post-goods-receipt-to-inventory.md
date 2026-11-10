# US-05-06: Post a goods receipt to inventory

| Field | Value |
|---|---|
| Story ID | US-05-06 |
| Epic | EPIC-05 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |
| Related Business Rules | BR-05-005, BR-05-008, BR-05-009, BR-05-010, BR-05-011, BR-G-04, BR-G-05, BR-G-09, BR-G-16, BR-G-19, BR-G-24 |
| Dependencies | US-05-04, US-05-05, SPEC-04 (Inventory receipt contract), SPEC-02 (DocumentSequence), SPEC-03 (LastPurchaseCost) |

## User Story
As an Inventory Staff member, I want to post a checked goods receipt so that the received batches become available stock in my branch with full traceability to the supplier and the receipt.

## Business Value
Posting is the single entry point of purchased stock. Atomicity and idempotency guarantee that stock, cost, and supplier attribution are never half-written or duplicated, even with unreliable connectivity in branches.

## Preconditions
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

## Acceptance Criteria

### US-05-06-AC1: Atomic posting creates batches and movements
- **Given** a Draft receipt in CAI01 with 2 lines: medicine M1 batch "B1" 10+1 packs (PackSize 20, net 969.00) and medicine M2 batch "C7" 5 packs (PackSize 10, net 250.00), and no existing matching batches
- **When** the user POSTs `/post` with a new `Idempotency-Key`
- **Then** the response is 200 with status Posted and number `CAI01-RCV-2026-NNNNNN` (next gapless value), two new Active batches with `SupplierId` = receipt supplier and unit costs 4.4045 and 5.0000, balances OnHand 220 and 50, exactly two `Receipt` movements referencing the receipt and line ids, M1/M2 `LastPurchaseCost` updated, one audit entry, and one outbox message `procurement.goods-receipt.posted`

### US-05-06-AC2: Merge into existing batch only on full key match
- **Given** branch CAI01 has batch X (M1, "B1", 2028-11-30, unit cost 4.4045, same supplier, Active, OnHand 30) and batch Y (M1, "B1", 2028-11-30, unit cost 4.2000, same supplier)
- **When** a receipt line for M1 "b1 " 2028-11-30 with effective unit cost 4.4045 from the same supplier is posted, and another line identical except from a different supplier is posted
- **Then** the first line increments batch X (OnHand 30 + received base units) and creates no new batch; the second line creates a new batch with the other supplier's id; batch Y is unchanged

### US-05-06-AC3: Quarantined batch match rejected
- **Given** a Quarantined batch matching the merge key of a receipt line
- **When** the receipt is posted
- **Then** the response is 422 `PROCUREMENT.BATCH_QUARANTINED` for that line and no part of the receipt is posted

### US-05-06-AC4: Idempotent retry (CS-11)
- **Given** a posting request that succeeded but whose response was lost by the client
- **When** the client retries 3 times with the same `Idempotency-Key` and identical body, and once with the same key but a different body
- **Then** the three retries return 200 with the identical response body (same number, same batch ids) and the database holds exactly one set of movements, batches, and one number; the different-body request returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`

### US-05-06-AC5: Concurrent posting of the same receipt
- **Given** a Draft receipt
- **When** two users post it simultaneously with different `Idempotency-Key` values
- **Then** exactly one request returns 200; the other returns 409 `PROCUREMENT.RECEIPT_NOT_DRAFT`; exactly one `Receipt` movement exists per line

### US-05-06-AC6: Failure rolls back everything
- **Given** a Draft receipt with 3 lines and a fault injected after the second line's movement is written
- **When** the receipt is posted
- **Then** the response is 500, the receipt remains Draft with no number, no batch, balance, movement, PO quantity, `LastPurchaseCost`, audit, or outbox change persists, and the next successful posting in the branch receives the number that would have been used (no gap)

### US-05-06-AC7: Permission and branch isolation
- **Given** a user with `procurement.receipts.create` but not `procurement.receipts.post`, a user assigned only to ALX01, and a receipt id of another organization
- **When** each posts the CAI01 receipt (or the other-organization id)
- **Then** the responses are 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN`, and 404 `COMMON.NOT_FOUND`, and nothing is posted

## Validation Rules
All of US-05-04 and US-05-05 re-evaluated at posting (FR-05-015); `Idempotency-Key` required (VR-05-032); supplier Active (FR-05-006).

## Authorization Rules
- `procurement.receipts.post` plus branch assignment; `procurement.receipts.override-shelf-life` if any line has an override.
- A receipt id that exists in the organization but in another branch than the route returns 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Same key, different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Receipt already Posted/Reversed | 409 `PROCUREMENT.RECEIPT_NOT_DRAFT` |
| Matching Quarantined batch | 422 `PROCUREMENT.BATCH_QUARANTINED` |
| Supplier Inactive / medicine Inactive | 422 `PROCUREMENT.SUPPLIER_INACTIVE` / `PROCUREMENT.MEDICINE_INACTIVE` |
| Stale If-Match (if supplied) | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Unexpected failure | 500, full rollback |
| Missing permission / branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- A Depleted batch matching the merge key becomes Active after increment.
- Two lines in the same receipt with the same merge key both increment the same batch, producing two movements (one per line).
- Lock order (receipt → document sequence → PO lines → batch balances by batch id) is fixed to avoid deadlocks with concurrent sales and transfers.
- Bonus-only line with cost 0.0000 merges only with a 0.0000-cost batch.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-026 | Integration | Post 2-line receipt; verify number, batches, balances, movements (type, sign, source ids), LastPurchaseCost, audit, outbox | US-05-06-AC1 |
| TS-05-027 | Integration | Merge-key matrix: each key component differing (batch no., expiry, cost, supplier, status Depleted/Quarantined) | US-05-06-AC2, US-05-06-AC3 |
| TS-05-028 | Integration (CS-11) | 10 parallel + 3 sequential retries with same key → one effect, identical responses; same key different body → 422 | US-05-06-AC4 |
| TS-05-029 | Integration (CS-10) | Concurrent post of same receipt → one 200, one 409; fault injection mid-posting → full rollback and no number gap | US-05-06-AC5, US-05-06-AC6 |
| TS-05-030 | Security | post-permission missing 403; unassigned branch 403 (CS-07); other-org receipt 404 (CS-08) | US-05-06-AC7 |
