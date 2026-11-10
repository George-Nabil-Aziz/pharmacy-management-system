# US-01-16: Manage own and in-scope user sessions

| Field | Value |
|---|---|
| Story ID | US-01-16 |
| Epic | EPIC-01 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-01-006, FR-01-011, FR-01-035, FR-01-036, FR-01-040 |
| Related Business Rules | BR-01-004, BR-01-006, BR-01-018, BR-G-30 |
| Dependencies | US-01-02, US-01-03, US-01-04, US-01-10, US-01-13 |

## User Story
As a user, I want to review and revoke my sessions, and as an authorized administrator I want to manage sessions for Users in my scope, so that lost or shared devices can be disconnected.

## Business Value
Visible session inventory and prompt revocation reduce the exposure of shared pharmacy workstations.

## Preconditions
- The caller is authenticated.
- Administrative session operations target a User within scope.

## Acceptance Criteria
### US-01-16-AC1: List own active sessions
- **Given** an authenticated User with multiple sessions
- **When** they request `GET /api/v1/auth/sessions`
- **Then** the response lists only their active sessions with device label, IP address, created/last activity timestamps, and a current-session flag.

### US-01-16-AC2: Revoke own session
- **Given** an active session owned by the caller
- **When** they revoke it
- **Then** the session and token family are revoked; revoking the current session behaves as logout and access is rejected within 60 seconds.

### US-01-16-AC3: Administer sessions only within permission and scope
- **Given** an administrator missing `identity.sessions.revoke`, a target outside management scope, and a session id from another Organization
- **When** they list or revoke the target sessions
- **Then** unauthorized in-scope operations and out-of-scope targets return 403, while the foreign Organization session returns 404; no other User's session is disclosed.

## Validation Rules
- Session and User identifiers must be valid UUIDs.
- A revoke request for an already revoked session is naturally idempotent.

## Authorization Rules
- Every authenticated User may list/revoke their own sessions without an extra permission.
- Other-user listing requires `identity.sessions.read`; revoking requires `identity.sessions.revoke` and target management scope.
- Cross-Organization resources return 404. Session revocation propagates within 60 seconds.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No valid access token | 401 `IDENTITY.UNAUTHENTICATED` |
| Missing administrative session permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Target outside management scope | 403 `IDENTITY.USER_OUTSIDE_SCOPE` |
| Session belongs to another Organization | 404 `IDENTITY.SESSION_NOT_FOUND` |
| Session already revoked | 204 with no additional effect |

## Edge Cases
- The session cap remains 10; the 11th login revokes the least recently active session (FR-01-006).
- A revoked session's refresh token family cannot issue another access token.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-076 | Integration | Own-session list includes required metadata and excludes other users | US-01-16-AC1 |
| TS-01-077 | Integration | Revoke own current and non-current sessions; verify token rejection | US-01-16-AC2 |
| TS-01-078 | Integration | Administrative reads/revokes enforce permissions and target scope | US-01-16-AC3 |
| TS-01-079 | Integration | Cross-Organization session id returns 404 and session cap remains 10 (CS-08) | US-01-16-AC3 |
