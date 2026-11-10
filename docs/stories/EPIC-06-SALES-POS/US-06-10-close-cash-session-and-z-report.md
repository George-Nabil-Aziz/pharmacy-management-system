# US-06-10: Close Cash Session with Blind Count and Z-Report

| Field | Value |
|---|---|
| Story ID | US-06-10 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |
| Related Business Rules | BR-G-26, BR-06-027, BR-06-028 |
| Dependencies | US-06-08, US-06-12 |

## User Story
As a cashier, I want to close my session by counting the drawer without seeing the expected amount, and then get a Z-report, so that cash differences are detected honestly and documented.

## Business Value
Blind counting is a standard cash-control practice; the Z-report is the daily reconciliation document for managers and accountants.

## Preconditions
- C owns an `Open` session S; sales, refunds, and cash movements exist.

## Acceptance Criteria
### US-06-10-AC1: Expected cash and variance
- **Given** S has float 500.00, `SaleCash` 1,861.59, `SaleVoid` −61.59, `RefundCash` −73.97, `CashIn` 200.00, `CashOut` −600.00
- **When** C closes S with counted cash 1,824.03 and an Idempotency-Key
- **Then** expected cash = 1,826.03, variance = −2.00, status `Closed`, `ClosingType` Normal, audit written; the response includes expected and variance only after closing

### US-06-10-AC2: Blind count before close
- **Given** S is open
- **When** C calls `GET /cash-sessions/current` or `GET /cash-sessions/{S}`
- **Then** the response contains no expected cash, variance, or totals by method; a holder of `sales.cash-sessions.manage` can see an X-report

### US-06-10-AC3: Variance above tolerance needs note and notifies
- **Given** `CashVarianceTolerance` = 5.00 and expected cash 1,826.03
- **When** C closes with counted 1,800.00 without a note, then with note "Gave wrong change"
- **Then** the first returns 422 `SALES.VARIANCE_REASON_REQUIRED` with S still open; the second closes S with variance −26.03 and branch managers receive a notification

### US-06-10-AC4: Denomination breakdown
- **Given** C enters 9 × 200, 2 × 10, 4 × 1, 0 × 0.25
- **When** the declared counted cash is 1,824.03
- **Then** the response is 422 `SALES.CASH_COUNT_INVALID` (breakdown sums to 1,824.00); with counted 1,824.00 the close succeeds

### US-06-10-AC5: Z-report content
- **Given** S is closed
- **When** C requests the Z-report (80 mm, ar)
- **Then** it shows session user and times, sale count, gross sales, discounts, returns, net sales, tax by rate, totals per payment method, refunds per method, voids (count, amount), cash in/out, float, expected, counted, variance, all consistent with stored documents

### US-06-10-AC6: Closed session immutable; close vs in-flight sale
- **Given** S is being closed while a sale on S is in progress
- **When** both run concurrently
- **Then** the sale either commits before the close (and is included in expected cash) or fails with 409 `SALES.CASH_SESSION_NOT_OPEN`; after close, any sale, refund, or movement on S returns 409 `SALES.CASH_SESSION_NOT_OPEN` and a second close returns 409 `SALES.CASH_SESSION_NOT_OPEN`

### US-06-10-AC7: Permission and ownership
- **Given** user D (with `sales.cash-sessions.open-close`) who does not own S, and a user without the permission
- **When** they call close on S
- **Then** D receives 403 `SALES.CASH_SESSION_NOT_OWNED`; the other receives 403 `COMMON.FORBIDDEN`; another organization's session id returns 404

## Validation Rules
- VR-06-024, VR-06-025, VR-06-021.

## Authorization Rules
- Close: owner with `sales.cash-sessions.open-close`. Z-report: owner (after close) or `sales.cash-sessions.manage`. X-report: `sales.cash-sessions.manage` only.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Variance above tolerance without note | 422 `SALES.VARIANCE_REASON_REQUIRED` |
| Denominations inconsistent | 422 `SALES.CASH_COUNT_INVALID` |
| Session already closed | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Not owner | 403 `SALES.CASH_SESSION_NOT_OWNED` |
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |

## Edge Cases
- Session with zero sales: expected = float ± movements; Z-report shows zeros.
- Session spanning two business dates: Z-report covers all session documents; SPEC-09 daily reports use document business dates.
- Card totals are informational; card settlement reconciliation with the terminal is manual.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-052 | Integration | Expected cash formula and variance from mixed movements | US-06-10-AC1 |
| TS-06-053 | Security | Blind: no expected cash for owner before close; X-report for manager only | US-06-10-AC2 |
| TS-06-054 | Integration | Variance note requirement and manager notification | US-06-10-AC3 |
| TS-06-055 | Unit | Denomination breakdown consistency | US-06-10-AC4 |
| TS-06-056 | Integration | Z-report totals reconcile with sales, returns, voids, movements | US-06-10-AC5 |
| TS-06-057 | Concurrency | Close vs in-flight sale; immutability after close | US-06-10-AC6 |
| TS-06-058 | Security | Non-owner 403 `SALES.CASH_SESSION_NOT_OWNED`; no permission 403; other org 404 | US-06-10-AC7 |
| TS-06-059 | Performance | Z-report ≤ 2 s for 1,000 sales | US-06-10-AC5 |
