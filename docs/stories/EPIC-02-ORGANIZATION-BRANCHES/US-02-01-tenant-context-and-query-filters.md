# US-02-01: Tenant Context Resolution and Global Query Filters

| Field | Value |
|---|---|
| Story ID | US-02-01 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |
| Related Business Rules | BR-G-17, BR-02-016 |
| Dependencies | EPIC-01 access token issuance with `org_id` claim (story id per EPIC-01) |

## User Story
As an Owner, I want every request and background operation to be confined to my organization's data so that no other organization can read or change my pharmacy's records.

## Business Value
Foundation of BRQ-02. Every other module relies on this mechanism; a defect here exposes all business data of every organization.

## Preconditions
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

## Acceptance Criteria

### US-02-01-AC1: Organization context comes only from the token
- **Given** a user of Org A with a valid access token
- **When** they call `GET /api/v1/organization` with header `X-Organization-Id` and query `organizationId` set to Org B's id
- **Then** the response is 200 with Org A's profile and the supplied Org B identifiers are ignored.

### US-02-01-AC2: Missing token rejected before data access
- **Given** no `Authorization` header
- **When** any tenant-owned endpoint is called
- **Then** the response is 401 `COMMON.UNAUTHENTICATED` and the database query log for the request contains zero queries on tenant-owned tables.

### US-02-01-AC3: Cross-organization route identifier returns 404
- **Given** a user of Org A with `org.branches.read`
- **When** they call `GET /api/v1/branches/{branchId}` with Org B's branch id
- **Then** the response is 404 `COMMON.NOT_FOUND` and its `type`, `title`, `status`, and `code` equal those returned for a random non-existent UUID.

### US-02-01-AC4: Cross-organization body reference returns 422
- **Given** a user of Org A with `org.branch-assignments.manage`
- **When** they submit branch assignments containing Org B's branch id
- **Then** the response is 422 with `COMMON.REFERENCE_NOT_FOUND` for that field and no assignment is stored.

### US-02-01-AC5: Mismatched OrganizationId on write aborts transaction
- **Given** a request handler of Org A that (by fault injection) attempts to save a row with Org B's `OrganizationId`
- **When** changes are saved
- **Then** the whole database transaction is rolled back, the client receives 500 `COMMON.INTERNAL_ERROR`, and a security log event `COMMON.TENANT_MISMATCH` is written with the request `traceId`.

### US-02-01-AC6: Background job without context fails safely
- **Given** a Hangfire job that reads tenant-owned data
- **When** it is enqueued without an `OrganizationId`
- **Then** it fails before executing any query and no data is written.

### US-02-01-AC7: Platform token cannot reach tenant-owned endpoints
- **Given** a platform administrator token without a support session
- **When** it calls `GET /api/v1/branches`
- **Then** the response is 404 `COMMON.NOT_FOUND` and no tenant-owned query is executed.

### US-02-01-AC8: Architecture test enforces filters
- **Given** a tenant-owned entity added without the organization filter, or filter bypass used outside the allowlist
- **When** the architecture test suite runs
- **Then** the build fails naming the entity or call site.

## Validation Rules
- `org_id` claim must be a UUID of an existing organization; otherwise 401 `COMMON.UNAUTHENTICATED`.

## Authorization Rules
- No permission is introduced; this story implements layers L1, L2, L4, L5, L8, L9 of SPEC-02 §11.2.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No/invalid token | 401 `COMMON.UNAUTHENTICATED` |
| Route id of another organization | 404 `COMMON.NOT_FOUND` |
| Body reference to another organization | 422 `COMMON.REFERENCE_NOT_FOUND` |
| Write with mismatched `OrganizationId` | 500 `COMMON.INTERNAL_ERROR` (logged `COMMON.TENANT_MISMATCH`) |
| Platform token on tenant-owned endpoint | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Cache entries: keys are prefixed with organization id; a cached Org A value is never returned for Org B with the same resource id.
- SignalR: a client cannot join a group of another organization; groups are joined server-side from token claims.
- Outbox messages persisted with `OrganizationId`; handlers establish context from the message.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-001 | Integration | Org identifiers in header/query/body ignored; token org used | US-02-01-AC1 |
| TS-02-002 | Integration | Unauthenticated call → 401 with zero tenant queries (query counter) | US-02-01-AC2 |
| TS-02-003 | Integration | Org B branch id vs random UUID → identical 404 problem bodies (CS-08) | US-02-01-AC3, US-02-01-AC7 |
| TS-02-004 | Integration | Body reference to Org B branch → 422 `COMMON.REFERENCE_NOT_FOUND`, nothing stored | US-02-01-AC4 |
| TS-02-005 | Integration | Fault-injected mismatched write → full rollback, security log | US-02-01-AC5 |
| TS-02-006 | Integration | Job without organization context fails before queries | US-02-01-AC6 |
| TS-02-007 | Architecture | Missing filter / unlisted bypass fails build | US-02-01-AC8 |
