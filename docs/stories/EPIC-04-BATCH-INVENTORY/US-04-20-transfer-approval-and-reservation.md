# US-04-20: Transfer approval with reservation, rejection

| Field | Value |
|---|---|
| Story ID | US-04-20 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-052 |
| Related Business Rules | BR-G-06, BR-G-13, BR-G-28, BR-04-010, BR-04-018, BR-04-019 |
| Dependencies | US-04-19, US-04-04 |

## User Story
As the source branch manager, I want to approve a transfer request and have the system reserve the stock by FEFO so that the approved quantity cannot be sold before it is dispatched.

## Business Value
Segregation of duties for inter-branch stock movement and guaranteed availability at dispatch.

## Preconditions
- Transfer `Requested`; approver assigned to the source branch.

## Acceptance Criteria
### US-04-20-AC1: Approve reserves by FEFO
- **Given** transfer T (A → C) requests M 40; in A, M has sale-eligible batches B1 (expiry 2027-01-31, sellable 25) and B2 (2027-04-30, sellable 30)
- **When** manager G (≠ creator) with `inventory.transfers.approve` assigned to A approves with an `Idempotency-Key`
- **Then** status becomes `Approved`, allocations B1 = 25 and B2 = 15 are stored, Reserved increases by 25 and 15, no movement is written, and `Inventory.TransferStatusChanged.v1` is emitted

### US-04-20-AC2: Insufficient stock at approval
- **Given** M has 30 sellable in A
- **When** G approves the 40-unit request
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK` with shortages, and T stays `Requested` with no reservation (G may reject, or the creator may cancel and resubmit)

### US-04-20-AC3: Reserved stock is not sellable
- **Given** T is approved and B1 has OnHand 25, Reserved 25
- **When** a cashier sells M in A
- **Then** FEFO skips B1 and allocates from B2; a sale that needs B1's units fails with `INVENTORY.INSUFFICIENT_STOCK`

### US-04-20-AC4: Reject with reason
- **Given** T is `Requested`
- **When** G rejects it with reason "Branch A is below its own minimum for M"
- **Then** status becomes `Rejected`, no reservation exists, and the creator is notified

### US-04-20-AC5: Cancel after approval releases reservation
- **Given** T is `Approved` with reservations 25 and 15
- **When** an authorized user cancels it with a reason
- **Then** status becomes `Cancelled` and Reserved on B1 and B2 decreases by 25 and 15 in the same transaction

### US-04-20-AC6: Segregation of duties and side
- **Given** creator U also holds `inventory.transfers.approve`, and manager H is assigned only to destination C
- **When** U approves, and H approves
- **Then** the responses are 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` and 403 `IDENTITY.BRANCH_ACCESS_DENIED`

### US-04-20-AC7: Permission and organization
- **Given** an inventory user without `inventory.transfers.approve` and a transfer id of another organization
- **When** each approves
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-013 rejection/cancel reason; VR-04-022 transitions.

## Authorization Rules
- Approve/reject: `inventory.transfers.approve`, assignment to source branch, approver ≠ creator.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Not enough sellable stock | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Self-approval | 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` |
| Approver not at source | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Not `Requested` | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Missing key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |

## Edge Cases
- Approved reservations do not expire automatically (OD-04-05); they are listed in the in-transit/aged view.
- Quantities may be approved only in full in v1 (partial approval = reject and recreate).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-137 | Integration | Approval allocates FEFO and reserves without movements | US-04-20-AC1 |
| TS-04-138 | Integration | Insufficient stock at approval → 409, no reservation | US-04-20-AC2 |
| TS-04-139 | Integration | Sales skip reserved quantity | US-04-20-AC3 |
| TS-04-140 | API | Reject with reason | US-04-20-AC4 |
| TS-04-141 | Integration | Cancel Approved releases reservations atomically | US-04-20-AC5 |
| TS-04-142 | API | Self-approval → 403; destination-only manager → 403 (CS-07) | US-04-20-AC6 |
| TS-04-143 | API | Missing permission → 403; CS-08 other org → 404 | US-04-20-AC7 |
| TS-04-144 | API | CS-11: approve retried with same key → one reservation set | US-04-20-AC1 |
