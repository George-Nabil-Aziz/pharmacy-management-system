# US-07-05: Log and Review Medical Data Access

| Field | Value |
|---|---|
| Story ID | US-07-05 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |
| Related Business Rules | BR-G-29, BR-G-16, BR-G-25, BR-07-004, BR-07-014 |
| Dependencies | US-07-01; external: SPEC-10 audit log |

## User Story
As an owner, I want every read of a patient's medical data recorded and reviewable so that I can detect and investigate inappropriate access.

## Business Value
Individual accountability for sensitive health data (BRQ-12) and the basis for responding to patient questions about who viewed their record.

## Preconditions
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

## Acceptance Criteria
### US-07-05-AC1: One log entry per medical response
- **Given** a user with `patients.medical.read` working in branch B (header `X-Branch-Id`)
- **When** they request any endpoint that returns medical data for patient P
- **Then** exactly one `PatientAccessLog` row is persisted before the response with patient, user, organization, branch B, `accessType`, data categories, endpoint, `traceId`, and UTC timestamp

### US-07-05-AC2: Fail closed when log cannot be written
- **Given** the access-log write fails (fault injected)
- **When** the user requests P's allergies
- **Then** the response is 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` and the body contains no medical data

### US-07-05-AC3: Demographic reads are not access-logged
- **Given** a user with `patients.profiles.read`
- **When** they GET `/api/v1/patients/{P}` (demographics only)
- **Then** no `PatientAccessLog` row is written

### US-07-05-AC4: Review access log
- **Given** an owner with `patients.access-logs.read` and P has 120 log entries
- **When** they GET `/api/v1/patients/{P}/access-logs?limit=50&category=Allergies`
- **Then** entries are returned newest first, filtered to the category, with a `nextCursor`, showing user display name, branch, access type, categories, and time; and the view itself writes an audit log entry

### US-07-05-AC5: Logs are append-only
- **Given** existing access-log rows
- **When** any application code path attempts UPDATE or DELETE on `patients.patient_access_logs`
- **Then** the database rejects it (no privilege) and the rows are unchanged

### US-07-05-AC6: Writes audited without medical values
- **Given** a pharmacist edits an allergy reaction
- **When** the change is saved
- **Then** the audit log entry includes entity type, id, action, and `changedFields: ["reaction"]` but not the old or new reaction text

### US-07-05-AC7: Permission denied
- **Given** a pharmacist without `patients.access-logs.read`
- **When** they GET `/access-logs`
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-05-AC8: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** an owner of organization B requests P's access logs
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
Cursor pagination `limit` 1–100 (default 50); date range ≤ 366 days; `category` from the `DataCategories` enumeration.

## Authorization Rules
- Logging is automatic for all medical reads. Review: `patients.access-logs.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Log write failure | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` |
| Invalid category or range > 366 days | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- A request returning medical data for several categories writes one row with multiple categories, not one row per category.
- 403/404/400 responses write no access-log row (no data disclosed).
- `X-Branch-Id` absent for an org-wide user: `BranchId` stored as null.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-032 | Integration | Parameterized over every medical endpoint: one log row per 200 response, none on 4xx | US-07-05-AC1 |
| TS-07-033 | Integration | Fault injection on log write → 503 with no medical fields in body | US-07-05-AC2 |
| TS-07-034 | Integration | Demographic detail writes no log row | US-07-05-AC3 |
| TS-07-035 | Integration | Access log listing, filters, cursor, audit of the view | US-07-05-AC4 |
| TS-07-036 | Security | DB privilege test: UPDATE/DELETE denied on access logs (NFR-07-009) | US-07-05-AC5 |
| TS-07-037 | Security | Audit entry and Serilog output contain no medical values (NFR-07-008) | US-07-05-AC6 |
| TS-07-038 | Security | 403 without permission; CS-08 → 404 | US-07-05-AC7, US-07-05-AC8 |
| TS-07-039 | Performance | Log write overhead ≤ 20 ms p95 (NFR-07-003) | US-07-05-AC1 |
