# US-04-12: Adjustment and write-off approval

| Field | Value |
|---|---|
| Story ID | US-04-12 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-04-037 |
| Related Business Rules | BR-G-16, BR-G-28, BR-04-013, BR-04-014, BR-04-015 |
| Dependencies | US-04-11 |

## User Story
As a branch manager, I want to approve or reject pending adjustments and write-offs submitted by others so that large or sensitive stock changes are controlled by a second person.

## Business Value
Implements segregation of duties (BR-G-28) against shrinkage concealment.

## Preconditions
- Document in `PendingApproval`; approver assigned to the branch.

## Acceptance Criteria
### US-04-12-AC1: Approve and post
- **Given** adjustment D (submitted by user S, value 2,400.00) is `PendingApproval` and manager M ≠ S holds `inventory.adjustments.approve`
- **When** M calls `POST …/adjustments/D/approve` with an `Idempotency-Key`
- **Then** status becomes `Posted`, movements are written against current balances, ApprovedBy/At are set, and an audit entry is written in the same transaction

### US-04-12-AC2: Self-approval blocked
- **Given** user S holds both create and approve permissions and submitted D
- **When** S approves D
- **Then** the response is 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` and D stays `PendingApproval`

### US-04-12-AC3: Reject with reason
- **Given** D is `PendingApproval`
- **When** M rejects it with reason "Count shows no loss; recount shelf 4" (≥ 10 characters)
- **Then** status becomes `Rejected`, no movement is written, the number is retained, and the submitter is notified; a reason under 10 characters returns 422 `INVENTORY.REASON_REQUIRED`

### US-04-12-AC4: Stock changed since submission
- **Given** D decreases batch B by 5 and B's available quantity dropped to 3 after submission
- **When** M approves D
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK`, nothing is written, and D stays `PendingApproval` for rejection or resubmission

### US-04-12-AC5: Concurrent approvals
- **Given** two managers approve D at the same time with different keys
- **When** both requests execute
- **Then** exactly one posts; the other returns 409 `INVENTORY.INVALID_STATE_TRANSITION`; movements exist once

### US-04-12-AC6: Authorization
- **Given** an inventory user without `inventory.adjustments.approve`, a manager not assigned to the document's branch, and a write-off id from another organization
- **When** each approves
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`; write-off approval requires `inventory.write-offs.approve` analogously

## Validation Rules
- VR-04-013 rejection reason; VR-04-022 state transition.

## Authorization Rules
- `inventory.adjustments.approve` / `inventory.write-offs.approve`; approver ≠ submitter; branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Self-approval | 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` |
| Document not pending | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Stock insufficient at approval | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Short rejection reason | 422 `INVENTORY.REASON_REQUIRED` |

## Edge Cases
- Single-approver branches where the approver is the submitter wait for another approver (OD-04-02).
- Approval value is recomputed at approval; it is informational only (the approval requirement was fixed at submit).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-083 | Integration | Approve posts movements and audit | US-04-12-AC1 |
| TS-04-084 | API | Self-approval → 403 SELF_APPROVAL_NOT_ALLOWED | US-04-12-AC2 |
| TS-04-085 | API | Reject with reason; short reason → 422 | US-04-12-AC3 |
| TS-04-086 | Integration | Approval with insufficient current stock → 409, stays pending | US-04-12-AC4 |
| TS-04-087 | Concurrency | Two concurrent approvals → one posts, other 409 | US-04-12-AC5 |
| TS-04-088 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) for adjustments and write-offs | US-04-12-AC6 |
