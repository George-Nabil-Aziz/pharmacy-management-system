# US-10-07: Suspicious Activity Reports

| Field | Value |
|---|---|
| Story ID | US-10-07 |
| Epic | EPIC-10 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-10-017 |
| Related Business Rules | BR-G-32, BR-10-008 |
| Dependencies | US-10-04, US-10-08, US-10-18 |

## User Story
As an Owner, I want a daily report of suspicious patterns such as excessive voids, repeated discount overrides, and after-hours logins so that I can detect fraud early without reading raw audit logs.

## Business Value
Reduces cash and stock leakage by surfacing high-risk behavior per cashier and branch every day.

## Preconditions
- Audit events `SALES.SALE_VOIDED`, `SALES.DISCOUNT_OVERRIDE_APPROVED`, `IDENTITY.LOGIN_SUCCEEDED`, `IDENTITY.LOGIN_FAILED` are emitted (US-10-02).
- Settings `SuspiciousVoidsPerCashierPerDay` (3), `SuspiciousDiscountOverridesPerDay` (5), `AuditAfterHoursStart` (23:00), `AuditAfterHoursEnd` (07:00) exist.

## Acceptance Criteria
### US-10-07-AC1: Excessive voids flagged
- **Given** cashier C in branch `CAI01` has 4 voided sales on business date 2026-11-08 and the threshold is 3
- **When** the daily evaluation for 2026-11-08 runs
- **Then** a finding `ExcessiveVoids` for C, branch `CAI01`, count 4, threshold 3, with links to the 4 audit entries is stored

### US-10-07-AC2: At threshold is not flagged (negative)
- **Given** cashier D has exactly 3 voids on the same date
- **When** the evaluation runs
- **Then** no finding is created for D

### US-10-07-AC3: After-hours login and failed-login burst
- **Given** a successful login at 23:40 Cairo time in a branch using the default window, and 5 failed logins for user E within 12 minutes
- **When** the evaluation runs
- **Then** findings `AfterHoursLogin` and `FailedLoginBurst` are created with the source entries linked

### US-10-07-AC4: Daily notification to Owners
- **Given** ≥ 1 finding for the organization on 2026-11-08
- **When** the evaluation completes
- **Then** exactly one `SUSPICIOUS_ACTIVITY_DETECTED` notification per Owner is created for that business date, and rerunning the evaluation creates no duplicate

### US-10-07-AC5: Report access control
- **Given** a Branch Manager without `audit.reports.read`, and an Owner of another organization
- **When** they call `GET /api/v1/audit/reports/suspicious-activity?date=2026-11-08`
- **Then** the Manager receives 403 `COMMON.FORBIDDEN` and the other organization's Owner receives no findings of this organization

## Validation Rules
- `date` required (ISO date); range queries ≤ 31 days → otherwise `AUDIT.INVALID_DATE_RANGE`.
- Threshold settings validated by the settings registry (VR-10-019).

## Authorization Rules
- `audit.reports.read`; organization-wide by default for Owners; branch-scoped users see only assigned branches.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Range > 31 days | 400 `AUDIT.INVALID_DATE_RANGE` |

## Edge Cases
- After-hours window crossing midnight (23:00–07:00) evaluated in the branch time zone.
- Discount overrides counted both per approver and per cashier; one override can create two findings.
- Logins without branch context are evaluated against the organization-level window value.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-040 | Integration | 4 voids vs threshold 3 flagged; 3 voids not flagged | US-10-07-AC1, US-10-07-AC2 |
| TS-10-041 | Integration | After-hours login across midnight; failed-login burst | US-10-07-AC3 |
| TS-10-042 | Integration | One notification per Owner per date; idempotent rerun | US-10-07-AC4 |
| TS-10-043 | Security | Manager 403; cross-org isolation (CS-08) | US-10-07-AC5 |
