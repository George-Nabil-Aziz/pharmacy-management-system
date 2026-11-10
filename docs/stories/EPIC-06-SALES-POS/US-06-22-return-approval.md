# US-06-22: Return Approval Above Threshold or Outside Window

| Field | Value |
|---|---|
| Story ID | US-06-22 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-06-047, FR-06-049 |
| Related Business Rules | BR-G-16, BR-06-020, BR-06-022 |
| Dependencies | US-06-21, US-06-07 |

## User Story
As a branch manager, I want returns with large refunds, returns outside the return window, and returns of controlled medicines to need my approval so that unusual refunds are reviewed by a second person.

## Business Value
Segregation of duties on refunds limits fraud and errors on high-value or unusual returns.

## Preconditions
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

## Acceptance Criteria
### US-06-22-AC1: Inline approval via manager override
- **Given** a return with refund total 1,200.00 created by cashier C
- **When** manager M re-authenticates at C's POS (override scope `ReturnApproval`) and C submits the return with the override id
- **Then** the return is `Completed` immediately with `ApprovedBy` M, refund from C's session, override consumed, audit written

### US-06-22-AC2: Deferred approval
- **Given** the same return submitted without an override
- **When** it is saved
- **Then** it is `PendingApproval` with no return number, no refund, no cash movement, and its quantities reserved; managers are notified

### US-06-22-AC3: Approve completes the return
- **Given** a `PendingApproval` return R by C and manager M with an open session in the branch
- **When** M posts `POST /sales-returns/{R}/approve` with refund details and an Idempotency-Key
- **Then** R becomes `Completed`, receives the next return number, the refund and `RefundCash` movement are recorded in M's session, and audit records approver M

### US-06-22-AC4: Reject
- **Given** a `PendingApproval` return R
- **When** M rejects with reason "Medicine opened, not returnable"
- **Then** R becomes `Rejected`, its reserved quantities are released, and C is notified; a later approve on R returns 409 `SALES.RETURN_NOT_PENDING`

### US-06-22-AC5: Self-approval and out-of-window reason
- **Given** M created return R, and an out-of-window return submitted with an override but no override reason
- **When** M approves R, and the second return is submitted
- **Then** the first returns 403 `SALES.SELF_APPROVAL_NOT_ALLOWED`; the second 422 `SALES.RETURN_WINDOW_EXPIRED`

### US-06-22-AC6: Controlled medicine always needs approval
- **Given** a return of a controlled medicine with refund 50.00
- **When** it is submitted without an override
- **Then** it is saved as `PendingApproval`

### US-06-22-AC7: Permission and isolation
- **Given** a cashier without `sales.returns.approve`, a manager not assigned to the branch, and a return id of another organization
- **When** they approve
- **Then** 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- VR-06-032, VR-06-036, VR-06-034, VR-06-035.

## Authorization Rules
- `sales.returns.approve` + branch assignment; approver ≠ creator; cash refunds require the approver's own open session.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Approve non-pending return | 409 `SALES.RETURN_NOT_PENDING` |
| Self-approval | 403 `SALES.SELF_APPROVAL_NOT_ALLOWED` |
| Approver without open session for cash refund | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Rejection reason < 10 chars | 400 `COMMON.VALIDATION_FAILED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Approve and reject submitted concurrently → return row lock; second gets `SALES.RETURN_NOT_PENDING`.
- Pending return older than 7 days remains pending (no auto-expiry in v1) and is listed for managers.
- Approval with a card refund requires the terminal reference at approval time.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-130 | Integration | Inline approval with `ReturnApproval` override | US-06-22-AC1 |
| TS-06-131 | Integration | Deferred PendingApproval without effects; reservation of quantities | US-06-22-AC2 |
| TS-06-132 | Integration | Approve completes with number and refund from approver session; CS-11 replay single effect | US-06-22-AC3 |
| TS-06-133 | Concurrency | Reject releases quantities; approve vs reject race | US-06-22-AC4 |
| TS-06-134 | Security | Self-approval 403; out-of-window without reason 422 | US-06-22-AC5 |
| TS-06-135 | Integration | Controlled medicine return requires approval | US-06-22-AC6 |
| TS-06-136 | Security | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | US-06-22-AC7 |
