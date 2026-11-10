# US-06-08: Open Cash Session with Opening Float

| Field | Value |
|---|---|
| Story ID | US-06-08 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-06-020, FR-06-021 |
| Related Business Rules | BR-06-002, BR-06-003, BR-06-029 |
| Dependencies | US-01-10, US-02-10 |

## User Story
As a cashier, I want to open my cash session with the counted opening float before selling so that all cash I handle is reconciled against my session.

## Business Value
Cash sessions create individual accountability for cash and are the basis of Z-reports and variance control.

## Preconditions
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

## Acceptance Criteria
### US-06-08-AC1: Open session
- **Given** cashier C has no open session in branch A
- **When** C posts `POST /branches/{A}/cash-sessions` with opening float 500.00 and an Idempotency-Key
- **Then** the response is 201 with status `Open`, opening business date per branch time zone, and a `CashMovement` of type `OpeningFloat` +500.00 is written with an audit entry

### US-06-08-AC2: One open session per user per branch
- **Given** C already has an `Open` session in branch A
- **When** C tries to open another in branch A, and then one in branch B (assigned)
- **Then** branch A returns 409 `SALES.CASH_SESSION_ALREADY_OPEN`; branch B succeeds

### US-06-08-AC3: Concurrent opens
- **Given** C sends two open requests for branch A concurrently with different Idempotency-Keys
- **When** both execute
- **Then** exactly one session is created and the other returns 409 `SALES.CASH_SESSION_ALREADY_OPEN` (partial unique index)

### US-06-08-AC4: Selling requires session
- **Given** C has no open session in branch A
- **When** C opens the POS selling screen, or calls the sale completion endpoint
- **Then** the screen shows the "Open cash session" prompt and blocks the Pay action; the API returns 409 `SALES.CASH_SESSION_NOT_OPEN`

### US-06-08-AC5: Invalid float
- **Given** an open request
- **When** float is -1.00, 100000.01, or 10.005
- **Then** the response is 400 `COMMON.VALIDATION_FAILED`

### US-06-08-AC6: Permission and branch
- **Given** a user without `sales.cash-sessions.open-close`, and a user not assigned to branch B
- **When** they open a session in branch A and branch B respectively
- **Then** both receive 403 `COMMON.FORBIDDEN` (CS-07); a branch id of another organization returns 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- VR-06-021, VR-06-023.

## Authorization Rules
- `sales.cash-sessions.open-close` + branch assignment; a user opens only their own session.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Already open | 409 `SALES.CASH_SESSION_ALREADY_OPEN` |
| Invalid float | 400 `COMMON.VALIDATION_FAILED` |
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Opening float 0.00 allowed.
- `GET /cash-sessions/current` returns the session without expected cash (blind).
- Deactivated branch → 403.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-041 | Integration | Open session creates OpeningFloat movement and audit | US-06-08-AC1 |
| TS-06-042 | Integration | Second open same branch rejected; other branch allowed | US-06-08-AC2 |
| TS-06-043 | Concurrency | Parallel opens → one session | US-06-08-AC3 |
| TS-06-044 | E2E | POS blocked without session; API 409 | US-06-08-AC4 |
| TS-06-045 | Unit | Float validation | US-06-08-AC5 |
| TS-06-046 | Security | 403 permission/branch; 404 other organization | US-06-08-AC6 |
