# US-01-14: Manage user roles and branch scope

| Field | Value |
|---|---|
| Story ID | US-01-14 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-022, FR-01-025, FR-01-031, FR-01-032, FR-01-033, FR-01-040 |
| Related Business Rules | BR-01-007, BR-01-008, BR-01-009, BR-01-010, BR-01-011, BR-01-013, BR-01-018 |
| Dependencies | US-01-08, US-01-09, US-01-10, US-01-13 |

## User Story
As an Owner or authorized user administrator, I want to assign roles and Branch scope to a User so that their permissions match their duties and assigned work locations.

## Business Value
Role and Branch assignment is the authoritative control for what each staff member can see and do.

## Preconditions
- The target User and Roles exist in the caller's Organization.
- The actor has the relevant role or Branch assignment management permission and the current User ETag.

## Acceptance Criteria
### US-01-14-AC1: Replace a user's role set
- **Given** an administrator with `identity.users.update` and role-granting authority
- **When** they replace a user's roles with a non-empty set using `If-Match`
- **Then** the roles are replaced atomically, audit before/after values are recorded, and permission changes propagate on the same node immediately and across nodes within 60 seconds.

### US-01-14-AC2: Replace Branch assignments and organization scope
- **Given** an Owner managing an in-scope User
- **When** they set one or more Active Branch assignments with exactly one default, or change the organization-wide scope flag
- **Then** the update succeeds with a new ETag; a non-organization-wide user always retains at least one Active Branch.

### US-01-14-AC3: Reject self-change, privilege escalation, and loss of last Owner
- **Given** an actor attempts to modify their own roles/scope, grant a permission they do not hold, assign an out-of-scope target, or remove the last Active Owner
- **When** they submit the update
- **Then** the request is denied with 403 for authorization violations or 409 `IDENTITY.LAST_OWNER` when the last Owner invariant would be broken; no partial change is committed.

### US-01-14-AC4: Isolate assignment identifiers by Organization
- **Given** a role or Branch id belonging to another Organization
- **When** the administrator includes it in an assignment request
- **Then** the request returns 404 or the documented organization-scoped reference error without disclosing the foreign resource.

## Validation Rules
- User must have at least one Role (VR-01-013).
- A non-organization-wide User must have at least one Active Branch and exactly one default (VR-01-014).
- Updates require `If-Match` (VR-01-022).

## Authorization Rules
- Role changes require `identity.users.update`; Branch changes require `org.branch-assignments.manage`; only Owner can assign `OWNER` or organization-wide scope.
- An actor may grant only permissions they hold and may manage only Users in scope. Self-modification is forbidden.
- Cross-Organization references are hidden with 404. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing role/assignment permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Self-modification or target outside scope | 403 `IDENTITY.SELF_MODIFICATION_FORBIDDEN` / `IDENTITY.USER_OUTSIDE_SCOPE` |
| Granting permission not held | 403 `IDENTITY.PRIVILEGE_ESCALATION` |
| Removing/demoting last Active Owner | 409 `IDENTITY.LAST_OWNER` |
| Foreign Organization Role or Branch | 404 `IDENTITY.ROLE_NOT_FOUND` / `ORG.BRANCH_NOT_FOUND` |
| Stale or missing ETag | 412 `COMMON.CONCURRENCY_CONFLICT` / 428 `COMMON.PRECONDITION_REQUIRED` |

## Edge Cases
- The Owner role always has organization-wide scope and cannot be assigned by non-Owners.
- Replacing assignments that would leave a User with zero active Branches is rejected before persistence.
- Role/Branch permission cache invalidation does not depend on the target User signing in again.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-068 | Integration | Replace role set and verify audit plus effective permission snapshot | US-01-14-AC1 |
| TS-01-069 | Integration | Branch assignments enforce one default and Owner-only organization scope | US-01-14-AC2 |
| TS-01-070 | Integration | Self-change, privilege escalation, out-of-scope target, and last-Owner guard | US-01-14-AC3 |
| TS-01-071 | Multi-node | Permission/assignment invalidation reaches other node within 60 seconds; foreign IDs return 404 (CS-08) | US-01-14-AC4 |
