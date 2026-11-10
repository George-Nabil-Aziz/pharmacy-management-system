# US-01-04: Logout and Logout from All Devices

| Field | Value |
|---|---|
| Story ID | US-01-04 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-01-010, FR-01-011 |
| Related Business Rules | BR-01-004, BR-01-005 |
| Dependencies | US-01-03 |

## User Story
As an organization user, I want to log out of this device or of all my devices so that nobody can continue working under my identity on a shared terminal.

## Business Value
Shared POS terminals are common; explicit logout and global logout preserve individual accountability.

## Preconditions
- The user has at least one active session (US-01-02).

## Acceptance Criteria

### US-01-04-AC1: Logout revokes the current session
- **Given** a user with sessions `S1` (current) and `S2`
- **When** she posts `/api/v1/auth/logout` from `S1`
- **Then** the response is 204, the refresh cookie is cleared (`Max-Age=0`), `S1` and its token family are revoked with reason `Logout`, and `S2` remains active
- **And** an access token of `S1` used after ≤ 60 s returns 401 `IDENTITY.SESSION_REVOKED`.

### US-01-04-AC2: Logout is idempotent
- **Given** the session is already revoked or the cookie is absent
- **When** `/api/v1/auth/logout` is posted again
- **Then** the response is 204 and no error is returned.

### US-01-04-AC3: Logout from all devices
- **Given** a user with 3 active sessions
- **When** he posts `/api/v1/auth/logout-all` with a valid access token
- **Then** the response is 204, all 3 sessions and their families are revoked with reason `LogoutAll`, the user's security stamp is rotated, and every previously issued access token returns 401 `IDENTITY.SESSION_REVOKED` within ≤ 60 s
- **And** audit event `identity.sessions.revoked-all` is written.

### US-01-04-AC4: Logout-all requires authentication
- **Given** no valid access token
- **When** `/api/v1/auth/logout-all` is posted
- **Then** the response is 401 `IDENTITY.UNAUTHENTICATED` and no session is revoked.

## Validation Rules
None beyond authentication.

## Authorization Rules
- `/auth/logout` accepts either the refresh cookie or a valid access token and only affects the caller's own session; no permission required (no 403 case).
- `/auth/logout-all` requires a valid access token; affects only the caller's own sessions.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Logout with no cookie and no token | 204 (no-op) |
| Logout-all without access token | 401 `IDENTITY.UNAUTHENTICATED` |
| Logout-all with revoked-session token | 401 `IDENTITY.SESSION_REVOKED` |

## Edge Cases
- Logout while a refresh is in flight in another tab: the refresh returns 401 `IDENTITY.REFRESH_TOKEN_INVALID`.
- The frontend clears in-memory access token and Zustand auth state and broadcasts logout to other tabs of the same session.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-018 | Integration | Logout revokes only current session; cookie cleared; token rejected after cache propagation | US-01-04-AC1 |
| TS-01-019 | Integration | Repeated logout returns 204 | US-01-04-AC2 |
| TS-01-020 | Integration | Logout-all revokes 3 sessions, rotates stamp, writes audit; unauthenticated → 401 | US-01-04-AC3, US-01-04-AC4 |
| TS-01-021 | Multi-node | Revocation enforced on a second node within 60 s | US-01-04-AC1, US-01-04-AC3 |
