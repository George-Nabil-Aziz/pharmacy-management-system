# US-09-07: Cash Session X/Z Report and Cash Reconciliation

| Field | Value |
|---|---|
| Story ID | US-09-07 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |
| Related Business Rules | BR-G-25, BR-G-26, BR-09-010 |
| Dependencies | US-09-01, SPEC-06 (`CashSession`, `CashMovement`) |

## User Story
As a cashier or branch manager, I want an X-report during a cash session and a Z-report after closing it, plus a variance report across sessions, so that every drawer is reconciled (expected vs counted) and shortages are visible.

## Business Value
Cash control is the most frequent daily finance task in a pharmacy; immutable Z-reports and a variance list detect shortages and overages per cashier.

## Preconditions
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

## Acceptance Criteria
### US-09-07-AC1: Z-report figures
- **Given** `CS1` is `Closed`
- **When** `M1` requests `GET /branches/{CAI01}/reports/cash-sessions/{CS1}`
- **Then** the report has `type = "Z"`, `openingFloat = 500.00`, `cashSales = 480.00`, `cashRefunds = 100.00`, `cashIn = 0.00`, `cashOut = 0.00`, `expensePayouts = 150.00`, `expectedCash = 730.00`, `countedCash = 725.00`, `variance = -5.00`, non-cash `Card = 114.00`, `saleCount = 2`, `voidCount = 1`, `returnCount = 1`

### US-09-07-AC2: Z-report immutable and reproducible
- **Given** `CS1` is closed and its Z-report was generated once
- **When** the Z-report is generated again 24 hours later after new sales occurred in another session
- **Then** every field except `meta.generatedAt` is identical, and `expectedCash` = 500.00 + Σ signed `CashMovement.Amount` of `CS1` (RC-06)

### US-09-07-AC3: X-report for open session
- **Given** session `CS2` of `C1` is `Open` with opening float 300.00 and one cash sale of 120.00
- **When** `C1` requests the report for `CS2`
- **Then** the report has `type = "X"`, `final = false`, `expectedCash = 420.00`, and contains no `countedCash` or `variance` fields

### US-09-07-AC4: Cashier limited to own sessions
- **Given** `C2` holds only `sales.cash-sessions.open-close`
- **When** `C2` requests the report for `CS1` (owned by `C1`)
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-09-07-AC5: Reconciliation list across sessions
- **Given** closed sessions on 2026-11-09: `CS1` (variance −5.00), `CS3` (expected 1,000.00, counted 1,002.00, variance +2.00), `CS4` (variance 0.00)
- **When** `M1` requests `GET /branches/{CAI01}/reports/cash-reconciliation?from=2026-11-09&to=2026-11-09&nonZeroOnly=true&sort=-absVariance`
- **Then** 2 rows are returned in order `CS1`, `CS3`; and the unfiltered totals show `shortages = -5.00`, `overages = 2.00`

### US-09-07-AC6: Session not found or other organization (negative)
- **Given** session id `CSX` belongs to another organization and id `CSY` does not exist
- **When** `M1` requests either report
- **Then** the API returns 404 `REPORTS.CASH_SESSION_NOT_FOUND` for both with identical bodies apart from `traceId`

### US-09-07-AC7: Cross-branch
- **Given** `M1` is assigned only to `CAI01` and session `CS9` belongs to `ALX01`
- **When** `M1` requests `/branches/{ALX01}/reports/cash-sessions/{CS9}`
- **Then** the API returns 403 `COMMON.FORBIDDEN`

## Validation Rules
- US-09-01 rules for the reconciliation list; `cashSessionId` must belong to `branchId` (else 404 `REPORTS.CASH_SESSION_NOT_FOUND`).

## Authorization Rules
- Own session: `sales.cash-sessions.open-close`. Any session in branch: `sales.cash-sessions.manage` or `reports.finance.read`. Reconciliation list: `reports.finance.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Session not in branch / other org / missing | 404 `REPORTS.CASH_SESSION_NOT_FOUND` |
| Cashier requests another cashier's session | 403 `COMMON.FORBIDDEN` |
| Unassigned branch | 403 `COMMON.FORBIDDEN` |
| Reconciliation without `reports.finance.read` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Session spanning midnight: reported in the reconciliation list on its close business date.
- Session with zero movements: expected = opening float.
- Force-closed session (SPEC-06 `manage`) shows `closedBy` of the manager.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-044 | Integration | Reference Z-report exact figures | US-09-07-AC1 |
| TS-09-045 | Integration | Z-report regenerated later is identical; RC-06 check | US-09-07-AC2 |
| TS-09-046 | Property | RC-06 on randomized sessions with cash in/out, refunds, voids, payouts | US-09-07-AC2 |
| TS-09-047 | Integration | X-report for open session, no counted/variance | US-09-07-AC3 |
| TS-09-048 | Security | Cashier reading another cashier's session → 403 | US-09-07-AC4 |
| TS-09-049 | Integration | Reconciliation list filter, sort, shortages/overages totals | US-09-07-AC5 |
| TS-09-050 | Security | CS-08 other-org session and missing session both 404 with same body | US-09-07-AC6 |
| TS-09-051 | Security | CS-07 cross-branch session → 403 | US-09-07-AC7 |
