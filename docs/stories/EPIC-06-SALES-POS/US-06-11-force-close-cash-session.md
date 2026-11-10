# US-06-11: Force-Close Another User's Cash Session

| Field | Value |
|---|---|
| Story ID | US-06-11 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-06-027 |
| Related Business Rules | BR-G-16, BR-G-26, BR-06-027, BR-06-028 |
| Dependencies | US-06-10 |

## User Story
As a branch manager, I want to close a cashier's open session when the cashier has left without closing it, recording what I counted and why, so that the drawer is reconciled and the next shift can start.

## Business Value
Prevents sessions staying open indefinitely (which hides variances and blocks reconciliation) while keeping an audit trail of who closed the drawer and why.

## Preconditions
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

## Acceptance Criteria
### US-06-11-AC1: Force-close
- **Given** S has expected cash 1,250.00
- **When** M posts `POST /branches/{branchId}/cash-sessions/{S}/force-close` with counted 1,250.00, reason "Cashier left at end of shift", and an Idempotency-Key
- **Then** S becomes `Closed` with `ClosingType` Forced, `ClosedByUserId` M, variance 0.00; an audit entry is written and C receives a notification

### US-06-11-AC2: Variance rules apply
- **Given** `CashVarianceTolerance` 5.00 and expected cash 1,250.00
- **When** M force-closes with counted 1,200.00 and no variance note
- **Then** the response is 422 `SALES.VARIANCE_REASON_REQUIRED`; with a note the session closes with variance −50.00 and managers are notified

### US-06-11-AC3: Session already closed
- **Given** S was closed by C a moment earlier
- **When** M's force-close executes
- **Then** the response is 409 `SALES.CASH_SESSION_NOT_OPEN` and the stored close is unchanged

### US-06-11-AC4: Missing reason
- **Given** an open session
- **When** M submits a reason of 5 characters
- **Then** the response is 400 `COMMON.VALIDATION_FAILED`

### US-06-11-AC5: Permission and isolation
- **Given** a cashier with only `sales.cash-sessions.open-close`, and a manager not assigned to S's branch
- **When** each calls force-close on S
- **Then** both receive 403 `COMMON.FORBIDDEN` (CS-07); a session of another organization returns 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- Reason 10–250 characters; counted cash per VR-06-024; variance note per VR-06-025; VR-06-021.

## Authorization Rules
- `sales.cash-sessions.manage` + branch assignment. Force-closing one's own session is not allowed through this endpoint (use normal close) → 422 `COMMON.VALIDATION_FAILED`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Already closed | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Reason too short | 400 `COMMON.VALIDATION_FAILED` |
| Variance above tolerance without note | 422 `SALES.VARIANCE_REASON_REQUIRED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- A sale by C in flight during force-close: sale holds the session row `FOR SHARE`; force-close waits, then includes it.
- After a forced close, C can open a new session immediately.
- Sessions open longer than 24 h are listed with duration in `GET /cash-sessions?status=Open` and notified daily (OD-06-12: no auto-close).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-060 | Integration | Force-close with Forced type, audit, owner notification | US-06-11-AC1 |
| TS-06-061 | Integration | Variance note required above tolerance | US-06-11-AC2 |
| TS-06-062 | Concurrency | Owner close vs manager force-close race → one close persists | US-06-11-AC3 |
| TS-06-063 | Unit | Reason length validation | US-06-11-AC4 |
| TS-06-064 | Security | 403 without manage / other branch (CS-07); 404 other organization (CS-08) | US-06-11-AC5 |
