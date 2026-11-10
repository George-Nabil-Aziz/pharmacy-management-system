# US-02-06: Create and Update Branches

| Field | Value |
|---|---|
| Story ID | US-02-06 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |
| Related Business Rules | BR-G-01, BR-G-23, BR-02-002, BR-02-003, BR-02-005 |
| Dependencies | US-02-04 |

## User Story
As an Owner, I want to register and maintain my pharmacy branches with their code, address, contact information, time zone, and license details so that each branch operates with correct identity and business date.

## Business Value
Branch code drives document numbers (BR-G-24); time zone drives business date for expiry, cash sessions, and reports (BR-G-23).

## Preconditions
- Organization `Active`.

## Acceptance Criteria

### US-02-06-AC1: Create branch
- **Given** an Owner with `org.branches.create`
- **When** they `POST /api/v1/branches` with code `ALX02`, names, governorate `Alexandria`, city, address line, phone `+2034440000`, and no time zone
- **Then** the response is 201 with status `Active`, `timeZone = "Africa/Cairo"`, a BranchSettings row with §8.4 defaults exists, and audit entry `org.branch.created` is written.

### US-02-06-AC2: Duplicate code rejected
- **Given** branch `CAI01` exists in the organization
- **When** a branch is created with code `cai01`
- **Then** the response is 409 `ORG.BRANCH_CODE_DUPLICATE` (case-insensitive) and no branch is created.

### US-02-06-AC3: Code immutable after first document number
- **Given** branch `CAI01` has issued `CAI01-INV-2026-000001`
- **When** a user updates its code to `CAI09`
- **Then** the response is 409 `ORG.BRANCH_CODE_IMMUTABLE`; before any number is issued the same update succeeds.

### US-02-06-AC4: Time zone change blocked by open cash session
- **Given** branch `CAI01` has a cash session in status `Open`
- **When** a user with `org.branches.update` changes `timeZone` to `Europe/London`
- **Then** the response is 409 `ORG.TIME_ZONE_CHANGE_BLOCKED`.

### US-02-06-AC5: Invalid fields rejected
- **Given** a create request with code `1AB`, phone `12345`, and time zone `Mars/Base`
- **When** it is submitted
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.BRANCH_CODE_INVALID`, `ORG.PHONE_INVALID`, and `ORG.TIME_ZONE_INVALID`.

### US-02-06-AC6: Permission denied
- **Given** a Branch Manager (no `org.branches.create`)
- **When** they `POST /api/v1/branches`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-02-06-AC7: List returns only branches in scope
- **Given** a Cashier assigned only to `CAI01` in an organization with branches `CAI01`, `ALX02`
- **When** they call `GET /api/v1/branches`
- **Then** only `CAI01` is returned, and `GET /api/v1/branches/{ALX02 id}` returns 403 `COMMON.FORBIDDEN`.

### US-02-06-AC8: Cross-organization branch update
- **Given** an Org A Owner
- **When** they `PUT /api/v1/branches/{Org B branch id}`
- **Then** the response is 404 `COMMON.NOT_FOUND`.

## Validation Rules
- VR-02-005..013; `If-Match` required on PUT.
- No field allows changing `OrganizationId` (BR-02-002); a body `organizationId` is ignored.

## Authorization Rules
- Create: `org.branches.create`. Update: `org.branches.update` and branch in scope. Read: `org.branches.read` and branch in scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Duplicate code | 409 `ORG.BRANCH_CODE_DUPLICATE` |
| Code change after numbering | 409 `ORG.BRANCH_CODE_IMMUTABLE` |
| Time zone change with open cash session | 409 `ORG.TIME_ZONE_CHANGE_BLOCKED` |
| Field validation | 422 `COMMON.VALIDATION_FAILED` |
| Stale ETag | 412 `COMMON.PRECONDITION_FAILED` |
| No permission / out of scope | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Accepted time zone change applies from the next business date; the current business date of the branch is unchanged until local midnight in the old time zone.
- License expiry date in the past is accepted (stored unverified, REG-08).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-030 | Integration | Create branch with defaults, settings row, audit | US-02-06-AC1 |
| TS-02-031 | API | Case-insensitive duplicate code → 409 | US-02-06-AC2 |
| TS-02-032 | Integration | Code change before/after first document number | US-02-06-AC3 |
| TS-02-033 | Integration | Time zone change with open cash session → 409 | US-02-06-AC4 |
| TS-02-034 | API | Field validation codes | US-02-06-AC5 |
| TS-02-035 | API | Manager create → 403; Cashier list scoped and out-of-scope detail 403 | US-02-06-AC6, US-02-06-AC7 |
| TS-02-036 | Integration (CS-08) | Org B branch update → 404, Org B unchanged | US-02-06-AC8 |
