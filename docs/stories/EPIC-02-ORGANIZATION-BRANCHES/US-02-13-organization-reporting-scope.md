# US-02-13: Organization-Level Reporting Scope

| Field | Value |
|---|---|
| Story ID | US-02-13 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-02-033 |
| Related Business Rules | BR-G-17, BR-02-015 |
| Dependencies | US-02-09; consumed by EPIC-09 report stories |

## User Story
As an Owner, I want cross-branch and organization-wide figures to be visible only to people I trust with the whole business so that branch staff see only their own branches' results.

## Business Value
Implements the Master SDD multi-branch rule "organization-level reporting must respect user permissions" as one reusable policy for all reports.

## Preconditions
- Branches `CAI01`, `ALX02`; Owner (`AllBranches`), Accountant AC1 (`AllBranches`, `reports.organization.read`), Manager M1 (assigned `CAI01`, `reports.sales.read`, no `reports.organization.read`), Manager M2 (assigned `CAI01` and `ALX02`, `reports.sales.read`).

## Acceptance Criteria

### US-02-13-AC1: Organization-level report allowed
- **Given** Accountant AC1
- **When** SPEC-09 calls `GetReportingScope(AC1)`
- **Then** the result is `AllBranches` with `organizationReportsAllowed = true`.

### US-02-13-AC2: Organization-level report denied
- **Given** Manager M2 (two branches but not `AllBranches` and no `reports.organization.read`)
- **When** M2 requests an organization-level report
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-02-13-AC3: Branch reports limited to scope
- **Given** Manager M2
- **When** M2 requests a sales report without a branch filter
- **Then** the report includes data from `CAI01` and `ALX02` only, each shown per branch.

### US-02-13-AC4: Branch filter outside scope
- **Given** Manager M1
- **When** M1 requests a sales report with `branchId = ALX02`
- **Then** the response is 403 `COMMON.FORBIDDEN`; with a branch id of another organization the response is 404 `COMMON.NOT_FOUND`.

### US-02-13-AC5: Permission without scope is insufficient
- **Given** a user holding `reports.organization.read` but with `AssignedBranches` scope
- **When** they request an organization-level report
- **Then** the response is 403 `COMMON.FORBIDDEN`.

## Validation Rules
- Branch filter values must be UUIDs of branches in the caller's organization.

## Authorization Rules
- Organization-level: `reports.organization.read` AND `AllBranches`. Branch-level: report permission AND branch in scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Organization report without both conditions | 403 `COMMON.FORBIDDEN` |
| Branch filter outside scope | 403 `COMMON.FORBIDDEN` |
| Branch filter of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Data of `Inactive` branches is included in reports for users in scope for the periods when the branch was active.
- Scheduled report exports evaluate scope at execution time, not at scheduling time.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-069 | Unit | Reporting scope policy truth table (permission × scope) | US-02-13-AC1, US-02-13-AC2, US-02-13-AC5 |
| TS-02-070 | Integration | Unfiltered report limited to assigned branches | US-02-13-AC3 |
| TS-02-071 | Integration (CS-07, CS-08) | Out-of-scope branch filter → 403; Org B branch filter → 404 | US-02-13-AC4 |
