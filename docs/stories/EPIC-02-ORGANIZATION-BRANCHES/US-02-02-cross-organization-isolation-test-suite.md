# US-02-02: Cross-Organization Isolation Test Suite

| Field | Value |
|---|---|
| Story ID | US-02-02 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-004, FR-02-006 |
| Related Business Rules | BR-G-17, BR-02-016 |
| Dependencies | US-02-01 |

## User Story
As a platform operator, I want an automated suite that proves every API route rejects cross-organization access so that isolation regressions are caught before release.

## Business Value
Turns CS-08 into a continuously enforced CI gate covering routes added by every future module, not only those that exist today.

## Preconditions
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

## Acceptance Criteria

### US-02-02-AC1: Every route is classified
- **Given** the set of registered API routes
- **When** the suite starts
- **Then** each route is classified as `TenantBranchScoped`, `TenantOrganization`, `Platform`, or `Anonymous`, and the suite fails listing any unclassified route.

### US-02-02-AC2: Cross-organization route identifiers return 404 (CS-08)
- **Given** an Org A Owner token (all permissions, `AllBranches`)
- **When** every `TenantBranchScoped` and `TenantOrganization` route containing an identifier is called with Org B identifiers (GET, PUT, POST, DELETE as registered)
- **Then** every response is 404 `COMMON.NOT_FOUND` and no Org B state changes (row counts and `RowVersion` of Org B records unchanged).

### US-02-02-AC3: No Org B data in any response
- **Given** the Org A Owner token
- **When** every list and report route is called without filters
- **Then** no response body contains any Org B record id, name, code, or document number (string scan against Org B fixture values).

### US-02-02-AC4: Cross-organization body references rejected
- **Given** the Org A Owner token
- **When** create/update routes are called with body references to Org B entities (medicine, supplier, patient, branch, batch)
- **Then** every response is 422 with `COMMON.REFERENCE_NOT_FOUND` and nothing is persisted.

### US-02-02-AC5: Suite runs in CI within budget
- **Given** the CI pipeline
- **When** a merge request is built
- **Then** the suite runs and completes in ≤ 10 minutes, and a failure blocks the merge.

## Validation Rules
- Route classification is declared in code metadata next to each endpoint; the suite reads it rather than a separately maintained list.

## Authorization Rules
- Uses Owner tokens to ensure failures are due to organization isolation, not missing permissions.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Org A token, Org B id in route | 404 `COMMON.NOT_FOUND` |
| Org A token, Org B id in body | 422 `COMMON.REFERENCE_NOT_FOUND` |
| Unclassified route | Suite failure (build fails) |

## Edge Cases
- Routes requiring `Idempotency-Key` are called with a fresh key so that idempotency replay does not mask the result.
- File download routes: no pre-signed URL is generated for Org B file objects.
- SignalR: an Org A connection attempting to join an Org B group receives no messages for Org B events emitted during the test.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-008 | Architecture | Unclassified route fails the suite | US-02-02-AC1 |
| TS-02-009 | Integration (CS-08) | All identifier routes with Org B ids → 404, Org B unchanged | US-02-02-AC2 |
| TS-02-010 | Integration (CS-08) | List/report responses scanned for Org B values → none | US-02-02-AC3 |
| TS-02-011 | Integration (CS-08) | Body references to Org B entities → 422, nothing persisted | US-02-02-AC4 |
| TS-02-012 | CI | Suite duration ≤ 10 min and merge-blocking | US-02-02-AC5 |
