# US-06-09: Cash In and Cash Out Movements

| Field | Value |
|---|---|
| Story ID | US-06-09 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-06-022 |
| Related Business Rules | BR-G-25, BR-06-028 |
| Dependencies | US-06-08 |

## User Story
As a branch manager, I want to record cash added to or removed from a drawer with a reason so that the session's expected cash stays correct when we top up change or deposit cash.

## Business Value
Unrecorded drawer movements are the most common source of cash variance; recording them keeps reconciliation meaningful.

## Preconditions
- An `Open` session exists; user holds `finance.cash.manage`.

## Acceptance Criteria
### US-06-09-AC1: Cash in
- **Given** session S with expected cash 500.00
- **When** the manager posts a `CashIn` of 200.00, category "Float top-up", note "Change coins added"
- **Then** a `CashIn` movement +200.00 is written with an audit entry and S's expected cash becomes 700.00

### US-06-09-AC2: Cash out within available
- **Given** S with expected cash 700.00
- **When** the manager posts a `CashOut` of 600.00, category "Bank deposit"
- **Then** a `CashOut` movement −600.00 is written and expected cash becomes 100.00

### US-06-09-AC3: Cash out exceeding available
- **Given** S with expected cash 100.00
- **When** a `CashOut` of 100.01 is posted
- **Then** the response is 422 `SALES.CASH_OUT_EXCEEDS_AVAILABLE` and nothing is written

### US-06-09-AC4: Closed session rejected
- **Given** session S is `Closed`
- **When** a cash movement is posted to S
- **Then** the response is 409 `SALES.CASH_SESSION_NOT_OPEN`

### US-06-09-AC5: Permission and isolation
- **Given** a cashier without `finance.cash.manage`, and a manager not assigned to S's branch
- **When** they post a movement to S
- **Then** both receive 403 `COMMON.FORBIDDEN`; a session id of another organization returns 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-06-026, VR-06-027, VR-06-021.

## Authorization Rules
- `finance.cash.manage` + branch assignment; session must be in the route branch.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Note shorter than 5 characters | 400 `COMMON.VALIDATION_FAILED` |
| Cash out > expected | 422 `SALES.CASH_OUT_EXCEEDS_AVAILABLE` |
| Session closed | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Concurrent cash out and cash refund on the same session serialize on the session row lock (`FOR UPDATE`); the second re-checks available cash.
- Retried request with the same Idempotency-Key does not double the movement.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-047 | Integration | Cash in updates expected cash and audits | US-06-09-AC1 |
| TS-06-048 | Integration | Cash out within available | US-06-09-AC2 |
| TS-06-049 | Concurrency | Cash out over available and concurrent cash out + refund serialization | US-06-09-AC3 |
| TS-06-050 | Integration | Movement on closed session rejected | US-06-09-AC4 |
| TS-06-051 | Security | 403 permission / branch; 404 other organization | US-06-09-AC5 |
