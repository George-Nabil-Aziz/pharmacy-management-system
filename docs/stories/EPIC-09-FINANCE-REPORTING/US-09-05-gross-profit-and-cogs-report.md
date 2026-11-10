# US-09-05: Gross Profit and COGS Report

| Field | Value |
|---|---|
| Story ID | US-09-05 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |
| Related Business Rules | BR-G-18, BR-G-20, BR-09-005, BR-09-006, BR-09-007 |
| Dependencies | US-09-01, US-09-03, SPEC-06 (`SaleLineAllocation`, return dispositions), SPEC-04 (`StockMovement`) |

## User Story
As an owner, I want gross profit and margin per day, medicine, and category based on the actual batch costs of what was sold, so that I know which products and days are profitable.

## Business Value
Distinguishes profit from revenue using the exact batch costs captured at sale time, and highlights loss-making lines.

## Preconditions
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

## Acceptance Criteria
### US-09-05-AC1: Reference day profit
- **Given** the reference dataset
- **When** `OWN1` requests `GET /branches/{CAI01}/reports/profit?groupBy=day&from=2026-11-09&to=2026-11-09`
- **Then** the row shows `netSales = 480.00`, `cogsSold = 410.00`, `cogsRestocked = 70.00`, `cogs = 340.00`, `grossProfit = 140.00`, `grossMarginPct = 29.17`

### US-09-05-AC2: Profit by medicine
- **Given** the reference dataset
- **When** `OWN1` requests `groupBy=medicine`
- **Then** Medicine A shows `netSales = 380.00`, `cogs = 280.00`, `grossProfit = 100.00`, `grossMarginPct = 26.32`; Medicine B shows `netSales = 100.00`, `cogs = 60.00`, `grossProfit = 40.00`, `grossMarginPct = 40.00`; totals 480.00 / 340.00 / 140.00

### US-09-05-AC3: Negative margin flagged
- **Given** Medicine D sold 1 unit @ 10.00 from a batch with unit cost 12.0000 on 2026-11-09
- **When** `OWN1` requests `groupBy=medicine&negativeOnly=true`
- **Then** only Medicine D is returned with `grossProfit = -2.00`, `grossMarginPct = -20.00`, `negativeMargin = true`

### US-09-05-AC4: Zero net sales gives null margin
- **Given** Medicine E sold 1 @ 50.00 (cost 35.0000) and returned the same day with disposition `Discarded`
- **When** `OWN1` requests `groupBy=medicine`
- **Then** Medicine E shows `netSales = 0.00`, `cogs = 35.00`, `grossProfit = -35.00`, `grossMarginPct = null`, and no error occurs

### US-09-05-AC5: Discarded and pending returns do not reverse COGS
- **Given** a return of 2 × A (allocation cost 35.0000) with disposition `PendingInspection` on 2026-11-09, set to `Restocked` on 2026-11-10
- **When** profit reports for 2026-11-09 and 2026-11-10 are requested
- **Then** 2026-11-09 shows `cogsRestocked = 0.00` for that return and 2026-11-10 shows `cogsRestocked = 70.00` for it

### US-09-05-AC6: Permission denied
- **Given** `M2` holds `reports.sales.read` but not `reports.finance.read`
- **When** `M2` requests the profit report
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-09-05-AC7: Cross-branch and cross-organization
- **Given** `OWN1`'s organization does not own branch `B9`, and manager `M1` is assigned only to `CAI01` with `reports.finance.read`
- **When** `OWN1` requests the profit report for `B9` and `M1` requests it for `ALX01`
- **Then** the API returns 404 `COMMON.NOT_FOUND` and 403 `COMMON.FORBIDDEN` respectively

## Validation Rules
- VR-09-006 (`groupBy` ∈ `day`, `medicine`, `category`), plus US-09-01 rules.

## Authorization Rules
- `reports.finance.read` + branch access.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| `groupBy=cashier` | 400 `REPORTS.INVALID_GROUP_BY` |
| No `reports.finance.read` | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |
| Period > 366 days | 422 `REPORTS.RANGE_REQUIRES_EXPORT` |

## Edge Cases
- Allocation cost 0.0000 (free goods) → COGS 0.00, margin 100.00 if net sales > 0.
- Allocation rounding: 3 × 0.3333 = 0.9999 → 1.00 per allocation.
- A sale split across two batches with different costs sums both allocations.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-031 | Integration | Reference dataset profit by day | US-09-05-AC1 |
| TS-09-032 | Integration | Profit by medicine and totals | US-09-05-AC2 |
| TS-09-033 | Integration | Negative margin flag and filter | US-09-05-AC3 |
| TS-09-034 | Unit | Margin null on zero net sales; rounding AwayFromZero | US-09-05-AC4 |
| TS-09-035 | Integration | Pending → Restocked next day shifts COGS reversal; Discarded never reverses | US-09-05-AC5 |
| TS-09-036 | Property | RC-05: COGS equals −Σ movement value of Sale/SaleVoid/SalesReturn | US-09-05-AC1 |
| TS-09-037 | Security | Sales-only user gets 403 | US-09-05-AC6 |
| TS-09-038 | Security | CS-08 404 and CS-07 403 | US-09-05-AC7 |
