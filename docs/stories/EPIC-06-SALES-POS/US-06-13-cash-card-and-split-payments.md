# US-06-13: Cash, Card, and Split Payments with Change

| Field | Value |
|---|---|
| Story ID | US-06-13 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-034, FR-06-035 |
| Related Business Rules | BR-G-35, BR-06-011, BR-06-012, BR-06-028 |
| Dependencies | US-06-12 |

## User Story
As a cashier, I want to take cash, card (approved on our standalone terminal), or a mix of both and see the change to give so that every customer can pay the way they prefer and the drawer stays correct.

## Business Value
Correct payment recording drives cash reconciliation and the cash-flow view of SPEC-09; recording only terminal references avoids handling card data.

## Preconditions
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

## Acceptance Criteria
### US-06-13-AC1: Cash with change
- **Given** a sale total of 261.59
- **When** C pays Cash with tendered 300.00
- **Then** the Cash payment is stored with amount 261.59, tendered 300.00, change 38.41; cash movement `SaleCash` +261.59; the POS displays change 38.41 in ≥ 32 px digits

### US-06-13-AC2: Split card + cash
- **Given** a total of 261.59
- **When** C pays Card 100.00 (ref `A1B2C3D4`, last4 `4242`) and Cash tendered 200.00
- **Then** payments Card 100.00 and Cash 161.59 (change 38.41) are stored; cash movement +161.59; no card number other than last 4 digits is stored

### US-06-13-AC3: Insufficient payment (CS-09)
- **Given** a total of 261.59
- **When** C submits Card 100.00 + Cash tendered 150.00
- **Then** the response is 422 `SALES.PAYMENT_INSUFFICIENT`; no sale, stock movement, payment, cash movement, or invoice number is persisted and batch balances are unchanged

### US-06-13-AC4: Card cannot exceed total or lack reference
- **Given** a total of 261.59
- **When** C submits Card 300.00, or Card 261.59 without a terminal reference
- **Then** the first returns 422 `SALES.PAYMENT_EXCEEDS_TOTAL`; the second 422 `SALES.CARD_REFERENCE_REQUIRED`; nothing persisted

### US-06-13-AC5: Declined / unconfirmed card (CS-09)
- **Given** the terminal declined the card and the cashier has no terminal reference
- **When** the cashier tries to finish the sale
- **Then** the POS Pay button stays disabled until a reference is entered or the card payment is removed; if a sale is rejected by the server after the terminal approved the card, the POS shows "Reverse the card transaction on the terminal" and the server has persisted nothing

### US-06-13-AC6: Payment method limits
- **Given** a total of 500.00
- **When** C submits two Cash entries, or four Card entries
- **Then** the response is 400 `COMMON.VALIDATION_FAILED`

## Validation Rules
- VR-06-016 to VR-06-020.

## Authorization Rules
- Same as US-06-12 (`sales.pos.sell`; 403 without it — covered by TS-06-072).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Payments < total | 422 `SALES.PAYMENT_INSUFFICIENT` |
| Card > total | 422 `SALES.PAYMENT_EXCEEDS_TOTAL` |
| Card without reference | 422 `SALES.CARD_REFERENCE_REQUIRED` |
| More than 1 cash / 3 card entries | 400 `COMMON.VALIDATION_FAILED` |
| `cardLast4` not 4 digits | 400 `COMMON.VALIDATION_FAILED` |
| No `sales.pos.sell` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Cash tendered exactly equal to cash due → change 0.00.
- Card covering the full total plus a cash entry of 0.00 → cash entry ignored (amount must be > 0 → 400).
- Total 0.00 → payments array must be empty.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-074 | Integration | Cash with change: payment, change, cash movement | US-06-13-AC1 |
| TS-06-075 | Integration | Split card + cash; only last 4 digits stored | US-06-13-AC2 |
| TS-06-076 | Integration | CS-09: insufficient payment → no stock deducted, no sale persisted | US-06-13-AC3 |
| TS-06-077 | Integration | Card exceeding total; missing reference | US-06-13-AC4 |
| TS-06-078 | E2E | CS-09: declined/unconfirmed card blocks completion; reversal instruction after server rejection | US-06-13-AC5 |
| TS-06-079 | Unit | Payment entry count limits | US-06-13-AC6 |
