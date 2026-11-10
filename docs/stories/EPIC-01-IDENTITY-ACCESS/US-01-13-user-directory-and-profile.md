# US-01-13: View and update users in management scope

| Field | Value |
|---|---|
| Story ID | US-01-13 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-030, FR-01-032 |
| Related Business Rules | BR-01-013, BR-01-020, BR-G-17 |
| Dependencies | US-01-02, US-01-10 |

## User Story
As a user administrator, I want to find and view users in my management scope and update their profile details so that the staff directory stays accurate without exposing users outside my scope.

## Business Value
Branch-aware user visibility supports staffing operations while limiting personal information to authorized administrators.

## Preconditions
- The caller is authenticated in an active Organization.
- The target User belongs to that Organization and is within the caller's management scope.

## Acceptance Criteria
### US-01-13-AC1: Search the paginated user directory
- **Given** a user administrator with `identity.users.read`
- **When** they request `/api/v1/users` with status, role, branch, and a valid text filter
- **Then** the response is paginated and contains only users sharing at least one assigned Branch when the caller lacks organization-wide scope.

### US-01-13-AC2: Update a profile with an ETag
- **Given** a User in scope and its current ETag
- **When** the administrator updates full name and phone with `If-Match`
- **Then** the response returns the updated profile and a new ETag; a stale ETag returns 412 and a missing ETag returns 428.

### US-01-13-AC3: Deny out-of-scope and unauthorized access
- **Given** an administrator without `identity.users.update`, a target user outside their management scope, and a user id from another Organization
- **When** they update the profile in each case
- **Then** the first two requests return 403 with the appropriate identity denial code, the cross-Organization request returns 404, and no profile changes.

## Validation Rules
- Search text is optional; when supplied it is 2–100 characters (VR-01-023).
- Full name and phone follow VR-01-008 and VR-01-009.
- Updates require `If-Match` (VR-01-022).

## Authorization Rules
- Directory/detail read requires `identity.users.read`; profile update requires `identity.users.update`.
- A caller without organization-wide scope sees only users sharing an assigned Branch; managing a target outside scope returns 403 `IDENTITY.USER_OUTSIDE_SCOPE`.
- Organization identity comes only from the token. Cross-Organization ids return 404. PostgreSQL RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Search text shorter than 2 characters | 400 `COMMON.VALIDATION_FAILED` |
| Missing update permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Target user outside management scope | 403 `IDENTITY.USER_OUTSIDE_SCOPE` |
| Target user belongs to another Organization | 404 `IDENTITY.USER_NOT_FOUND` |
| Missing or stale `If-Match` | 428 `COMMON.PRECONDITION_REQUIRED` / 412 `COMMON.CONCURRENCY_CONFLICT` |

## Edge Cases
- A user with organization-wide scope may read all users in their Organization but still cannot manage an out-of-scope Owner unless permitted by the Owner rules.
- Profile updates do not alter roles, branch assignments, or account status.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-064 | Integration | Filter and page directory; verify branch-sharing result set | US-01-13-AC1 |
| TS-01-065 | Integration | Update profile with current, stale, and missing ETag | US-01-13-AC2 |
| TS-01-066 | Integration | Missing permission and target outside scope return 403 | US-01-13-AC3 |
| TS-01-067 | Integration | Cross-Organization user id returns 404 indistinguishable from missing id (CS-08) | US-01-13-AC3 |
