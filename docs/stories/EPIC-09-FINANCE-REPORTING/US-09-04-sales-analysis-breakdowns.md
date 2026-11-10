# US-09-04: Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour

| Field | Value |
|---|---|
| Story ID | US-09-04 |
| Epic | EPIC-09 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-09-013, FR-09-014 |
| Related Business Rules | BR-G-20, BR-G-23, BR-09-002, BR-09-003 |
| Dependencies | US-09-01, US-09-03 |

## User Story
As a branch manager, I want to break sales for a period down by cashier, medicine, category, payment method, or hour of day, so that I can see who and what drives revenue and when the branch is busiest.

## Business Value
Supports staffing, purchasing, and cashier performance decisions with figures that reconcile to the daily sales report.

## Preconditions
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

## Acceptance Criteria
### US-09-04-AC1: Group by medicine
- **Given** the reference dataset for 2026-11-09
- **When** `M1` requests `groupBy=medicine`
- **Then** Medicine A has `quantitySold = 10`, `grossSales = 500.00`, `discounts = 20.00`, `salesReturns = 100.00`, `netSales = 380.00`, `share = 79.17`; Medicine B has `quantitySold = 4`, `grossSales = 100.00`, `netSales = 100.00`, `share = 20.83`; `totals.netSales = 480.00`

### US-09-04-AC2: Group by payment method reconciles to cash flow
- **Given** the reference dataset
- **When** `M1` requests `groupBy=paymentMethod`
- **Then** Cash shows `received = 480.00`, `refunded = 100.00`, `net = 380.00`; Card shows `received = 114.00`, `refunded = 0.00`, `net = 114.00`; and Σ `net` = 494.00 = `cashFlowFromSales`

### US-09-04-AC3: Group by cashier
- **Given** the reference dataset where returns are attributed to the user who completed the return
- **When** `M1` requests `groupBy=cashier`
- **Then** `C1` shows `saleCount = 1`, `grossSales = 500.00`, `salesReturns = 100.00`, `netSales = 380.00`; `C2` shows `saleCount = 1`, `netSales = 100.00`

### US-09-04-AC4: Group by hour uses branch local time
- **Given** S2 completed at 21:30Z (23:30 Cairo)
- **When** `M1` requests `groupBy=hourOfDay`
- **Then** S2 is counted in hour `23` and S1 (07:15Z = 09:15 Cairo) in hour `9`, and 24 rows (0–23) are returned

### US-09-04-AC5: Invalid groupBy (negative)
- **Given** a request with `groupBy=supplier`
- **When** it is sent to the sales analysis endpoint
- **Then** the API returns 400 `REPORTS.INVALID_GROUP_BY`

### US-09-04-AC6: Permission denied and cross-branch
- **Given** user `PH1` (`PHARMACIST`) without `reports.sales.read`, and `M1` assigned only to `CAI01`
- **When** `PH1` requests the analysis for `CAI01` and `M1` requests it for `ALX01`
- **Then** both return 403 `COMMON.FORBIDDEN`

### US-09-04-AC7: Cross-organization
- **Given** branch `B9` belongs to another organization
- **When** `M1` requests the analysis for `B9`
- **Then** the API returns 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-09-006 (`groupBy` ∈ `cashier`, `medicine`, `category`, `paymentMethod`, `hourOfDay`), plus US-09-01 rules.

## Authorization Rules
- `reports.sales.read` + branch access.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unsupported `groupBy` | 400 `REPORTS.INVALID_GROUP_BY` |
| Sort by unknown column | 400 `REPORTS.INVALID_PAGINATION` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Share % is rounded to 2 decimals per row; the sum of shares may differ from 100.00 by ≤ 0.01 × rows; `totals.share` is reported as 100.00.
- Medicine category changed after sale → current category used (OD-09-07).
- Deactivated cashier still listed by name.
- Quantity is in base units; packs shown as `quantityPacks` = base units ÷ `PackSize` with 2 decimals.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-024 | Integration | Reference dataset by medicine with shares | US-09-04-AC1 |
| TS-09-025 | Integration | By payment method; Σ net = cash flow from sales | US-09-04-AC2 |
| TS-09-026 | Integration | By cashier with return attribution | US-09-04-AC3 |
| TS-09-027 | Integration | By hour in Cairo local time, 24 rows | US-09-04-AC4 |
| TS-09-028 | Integration | Invalid `groupBy` | US-09-04-AC5 |
| TS-09-029 | Security | 403 missing permission and CS-07 cross-branch | US-09-04-AC6 |
| TS-09-030 | Security | CS-08 cross-organization 404 | US-09-04-AC7 |
