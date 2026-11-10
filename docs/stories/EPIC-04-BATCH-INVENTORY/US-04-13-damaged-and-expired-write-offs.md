# US-04-13: Damaged and expired write-offs

| Field | Value |
|---|---|
| Story ID | US-04-13 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-039, FR-04-040 |
| Related Business Rules | BR-G-07, BR-G-28, BR-04-013, BR-04-014, BR-04-015, BR-04-027, BR-04-030 |
| Dependencies | US-04-11, US-04-12 |

## User Story
As a pharmacist or inventory staff member, I want to write off damaged and expired stock so that unusable stock leaves the books with a recorded reason and approval.

## Business Value
Keeps sellable and valuation figures accurate and gives loss visibility (BRQ-10).

## Preconditions
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

## Acceptance Criteria
### US-04-13-AC1: Damaged write-off posts
- **Given** batch B (UnitCost 8.0000, OnHand 30) and a damaged write-off line of 5 with note "Broken vials during delivery", value 40.00 ≤ threshold
- **When** a user with `inventory.write-offs.create` submits it with an `Idempotency-Key`
- **Then** status is `Posted`, number `{BranchCode}-WOF-2026-NNNNNN` is assigned, a `WriteOffDamaged` −5 movement exists, and OnHand = 25

### US-04-13-AC2: Expired write-off only for expired batches
- **Given** batch N expires on business date + 10
- **When** an `Expired` write-off line for N is saved
- **Then** the response is 422 `INVENTORY.WRITE_OFF_NOT_EXPIRED`

### US-04-13-AC3: Expired prefill
- **Given** branch A has 3 expired batches with OnHand − Reserved of 6, 0, and 9
- **When** the user calls `POST …/write-offs/expired-prefill`
- **Then** a `Draft` expired write-off with 2 lines (6 and 9) is created; the batch with 0 available is omitted

### US-04-13-AC4: Above threshold requires approval
- **Given** an expired write-off of value 3,200.00 with threshold 1,000.00
- **When** it is submitted
- **Then** status is `PendingApproval`, no movement is written, and approval follows US-04-12 with `inventory.write-offs.approve`

### US-04-13-AC5: Quarantined batch can be written off
- **Given** batch Q is `Quarantined` with OnHand 12
- **When** a damaged write-off of 12 posts
- **Then** a `WriteOffDamaged` −12 movement is written and Q remains `Quarantined` with OnHand 0

### US-04-13-AC6: Quantity limited to available
- **Given** batch B has OnHand 10 and Reserved 4
- **When** a write-off of 7 is submitted
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK` and the document stays `Draft`

### US-04-13-AC7: Authorization
- **Given** a cashier without `inventory.write-offs.create`, a user not assigned to branch B, and a write-off id of another organization
- **When** each creates or submits
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-001, VR-04-011, VR-04-012; damaged note 10–500 characters; evidence file optional (image/PDF ≤ 10 MB per SPEC-10 file rules).

## Authorization Rules
- `inventory.write-offs.create` (create/submit/prefill), `inventory.write-offs.approve` (approve/reject); branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Expired type on non-expired batch | 422 `INVENTORY.WRITE_OFF_NOT_EXPIRED` |
| Quantity > available | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Missing damaged note | 422 `INVENTORY.REASON_REQUIRED` |
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |

## Edge Cases
- A batch that expires between draft and submit can be moved from a Damaged to an Expired write-off by editing the draft type.
- Controlled-medicine write-offs always require approval (BR-04-014, REG-02); disposal procedure pending REG-08.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-089 | Integration | Damaged write-off posts movement and number | US-04-13-AC1 |
| TS-04-090 | API | Expired write-off on non-expired batch → 422 | US-04-13-AC2 |
| TS-04-091 | Integration | Prefill includes only expired batches with available > 0 | US-04-13-AC3 |
| TS-04-092 | Integration | Above-threshold write-off → PendingApproval | US-04-13-AC4 |
| TS-04-093 | Integration | Quarantined batch damaged write-off | US-04-13-AC5 |
| TS-04-094 | Integration | Write-off > OnHand − Reserved → 409 | US-04-13-AC6 |
| TS-04-095 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-13-AC7 |
