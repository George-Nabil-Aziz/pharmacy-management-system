# US-04-11: Stock adjustments with reason codes

| Field | Value |
|---|---|
| Story ID | US-04-11 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |
| Related Business Rules | BR-G-05, BR-G-08, BR-G-16, BR-G-28, BR-04-013, BR-04-014, BR-04-015, BR-04-030, BR-04-031 |
| Dependencies | US-04-03, US-04-06 |

## User Story
As an inventory staff member, I want to record stock adjustments with a reason so that system quantities match physical stock with full accountability.

## Business Value
Corrects discrepancies (counting errors, losses, found stock) under control (BR-G-28) and keeps the ledger explainable.

## Preconditions
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

## Acceptance Criteria
### US-04-11-AC1: Below-threshold adjustment posts immediately
- **Given** threshold 1,000.00 and a draft with one line: batch B (UnitCost 12.5000, OnHand 50) Decrease 4, reason `TheftOrLoss`
- **When** a user with `inventory.adjustments.create` submits it with an `Idempotency-Key`
- **Then** value is 50.00, status becomes `Posted`, number `{BranchCode}-ADJ-2026-NNNNNN` is assigned, an `AdjustmentDecrease` −4 movement is written, OnHand = 46, and an audit entry is written in the same transaction

### US-04-11-AC2: Above-threshold adjustment goes to approval
- **Given** a draft whose value is 1,000.01
- **When** it is submitted
- **Then** status becomes `PendingApproval`, a number is assigned, no movement is written, and `Inventory.InventoryDocumentPendingApproval.v1` is emitted for approvers of the branch

### US-04-11-AC3: Controlled medicine always requires approval
- **Given** a draft of value 10.00 whose line concerns a medicine flagged controlled
- **When** it is submitted
- **Then** status becomes `PendingApproval` (REG-02 pending)

### US-04-11-AC4: Decrease beyond available rejected
- **Given** batch B has OnHand 10 and Reserved 8
- **When** a Decrease of 3 is submitted
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK` (available 2) and the document stays `Draft`

### US-04-11-AC5: Reason `Other` requires a note
- **Given** a line with reason `Other` and note "fix" (3 characters)
- **When** the draft is saved
- **Then** the response is 422 `INVENTORY.REASON_REQUIRED`

### US-04-11-AC6: Increase into a new batch (found stock)
- **Given** a line with reason `FoundStock`, no batch id, and new-batch details (`F9`, expiry 2027-10-31, cost 6.0000, qty 12)
- **When** the adjustment posts
- **Then** a batch `F9` is created (or matched by receipt key) with an `AdjustmentIncrease` +12 movement

### US-04-11-AC7: Reclassification pair
- **Given** batch B (number `X1`, wrong expiry 2027-01-31, OnHand 30, two movements) and a reclassification pair: Decrease B by 30, Increase new batch `X1` with expiry 2027-07-31 at the same cost
- **When** it posts
- **Then** B ends at OnHand 0 (`Depleted`), the new batch has OnHand 30, both movements reference the same document, and a pair with unequal quantities returns 422 `INVENTORY.RECLASSIFICATION_INVALID`

### US-04-11-AC8: Authorization
- **Given** a pharmacist without `inventory.adjustments.create`, an inventory user not assigned to branch B, and an adjustment id from another organization
- **When** each attempts to create or submit
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-001, VR-04-009, VR-04-010, VR-04-012, VR-04-013; new-batch fields VR-04-002..006.

## Authorization Rules
- Create/update/submit: `inventory.adjustments.create`; read: `inventory.movements.read` or `inventory.adjustments.create`; approval in US-04-12.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Decrease > OnHand − Reserved | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Missing/short note for `Other` | 422 `INVENTORY.REASON_REQUIRED` |
| Invalid reclassification pair | 422 `INVENTORY.RECLASSIFICATION_INVALID` |
| Submit a non-Draft document | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Stale ETag on update | 412 `COMMON.CONCURRENCY_CONFLICT` |

## Edge Cases
- Value exactly equal to the threshold posts directly (E-17).
- Increase on an expired batch is allowed (records found expired stock) and leaves it non-sellable.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-075 | Integration | Below-threshold submit posts movement, number, audit | US-04-11-AC1 |
| TS-04-076 | Integration | Value 1,000.01 → PendingApproval + event; 1,000.00 → Posted | US-04-11-AC2 |
| TS-04-077 | Integration | Controlled medicine line forces approval | US-04-11-AC3 |
| TS-04-078 | Integration | Decrease beyond OnHand − Reserved → 409, stays Draft | US-04-11-AC4 |
| TS-04-079 | API | Reason Other note validation | US-04-11-AC5 |
| TS-04-080 | Integration | FoundStock creates new batch via inbound contract | US-04-11-AC6 |
| TS-04-081 | Integration | Reclassification pair posts both movements; unequal pair rejected | US-04-11-AC7 |
| TS-04-082 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-11-AC8 |
