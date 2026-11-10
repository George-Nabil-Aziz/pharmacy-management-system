# Test Cases — EPIC-09 Finance and Reporting

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-09-FINANCE-REPORTING/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (114 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-09-001 | Sales at 21:59:30Z and 22:00:30Z attributed to Cairo business dates | Integration | T1 | MVP | US-09-01-AC1 |
| TS-09-002 | Preset resolution table for every preset with fixed clock and week start Saturday/Sunday | Unit | T1 | MVP | US-09-01-AC2 |
| TS-09-003 | 366-day accepted, 367-day and 678-day rejected; 31/32-day org-level boundary | Integration | T1 | MVP | US-09-01-AC3 |
| TS-09-004 | Invalid range, future date, preset conflict, pageSize 101 | Integration | T1 | MVP | US-09-01-AC4 |
| TS-09-005 | Paging with totals over full result and `meta` fields | Integration | T1 | MVP | US-09-01-AC5 |
| TS-09-006 | CS-07 cross-branch request on every branch report endpoint returns 403 | Security | T0 | MVP | US-09-01-AC6 |
| TS-09-007 | CS-08 cross-organization branch id on every report endpoint returns 404, no data | Security | T0 | MVP | US-09-01-AC7 |
| TS-09-008 | Missing report permission returns 403 | Security | T0 | MVP | US-09-01-AC8 |
| TS-09-009 | Reference dataset → summary and payment summary values within 60 s | Integration | T2 | V1 | US-09-02-AC1 |
| TS-09-010 | Duplicate and out-of-order delivery yields identical row, one inbox record per event | Integration | T2 | V1 | US-09-02-AC2 |
| TS-09-011 | Cross-midnight void recomputes previous date and increments `Version` | Integration | T2 | V1 | US-09-02-AC3 |
| TS-09-012 | Nightly job repairs tampered row, records difference, notifies Owners | Integration | T2 | V1 | US-09-02-AC4 |
| TS-09-013 | Randomized 10,000-sale dataset: RC-08 holds for every branch/date after nightly job | Property | T2 | V1 | US-09-02-AC4 |
| TS-09-014 | Rebuild 202 + audit; concurrent rebuild 409 | Integration | T2 | V1 | US-09-02-AC5 |
| TS-09-015 | Rebuild range validation | Integration | T2 | V1 | US-09-02-AC6 |
| TS-09-016 | 403 without permission; 404 cross-organization (CS-07/CS-08) | Security | T1 | V1 | US-09-02-AC7 |
| TS-09-017 | Reference dataset daily row exact values | Integration | T1 | MVP | US-09-03-AC1 |
| TS-09-018 | 3-day period with zero day and totals = Σ rows | Integration | T1 | MVP | US-09-03-AC2 |
| TS-09-019 | Randomized data: net-sales identity per row; voided sales contribute 0.00 | Property | T1 | MVP | US-09-03-AC3 |
| TS-09-020 | Cross-month return attribution | Integration | T1 | MVP | US-09-03-AC4 |
| TS-09-021 | Missing `reports.sales.read` → 403 | Security | T0 | MVP | US-09-03-AC5 |
| TS-09-022 | CS-07 cross-branch → 403 | Security | T0 | MVP | US-09-03-AC6 |
| TS-09-023 | CS-08 cross-organization → 404 | Security | T0 | MVP | US-09-03-AC6 |
| TS-09-024 | Reference dataset by medicine with shares | Integration | T2 | V1 | US-09-04-AC1 |
| TS-09-025 | By payment method; Σ net = cash flow from sales | Integration | T2 | V1 | US-09-04-AC2 |
| TS-09-026 | By cashier with return attribution | Integration | T2 | V1 | US-09-04-AC3 |
| TS-09-027 | By hour in Cairo local time, 24 rows | Integration | T2 | V1 | US-09-04-AC4 |
| TS-09-028 | Invalid `groupBy` | Integration | T2 | V1 | US-09-04-AC5 |
| TS-09-029 | 403 missing permission and CS-07 cross-branch | Security | T1 | V1 | US-09-04-AC6 |
| TS-09-030 | CS-08 cross-organization 404 | Security | T1 | V1 | US-09-04-AC7 |
| TS-09-031 | Reference dataset profit by day | Integration | T1 | MVP | US-09-05-AC1 |
| TS-09-032 | Profit by medicine and totals | Integration | T1 | MVP | US-09-05-AC2 |
| TS-09-033 | Negative margin flag and filter | Integration | T1 | MVP | US-09-05-AC3 |
| TS-09-034 | Margin null on zero net sales; rounding AwayFromZero | Unit | T1 | MVP | US-09-05-AC4 |
| TS-09-035 | Pending → Restocked next day shifts COGS reversal; Discarded never reverses | Integration | T1 | MVP | US-09-05-AC5 |
| TS-09-036 | RC-05: COGS equals −Σ movement value of Sale/SaleVoid/SalesReturn | Property | T1 | MVP | US-09-05-AC1 |
| TS-09-037 | Sales-only user gets 403 | Security | T0 | MVP | US-09-05-AC6 |
| TS-09-038 | CS-08 404 and CS-07 403 | Security | T0 | MVP | US-09-05-AC7 |
| TS-09-039 | Reference return row and return rate 17.24 | Integration | T2 | V1 | US-09-06-AC1 |
| TS-09-040 | Disposition totals for mixed return | Integration | T2 | V1 | US-09-06-AC2 |
| TS-09-041 | Pending/rejected returns excluded | Integration | T2 | V1 | US-09-06-AC3 |
| TS-09-042 | Missing permission 403 | Security | T1 | V1 | US-09-06-AC4 |
| TS-09-043 | CS-07 403 and CS-08 404 | Security | T1 | V1 | US-09-06-AC5 |
| TS-09-044 | Reference Z-report exact figures | Integration | T1 | MVP | US-09-07-AC1 |
| TS-09-045 | Z-report regenerated later is identical; RC-06 check | Integration | T1 | MVP | US-09-07-AC2 |
| TS-09-046 | RC-06 on randomized sessions with cash in/out, refunds, voids, payouts | Property | T1 | MVP | US-09-07-AC2 |
| TS-09-047 | X-report for open session, no counted/variance | Integration | T1 | MVP | US-09-07-AC3 |
| TS-09-048 | Cashier reading another cashier's session → 403 | Security | T0 | MVP | US-09-07-AC4 |
| TS-09-049 | Reconciliation list filter, sort, shortages/overages totals | Integration | T1 | MVP | US-09-07-AC5 |
| TS-09-050 | CS-08 other-org session and missing session both 404 with same body | Security | T0 | MVP | US-09-07-AC6 |
| TS-09-051 | CS-07 cross-branch session → 403 | Security | T0 | MVP | US-09-07-AC7 |
| TS-09-052 | Four classes, values, subtotals, grand total 3,850.00 | Integration | T1 | MVP | US-09-08-AC1 |
| TS-09-053 | Class precedence including expiry = business date | Unit | T1 | MVP | US-09-08-AC1 |
| TS-09-054 | Reserved shown, value on on-hand | Integration | T1 | MVP | US-09-08-AC2 |
| TS-09-055 | Rounding per batch; grand total = direct DB computation (FR-09-024) | Integration | T1 | MVP | US-09-08-AC3 |
| TS-09-056 | Group by medicine with class breakdown | Integration | T1 | MVP | US-09-08-AC4 |
| TS-09-057 | Cashier 403 | Security | T0 | MVP | US-09-08-AC5 |
| TS-09-058 | CS-07 403, CS-08 404 | Security | T0 | MVP | US-09-08-AC6 |
| TS-09-059 | Reference values/required behavior and reconciliation (FR-09-025) | Integration | T2 | V1 | US-09-09-AC1 |
| TS-09-060 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-09-AC2 |
| TS-09-061 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-09-AC3 |
| TS-09-062 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-09-AC4 |
| TS-09-063 | Reference values/required behavior and reconciliation (FR-09-028) | Integration | T1 | MVP | US-09-10-AC1 |
| TS-09-064 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T1 | MVP | US-09-10-AC2 |
| TS-09-065 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-09-10-AC3 |
| TS-09-066 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-09-10-AC4 |
| TS-09-067 | Reference values/required behavior and reconciliation (FR-09-029) | Integration | T2 | V1 | US-09-11-AC1 |
| TS-09-068 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-11-AC2 |
| TS-09-069 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-11-AC3 |
| TS-09-070 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-11-AC4 |
| TS-09-071 | Reference values/required behavior and reconciliation (FR-09-030) | Integration | T2 | V1 | US-09-12-AC1 |
| TS-09-072 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-12-AC2 |
| TS-09-073 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-12-AC3 |
| TS-09-074 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-12-AC4 |
| TS-09-075 | Reference values/required behavior and reconciliation (FR-09-031, FR-09-032) | Integration | T2 | V1 | US-09-13-AC1 |
| TS-09-076 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-13-AC2 |
| TS-09-077 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-13-AC3 |
| TS-09-078 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-13-AC4 |
| TS-09-079 | Reference values/required behavior and reconciliation (FR-09-033, FR-09-034, FR-09-035) | Integration | T2 | V1 | US-09-14-AC1 |
| TS-09-080 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-14-AC2 |
| TS-09-081 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-14-AC3 |
| TS-09-082 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-14-AC4 |
| TS-09-083 | Reference values/required behavior and reconciliation (FR-09-036, FR-09-037) | Integration | T2 | V1 | US-09-15-AC1 |
| TS-09-084 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-15-AC2 |
| TS-09-085 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-15-AC3 |
| TS-09-086 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-15-AC4 |
| TS-09-087 | Reference values/required behavior and reconciliation (FR-09-038) | Integration | T3 | Future | US-09-16-AC1 |
| TS-09-088 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T3 | Future | US-09-16-AC2 |
| TS-09-089 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-09-16-AC3 |
| TS-09-090 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-09-16-AC4 |
| TS-09-091 | Reference values/required behavior and reconciliation (FR-09-039) | Integration | T2 | V1 | US-09-17-AC1 |
| TS-09-092 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-17-AC2 |
| TS-09-093 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-17-AC3 |
| TS-09-094 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-17-AC4 |
| TS-09-095 | Reference values/required behavior and reconciliation (FR-09-040, FR-09-041, FR-09-042) | Integration | T1 | MVP | US-09-18-AC1 |
| TS-09-096 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T1 | MVP | US-09-18-AC2 |
| TS-09-097 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-09-18-AC3 |
| TS-09-098 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-09-18-AC4 |
| TS-09-099 | Reference values/required behavior and reconciliation (FR-09-042, FR-09-043, FR-09-044, FR-09-045) | Integration | T2 | V1 | US-09-19-AC1 |
| TS-09-100 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-19-AC2 |
| TS-09-101 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-19-AC3 |
| TS-09-102 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-19-AC4 |
| TS-09-103 | Reference values/required behavior and reconciliation (FR-09-046) | Integration | T2 | V1 | US-09-20-AC1 |
| TS-09-104 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-20-AC2 |
| TS-09-105 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-20-AC3 |
| TS-09-106 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-20-AC4 |
| TS-09-107 | Reference values/required behavior and reconciliation (FR-09-047, FR-09-048) | Integration | T2 | V1 | US-09-21-AC1 |
| TS-09-108 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T2 | V1 | US-09-21-AC2 |
| TS-09-109 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-09-21-AC3 |
| TS-09-110 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-09-21-AC4 |
| TS-09-111 | Reference values/required behavior and reconciliation (FR-09-049, FR-09-050) | Integration | T3 | Future | US-09-22-AC1 |
| TS-09-112 | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | API | T3 | Future | US-09-22-AC2 |
| TS-09-113 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-09-22-AC3 |
| TS-09-114 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-09-22-AC4 |

---

## US-09-01: Report Filters, Business-Date Presets, and Scoping

### TS-09-001: Sales at 21:59:30Z and 22:00:30Z attributed to Cairo business dates

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC1 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC1 — Business date uses branch time zone**

*Preconditions / test data*
1. sale S1 completed at 2026-11-09T21:59:30Z (23:59:30 Cairo) and sale S2 completed at 2026-11-09T22:00:30Z (00:00:30 Cairo on 2026-11-10)

*Steps*
1. `M1` requests the daily sales report with `from=2026-11-09&to=2026-11-09`

*Expected results*
1. the response contains `saleCount = 1` (S1 only) and S2 appears only in a report for 2026-11-10

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-002: Preset resolution table for every preset with fixed clock and week start Saturday/Sunday

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC2 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC2 — Presets resolved server-side**

*Preconditions / test data*
1. the current business date is 2026-11-09 and `ReportWeekStartDay = Saturday`

*Steps*
1. `M1` requests `preset=ThisWeek`, then `preset=LastMonth`, then `preset=Last7Days`

*Expected results*
1. `meta.from`/`meta.to` are respectively 2026-11-07/2026-11-09, 2026-10-01/2026-10-31, and 2026-11-03/2026-11-09

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-003: 366-day accepted, 367-day and 678-day rejected; 31/32-day org-level boundary

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC3 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC3 — Interactive range limit**

*Preconditions / test data*
1. a single-branch report request with `from=2025-01-01&to=2026-11-09` (678 days)

*Steps*
1. the request is sent

*Expected results*
1. the API returns 422 `REPORTS.RANGE_REQUIRES_EXPORT` and no query is executed against sales tables

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-004: Invalid range, future date, preset conflict, pageSize 101

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC4 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC4 — Invalid parameters rejected (negative)**

*Preconditions / test data*
1. a request with `from=2026-11-09&to=2026-11-01`, a request with `to=2026-11-10`, and a request with both `preset=Today` and `from`

*Steps*
1. each is sent

*Expected results*
1. the API returns 400 `REPORTS.INVALID_DATE_RANGE`, 400 `REPORTS.FUTURE_DATE_NOT_ALLOWED`, and 400 `REPORTS.INVALID_PRESET` respectively

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-005: Paging with totals over full result and `meta` fields

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC5 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC5 — Totals independent of page**

*Preconditions / test data*
1. a daily sales report for 2026-10-11 … 2026-11-09 (30 days) with 10.00 net sales on each day

*Steps*
1. `M1` requests `page=2&pageSize=10`

*Expected results*
1. `items` has 10 rows, `totalCount = 30`, `totals.netSales = "300.00"`, and `meta` contains `generatedAt`, `timeZone = "Africa/Cairo"`, `currency = "EGP"`, and `dataAsOf`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-006: CS-07 cross-branch request on every branch report endpoint returns 403

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC6 |
| Critical scenario | CS-07 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC6 — Cross-branch access denied (CS-07)**

*Preconditions / test data*
1. `M1` is assigned only to `CAI01`

*Steps*
1. `M1` requests `/api/v1/branches/{ALX01}/reports/sales/daily`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and the response body contains no report data

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-007: CS-08 cross-organization branch id on every report endpoint returns 404, no data

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC7 — Cross-organization access hidden (CS-08)**

*Preconditions / test data*
1. branch `B9` belongs to organization `ORG-B`

*Steps*
1. `M1` requests `/api/v1/branches/{B9}/reports/sales/daily`

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no indication that the branch exists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-008: Missing report permission returns 403

| Field | Value |
|---|---|
| Story | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) — Report Filters, Business-Date Presets, and Scoping |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-01-AC8 |
| Requirements | FR-09-001, FR-09-002, FR-09-003, FR-09-004, FR-09-005 |

**Story preconditions**
- Branch `CAI01` exists with time zone `Africa/Cairo`; current business date 2026-11-09 (Monday).
- Organization setting `ReportWeekStartDay` = `Saturday`.
- User `M1` has role `MANAGER` assigned to `CAI01` only; branch `ALX01` exists in the same organization; organization `ORG-B` exists separately.

**US-09-01-AC8 — Permission denied**

*Preconditions / test data*
1. user `C1` (role `CASHIER`) assigned to `CAI01` without `reports.sales.read`

*Steps*
1. `C1` requests the daily sales report for `CAI01`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-02: DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation

### TS-09-009: Reference dataset → summary and payment summary values within 60 s

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC1 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC1 — Projection reflects events**

*Preconditions / test data*
1. the reference dataset events are committed

*Steps*
1. the projection processes the resulting integration events

*Expected results*
1. within 60 s the `DailyBranchSummary` row for (`CAI01`, 2026-11-09) has `SaleCount = 2`, `GrossSales = 600.00`, `Discounts = 20.00`, `SalesReturns = 100.00`, `NetSales = 480.00`, `CogsSold = 410.00`, `CogsRestocked = 70.00`, `Cogs = 340.00`, `GrossProfit = 140.00`, `Expenses = 150.00`, `WriteOffLoss = 35.00`, `VoidCount = 1`, `VoidedAmount = 50.00`, and `DailyBranchPaymentSummary` rows Cash (480.00 received / 100.00 refunded) and Card (114.00 / 0.00)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-010: Duplicate and out-of-order delivery yields identical row, one inbox record per event

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC2 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC2 — Duplicate and out-of-order events are idempotent**

*Preconditions / test data*
1. the `SaleCompleted` event for S2 is delivered twice and the `SalesReturnCompleted` event for R1 is delivered before the S1 event

*Steps*
1. all deliveries are processed

*Expected results*
1. the summary row equals the AC1 values exactly and exactly one `ProjectionInboxRecord` exists per event id

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-011: Cross-midnight void recomputes previous date and increments `Version`

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC3 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC3 — Late correction recomputes the past date**

*Preconditions / test data*
1. the AC1 row has `Version = n` and the branch business date has advanced to 2026-11-10

*Steps*
1. sale S2 (business date 2026-11-09, 114.00) is voided at 2026-11-09T22:10:00Z (00:10 Cairo on 2026-11-10)

*Expected results*
1. the 2026-11-09 row is recomputed to `SaleCount = 1`, `GrossSales = 500.00`, `NetSales = 380.00`, `Cogs = 280.00`, `GrossProfit = 100.00`, `Version = n + 1`, `LastRecomputedAt` updated, and the 2026-11-10 row shows `VoidCount = 1`, `VoidedAmount = 114.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-012: Nightly job repairs tampered row, records difference, notifies Owners

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC4 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC4 — Nightly reconciliation repairs a discrepancy**

*Preconditions / test data*
1. a test fixture has set the 2026-11-09 row `NetSales` to 470.00 directly in the database

*Steps*
1. the nightly reconciliation job runs for `CAI01`

*Expected results*
1. the row is corrected to 480.00, the `BackgroundJobRun` records difference 10.00 for metric `netSales` on 2026-11-09, and every user with role `OWNER` receives one notification

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-013: Randomized 10,000-sale dataset: RC-08 holds for every branch/date after nightly job

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Property / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC4 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC4 — Nightly reconciliation repairs a discrepancy**

*Preconditions / test data*
1. a test fixture has set the 2026-11-09 row `NetSales` to 470.00 directly in the database

*Steps*
1. the nightly reconciliation job runs for `CAI01`

*Expected results*
1. the row is corrected to 480.00, the `BackgroundJobRun` records difference 10.00 for metric `netSales` on 2026-11-09, and every user with role `OWNER` receives one notification

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-014: Rebuild 202 + audit; concurrent rebuild 409

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC5 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC5 — Manual rebuild**

*Preconditions / test data*
1. `OWN1` sends `POST /branches/{CAI01}/reports/projections/rebuild` with `from=2026-10-01&to=2026-11-09` and an `Idempotency-Key`

*Steps*
1. a second rebuild for `CAI01` is requested while the first is running

*Expected results*
1. the first returns 202 and writes an audit entry, and the second returns 409 `REPORTS.PROJECTION_REBUILD_IN_PROGRESS`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-015: Rebuild range validation

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC6 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC6 — Rebuild range invalid (negative)**

*Preconditions / test data*
1. `OWN1` requests a rebuild for `from=2025-01-01&to=2026-11-09` (678 days)

*Steps*
1. the request is sent

*Expected results*
1. the API returns 400 `REPORTS.REBUILD_RANGE_INVALID` and no job is enqueued

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-016: 403 without permission; 404 cross-organization (CS-07/CS-08)

| Field | Value |
|---|---|
| Story | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) — DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-02-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |

**Story preconditions**
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

**US-09-02-AC7 — Permission denied and cross-organization**

*Preconditions / test data*
1. `M1` lacks `reports.projections.manage`, and branch `B9` belongs to another organization

*Steps*
1. `M1` requests a rebuild for `CAI01`, and `OWN1` requests a rebuild for `B9`

*Expected results*
1. the first returns 403 `COMMON.FORBIDDEN` and the second returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-03: Daily Sales Report

### TS-09-017: Reference dataset daily row exact values

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC1 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC1 — Reference day figures**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `M1` requests `GET /branches/{CAI01}/reports/sales/daily?from=2026-11-09&to=2026-11-09`

*Expected results*
1. the row for 2026-11-09 has `saleCount = 2`, `grossSales = 600.00`, `discounts = 20.00`, `salesReturns = 100.00`, `netSales = 480.00`, `netTaxCollected = 14.00`, Cash `received = 480.00` / `refunded = 100.00`, Card `received = 114.00` / `refunded = 0.00`, `voidCount = 1`, `voidedAmount = 50.00`, `averageBasket = 290.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-018: 3-day period with zero day and totals = Σ rows

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC2 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC2 — Every date in period returned, totals equal row sums**

*Preconditions / test data*
1. the period 2026-11-08 … 2026-11-10

*Steps*
1. the report is requested

*Expected results*
1. 3 rows are returned
2. 2026-11-08 has `saleCount = 1`, `grossSales = 100.00`, `netSales = 100.00`
3. 2026-11-10 has all amounts 0.00
4. and `totals` equal the column sums (`grossSales = 700.00`, `netSales = 580.00`) with difference 0.00

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-019: Randomized data: net-sales identity per row; voided sales contribute 0.00

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Property / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC3 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC3 — Net sales identity on every row**

*Preconditions / test data*
1. any row of any daily sales report

*Steps*
1. the response is validated

*Expected results*
1. `netSales = grossSales − discounts − salesReturns` exactly, and voided sale S3 contributes 0.00 to `grossSales`, `discounts`, `netTaxCollected`, and payments

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-020: Cross-month return attribution

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC4 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC4 — Return attributed to return date**

*Preconditions / test data*
1. sale S10 of 200.00 on 2026-10-30 is returned in full on 2026-11-02

*Steps*
1. reports for October 2026 and for 2026-11-02 are requested

*Expected results*
1. October's `salesReturns` is unaffected by S10's return and 2026-11-02 shows `salesReturns = 200.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-021: Missing `reports.sales.read` → 403

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC5 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC5 — Permission denied**

*Preconditions / test data*
1. user `INV1` (`INVENTORY`) assigned to `CAI01` lacks `reports.sales.read`

*Steps*
1. `INV1` requests the daily sales report

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-022: CS-07 cross-branch → 403

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC6 |
| Critical scenario | CS-07 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC6 — Cross-branch and cross-organization**

*Preconditions / test data*
1. `M1` is assigned only to `CAI01`

*Steps*
1. `M1` requests the report for `ALX01` (same organization) and for `B9` (other organization)

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND` respectively

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-023: CS-08 cross-organization → 404

| Field | Value |
|---|---|
| Story | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) — Daily Sales Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-03-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-09-006, FR-09-011, FR-09-012 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded for `CAI01`, 2026-11-09; no activity on 2026-11-08 or 2026-11-10 other than the original sale of R1 on 2026-11-08 (2 × Medicine A @ 50.00, cash).
- User `M1` (`MANAGER`, assigned `CAI01`) holds `reports.sales.read`.

**US-09-03-AC6 — Cross-branch and cross-organization**

*Preconditions / test data*
1. `M1` is assigned only to `CAI01`

*Steps*
1. `M1` requests the report for `ALX01` (same organization) and for `B9` (other organization)

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND` respectively

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-04: Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour

### TS-09-024: Reference dataset by medicine with shares

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC1 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC1 — Group by medicine**

*Preconditions / test data*
1. the reference dataset for 2026-11-09

*Steps*
1. `M1` requests `groupBy=medicine`

*Expected results*
1. Medicine A has `quantitySold = 10`, `grossSales = 500.00`, `discounts = 20.00`, `salesReturns = 100.00`, `netSales = 380.00`, `share = 79.17`
2. Medicine B has `quantitySold = 4`, `grossSales = 100.00`, `netSales = 100.00`, `share = 20.83`
3. `totals.netSales = 480.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-025: By payment method; Σ net = cash flow from sales

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC2 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC2 — Group by payment method reconciles to cash flow**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `M1` requests `groupBy=paymentMethod`

*Expected results*
1. Cash shows `received = 480.00`, `refunded = 100.00`, `net = 380.00`
2. Card shows `received = 114.00`, `refunded = 0.00`, `net = 114.00`
3. and Σ `net` = 494.00 = `cashFlowFromSales`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-026: By cashier with return attribution

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC3 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC3 — Group by cashier**

*Preconditions / test data*
1. the reference dataset where returns are attributed to the user who completed the return

*Steps*
1. `M1` requests `groupBy=cashier`

*Expected results*
1. `C1` shows `saleCount = 1`, `grossSales = 500.00`, `salesReturns = 100.00`, `netSales = 380.00`
2. `C2` shows `saleCount = 1`, `netSales = 100.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-027: By hour in Cairo local time, 24 rows

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC4 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC4 — Group by hour uses branch local time**

*Preconditions / test data*
1. S2 completed at 21:30Z (23:30 Cairo)

*Steps*
1. `M1` requests `groupBy=hourOfDay`

*Expected results*
1. S2 is counted in hour `23` and S1 (07:15Z = 09:15 Cairo) in hour `9`, and 24 rows (0–23) are returned

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-028: Invalid `groupBy`

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC5 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC5 — Invalid groupBy (negative)**

*Preconditions / test data*
1. a request with `groupBy=supplier`

*Steps*
1. it is sent to the sales analysis endpoint

*Expected results*
1. the API returns 400 `REPORTS.INVALID_GROUP_BY`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-029: 403 missing permission and CS-07 cross-branch

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC6 |
| Critical scenario | CS-07 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC6 — Permission denied and cross-branch**

*Preconditions / test data*
1. user `PH1` (`PHARMACIST`) without `reports.sales.read`, and `M1` assigned only to `CAI01`

*Steps*
1. `PH1` requests the analysis for `CAI01` and `M1` requests it for `ALX01`

*Expected results*
1. both return 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-030: CS-08 cross-organization 404

| Field | Value |
|---|---|
| Story | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) — Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-04-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-09-013, FR-09-014 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: S1 (Medicine A, category "Analgesics") sold by cashier `C1` at 2026-11-09T07:15:00Z; S2 (Medicine B, category "Skin Care") sold by cashier `C2` at 2026-11-09T21:30:00Z; return R1 processed by `C1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-04-AC7 — Cross-organization**

*Preconditions / test data*
1. branch `B9` belongs to another organization

*Steps*
1. `M1` requests the analysis for `B9`

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-05: Gross Profit and COGS Report

### TS-09-031: Reference dataset profit by day

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC1 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC1 — Reference day profit**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `OWN1` requests `GET /branches/{CAI01}/reports/profit?groupBy=day&from=2026-11-09&to=2026-11-09`

*Expected results*
1. the row shows `netSales = 480.00`, `cogsSold = 410.00`, `cogsRestocked = 70.00`, `cogs = 340.00`, `grossProfit = 140.00`, `grossMarginPct = 29.17`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-032: Profit by medicine and totals

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC2 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC2 — Profit by medicine**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `OWN1` requests `groupBy=medicine`

*Expected results*
1. Medicine A shows `netSales = 380.00`, `cogs = 280.00`, `grossProfit = 100.00`, `grossMarginPct = 26.32`
2. Medicine B shows `netSales = 100.00`, `cogs = 60.00`, `grossProfit = 40.00`, `grossMarginPct = 40.00`
3. totals 480.00 / 340.00 / 140.00

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-033: Negative margin flag and filter

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC3 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC3 — Negative margin flagged**

*Preconditions / test data*
1. Medicine D sold 1 unit @ 10.00 from a batch with unit cost 12.0000 on 2026-11-09

*Steps*
1. `OWN1` requests `groupBy=medicine&negativeOnly=true`

*Expected results*
1. only Medicine D is returned with `grossProfit = -2.00`, `grossMarginPct = -20.00`, `negativeMargin = true`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-034: Margin null on zero net sales; rounding AwayFromZero

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC4 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC4 — Zero net sales gives null margin**

*Preconditions / test data*
1. Medicine E sold 1 @ 50.00 (cost 35.0000) and returned the same day with disposition `Discarded`

*Steps*
1. `OWN1` requests `groupBy=medicine`

*Expected results*
1. Medicine E shows `netSales = 0.00`, `cogs = 35.00`, `grossProfit = -35.00`, `grossMarginPct = null`, and no error occurs

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-035: Pending → Restocked next day shifts COGS reversal; Discarded never reverses

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC5 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC5 — Discarded and pending returns do not reverse COGS**

*Preconditions / test data*
1. a return of 2 × A (allocation cost 35.0000) with disposition `PendingInspection` on 2026-11-09, set to `Restocked` on 2026-11-10

*Steps*
1. profit reports for 2026-11-09 and 2026-11-10 are requested

*Expected results*
1. 2026-11-09 shows `cogsRestocked = 0.00` for that return and 2026-11-10 shows `cogsRestocked = 70.00` for it

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-036: RC-05: COGS equals −Σ movement value of Sale/SaleVoid/SalesReturn

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Property / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC1 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC1 — Reference day profit**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `OWN1` requests `GET /branches/{CAI01}/reports/profit?groupBy=day&from=2026-11-09&to=2026-11-09`

*Expected results*
1. the row shows `netSales = 480.00`, `cogsSold = 410.00`, `cogsRestocked = 70.00`, `cogs = 340.00`, `grossProfit = 140.00`, `grossMarginPct = 29.17`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-037: Sales-only user gets 403

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC6 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC6 — Permission denied**

*Preconditions / test data*
1. `M2` holds `reports.sales.read` but not `reports.finance.read`

*Steps*
1. `M2` requests the profit report

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-038: CS-08 404 and CS-07 403

| Field | Value |
|---|---|
| Story | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) — Gross Profit and COGS Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-05-AC7 |
| Critical scenario | CS-08, CS-07 |
| Requirements | FR-09-006, FR-09-015, FR-09-016, FR-09-017 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset loaded (S1: 10 × A, allocation cost 35.0000; S2: 4 × B, cost 15.0000; R1 restocked 2 × A at 35.0000).
- User `OWN1` holds `reports.finance.read`; user `M2` holds only `reports.sales.read`.

**US-09-05-AC7 — Cross-branch and cross-organization**

*Preconditions / test data*
1. `OWN1`'s organization does not own branch `B9`, and manager `M1` is assigned only to `CAI01` with `reports.finance.read`

*Steps*
1. `OWN1` requests the profit report for `B9` and `M1` requests it for `ALX01`

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` and 403 `COMMON.FORBIDDEN` respectively

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-06: Returns and Refunds Report

### TS-09-039: Reference return row and return rate 17.24

| Field | Value |
|---|---|
| Story | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) — Returns and Refunds Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-06-AC1 |
| Requirements | FR-09-018 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-06-AC1 — Reference return listed with return rate**

*Preconditions / test data*
1. the reference dataset

*Steps*
1. `M1` requests `GET /branches/{CAI01}/reports/sales/returns?from=2026-11-09&to=2026-11-09`

*Expected results*
1. R1 is listed with `originalSaleBusinessDate = 2026-11-08`, `quantity = 2`, `returnAmount = 100.00`, `taxReversed = 0.00`, refund `Cash 100.00`, disposition `Restocked`, `approvedBy = M1`
2. totals `salesReturns = 100.00`
3. `returnRatePct = 17.24` (100.00 ÷ 580.00 × 100)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-040: Disposition totals for mixed return

| Field | Value |
|---|---|
| Story | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) — Returns and Refunds Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-06-AC2 |
| Requirements | FR-09-018 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-06-AC2 — Disposition breakdown**

*Preconditions / test data*
1. on 2026-11-12 return R2 has lines: 1 × A `PendingInspection` (50.00), 1 × A `Discarded` (50.00), 2 × B `Restocked` (50.00)

*Steps*
1. `M1` requests the report for 2026-11-12

*Expected results*
1. totals by disposition are `PendingInspection = 50.00`, `Discarded = 50.00`, `Restocked = 50.00`, and `salesReturns = 150.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-041: Pending/rejected returns excluded

| Field | Value |
|---|---|
| Story | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) — Returns and Refunds Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-06-AC3 |
| Requirements | FR-09-018 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-06-AC3 — Only completed returns (negative)**

*Preconditions / test data*
1. return R3 in `PendingApproval` and return R4 `Rejected` on 2026-11-09

*Steps*
1. the report for 2026-11-09 is requested

*Expected results*
1. neither R3 nor R4 appears and totals remain `salesReturns = 100.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-042: Missing permission 403

| Field | Value |
|---|---|
| Story | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) — Returns and Refunds Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-06-AC4 |
| Requirements | FR-09-018 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-06-AC4 — Permission denied**

*Preconditions / test data*
1. user `INV1` lacks `reports.sales.read`

*Steps*
1. `INV1` requests the returns report

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-043: CS-07 403 and CS-08 404

| Field | Value |
|---|---|
| Story | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) — Returns and Refunds Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-06-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-09-018 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

**US-09-06-AC5 — Cross-branch and cross-organization**

*Preconditions / test data*
1. `M1` is assigned only to `CAI01`

*Steps*
1. `M1` requests the report for `ALX01` and for other-organization branch `B9`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-07: Cash Session X/Z Report and Cash Reconciliation

### TS-09-044: Reference Z-report exact figures

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC1 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC1 — Z-report figures**

*Preconditions / test data*
1. `CS1` is `Closed`

*Steps*
1. `M1` requests `GET /branches/{CAI01}/reports/cash-sessions/{CS1}`

*Expected results*
1. the report has `type = "Z"`, `openingFloat = 500.00`, `cashSales = 480.00`, `cashRefunds = 100.00`, `cashIn = 0.00`, `cashOut = 0.00`, `expensePayouts = 150.00`, `expectedCash = 730.00`, `countedCash = 725.00`, `variance = -5.00`, non-cash `Card = 114.00`, `saleCount = 2`, `voidCount = 1`, `returnCount = 1`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-045: Z-report regenerated later is identical; RC-06 check

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC2 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC2 — Z-report immutable and reproducible**

*Preconditions / test data*
1. `CS1` is closed and its Z-report was generated once

*Steps*
1. the Z-report is generated again 24 hours later after new sales occurred in another session

*Expected results*
1. every field except `meta.generatedAt` is identical, and `expectedCash` = 500.00 + Σ signed `CashMovement.Amount` of `CS1` (RC-06)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-046: RC-06 on randomized sessions with cash in/out, refunds, voids, payouts

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Property / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC2 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC2 — Z-report immutable and reproducible**

*Preconditions / test data*
1. `CS1` is closed and its Z-report was generated once

*Steps*
1. the Z-report is generated again 24 hours later after new sales occurred in another session

*Expected results*
1. every field except `meta.generatedAt` is identical, and `expectedCash` = 500.00 + Σ signed `CashMovement.Amount` of `CS1` (RC-06)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-047: X-report for open session, no counted/variance

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC3 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC3 — X-report for open session**

*Preconditions / test data*
1. session `CS2` of `C1` is `Open` with opening float 300.00 and one cash sale of 120.00

*Steps*
1. `C1` requests the report for `CS2`

*Expected results*
1. the report has `type = "X"`, `final = false`, `expectedCash = 420.00`, and contains no `countedCash` or `variance` fields

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-048: Cashier reading another cashier's session → 403

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC4 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC4 — Cashier limited to own sessions**

*Preconditions / test data*
1. `C2` holds only `sales.cash-sessions.open-close`

*Steps*
1. `C2` requests the report for `CS1` (owned by `C1`)

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-049: Reconciliation list filter, sort, shortages/overages totals

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC5 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC5 — Reconciliation list across sessions**

*Preconditions / test data*
1. closed sessions on 2026-11-09: `CS1` (variance −5.00), `CS3` (expected 1,000.00, counted 1,002.00, variance +2.00), `CS4` (variance 0.00)

*Steps*
1. `M1` requests `GET /branches/{CAI01}/reports/cash-reconciliation?from=2026-11-09&to=2026-11-09&nonZeroOnly=true&sort=-absVariance`

*Expected results*
1. 2 rows are returned in order `CS1`, `CS3`
2. and the unfiltered totals show `shortages = -5.00`, `overages = 2.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-050: CS-08 other-org session and missing session both 404 with same body

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC6 — Session not found or other organization (negative)**

*Preconditions / test data*
1. session id `CSX` belongs to another organization and id `CSY` does not exist

*Steps*
1. `M1` requests either report

*Expected results*
1. the API returns 404 `REPORTS.CASH_SESSION_NOT_FOUND` for both with identical bodies apart from `traceId`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-051: CS-07 cross-branch session → 403

| Field | Value |
|---|---|
| Story | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) — Cash Session X/Z Report and Cash Reconciliation |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-07-AC7 |
| Critical scenario | CS-07 |
| Requirements | FR-09-019, FR-09-020, FR-09-021, FR-09-022 |

**Story preconditions**
- SPEC-09 §6.3 reference dataset: session `CS1` of cashier `C1` in `CAI01`, opening float 500.00, movements: S1 cash +480.00, S3 cash +50.00, S3 void −50.00, R1 refund −100.00, expense payout −150.00; S2 card 114.00 (non-cash); closed with counted cash 725.00.
- `C1` holds `sales.cash-sessions.open-close`; `M1` holds `reports.finance.read` for `CAI01`.

**US-09-07-AC7 — Cross-branch**

*Preconditions / test data*
1. `M1` is assigned only to `CAI01` and session `CS9` belongs to `ALX01`

*Steps*
1. `M1` requests `/branches/{ALX01}/reports/cash-sessions/{CS9}`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-08: Current Inventory Valuation (Stock on Hand)

### TS-09-052: Four classes, values, subtotals, grand total 3,850.00

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC1 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC1 — Classes and values**

*Preconditions / test data*
1. the batches above

*Steps*
1. `OWN1` requests `GET /branches/{CAI01}/reports/inventory/valuation`

*Expected results*
1. `B1` is `Sellable` value 3,500.00
2. `B2` is `Expired` value 125.00
3. `B3` is `Quarantined` value 165.00
4. `B4` is `DoNotSellWindow` value 60.00
5. class subtotals equal those values
6. grand total = 3,850.00
7. `B5` is not listed

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-053: Class precedence including expiry = business date

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC1 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC1 — Classes and values**

*Preconditions / test data*
1. the batches above

*Steps*
1. `OWN1` requests `GET /branches/{CAI01}/reports/inventory/valuation`

*Expected results*
1. `B1` is `Sellable` value 3,500.00
2. `B2` is `Expired` value 125.00
3. `B3` is `Quarantined` value 165.00
4. `B4` is `DoNotSellWindow` value 60.00
5. class subtotals equal those values
6. grand total = 3,850.00
7. `B5` is not listed

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-054: Reserved shown, value on on-hand

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC2 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC2 — Reserved does not change value**

*Preconditions / test data*
1. `B1` has on-hand 100 and reserved 30

*Steps*
1. the report is generated

*Expected results*
1. `B1` shows `onHand = 100`, `reserved = 30`, `value = 3500.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-055: Rounding per batch; grand total = direct DB computation (FR-09-024)

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC3 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC3 — Per-batch rounding and grand-total identity**

*Preconditions / test data*
1. two additional Active batches each with on-hand 3 and unit cost 0.3333

*Steps*
1. the report is generated

*Expected results*
1. each shows `value = 1.00`, and the grand total equals Σ round₂(`BatchBalance.OnHand` × `Batch.UnitCost`) computed directly from the database with difference 0.00 (3,852.00)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-056: Group by medicine with class breakdown

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC4 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC4 — Aggregation by medicine and category**

*Preconditions / test data*
1. `B1` and `B4` belong to Medicine A (category "Analgesics")

*Steps*
1. `OWN1` requests `groupBy=medicine`

*Expected results*
1. Medicine A shows `onHand = 104`, `value = 3560.00` with class breakdown `Sellable 3500.00`, `DoNotSellWindow 60.00`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-057: Cashier 403

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC5 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC5 — Permission denied**

*Preconditions / test data*
1. user `C1` (`CASHIER`) lacks `reports.inventory.read`

*Steps*
1. `C1` requests the valuation

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-058: CS-07 403, CS-08 404

| Field | Value |
|---|---|
| Story | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) — Current Inventory Valuation (Stock on Hand) |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-08-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-09-023, FR-09-024 |

**Story preconditions**
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

**US-09-08-AC6 — Cross-branch and cross-organization**

*Preconditions / test data*
1. `M1` assigned only to `CAI01` with `reports.inventory.read`

*Steps*
1. `M1` requests valuation for `ALX01` and for other-organization branch `B9`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-09: Historical Inventory Valuation

### TS-09-059: Reference values/required behavior and reconciliation (FR-09-025)

| Field | Value |
|---|---|
| Story | [US-09-09](../stories/EPIC-09-FINANCE-REPORTING/US-09-09-historical-inventory-valuation.md) — Historical Inventory Valuation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-09-AC1 |
| Requirements | FR-09-025, FR-09-026, FR-09-027 |

**Story preconditions**
- Source entities and settings required by FR-09-025 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-09-AC1 — Exact reference result**

*Preconditions / test data*
1. Given batches with 10 base units at EGP 12.5000 unit cost and an as-of on-hand quantity of 10, the row value is EGP 125.00.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-025

*Expected results*
1. the system applies each requirement in FR-09-025
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-060: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-09](../stories/EPIC-09-FINANCE-REPORTING/US-09-09-historical-inventory-valuation.md) — Historical Inventory Valuation |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-09-AC2 |
| Requirements | FR-09-025, FR-09-026, FR-09-027 |

**Story preconditions**
- Source entities and settings required by FR-09-025 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-09-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-025

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-061: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-09](../stories/EPIC-09-FINANCE-REPORTING/US-09-09-historical-inventory-valuation.md) — Historical Inventory Valuation |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-09-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-025, FR-09-026, FR-09-027 |

**Story preconditions**
- Source entities and settings required by FR-09-025 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-09-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.inventory.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-062: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-09](../stories/EPIC-09-FINANCE-REPORTING/US-09-09-historical-inventory-valuation.md) — Historical Inventory Valuation |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-09-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-025, FR-09-026, FR-09-027 |

**Story preconditions**
- Source entities and settings required by FR-09-025 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-09-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-10: Near-Expiry and Expired Stock Report

### TS-09-063: Reference values/required behavior and reconciliation (FR-09-028)

| Field | Value |
|---|---|
| Story | [US-09-10](../stories/EPIC-09-FINANCE-REPORTING/US-09-10-near-expiry-report.md) — Near-Expiry and Expired Stock Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-10-AC1 |
| Requirements | FR-09-028 |

**Story preconditions**
- Source entities and settings required by FR-09-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-10-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-028

*Expected results*
1. the system applies each requirement in FR-09-028
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-064: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-10](../stories/EPIC-09-FINANCE-REPORTING/US-09-10-near-expiry-report.md) — Near-Expiry and Expired Stock Report |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-10-AC2 |
| Requirements | FR-09-028 |

**Story preconditions**
- Source entities and settings required by FR-09-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-10-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-028

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-065: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-10](../stories/EPIC-09-FINANCE-REPORTING/US-09-10-near-expiry-report.md) — Near-Expiry and Expired Stock Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-10-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-028 |

**Story preconditions**
- Source entities and settings required by FR-09-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-10-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.inventory.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-066: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-10](../stories/EPIC-09-FINANCE-REPORTING/US-09-10-near-expiry-report.md) — Near-Expiry and Expired Stock Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-10-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-028 |

**Story preconditions**
- Source entities and settings required by FR-09-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-10-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-11: Inventory Loss Report

### TS-09-067: Reference values/required behavior and reconciliation (FR-09-029)

| Field | Value |
|---|---|
| Story | [US-09-11](../stories/EPIC-09-FINANCE-REPORTING/US-09-11-inventory-loss-report.md) — Inventory Loss Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-11-AC1 |
| Requirements | FR-09-029 |

**Story preconditions**
- Source entities and settings required by FR-09-029 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-11-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-029

*Expected results*
1. the system applies each requirement in FR-09-029
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-068: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-11](../stories/EPIC-09-FINANCE-REPORTING/US-09-11-inventory-loss-report.md) — Inventory Loss Report |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-11-AC2 |
| Requirements | FR-09-029 |

**Story preconditions**
- Source entities and settings required by FR-09-029 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-11-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-029

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-069: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-11](../stories/EPIC-09-FINANCE-REPORTING/US-09-11-inventory-loss-report.md) — Inventory Loss Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-11-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-029 |

**Story preconditions**
- Source entities and settings required by FR-09-029 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-11-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.finance.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-070: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-11](../stories/EPIC-09-FINANCE-REPORTING/US-09-11-inventory-loss-report.md) — Inventory Loss Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-11-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-029 |

**Story preconditions**
- Source entities and settings required by FR-09-029 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-11-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-12: Purchase Report

### TS-09-071: Reference values/required behavior and reconciliation (FR-09-030)

| Field | Value |
|---|---|
| Story | [US-09-12](../stories/EPIC-09-FINANCE-REPORTING/US-09-12-purchase-report.md) — Purchase Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-12-AC1 |
| Requirements | FR-09-030 |

**Story preconditions**
- Source entities and settings required by FR-09-030 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-12-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-030

*Expected results*
1. the system applies each requirement in FR-09-030
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-072: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-12](../stories/EPIC-09-FINANCE-REPORTING/US-09-12-purchase-report.md) — Purchase Report |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-12-AC2 |
| Requirements | FR-09-030 |

**Story preconditions**
- Source entities and settings required by FR-09-030 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-12-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-030

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-073: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-12](../stories/EPIC-09-FINANCE-REPORTING/US-09-12-purchase-report.md) — Purchase Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-12-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-030 |

**Story preconditions**
- Source entities and settings required by FR-09-030 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-12-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.finance.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-074: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-12](../stories/EPIC-09-FINANCE-REPORTING/US-09-12-purchase-report.md) — Purchase Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-12-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-030 |

**Story preconditions**
- Source entities and settings required by FR-09-030 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-12-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-13: Supplier Balances and Aging

### TS-09-075: Reference values/required behavior and reconciliation (FR-09-031, FR-09-032)

| Field | Value |
|---|---|
| Story | [US-09-13](../stories/EPIC-09-FINANCE-REPORTING/US-09-13-supplier-balances-and-aging.md) — Supplier Balances and Aging |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-13-AC1 |
| Requirements | FR-09-031, FR-09-032 |

**Story preconditions**
- Source entities and settings required by FR-09-031, FR-09-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-13-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-031, FR-09-032

*Expected results*
1. the system applies each requirement in FR-09-031, FR-09-032
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-076: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-13](../stories/EPIC-09-FINANCE-REPORTING/US-09-13-supplier-balances-and-aging.md) — Supplier Balances and Aging |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-13-AC2 |
| Requirements | FR-09-031, FR-09-032 |

**Story preconditions**
- Source entities and settings required by FR-09-031, FR-09-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-13-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-031, FR-09-032

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-077: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-13](../stories/EPIC-09-FINANCE-REPORTING/US-09-13-supplier-balances-and-aging.md) — Supplier Balances and Aging |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-13-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-031, FR-09-032 |

**Story preconditions**
- Source entities and settings required by FR-09-031, FR-09-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-13-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.finance.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-078: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-13](../stories/EPIC-09-FINANCE-REPORTING/US-09-13-supplier-balances-and-aging.md) — Supplier Balances and Aging |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-13-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-031, FR-09-032 |

**Story preconditions**
- Source entities and settings required by FR-09-031, FR-09-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-13-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-14: Expense Categories and Expense Reporting

### TS-09-079: Reference values/required behavior and reconciliation (FR-09-033, FR-09-034, FR-09-035)

| Field | Value |
|---|---|
| Story | [US-09-14](../stories/EPIC-09-FINANCE-REPORTING/US-09-14-expense-categories-and-expense-reporting.md) — Expense Categories and Expense Reporting |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-14-AC1 |
| Requirements | FR-09-033, FR-09-034, FR-09-035 |

**Story preconditions**
- Source entities and settings required by FR-09-033, FR-09-034, FR-09-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-14-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-033, FR-09-034, FR-09-035

*Expected results*
1. the system applies each requirement in FR-09-033, FR-09-034, FR-09-035
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-080: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-14](../stories/EPIC-09-FINANCE-REPORTING/US-09-14-expense-categories-and-expense-reporting.md) — Expense Categories and Expense Reporting |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-14-AC2 |
| Requirements | FR-09-033, FR-09-034, FR-09-035 |

**Story preconditions**
- Source entities and settings required by FR-09-033, FR-09-034, FR-09-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-14-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-033, FR-09-034, FR-09-035

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-081: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-14](../stories/EPIC-09-FINANCE-REPORTING/US-09-14-expense-categories-and-expense-reporting.md) — Expense Categories and Expense Reporting |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-14-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-033, FR-09-034, FR-09-035 |

**Story preconditions**
- Source entities and settings required by FR-09-033, FR-09-034, FR-09-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-14-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `finance.expenses.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-082: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-14](../stories/EPIC-09-FINANCE-REPORTING/US-09-14-expense-categories-and-expense-reporting.md) — Expense Categories and Expense Reporting |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-14-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-033, FR-09-034, FR-09-035 |

**Story preconditions**
- Source entities and settings required by FR-09-033, FR-09-034, FR-09-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-14-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-15: Expense Cash Payout and Reversal

### TS-09-083: Reference values/required behavior and reconciliation (FR-09-036, FR-09-037)

| Field | Value |
|---|---|
| Story | [US-09-15](../stories/EPIC-09-FINANCE-REPORTING/US-09-15-expense-cash-payout-and-reversal.md) — Expense Cash Payout and Reversal |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-15-AC1 |
| Requirements | FR-09-036, FR-09-037 |

**Story preconditions**
- Source entities and settings required by FR-09-036, FR-09-037 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-15-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-036, FR-09-037

*Expected results*
1. the system applies each requirement in FR-09-036, FR-09-037
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-084: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-15](../stories/EPIC-09-FINANCE-REPORTING/US-09-15-expense-cash-payout-and-reversal.md) — Expense Cash Payout and Reversal |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-15-AC2 |
| Requirements | FR-09-036, FR-09-037 |

**Story preconditions**
- Source entities and settings required by FR-09-036, FR-09-037 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-15-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-036, FR-09-037

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-085: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-15](../stories/EPIC-09-FINANCE-REPORTING/US-09-15-expense-cash-payout-and-reversal.md) — Expense Cash Payout and Reversal |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-15-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-036, FR-09-037 |

**Story preconditions**
- Source entities and settings required by FR-09-036, FR-09-037 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-15-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `finance.expenses.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-086: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-15](../stories/EPIC-09-FINANCE-REPORTING/US-09-15-expense-cash-payout-and-reversal.md) — Expense Cash Payout and Reversal |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-15-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-036, FR-09-037 |

**Story preconditions**
- Source entities and settings required by FR-09-036, FR-09-037 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-15-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-16: Expense Approval Workflow

### TS-09-087: Reference values/required behavior and reconciliation (FR-09-038)

| Field | Value |
|---|---|
| Story | [US-09-16](../stories/EPIC-09-FINANCE-REPORTING/US-09-16-expense-approval-workflow.md) — Expense Approval Workflow |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-09-16-AC1 |
| Requirements | FR-09-038 |

**Story preconditions**
- Source entities and settings required by FR-09-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-16-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-038

*Expected results*
1. the system applies each requirement in FR-09-038
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-088: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-16](../stories/EPIC-09-FINANCE-REPORTING/US-09-16-expense-approval-workflow.md) — Expense Approval Workflow |
| Type / Execution | API / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-09-16-AC2 |
| Requirements | FR-09-038 |

**Story preconditions**
- Source entities and settings required by FR-09-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-16-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-038

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-089: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-16](../stories/EPIC-09-FINANCE-REPORTING/US-09-16-expense-approval-workflow.md) — Expense Approval Workflow |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-09-16-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-038 |

**Story preconditions**
- Source entities and settings required by FR-09-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-16-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `finance.expenses.approve` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-090: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-16](../stories/EPIC-09-FINANCE-REPORTING/US-09-16-expense-approval-workflow.md) — Expense Approval Workflow |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-09-16-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-038 |

**Story preconditions**
- Source entities and settings required by FR-09-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-16-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-17: Tax Summary Report

### TS-09-091: Reference values/required behavior and reconciliation (FR-09-039)

| Field | Value |
|---|---|
| Story | [US-09-17](../stories/EPIC-09-FINANCE-REPORTING/US-09-17-tax-summary-report.md) — Tax Summary Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-17-AC1 |
| Requirements | FR-09-039 |

**Story preconditions**
- Source entities and settings required by FR-09-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-17-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-039

*Expected results*
1. the system applies each requirement in FR-09-039
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-092: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-17](../stories/EPIC-09-FINANCE-REPORTING/US-09-17-tax-summary-report.md) — Tax Summary Report |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-17-AC2 |
| Requirements | FR-09-039 |

**Story preconditions**
- Source entities and settings required by FR-09-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-17-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-039

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-093: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-17](../stories/EPIC-09-FINANCE-REPORTING/US-09-17-tax-summary-report.md) — Tax Summary Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-17-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-039 |

**Story preconditions**
- Source entities and settings required by FR-09-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-17-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.finance.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-094: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-17](../stories/EPIC-09-FINANCE-REPORTING/US-09-17-tax-summary-report.md) — Tax Summary Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-17-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-039 |

**Story preconditions**
- Source entities and settings required by FR-09-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-17-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-18: Synchronous CSV Report Export

### TS-09-095: Reference values/required behavior and reconciliation (FR-09-040, FR-09-041, FR-09-042)

| Field | Value |
|---|---|
| Story | [US-09-18](../stories/EPIC-09-FINANCE-REPORTING/US-09-18-synchronous-csv-report-export.md) — Synchronous CSV Report Export |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-18-AC1 |
| Requirements | FR-09-040, FR-09-041, FR-09-042 |

**Story preconditions**
- Source entities and settings required by FR-09-040, FR-09-041, FR-09-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-18-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-040, FR-09-041, FR-09-042

*Expected results*
1. the system applies each requirement in FR-09-040, FR-09-041, FR-09-042
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-096: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-18](../stories/EPIC-09-FINANCE-REPORTING/US-09-18-synchronous-csv-report-export.md) — Synchronous CSV Report Export |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-09-18-AC2 |
| Requirements | FR-09-040, FR-09-041, FR-09-042 |

**Story preconditions**
- Source entities and settings required by FR-09-040, FR-09-041, FR-09-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-18-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-040, FR-09-041, FR-09-042

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-097: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-18](../stories/EPIC-09-FINANCE-REPORTING/US-09-18-synchronous-csv-report-export.md) — Synchronous CSV Report Export |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-18-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-040, FR-09-041, FR-09-042 |

**Story preconditions**
- Source entities and settings required by FR-09-040, FR-09-041, FR-09-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-18-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.export` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-098: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-18](../stories/EPIC-09-FINANCE-REPORTING/US-09-18-synchronous-csv-report-export.md) — Synchronous CSV Report Export |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-09-18-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-040, FR-09-041, FR-09-042 |

**Story preconditions**
- Source entities and settings required by FR-09-040, FR-09-041, FR-09-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-18-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-19: Background Report Exports

### TS-09-099: Reference values/required behavior and reconciliation (FR-09-042, FR-09-043, FR-09-044, FR-09-045)

| Field | Value |
|---|---|
| Story | [US-09-19](../stories/EPIC-09-FINANCE-REPORTING/US-09-19-background-report-exports.md) — Background Report Exports |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-19-AC1 |
| Requirements | FR-09-042, FR-09-043, FR-09-044, FR-09-045 |

**Story preconditions**
- Source entities and settings required by FR-09-042, FR-09-043, FR-09-044, FR-09-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-19-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-042, FR-09-043, FR-09-044, FR-09-045

*Expected results*
1. the system applies each requirement in FR-09-042, FR-09-043, FR-09-044, FR-09-045
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-100: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-19](../stories/EPIC-09-FINANCE-REPORTING/US-09-19-background-report-exports.md) — Background Report Exports |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-19-AC2 |
| Requirements | FR-09-042, FR-09-043, FR-09-044, FR-09-045 |

**Story preconditions**
- Source entities and settings required by FR-09-042, FR-09-043, FR-09-044, FR-09-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-19-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-042, FR-09-043, FR-09-044, FR-09-045

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-101: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-19](../stories/EPIC-09-FINANCE-REPORTING/US-09-19-background-report-exports.md) — Background Report Exports |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-19-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-042, FR-09-043, FR-09-044, FR-09-045 |

**Story preconditions**
- Source entities and settings required by FR-09-042, FR-09-043, FR-09-044, FR-09-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-19-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.export` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-102: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-19](../stories/EPIC-09-FINANCE-REPORTING/US-09-19-background-report-exports.md) — Background Report Exports |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-19-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-042, FR-09-043, FR-09-044, FR-09-045 |

**Story preconditions**
- Source entities and settings required by FR-09-042, FR-09-043, FR-09-044, FR-09-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-19-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-20: Branch and Organization Dashboard

### TS-09-103: Reference values/required behavior and reconciliation (FR-09-046)

| Field | Value |
|---|---|
| Story | [US-09-20](../stories/EPIC-09-FINANCE-REPORTING/US-09-20-branch-dashboard.md) — Branch and Organization Dashboard |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-20-AC1 |
| Requirements | FR-09-046 |

**Story preconditions**
- Source entities and settings required by FR-09-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-20-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-046

*Expected results*
1. the system applies each requirement in FR-09-046
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-104: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-20](../stories/EPIC-09-FINANCE-REPORTING/US-09-20-branch-dashboard.md) — Branch and Organization Dashboard |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-20-AC2 |
| Requirements | FR-09-046 |

**Story preconditions**
- Source entities and settings required by FR-09-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-20-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-046

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-105: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-20](../stories/EPIC-09-FINANCE-REPORTING/US-09-20-branch-dashboard.md) — Branch and Organization Dashboard |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-20-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-046 |

**Story preconditions**
- Source entities and settings required by FR-09-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-20-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.sales.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-106: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-20](../stories/EPIC-09-FINANCE-REPORTING/US-09-20-branch-dashboard.md) — Branch and Organization Dashboard |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-20-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-046 |

**Story preconditions**
- Source entities and settings required by FR-09-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-20-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-21: Branch Comparison and Operating Summary

### TS-09-107: Reference values/required behavior and reconciliation (FR-09-047, FR-09-048)

| Field | Value |
|---|---|
| Story | [US-09-21](../stories/EPIC-09-FINANCE-REPORTING/US-09-21-branch-comparison-and-operating-summary.md) — Branch Comparison and Operating Summary |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-21-AC1 |
| Requirements | FR-09-047, FR-09-048 |

**Story preconditions**
- Source entities and settings required by FR-09-047, FR-09-048 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-21-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-047, FR-09-048

*Expected results*
1. the system applies each requirement in FR-09-047, FR-09-048
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-108: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-21](../stories/EPIC-09-FINANCE-REPORTING/US-09-21-branch-comparison-and-operating-summary.md) — Branch Comparison and Operating Summary |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-09-21-AC2 |
| Requirements | FR-09-047, FR-09-048 |

**Story preconditions**
- Source entities and settings required by FR-09-047, FR-09-048 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-21-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-047, FR-09-048

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-109: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-21](../stories/EPIC-09-FINANCE-REPORTING/US-09-21-branch-comparison-and-operating-summary.md) — Branch Comparison and Operating Summary |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-21-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-047, FR-09-048 |

**Story preconditions**
- Source entities and settings required by FR-09-047, FR-09-048 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-21-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.organization.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-110: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-21](../stories/EPIC-09-FINANCE-REPORTING/US-09-21-branch-comparison-and-operating-summary.md) — Branch Comparison and Operating Summary |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-09-21-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-047, FR-09-048 |

**Story preconditions**
- Source entities and settings required by FR-09-047, FR-09-048 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-21-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-09-22: ABC and Operational Analytics

### TS-09-111: Reference values/required behavior and reconciliation (FR-09-049, FR-09-050)

| Field | Value |
|---|---|
| Story | [US-09-22](../stories/EPIC-09-FINANCE-REPORTING/US-09-22-abc-and-operational-analytics.md) — ABC and Operational Analytics |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-09-22-AC1 |
| Requirements | FR-09-049, FR-09-050 |

**Story preconditions**
- Source entities and settings required by FR-09-049, FR-09-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-22-AC1 — Exact reference result**

*Preconditions / test data*
1. Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00
2. all financial amounts are EGP rounded to 2 decimals per BR-G-18.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-09-049, FR-09-050

*Expected results*
1. the system applies each requirement in FR-09-049, FR-09-050
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-112: Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT)

| Field | Value |
|---|---|
| Story | [US-09-22](../stories/EPIC-09-FINANCE-REPORTING/US-09-22-abc-and-operational-analytics.md) — ABC and Operational Analytics |
| Type / Execution | API / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-09-22-AC2 |
| Requirements | FR-09-049, FR-09-050 |

**Story preconditions**
- Source entities and settings required by FR-09-049, FR-09-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-22-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-049, FR-09-050

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-113: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-09-22](../stories/EPIC-09-FINANCE-REPORTING/US-09-22-abc-and-operational-analytics.md) — ABC and Operational Analytics |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-09-22-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-09-049, FR-09-050 |

**Story preconditions**
- Source entities and settings required by FR-09-049, FR-09-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-22-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `reports.finance.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-09-114: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-09-22](../stories/EPIC-09-FINANCE-REPORTING/US-09-22-abc-and-operational-analytics.md) — ABC and Operational Analytics |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-09-22-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-09-049, FR-09-050 |

**Story preconditions**
- Source entities and settings required by FR-09-049, FR-09-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-09-22-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

