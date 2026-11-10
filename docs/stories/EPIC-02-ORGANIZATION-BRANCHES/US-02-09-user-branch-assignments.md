# US-02-09: Manage User Branch Scope and Assignments

| Field | Value |
|---|---|
| Story ID | US-02-09 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |
| Related Business Rules | BR-G-17, BR-02-008, BR-02-009, BR-02-010 |
| Dependencies | US-02-06, EPIC-01 user management stories |

## User Story
As an Owner or Branch Manager, I want to assign employees to the branches where they work and set their default branch so that each employee acts only in their branches.

## Business Value
Branch scope is the second dimension of every authorization decision (§5.3 of the conventions).

## Preconditions
- Target user exists in the caller's organization (SPEC-01).

## Acceptance Criteria

### US-02-09-AC1: Owner assigns branches and default
- **Given** an Owner and a Pharmacist user with no assignments
- **When** the Owner calls `PUT /api/v1/users/{userId}/branch-assignments` with `{ "branchScope": "AssignedBranches", "branchIds": [CAI01, ALX02], "defaultBranchId": CAI01 }` and `If-Match`
- **Then** the response is 200, both assignments exist with `IsDefault` true only for CAI01, and audit entry `org.branch-assignments.changed` contains before `[]` and after `[CAI01, ALX02]`.

### US-02-09-AC2: Effective within 5 seconds without re-login
- **Given** the Pharmacist is logged in with a token issued before AC1
- **When** they call `GET /api/v1/branches/{ALX02}/...` 5 seconds after the change commits
- **Then** the call is authorized (no 403 for scope); after removal of ALX02 the same call returns 403 within 5 seconds.

### US-02-09-AC3: My branches
- **Given** the Pharmacist from AC1
- **When** they call `GET /api/v1/me/branches`
- **Then** they receive CAI01 (`isDefault: true`) and ALX02, each with code, names, status, and time zone; `Inactive` branches are excluded.

### US-02-09-AC4: Manager limited to own scope
- **Given** a Manager assigned only to CAI01 holding `org.branch-assignments.manage`
- **When** they assign a user to ALX02, or set `branchScope = AllBranches`, or change an Owner's assignments
- **Then** each returns 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE` and nothing changes.

### US-02-09-AC5: Invalid assignment sets rejected
- **Given** an Owner
- **When** they submit an `Inactive` branch, an empty list with `AssignedBranches`, or a default not in the list
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.ASSIGNMENT_BRANCH_INVALID` or `ORG.ASSIGNMENT_DEFAULT_INVALID`.

### US-02-09-AC6: Owner scope fixed
- **Given** a user holding the `OWNER` role
- **When** anyone submits `branchScope = AssignedBranches` for them
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.OWNER_SCOPE_FIXED`.

### US-02-09-AC7: Permission denied and cross-organization user
- **Given** a Cashier, and separately an Org A Owner targeting an Org B user id
- **When** each calls `PUT /api/v1/users/{userId}/branch-assignments`
- **Then** the Cashier receives 403 `COMMON.FORBIDDEN` and the Org A Owner receives 404 `COMMON.NOT_FOUND`.

## Validation Rules
- VR-02-017, VR-02-018, VR-02-019; `If-Match` required.

## Authorization Rules
- View: `identity.users.read`. Change: `org.branch-assignments.manage`, constrained by BR-02-009.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Manager exceeds own scope | 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE` |
| Inactive / foreign branch in set | 422 `ORG.ASSIGNMENT_BRANCH_INVALID` (foreign branch: `COMMON.REFERENCE_NOT_FOUND`) |
| Empty set / bad default | 422 `ORG.ASSIGNMENT_DEFAULT_INVALID` |
| Owner scope change | 422 `ORG.OWNER_SCOPE_FIXED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| User of another organization | 404 `COMMON.NOT_FOUND` |
| Stale ETag | 412 `COMMON.PRECONDITION_FAILED` |

## Edge Cases
- Setting `AllBranches` stores no assignment rows except the default branch row; new branches are automatically in scope.
- A Manager may remove a user's assignment to a branch in the Manager's scope even if the user also has branches outside it; those other assignments are preserved.
- A user whose only branch becomes `Inactive` gets an empty `/me/branches` list (BR-02-010).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-047 | Integration | Assign two branches with default, audit before/after | US-02-09-AC1 |
| TS-02-048 | Integration | Scope change effective ≤ 5 s on existing token (grant and revoke) | US-02-09-AC2 |
| TS-02-049 | API | `/me/branches` content and exclusion of inactive | US-02-09-AC3 |
| TS-02-050 | API | Manager scope limits → 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE` | US-02-09-AC4 |
| TS-02-051 | API | Invalid sets and Owner scope fixed → 422 | US-02-09-AC5, US-02-09-AC6 |
| TS-02-052 | API (CS-08) | Cashier 403; Org B user id → 404 | US-02-09-AC7 |
