# US-04-22: Transfer receipt with short, over, and rejected quantities

| Field | Value |
|---|---|
| Story ID | US-04-22 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | L |
| Related Requirements | FR-04-055, FR-04-056, FR-04-057 |
| Related Business Rules | BR-G-04, BR-G-13, BR-G-25, BR-04-005, BR-04-020, BR-04-021, BR-04-031, BR-04-032 |
| Dependencies | US-04-21, US-04-03, US-04-13 |

## User Story
As the destination branch inventory staff, I want to receive a transfer, record any missing, damaged, or wrong items, so that my branch gets exactly what arrived and every unit dispatched is accounted for.

## Business Value
Completes BR-G-13 with full conservation of stock across branches (CS-06) and lineage-preserving batches (BR-G-04).

## Preconditions
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

## Acceptance Criteria
### US-04-22-AC1: Full receipt into linked destination batch
- **Given** T (A → C) dispatched B1 = 25 (number `X1`, expiry 2027-01-31, cost 12.5000, override 95.0000) and C has no batch with SourceBatchId = B1
- **When** user R with `inventory.transfers.receive` assigned to C records received 25 with an `Idempotency-Key`
- **Then** a batch C1 is created in C with the same number, expiry, unit cost, supplier, override and SourceBatchId = B1; a `TransferIn` +25 movement is written; status becomes `Received`

### US-04-22-AC2: Partial then final receipt with shortage (CS-06)
- **Given** T dispatched B1 = 25 and B2 = 15
- **When** R records receipt 1 (B1 received 25, B2 received 10) and later a final receipt (B2 short 5)
- **Then** after receipt 1 status is `PartiallyReceived` with outstanding 5; after the final receipt a `TransferReturn` +5 is posted into source batch B2, a draft `StockAdjustment` (Decrease 5, reason `TransitLoss`, OriginTransferId T) is created in A, and status becomes `Received`

### US-04-22-AC3: Rejected damaged items
- **Given** 3 of B1's 25 units arrive broken
- **When** R records received 22 and rejected 3 with reason `Damaged`
- **Then** `TransferIn` +22 into C1 and `TransferReturn` +3 into B1 are posted, and a draft `WriteOff` (Damaged, 3 units of B1, OriginTransferId T) is created in A

### US-04-22-AC4: Over-receipt rejected
- **Given** B2 has outstanding 5
- **When** R records received 6 for B2
- **Then** the response is 422 `INVENTORY.TRANSFER_OVER_RECEIPT`, nothing is written, and the receiver records surplus separately via a `FoundStock` adjustment if physically present

### US-04-22-AC5: Second transfer increments the same destination batch
- **Given** C1 exists from an earlier transfer of B1 with OnHand 10
- **When** a new transfer of 8 units of B1 is received
- **Then** C1 is incremented to 18 (no new batch), and a directly received batch with the same number in C remains separate

### US-04-22-AC6: Conservation holds
- **Given** any sequence of receipts, rejections, and shortages on T
- **When** T reaches `Received`
- **Then** Σ TransferOut = Σ TransferIn + Σ TransferReturn and every allocation satisfies DispatchedQty = Received + Rejected + Short

### US-04-22-AC7: Wrong side and organization
- **Given** user S assigned only to source A with `inventory.transfers.receive`, and a transfer id of another organization
- **When** each records a receipt
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`; a user at C without the permission gets 403 `IDENTITY.PERMISSION_DENIED`

### US-04-22-AC8: Idempotent receipt (CS-11)
- **Given** receipt 1 was committed but the response was lost
- **When** the client retries with the same key
- **Then** the stored response is returned and C1 is incremented only once

## Validation Rules
- VR-04-015; short quantities only with `final: true`; rejection reason code from SPEC-04 §8.4, note ≥ 10 characters for `Other`.

## Authorization Rules
- `inventory.transfers.receive` + assignment to destination branch. Auto-created drafts in the source branch are owned by the system with CreatedBy = receiver and follow normal source-branch approval.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Quantities exceed outstanding | 422 `INVENTORY.TRANSFER_OVER_RECEIPT` |
| Short on non-final receipt | 422 `INVENTORY.TRANSFER_QUANTITY_INVALID` |
| Transfer not `InTransit`/`PartiallyReceived` | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Source-side user | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Missing key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |

## Edge Cases
- The source batch was quarantined during transit: `TransferReturn` is still accepted and the batch stays non-sellable (BR-04-032); the destination batch inherits no quarantine (recall in US-04-17 covers lineage by batch number).
- Received stock whose expiry is inside the destination's do-not-sell window is received but non-sellable.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-152 | Integration | Full receipt creates linked destination batch with inherited fields; status Received | US-04-22-AC1 |
| TS-04-153 | E2E | CS-06: partial receipt then final short → TransferReturn + TransitLoss draft; statuses PartiallyReceived → Received | US-04-22-AC2 |
| TS-04-154 | Integration | Rejected damaged → TransferReturn + draft Damaged write-off in source | US-04-22-AC3 |
| TS-04-155 | API | Over-receipt → 422, no writes | US-04-22-AC4 |
| TS-04-156 | Integration | Second transfer increments same destination batch; direct batch stays separate | US-04-22-AC5 |
| TS-04-157 | API | CS-07 source-side user → 403; permission → 403; CS-08 → 404 | US-04-22-AC7 |
| TS-04-158 | Unit | CS-06: property-based conservation over random receipt/reject/short sequences | US-04-22-AC6 |
| TS-04-159 | API | CS-11: receipt retried with same key increments once | US-04-22-AC8 |
