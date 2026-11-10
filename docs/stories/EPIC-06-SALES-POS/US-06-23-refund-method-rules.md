# US-06-23: Refund Method Rules and Cash-in-Drawer Limit

| Field | Value |
|---|---|
| Story ID | US-06-23 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-050, FR-06-051, FR-06-052 |
| Related Business Rules | BR-06-023, BR-06-028 |
| Dependencies | US-06-21, US-06-07 |

## User Story
As a cashier, I want refunds to go back by the original payment method, never to exceed the cash in my drawer, and to need manager approval to use a different method so that refunds are correct and controlled.

## Business Value
Refund-method discipline prevents converting card payments into cash (a common fraud pattern) and keeps drawers reconcilable.

## Preconditions
- US-06-21 return creation; refunding user owns an open session.

## Acceptance Criteria
### US-06-23-AC1: Default allocation cash first
- **Given** sale X paid Card 100.00 + Cash 161.59 and a return refund of 200.00
- **When** the default refund allocation is used
- **Then** refunds are Cash 161.59 and Card 38.41 (Card requires a terminal refund reference)

### US-06-23-AC2: Cash refund limited by drawer
- **Given** the refunding session's expected cash is 50.00
- **When** a cash refund of 73.97 is submitted
- **Then** the response is 422 `SALES.REFUND_EXCEEDS_CASH_AVAILABLE` and nothing is persisted

### US-06-23-AC3: Card refund requires reference
- **Given** a card-paid sale
- **When** a card refund is submitted without terminal reference
- **Then** the response is 422 `SALES.CARD_REFERENCE_REQUIRED`

### US-06-23-AC4: Different method needs override
- **Given** a sale paid entirely by Card 100.00
- **When** the cashier refunds 60.00 in Cash without an override, and then with a `RefundMethod` override approved by manager M
- **Then** the first returns 422 `SALES.REFUND_METHOD_NOT_ALLOWED`; the second completes with refund Cash 60.00, override consumed, audit recording M

### US-06-23-AC5: Concurrent cash outflows
- **Given** the session's expected cash is 100.00
- **When** a cash refund of 80.00 and a cash out of 50.00 run concurrently on the same session
- **Then** exactly one succeeds and the other is rejected (`SALES.REFUND_EXCEEDS_CASH_AVAILABLE` or `SALES.CASH_OUT_EXCEEDS_AVAILABLE`); expected cash never becomes negative

### US-06-23-AC6: Refund in another user's session denied
- **Given** session T belongs to cashier D
- **When** cashier C submits a return refund specifying T
- **Then** the response is 403 `SALES.CASH_SESSION_NOT_OWNED`

## Validation Rules
- VR-06-019, VR-06-034, VR-06-035.

## Authorization Rules
- `sales.returns.create`; `RefundMethod` override issued by a holder of `sales.returns.approve` (US-06-07).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Not enough cash in drawer | 422 `SALES.REFUND_EXCEEDS_CASH_AVAILABLE` |
| Method/amount outside original without override | 422 `SALES.REFUND_METHOD_NOT_ALLOWED` |
| Card refund without reference | 422 `SALES.CARD_REFERENCE_REQUIRED` |
| Other user's session | 403 `SALES.CASH_SESSION_NOT_OWNED` |

## Edge Cases
- Prior refunds reduce remaining refundable per method (e.g., second return refunds card after cash is exhausted).
- Refund allocation Σ must equal the return refund total exactly (else 400 `COMMON.VALIDATION_FAILED`).
- Card refunds do not affect expected cash.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-137 | Unit | Default allocation cash-first then cards, net of prior refunds | US-06-23-AC1 |
| TS-06-138 | Integration | Cash refund above expected cash rejected | US-06-23-AC2 |
| TS-06-139 | Integration | Card refund without reference rejected | US-06-23-AC3 |
| TS-06-140 | Integration | Different method rejected without override, accepted with it | US-06-23-AC4 |
| TS-06-141 | Concurrency | Concurrent refund and cash out serialize on session lock | US-06-23-AC5 |
| TS-06-142 | Security | Refund to another user's session → 403 | US-06-23-AC6 |
