# US-01-10: Backend Authorization Enforcement (Permission, Branch, Organization)

| Field | Value |
|---|---|
| Story ID | US-01-10 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-023, FR-01-024, FR-01-025 |
| Related Business Rules | BR-01-020, BR-01-023, BR-G-17 |
| Dependencies | US-01-02, US-01-08, SPEC-02 branch queries |

## User Story
As an Owner, I want every API request to be checked for permission, branch, and organization on the server so that staff can only act within what I have granted and no other organization can ever see my data.

## Business Value
The single authorization evaluator protects every module consistently and is the foundation for CS-07 and CS-08 across all epics.

## Preconditions
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

## Acceptance Criteria

### US-01-10-AC1: Every endpoint declares a policy (default deny)
- **Given** the API host's endpoint metadata
- **When** the automated policy test enumerates all endpoints
- **Then** every endpoint either is on the anonymous allow-list (NFR-G-07 as amended by OD-01-06) or declares a permission policy, otherwise the test fails
- **And** a test endpoint registered without a policy returns 403 `IDENTITY.PERMISSION_DENIED` to an authenticated Owner.

### US-01-10-AC2: Missing permission returns 403
- **Given** `cashierA1` without `inventory.adjustments.create`
- **When** she posts `/api/v1/branches/{A1}/stock-adjustments`
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED` and no data is changed.

### US-01-10-AC3: Cross-branch access in own organization returns 403 (CS-07)
- **Given** `cashierA1` holding `sales.sales.read`, assigned only to `A1`
- **When** she calls `GET /api/v1/branches/{A2}/sales`
- **Then** the response is 403 `IDENTITY.BRANCH_ACCESS_DENIED` and the body contains no sales data or branch name.

### US-01-10-AC4: Cross-organization access returns 404 without leakage (CS-08)
- **Given** `ownerB` of `ORG-B` (all permissions, organization-wide scope in `ORG-B`)
- **When** he calls `GET /api/v1/branches/{A1}/sales`, `GET /api/v1/users/{cashierA1Id}`, and `GET /api/v1/roles/{roleOfOrgA}`
- **Then** the responses are 404 `ORG.BRANCH_NOT_FOUND`, 404 `IDENTITY.USER_NOT_FOUND`, and 404 `IDENTITY.ROLE_NOT_FOUND`, byte-identical (except `traceId`) to requests for random non-existent ids.

### US-01-10-AC5: Organization-wide scope grants all own branches
- **Given** `accountantA` with organization-wide scope and `reports.sales.read`
- **When** she calls a sales report for `A1` and for `A2`
- **Then** both return 200.

### US-01-10-AC6: Organization id in body or query is ignored
- **Given** `cashierA1`
- **When** she sends a request whose body or query contains `organizationId = ORG-B`
- **Then** the request is evaluated against `ORG-A` from the token and no `ORG-B` data is read or written.

### US-01-10-AC7: Branch assignment change takes effect promptly
- **Given** `cashierA1` is newly assigned to `A2` by an authorized user
- **When** she calls `GET /api/v1/branches/{A2}/sales` on the same node immediately after, and on another node 60 s after
- **Then** both return 200 without re-login.

## Validation Rules
- `branchId` route value must be a UUID; malformed → 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- Evaluation order: authenticated token (401) → session restriction (403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` / `IDENTITY.MFA_ENROLLMENT_REQUIRED`) → organization ownership of route resources (404) → permission (403 `IDENTITY.PERMISSION_DENIED`) → branch scope (403 `IDENTITY.BRANCH_ACCESS_DENIED`).
- Permissions and branch scope are resolved server-side per request from a cache keyed by user and invalidated on change; they are never trusted from the client.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No/invalid token | 401 `IDENTITY.UNAUTHENTICATED` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Own-org branch not assigned | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Other-org branch or non-existent branch | 404 `ORG.BRANCH_NOT_FOUND` |
| Other-org user/role | 404 `IDENTITY.USER_NOT_FOUND` / `IDENTITY.ROLE_NOT_FOUND` |
| Restricted session | 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` / `IDENTITY.MFA_ENROLLMENT_REQUIRED` |

## Edge Cases
- Inactive branch of own organization: excluded from scope; returns 403 `IDENTITY.BRANCH_ACCESS_DENIED` unless SPEC-02 defines read-only access for history.
- Platform token on an organization endpoint → 401 (US-01-20).
- Cache unavailable: evaluator falls back to database lookup (fail closed, never fail open).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-047 | Architecture | Endpoint policy enumeration test fails on missing policy; unpoliced endpoint returns 403 | US-01-10-AC1 |
| TS-01-048 | Integration | Missing permission → 403, no state change | US-01-10-AC2 |
| TS-01-049 | Integration | **CS-07** — user of branch A1 calls branch A2 routes (read and write) → 403 `IDENTITY.BRANCH_ACCESS_DENIED`, no data | US-01-10-AC3 |
| TS-01-050 | Integration | **CS-08** — ORG-B owner requests ORG-A branch/user/role ids → 404 identical to random ids | US-01-10-AC4 |
| TS-01-051 | Integration | Org-wide scope 200 on both branches; forged organizationId ignored | US-01-10-AC5, US-01-10-AC6 |
| TS-01-052 | Multi-node | Assignment change effective same node immediately and other node ≤ 60 s | US-01-10-AC7 |
| TS-01-053 | Integration | Authorization matrix: all endpoints × system roles × in/out-of-scope branch × other org | US-01-10-AC2, US-01-10-AC3, US-01-10-AC4 |
