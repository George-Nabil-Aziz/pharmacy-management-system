# US-09-03: Daily Sales Report

| Field | Value |
|---|---|
| Story ID | US-09-03 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-09-006, FR-09-011, FR-09-012 |
| Related Business Rules | BR-G-18, BR-G-20, BR-G-23, BR-09-002, BR-09-003, BR-09-004, BR-09-005 |
| Dependencies | US-09-01, SPEC-06 (sales, returns, payments, refunds) |

## User Story
As a branch manager, I want a per-day sales report showing gross sales, discounts, returns, net sales, tax, and payments by method, so that I can verify each day's trading against the cash and card totals.

## Business Value
The daily sales report is the primary MVP management report; it defines revenue exactly as the conventions do and separates it from cash received.

## Preconditions
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

## Acceptance Criteria
### US-09-03-AC1: Reference day figures
- **Given** the reference dataset
- **When** `M1` requests `GET /branches/{CAI01}/reports/sales/daily?from=2026-11-09&to=2026-11-09`
- **Then** the row for 2026-11-09 has `saleCount = 2`, `grossSales = 600.00`, `discounts = 20.00`, `salesReturns = 100.00`, `netSales = 480.00`, `netTaxCollected = 14.00`, Cash `received = 480.00` / `refunded = 100.00`, Card `received = 114.00` / `refunded = 0.00`, `voidCount = 1`, `voidedAmount = 50.00`, `averageBasket = 290.00`

### US-09-03-AC2: Every date in period returned, totals equal row sums
- **Given** the period 2026-11-08 … 2026-11-10
- **When** the report is requested
- **Then** 3 rows are returned; 2026-11-08 has `saleCount = 1`, `grossSales = 100.00`, `netSales = 100.00`; 2026-11-10 has all amounts 0.00; and `totals` equal the column sums (`grossSales = 700.00`, `netSales = 580.00`) with difference 0.00

### US-09-03-AC3: Net sales identity on every row
- **Given** any row of any daily sales report
- **When** the response is validated
- **Then** `netSales = grossSales − discounts − salesReturns` exactly, and voided sale S3 contributes 0.00 to `grossSales`, `discounts`, `netTaxCollected`, and payments

### US-09-03-AC4: Return attributed to return date
- **Given** sale S10 of 200.00 on 2026-10-30 is returned in full on 2026-11-02
- **When** reports for October 2026 and for 2026-11-02 are requested
- **Then** October's `salesReturns` is unaffected by S10's return and 2026-11-02 shows `salesReturns = 200.00`

### US-09-03-AC5: Permission denied
- **Given** user `INV1` (`INVENTORY`) assigned to `CAI01` lacks `reports.sales.read`
- **When** `INV1` requests the daily sales report
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-09-03-AC6: Cross-branch and cross-organization
- **Given** `M1` is assigned only to `CAI01`
- **When** `M1` requests the report for `ALX01` (same organization) and for `B9` (other organization)
- **Then** the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND` respectively

## Validation Rules
- VR-09-001 … VR-09-005, VR-09-007 (via US-09-01).

## Authorization Rules
- `reports.sales.read` + branch access.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| `from` > `to` | 400 `REPORTS.INVALID_DATE_RANGE` |
| Period > 366 days | 422 `REPORTS.RANGE_REQUIRES_EXPORT` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 `COMMON.NOT_FOUND` |
| Query exceeds 30 s | 503 `REPORTS.QUERY_TIMEOUT` |

## Edge Cases
- `averageBasket` is `null` for days with `saleCount = 0`.
- A void after midnight changes the previous day's row (BR-09-004) — covered by US-09-02.
- Return lines `PendingInspection` still reduce net sales on the return date.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-017 | Integration | Reference dataset daily row exact values | US-09-03-AC1 |
| TS-09-018 | Integration | 3-day period with zero day and totals = Σ rows | US-09-03-AC2 |
| TS-09-019 | Property | Randomized data: net-sales identity per row; voided sales contribute 0.00 | US-09-03-AC3 |
| TS-09-020 | Integration | Cross-month return attribution | US-09-03-AC4 |
| TS-09-021 | Security | Missing `reports.sales.read` → 403 | US-09-03-AC5 |
| TS-09-022 | Security | CS-07 cross-branch → 403 | US-09-03-AC6 |
| TS-09-023 | Security | CS-08 cross-organization → 404 | US-09-03-AC6 |
