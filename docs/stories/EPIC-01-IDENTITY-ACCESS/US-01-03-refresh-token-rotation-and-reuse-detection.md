# US-01-03: Refresh Token Rotation and Reuse Detection

| Field | Value |
|---|---|
| Story ID | US-01-03 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |
| Related Business Rules | BR-01-005, BR-01-006, BR-01-018, BR-01-021 |
| Dependencies | US-01-02 |

## User Story
As an organization user, I want my session to be renewed silently and safely so that I stay logged in during my shift while a stolen refresh token cannot be used without detection.

## Business Value
Keeps POS operators working without repeated logins for up to 30 days while limiting the damage of token theft (ADR-005, CS-12).

## Preconditions
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

## Acceptance Criteria

### US-01-03-AC1: Refresh rotates the token within the family
- **Given** a valid, unrotated refresh token `RT1` of family `F` issued 2 days ago, family created 2 days ago
- **When** the client posts `/api/v1/auth/refresh` with the `RT1` cookie
- **Then** the response is 200 with a new access token (15 min) and a `Set-Cookie` with `RT2`
- **And** `RT1` has `RotatedAt` set and `ReplacedByTokenId = RT2`, `RT2` belongs to family `F`, expires 14 days after issue, and `UserSession.LastActivityAt` is updated
- **And** the refresh token value never appears in the response body.

### US-01-03-AC2: Reuse of a rotated token revokes the whole family (CS-12)
- **Given** `RT1` was rotated to `RT2` and `RT2` was rotated to `RT3`
- **When** `RT1` is presented to `/api/v1/auth/refresh`
- **Then** the response is 401 `IDENTITY.REFRESH_TOKEN_REUSED` and the cookie is cleared
- **And** `RT2` and `RT3` and the session are revoked with reason `TokenReuse`
- **And** a subsequent refresh with `RT3` returns 401 `IDENTITY.REFRESH_TOKEN_INVALID`
- **And** access tokens of the session are rejected with 401 `IDENTITY.SESSION_REVOKED` within ≤ 60 s
- **And** audit event `identity.refresh-token.reuse-detected` is written and a security notice email is queued.

### US-01-03-AC3: Absolute family expiry is enforced
- **Given** a family created 30 days and 1 second ago whose latest token was issued 1 day ago
- **When** that token is presented
- **Then** the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`, the cookie is cleared, and the session is revoked with reason `Expired`.

### US-01-03-AC4: Refresh refused for non-active user or revoked session
- **Given** a valid refresh token belonging to a user who has been `Deactivated`, or to a session revoked by an administrator
- **When** the token is presented
- **Then** the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`, no new token is issued, and the cookie is cleared.

### US-01-03-AC5: Sliding expiry is honored
- **Given** a token issued 14 days and 1 second ago in a family created 14 days ago
- **When** it is presented
- **Then** the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`.

### US-01-03-AC6: Concurrent refresh with the same token
- **Given** two requests carrying the same unrotated `RT1` arrive within 50 ms
- **When** both are processed
- **Then** exactly one returns 200 with a new token, and the other returns 401 `IDENTITY.REFRESH_TOKEN_REUSED` and the family is revoked (default behavior pending OD-01-01).

## Validation Rules
- Cookie missing → 401 `IDENTITY.REFRESH_TOKEN_INVALID`.
- Refresh requires header `X-Requested-With: XMLHttpRequest`; missing → 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- Anonymous endpoint authenticated by the refresh cookie only. No permission applies; a 403 case does not exist for this endpoint.
- Refresh tokens are looked up by SHA-256 hash; plaintext is never stored (BR-01-021).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No cookie / unknown token | 401 `IDENTITY.REFRESH_TOKEN_INVALID` |
| Rotated or revoked token presented | 401 `IDENTITY.REFRESH_TOKEN_REUSED` (family revoked) |
| Sliding or absolute expiry passed | 401 `IDENTITY.REFRESH_TOKEN_INVALID` |
| User deactivated / session revoked | 401 `IDENTITY.REFRESH_TOKEN_INVALID` |
| Missing `X-Requested-With` | 400 `COMMON.VALIDATION_FAILED` |

## Edge Cases
- Frontend must serialize refresh across browser tabs (single-flight + cross-tab lock) to avoid AC6 false positives.
- Token reuse detected after the user was already deactivated: still writes the audit event.
- Refresh during signing-key rotation: new access tokens use the new `kid`; old ones remain valid until expiry (NFR-01-007).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-013 | Integration | Rotation updates rows; cookie attributes; no token in body | US-01-03-AC1 |
| TS-01-014 | Integration | **CS-12** — replay rotated RT1 after RT3 → family + session revoked, audit, email queued, RT3 rejected, access token 401 within 60 s | US-01-03-AC2 |
| TS-01-015 | Integration | Clock-driven absolute (30 d) and sliding (14 d) expiry | US-01-03-AC3, US-01-03-AC5 |
| TS-01-016 | Integration | Deactivated user / admin-revoked session cannot refresh | US-01-03-AC4 |
| TS-01-017 | Concurrency | 2 parallel refreshes with same token, repeated 100 times → exactly one success each run | US-01-03-AC6 |
