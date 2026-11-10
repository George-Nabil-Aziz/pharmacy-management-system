# US-09-01: Report Filters, Business-Date Presets, and Scoping

| Field | Value |
|---|---|
| Story ID | US-09-01 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |
| Related Business Rules | BR-G-17, BR-G-23, BR-09-014 |
| Dependencies | SPEC-01 (permissions, branch assignment), SPEC-02 (branch time zone, business date, `ReportWeekStartDay`) |

## User Story
As a branch manager, I want every report to accept the same business-date period and presets and to be restricted to branches I may access, so that report figures match the pharmacy's local trading day and never expose other branches' data.

## Business Value
A single, shared report query framework guarantees that every report counts the same day the same way (Cairo local time, not UTC) and that branch isolation is enforced once, consistently, for all ~20 report endpoints.

## Preconditions
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

## Acceptance Criteria
### US-09-01-AC1: Business date uses branch time zone
- **Given** sale S1 completed at 2026-11-09T21:59:30Z (23:59:30 Cairo) and sale S2 completed at 2026-11-09T22:00:30Z (00:00:30 Cairo on 2026-11-10)
- **When** `M1` requests the daily sales report with `from=2026-11-09&to=2026-11-09`
- **Then** the response contains `saleCount = 1` (S1 only) and S2 appears only in a report for 2026-11-10

### US-09-01-AC2: Presets resolved server-side
- **Given** the current business date is 2026-11-09 and `ReportWeekStartDay = Saturday`
- **When** `M1` requests `preset=ThisWeek`, then `preset=LastMonth`, then `preset=Last7Days`
- **Then** `meta.from`/`meta.to` are respectively 2026-11-07/2026-11-09, 2026-10-01/2026-10-31, and 2026-11-03/2026-11-09

### US-09-01-AC3: Interactive range limit
- **Given** a single-branch report request with `from=2025-01-01&to=2026-11-09` (678 days)
- **When** the request is sent
- **Then** the API returns 422 `REPORTS.RANGE_REQUIRES_EXPORT` and no query is executed against sales tables

### US-09-01-AC4: Invalid parameters rejected (negative)
- **Given** a request with `from=2026-11-09&to=2026-11-01`, a request with `to=2026-11-10`, and a request with both `preset=Today` and `from`
- **When** each is sent
- **Then** the API returns 400 `REPORTS.INVALID_DATE_RANGE`, 400 `REPORTS.FUTURE_DATE_NOT_ALLOWED`, and 400 `REPORTS.INVALID_PRESET` respectively

### US-09-01-AC5: Totals independent of page
- **Given** a daily sales report for 2026-10-11 … 2026-11-09 (30 days) with 10.00 net sales on each day
- **When** `M1` requests `page=2&pageSize=10`
- **Then** `items` has 10 rows, `totalCount = 30`, `totals.netSales = "300.00"`, and `meta` contains `generatedAt`, `timeZone = "Africa/Cairo"`, `currency = "EGP"`, and `dataAsOf`

### US-09-01-AC6: Cross-branch access denied (CS-07)
- **Given** `M1` is assigned only to `CAI01`
- **When** `M1` requests `/api/v1/branches/{ALX01}/reports/sales/daily`
- **Then** the API returns 403 `COMMON.FORBIDDEN` and the response body contains no report data

### US-09-01-AC7: Cross-organization access hidden (CS-08)
- **Given** branch `B9` belongs to organization `ORG-B`
- **When** `M1` requests `/api/v1/branches/{B9}/reports/sales/daily`
- **Then** the API returns 404 `COMMON.NOT_FOUND` with no indication that the branch exists

### US-09-01-AC8: Permission denied
- **Given** user `C1` (role `CASHIER`) assigned to `CAI01` without `reports.sales.read`
- **When** `C1` requests the daily sales report for `CAI01`
- **Then** the API returns 403 `COMMON.FORBIDDEN`

## Validation Rules
- VR-09-001, VR-09-002, VR-09-003, VR-09-005, VR-09-007.

## Authorization Rules
- Branch report endpoints: report permission AND branch ∈ assigned branches (or organization-wide scope) AND branch ∈ token organization.
- Requests spanning more than one branch require `reports.organization.read` (BR-09-014).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| `from` > `to` | 400 `REPORTS.INVALID_DATE_RANGE` |
| `to` in the future | 400 `REPORTS.FUTURE_DATE_NOT_ALLOWED` |
| Unknown preset or preset + dates | 400 `REPORTS.INVALID_PRESET` |
| `pageSize = 101` | 400 `REPORTS.INVALID_PAGINATION` |
| 678-day single-branch period | 422 `REPORTS.RANGE_REQUIRES_EXPORT` |
| 32-day org-level detail report | 422 `REPORTS.RANGE_REQUIRES_EXPORT` |
| Unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Period of exactly 366 days is accepted; 367 days is rejected.
- `preset=ThisYear` on 2026-01-01 resolves to 2026-01-01/2026-01-01.
- Branches in different time zones: org-level period applies each branch's own business date.
- Deactivated branch remains reportable for historical periods.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-001 | Integration | Sales at 21:59:30Z and 22:00:30Z attributed to Cairo business dates | US-09-01-AC1 |
| TS-09-002 | Unit | Preset resolution table for every preset with fixed clock and week start Saturday/Sunday | US-09-01-AC2 |
| TS-09-003 | Integration | 366-day accepted, 367-day and 678-day rejected; 31/32-day org-level boundary | US-09-01-AC3 |
| TS-09-004 | Integration | Invalid range, future date, preset conflict, pageSize 101 | US-09-01-AC4 |
| TS-09-005 | Integration | Paging with totals over full result and `meta` fields | US-09-01-AC5 |
| TS-09-006 | Security | CS-07 cross-branch request on every branch report endpoint returns 403 | US-09-01-AC6 |
| TS-09-007 | Security | CS-08 cross-organization branch id on every report endpoint returns 404, no data | US-09-01-AC7 |
| TS-09-008 | Security | Missing report permission returns 403 | US-09-01-AC8 |
