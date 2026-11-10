# US-01-15: Activate and deactivate users

| Field | Value |
|---|---|
| Story ID | US-01-15 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-011, FR-01-032, FR-01-033, FR-01-034, FR-01-040 |
| Related Business Rules | BR-01-003, BR-01-004, BR-01-007, BR-01-008, BR-01-013, BR-01-017, BR-01-018 |
| Dependencies | US-01-10, US-01-13, US-01-14, US-01-16 |

## User Story
As an authorized user administrator, I want to deactivate or reactivate a User so that staff access ends promptly when employment or access needs change.

## Business Value
Consistent status transitions revoke session credentials and preserve individual accountability without deleting historical records.

## Preconditions
- The actor holds `identity.users.deactivate` and the target User is within management scope.
- Deactivation includes a reason of 3–500 characters.

## Acceptance Criteria
### US-01-15-AC1: Deactivate user and revoke access
- **Given** an Active User in scope
- **When** the administrator deactivates them with a valid reason
- **Then** status, deactivation metadata, refresh-token revocations, session revocations, and audit event commit atomically; access tokens are rejected within 60 seconds on every node.

### US-01-15-AC2: Reactivate without restoring sessions
- **Given** a Deactivated User who is not the last Active Owner
- **When** an authorized administrator reactivates them
- **Then** status becomes Active, the failed-attempt counter is reset, and no prior session or refresh token becomes valid.

### US-01-15-AC3: Reject unsafe transitions and last-Owner deactivation
- **Given** the actor targets themselves, the last Active Owner, or a User from another Organization
- **When** they attempt deactivation or reactivation
- **Then** self and scope violations return 403, a last-Owner violation returns 409, and a foreign User id returns 404; status remains unchanged.

## Validation Rules
- Deactivation reason is required and 3–500 characters (VR-01-015).
- Only the status transitions in BR-01-003 are allowed.

## Authorization Rules
- Require `identity.users.deactivate` and target management scope. Self-status modification is forbidden.
- Another Organization's User is concealed with 404; no organization id from the body can override token context. PostgreSQL RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Target outside actor scope or self-target | 403 `IDENTITY.USER_OUTSIDE_SCOPE` / `IDENTITY.SELF_MODIFICATION_FORBIDDEN` |
| Last Active Owner would be removed | 409 `IDENTITY.LAST_OWNER` |
| Invalid status transition | 409 `IDENTITY.INVALID_STATUS_TRANSITION` |
| Target from another Organization | 404 `IDENTITY.USER_NOT_FOUND` |
| Invalid reason | 400 `COMMON.VALIDATION_FAILED` with `COMMON.REQUIRED` |

## Edge Cases
- A Locked User may be deactivated; reactivation resets the counter but does not restore sessions.
- A User remains present for historical documents and audit records after deactivation (BR-01-017).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-072 | Integration | Deactivation records reason/audit and revokes sessions and refresh tokens atomically | US-01-15-AC1 |
| TS-01-073 | Multi-node | Deactivated User's access token is rejected within 60 seconds | US-01-15-AC1 |
| TS-01-074 | Integration | Reactivation resets failed attempts without restoring old sessions | US-01-15-AC2 |
| TS-01-075 | Integration | Self/permission/scope, last-Owner, and foreign Organization cases | US-01-15-AC3 |
