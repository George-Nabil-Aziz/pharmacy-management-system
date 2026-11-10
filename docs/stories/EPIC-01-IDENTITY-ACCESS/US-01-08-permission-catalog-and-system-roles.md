# US-01-08: Permission Catalog and Seeded System Roles

| Field | Value |
|---|---|
| Story ID | US-01-08 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-01-019, FR-01-020 |
| Related Business Rules | BR-01-010, BR-01-012 |
| Dependencies | SPEC-02 organization provisioning (invokes role seeding) |

## User Story
As an Owner, I want the system to come with a complete permission catalog and ready-made roles so that I can staff my pharmacy immediately with sensible access levels.

## Business Value
New organizations become operational without designing roles; consistent role semantics simplify support and training.

## Preconditions
- The permission catalog is defined in code and seeded by migration.

## Acceptance Criteria

### US-01-08-AC1: Catalog is complete and localized
- **Given** a user with `identity.roles.read`
- **When** she calls `GET /api/v1/permissions`
- **Then** the response is 200 grouped by module, containing every permission code of DOCUMENTATION-CONVENTIONS §5.2, each with `code`, `module`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `isOverrideEligible`
- **And** exactly `sales.discounts.override`, `sales.sales.void`, `sales.returns.approve` have `isOverrideEligible = true`.

### US-01-08-AC2: New organization receives six system roles
- **Given** SPEC-02 provisions a new organization
- **When** role seeding runs inside the provisioning transaction
- **Then** six roles with `SystemCode` `OWNER`, `MANAGER`, `PHARMACIST`, `CASHIER`, `INVENTORY`, `ACCOUNTANT` exist with `IsSystem = true`, Arabic and English names, and the permission sets of SPEC-01 §5.3; `OWNER` holds every catalog permission.

### US-01-08-AC3: System roles cannot be modified or deleted
- **Given** a user with `identity.roles.manage`
- **When** he sends `PUT /api/v1/roles/{managerRoleId}` or `DELETE /api/v1/roles/{managerRoleId}`
- **Then** the response is 409 `IDENTITY.SYSTEM_ROLE_IMMUTABLE` and the role is unchanged.

### US-01-08-AC4: Catalog read requires permission
- **Given** a `CASHIER` without `identity.roles.read`
- **When** she calls `GET /api/v1/permissions`
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`.

### US-01-08-AC5: Permissions added in a release reach OWNER only
- **Given** a release adds a new permission code (test fixture code `P-new`) to the catalog
- **When** the release migration runs
- **Then** every organization's `OWNER` role holds it, no custom role holds it, and other system roles hold it only if the migration explicitly lists them.

## Validation Rules
None (read-only catalog).

## Authorization Rules
- `GET /permissions`, `GET /roles`, `GET /roles/{id}` require `identity.roles.read`.
- Role id from another organization → 404 `IDENTITY.ROLE_NOT_FOUND` (CS-08).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Modify/delete system role | 409 `IDENTITY.SYSTEM_ROLE_IMMUTABLE` |
| Missing `identity.roles.read` | 403 `IDENTITY.PERMISSION_DENIED` |
| Role of another organization | 404 `IDENTITY.ROLE_NOT_FOUND` |

## Edge Cases
- Role names are displayed in the user's UI language; `SystemCode` is stable for integrations.
- A permission removed from the catalog in a future release requires a migration that removes `RolePermission` rows and is listed in release notes.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-037 | Unit | Catalog equals §5.2 list; override-eligible flags; Arabic/English names non-empty | US-01-08-AC1 |
| TS-01-038 | Integration | Provisioning seeds six roles with §5.3 matrix | US-01-08-AC2 |
| TS-01-039 | Integration | PUT/DELETE on system role → 409; cashier GET permissions → 403; other-org role → 404 | US-01-08-AC3, US-01-08-AC4 |
| TS-01-040 | Integration | Migration adding a permission updates OWNER only | US-01-08-AC5 |
