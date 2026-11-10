# US-01-06: Forgot and Reset Password

| Field | Value |
|---|---|
| Story ID | US-01-06 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |
| Related Business Rules | BR-01-002, BR-01-014, BR-01-021, BR-01-022 |
| Dependencies | US-01-05, SPEC-10 email dispatch |

## User Story
As an organization user who forgot my password, I want to receive a reset link by email so that I can regain access without exposing whether an email is registered.

## Business Value
Reduces dependence on the Owner for routine password recovery while keeping recovery secure.

## Preconditions
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

## Acceptance Criteria

### US-01-06-AC1: Forgot request for an active user sends a single valid token
- **Given** an `Active` user `mona@example.eg` with one unused reset token issued 10 minutes ago
- **When** `/api/v1/auth/password/forgot` is posted with `mona@example.eg`
- **Then** the response is 202 with body `{ "status": "accepted" }`
- **And** the previous token has `InvalidatedAt` set, a new `PasswordResetToken` expiring in 30 minutes exists (hash only), and one reset email is queued in the user's preferred language.

### US-01-06-AC2: Non-existent, invited, or deactivated email gets the same response and no email
- **Given** an email not on the platform, an `Invited` user, and a `Deactivated` user
- **When** each is posted to `/api/v1/auth/password/forgot`
- **Then** each response is 202 with the identical body and p95 timing difference ≤ 50 ms versus AC1, and no token or email is created.

### US-01-06-AC3: Reset with a valid token sets the password and revokes all sessions
- **Given** a `Locked` user with 2 active sessions and an unexpired reset token
- **When** `/api/v1/auth/password/reset` is posted with the token and a compliant new password
- **Then** the response is 204, the password changes, the token is consumed, the user becomes `Active` with `AccessFailedCount = 0`, the security stamp rotates, both sessions are revoked with reason `PasswordReset`
- **And** audit event `identity.password.reset-completed` is written and a security notice email is queued.

### US-01-06-AC4: Expired, consumed, or invalidated tokens are rejected
- **Given** a token 30 minutes and 1 second old, a consumed token, and an invalidated token
- **When** each is used on `/api/v1/auth/password/reset`
- **Then** each response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the password is unchanged.

### US-01-06-AC5: Policy still applies on reset
- **Given** a valid token
- **When** the new password is one of the user's last 5 passwords
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `IDENTITY.PASSWORD_REUSED` and the token remains unconsumed.

### US-01-06-AC6: Forgot-password rate limit
- **Given** 3 forgot requests for the same email within the last hour
- **When** a 4th is posted
- **Then** the response is 429 `COMMON.RATE_LIMITED` with a `Retry-After` header and no email is queued.

## Validation Rules
VR-01-001, VR-01-003 – VR-01-006, VR-01-016.

## Authorization Rules
- Both endpoints are anonymous; possession of the emailed token is the only authorization. No 403 case exists.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Malformed email on forgot | 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.EMAIL_INVALID` |
| Invalid/expired/consumed token | 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` |
| Weak or reused password | 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.PASSWORD_*` |
| Rate limit | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- Two forgot requests 5 seconds apart: only the second token is usable.
- Reset link opened on a different device than the one that requested it: allowed.
- Email delivery delayed > 30 minutes: user requests again; outbox retries do not extend token validity.
- Reset token appears in browser history: it is single-use and 30-minute limited; the page uses `Referrer-Policy: no-referrer`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-026 | Integration | Forgot for active user invalidates old token, creates hashed token, queues email | US-01-06-AC1 |
| TS-01-027 | Integration | Unknown/invited/deactivated emails → identical 202, no rows, timing check | US-01-06-AC2 |
| TS-01-028 | Integration | Reset unlocks, consumes token, revokes sessions, audit, notice | US-01-06-AC3 |
| TS-01-029 | Integration | Expired/consumed/invalidated tokens rejected; reused password keeps token | US-01-06-AC4, US-01-06-AC5 |
| TS-01-030 | Integration | 4th forgot request in 1 hour → 429 | US-01-06-AC6 |
