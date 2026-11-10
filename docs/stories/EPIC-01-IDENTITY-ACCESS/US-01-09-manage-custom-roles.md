# US-01-09: Manage Custom Roles

| Field | Value |
|---|---|
| Story ID | US-01-09 |
| Epic | EPIC-01 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |
| Related Business Rules | BR-01-009, BR-01-012, BR-01-018 |
| Dependencies | US-01-08, US-01-10 |

## User Story
As an Owner, I want to create, clone, edit, and delete custom roles with fine-grained permissions so that access matches how my pharmacy actually divides work.

## Business Value
Pharmacies differ (e.g., a senior cashier who may approve returns); custom roles avoid over-granting system roles.

## Preconditions
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

## Acceptance Criteria

### US-01-09-AC1: Create a custom role
- **Given** an Owner
- **When** she posts `/api/v1/roles` with `nameEn = "Senior Cashier"`, `nameAr = "كاشير أول"`, description, and permissions `[sales.pos.sell, sales.sales.read, sales.returns.create, sales.returns.approve]`
- **Then** the response is 201 with the role id and an `ETag`, `IsSystem = false`, and audit event `identity.role.created` records the permission list.

### US-01-09-AC2: Clone a system role
- **Given** an Owner
- **When** she posts `/api/v1/roles/{cashierRoleId}/clone` with `nameEn = "Cashier Plus"`, `nameAr = "كاشير بلس"`
- **Then** the response is 201 with a custom role whose permissions equal `CASHIER`'s and `ClonedFromRoleId = cashierRoleId`.

### US-01-09-AC3: Update with optimistic concurrency and prompt effect
- **Given** custom role `R` held by user `U`, with current ETag `E1`
- **When** the Owner sends `PUT /api/v1/roles/{R}` with `If-Match: E1` removing `sales.returns.approve`
- **Then** the response is 200 with a new ETag, audit event `identity.role.updated` contains before/after permission lists
- **And** `U`'s next request on the same node is evaluated without `sales.returns.approve`, and on all nodes within ≤ 60 s.

### US-01-09-AC4: Stale ETag is rejected
- **Given** the role was updated after the client read ETag `E1`
- **When** a `PUT` with `If-Match: E1` is sent
- **Then** the response is 412 `COMMON.CONCURRENCY_CONFLICT`; without `If-Match` the response is 428 `COMMON.PRECONDITION_REQUIRED`.

### US-01-09-AC5: Delete only unused roles
- **Given** custom role `R1` held by 1 user and custom role `R2` held by none
- **When** the Owner deletes `R1` and then `R2`
- **Then** `R1` returns 409 `IDENTITY.ROLE_IN_USE` and `R2` returns 204 with audit event `identity.role.deleted`.

### US-01-09-AC6: Privilege escalation is blocked
- **Given** a user holding `MANAGER` plus a custom role granting `identity.roles.manage`, and not holding `settings.organization.manage`
- **When** he creates a role containing `inventory.adjustments.approve` (which he holds) and `settings.organization.manage` (which he does not hold)
- **Then** the response is 403 `IDENTITY.PRIVILEGE_ESCALATION` and no role is created.

### US-01-09-AC7: Role management requires permission
- **Given** a `PHARMACIST` without `identity.roles.manage`
- **When** she posts `/api/v1/roles`
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`.

### US-01-09-AC8: Duplicate name and invalid permissions are rejected
- **Given** a custom role named `Senior Cashier` exists
- **When** a role named `senior cashier` is created, or a role with permission `sales.pos.fly`, or with an empty permission list
- **Then** the responses are 409 `IDENTITY.ROLE_NAME_EXISTS`, 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.UNKNOWN_PERMISSION`, and 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.ROLE_PERMISSIONS_REQUIRED` respectively.

## Validation Rules
VR-01-011, VR-01-012, VR-01-022.

## Authorization Rules
- `identity.roles.manage` for create/clone/update/delete; `identity.roles.read` for reads.
- Anti-escalation BR-01-009: every permission in the submitted set must be in the actor's effective permissions (an Owner always passes).
- Role id from another organization → 404 `IDENTITY.ROLE_NOT_FOUND` (CS-08).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Escalation | 403 `IDENTITY.PRIVILEGE_ESCALATION` |
| Duplicate name | 409 `IDENTITY.ROLE_NAME_EXISTS` |
| Role in use on delete | 409 `IDENTITY.ROLE_IN_USE` |
| System role edit/delete | 409 `IDENTITY.SYSTEM_ROLE_IMMUTABLE` |
| Stale / missing `If-Match` | 412 `COMMON.CONCURRENCY_CONFLICT` / 428 `COMMON.PRECONDITION_REQUIRED` |
| Other organization's role | 404 `IDENTITY.ROLE_NOT_FOUND` |

## Edge Cases
- Removing `identity.roles.manage` from the only custom role an actor holds: allowed; the actor loses the ability on the next request.
- Cloning a role containing permissions the actor lacks → 403 `IDENTITY.PRIVILEGE_ESCALATION`.
- Per-role discount limit field is reserved pending OD-01-04.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-041 | Integration | Create and clone custom roles; audit content | US-01-09-AC1, US-01-09-AC2 |
| TS-01-042 | Integration | Update with ETag; effect on holder's next request; multi-node ≤ 60 s | US-01-09-AC3 |
| TS-01-043 | Integration | 412 and 428 cases | US-01-09-AC4 |
| TS-01-044 | Integration | Delete in-use vs unused | US-01-09-AC5 |
| TS-01-045 | Integration | Escalation 403; pharmacist 403; other-org role 404 | US-01-09-AC6, US-01-09-AC7 |
| TS-01-046 | Integration | Duplicate name, unknown permission, empty set | US-01-09-AC8 |
