# US-04-19: Transfer drafting, submission, and cancellation

| Field | Value |
|---|---|
| Story ID | US-04-19 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-051 |
| Related Business Rules | BR-G-02, BR-G-13, BR-04-018, BR-04-030 |
| Dependencies | US-04-01 |

## User Story
As an inventory staff member of a branch, I want to request stock from another branch (or propose sending stock to one) through a transfer document so that stock moves only through an explicit, traceable workflow.

## Business Value
Implements the first steps of BR-G-13; prevents implicit stock sharing (BR-G-02).

## Preconditions
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

## Acceptance Criteria
### US-04-19-AC1: Create a draft request
- **Given** user U with `inventory.transfers.create` is assigned to destination branch C
- **When** U calls `POST /api/v1/branches/C/inventory/transfers` with source A, destination C, lines [M1 40 base units, M2 10 base units]
- **Then** a `Draft` transfer is created (BranchId = A, readable from A and C), with CreatedBy U and no number

### US-04-19-AC2: Same branch or inactive branch rejected
- **Given** source = destination A, or destination D is `Inactive`
- **When** the draft is created
- **Then** the responses are 422 `INVENTORY.TRANSFER_SAME_BRANCH` and 422 `INVENTORY.BRANCH_INACTIVE`

### US-04-19-AC3: Submit assigns number and notifies
- **Given** the draft has ≥ 1 line
- **When** U submits it with a valid `If-Match`
- **Then** status becomes `Requested`, number `{SourceBranchCode}-TRF-2026-NNNNNN` from the source branch sequence is assigned, an audit entry is written, and `Inventory.TransferStatusChanged.v1` is emitted for approvers of A

### US-04-19-AC4: Cancel before dispatch
- **Given** a transfer in `Draft` or `Requested`
- **When** a user with `inventory.transfers.create` assigned to A or C cancels it with reason "No longer required, received from supplier"
- **Then** status becomes `Cancelled`, the number (if any) is retained, and cancellation of an `InTransit` transfer returns 409 `INVENTORY.INVALID_STATE_TRANSITION`

### US-04-19-AC5: No edits after submit
- **Given** the transfer is `Requested`
- **When** U tries to change its lines
- **Then** the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`

### US-04-19-AC6: Authorization
- **Given** user V assigned only to branch D (neither source nor destination), a cashier without `inventory.transfers.create` at C, and a transfer id of another organization
- **When** each creates, reads, or submits
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 403 `IDENTITY.PERMISSION_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-001 quantities; VR-04-012 1–500 lines, no duplicate medicine; VR-04-014 branches; medicine `Active` (VR-04-007).

## Authorization Rules
- `inventory.transfers.create` and assignment to source or destination; read via either branch route with any `inventory.transfers.*` permission.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Source = destination | 422 `INVENTORY.TRANSFER_SAME_BRANCH` |
| Inactive branch | 422 `INVENTORY.BRANCH_INACTIVE` |
| Edit/cancel in disallowed state | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Stale If-Match | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Unrelated branch user | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |

## Edge Cases
- Destination in another organization is treated as not found (404 `COMMON.NOT_FOUND`).
- Requested quantities are informational until approval; no stock is reserved in `Requested`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-132 | API | Destination user creates draft readable from both branches | US-04-19-AC1 |
| TS-04-133 | API | Same branch / inactive branch → 422 | US-04-19-AC2 |
| TS-04-134 | Integration | Submit assigns source-branch number, audit, status event | US-04-19-AC3 |
| TS-04-135 | API | Cancel from Draft/Requested; cancel InTransit → 409; edit after submit → 409 | US-04-19-AC4, US-04-19-AC5 |
| TS-04-136 | API | CS-07 unrelated branch → 403; permission → 403; CS-08 other org → 404 | US-04-19-AC6 |
