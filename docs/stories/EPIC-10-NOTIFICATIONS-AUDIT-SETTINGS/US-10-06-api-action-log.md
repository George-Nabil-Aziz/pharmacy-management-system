# US-10-06: API Action Log

| Field | Value |
|---|---|
| Story ID | US-10-06 |
| Epic | EPIC-10 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-10-015, FR-10-016 |
| Related Business Rules | BR-G-17, BR-10-025 |
| Dependencies | SPEC-01 authentication |

## User Story
As an Owner, I want a log of every state-changing API action by each user so that I can review user activity beyond the sensitive-operation catalog, including failed attempts.

## Business Value
Gives activity-level accountability (BRQ-01) and helps diagnose disputed actions (e.g., "I never tried to edit that") at low storage cost.

## Preconditions
- `platform.api_action_logs` table with monthly partitions exists.

## Acceptance Criteria
### US-10-06-AC1: Mutating requests captured without bodies
- **Given** an authenticated Cashier
- **When** they call `POST /api/v1/branches/{branchId}/sales` and the response is 201
- **Then** within 10 s an `ApiActionLog` row exists with user, organization, branch, method `POST`, route template `/api/v1/branches/{branchId}/sales`, status 201, duration in ms, correlation id, IP, and user agent, and contains no request/response body or query-string values

### US-10-06-AC2: Read requests and anonymous requests not captured
- **Given** a `GET` request and an anonymous `POST /api/v1/auth/login`
- **When** they complete
- **Then** no `ApiActionLog` row is created for them (login is covered by audit events)

### US-10-06-AC3: Failed attempts captured
- **Given** a Cashier without `inventory.adjustments.create`
- **When** they `POST` a stock adjustment and receive 403
- **Then** an `ApiActionLog` row with status 403 exists

### US-10-06-AC4: Activity search with scoping
- **Given** a Branch Manager with `audit.logs.read` assigned to `CAI01`
- **When** they call `GET /api/v1/audit/activity?userId=…&from=2026-11-01&to=2026-11-07`
- **Then** only rows with `BranchId = CAI01` are returned, newest first, cursor-paginated

### US-10-06-AC5: Range limit, permission and cross-organization (negative)
- **Given** an Owner, a Cashier, and an Owner of another organization
- **When** the Owner queries 45 days, the Cashier queries 7 days, and the other organization's Owner filters by a user id of this organization
- **Then** the Owner receives 400 `AUDIT.INVALID_DATE_RANGE`, the Cashier 403 `COMMON.FORBIDDEN`, and the other Owner receives an empty result

### US-10-06-AC6: 180-day retention
- **Given** monthly partitions where the newest row of one partition is older than 180 days
- **When** the daily partition maintenance job runs
- **Then** that partition is dropped, newer partitions are untouched, and the next month's partition exists in advance

## Validation Rules
- VR-10-008 range ≤ 31 days; `limit` 1–200.

## Authorization Rules
- `audit.logs.read` with FR-10-013 branch scoping.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Range > 31 days | 400 `AUDIT.INVALID_DATE_RANGE` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Unassigned branch filter | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Process crash loses at most 5 s of buffered entries (accepted; not an audit record).
- Requests rejected before authentication (401) are not logged here; they appear in structured logs.
- Logging must add ≤ 2 ms p95 latency (NFR-10-014).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-035 | Integration | POST sale logged with route template; no body/query values | US-10-06-AC1 |
| TS-10-036 | Integration | GET and anonymous login not logged | US-10-06-AC2 |
| TS-10-037 | Integration | 403 attempt logged | US-10-06-AC3 |
| TS-10-038 | Security | Activity search branch scoping (CS-07); cross-org empty (CS-08); 31-day limit; Cashier 403 | US-10-06-AC4, US-10-06-AC5 |
| TS-10-039 | Integration | Partition older than 180 days dropped; future partition created | US-10-06-AC6 |
