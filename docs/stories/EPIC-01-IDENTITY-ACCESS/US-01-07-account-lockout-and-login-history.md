# US-01-07: Account Lockout, Login Rate Limiting and Login History

| Field | Value |
|---|---|
| Story ID | US-01-07 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |
| Related Business Rules | BR-01-002, BR-01-003, BR-01-013, BR-01-022 |
| Dependencies | US-01-02, US-01-13 (directory scope for history view) |

## User Story
As an Owner, I want repeated failed logins to lock the account and to see a user's login history so that password guessing is stopped and suspicious access can be investigated.

## Business Value
Blocks brute-force and credential-stuffing attempts and gives managers evidence when investigating misuse.

## Preconditions
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

## Acceptance Criteria

### US-01-07-AC1: Five consecutive failures lock the account
- **Given** an `Active` user with `AccessFailedCount = 4`
- **When** a 5th wrong password is submitted to `/api/v1/auth/login`
- **Then** the response is 423 `IDENTITY.ACCOUNT_LOCKED` with `retryAfterSeconds = 900`, the user status is `Locked` with `LockedUntil = now + 15 min`
- **And** audit event `identity.user.locked` is written and a `LoginAttempt` with outcome `Locked` is recorded.

### US-01-07-AC2: Correct password during lock is still refused
- **Given** a `Locked` user with `LockedUntil` 10 minutes in the future
- **When** the correct password is submitted
- **Then** the response is 423 `IDENTITY.ACCOUNT_LOCKED` with `retryAfterSeconds` ≤ 600 and no session is created.

### US-01-07-AC3: Lock expires automatically
- **Given** a `Locked` user whose `LockedUntil` passed 1 second ago
- **When** the correct password is submitted
- **Then** login succeeds (200), the status becomes `Active`, and `AccessFailedCount = 0`.

### US-01-07-AC4: Unknown emails behave identically
- **Given** an email not on the platform
- **When** 5 attempts are made and then a 6th
- **Then** the first 4 responses are 401 `IDENTITY.INVALID_CREDENTIALS` and the 5th and 6th are 423 `IDENTITY.ACCOUNT_LOCKED`, indistinguishable from a real account.

### US-01-07-AC5: Administrator unlocks a user early
- **Given** a Manager with `identity.users.update` whose branches include all of the locked user's branches
- **When** he posts `/api/v1/users/{userId}/unlock`
- **Then** the response is 204, the user is `Active` with `AccessFailedCount = 0`, and audit event `identity.user.unlocked` is written.

### US-01-07-AC6: Unlock without permission is denied
- **Given** a `CASHIER` without `identity.users.update`
- **When** she posts `/api/v1/users/{userId}/unlock`
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED` and the user stays `Locked`.

### US-01-07-AC7: Login history is visible to authorized users
- **Given** a user with 60 recorded login attempts and an Owner with `identity.users.read`
- **When** the Owner calls `GET /api/v1/users/{userId}/login-attempts?limit=50`
- **Then** the response is 200 with 50 items ordered newest first (timestamp, IP, user agent, outcome, failure code) and a `nextCursor`; no password or email hash is returned.

### US-01-07-AC8: Per-IP login rate limit
- **Given** 30 login attempts from one IP within the last minute across different emails
- **When** a 31st is made
- **Then** the response is 429 `COMMON.RATE_LIMITED` with a `Retry-After` header and a `LoginAttempt` with outcome `RateLimited` is recorded.

## Validation Rules
- `limit` 1–100 (default 25); invalid cursor → 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- Unlock requires `identity.users.update` + scope rule BR-01-013; history requires `identity.users.read` + scope rule.
- Target user in another organization → 404 `IDENTITY.USER_NOT_FOUND` (CS-08).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Locked account login | 423 `IDENTITY.ACCOUNT_LOCKED` |
| Unlock a user that is not `Locked` | 409 `IDENTITY.INVALID_STATUS_TRANSITION` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Target outside scope | 403 `IDENTITY.USER_OUTSIDE_SCOPE` |
| Other organization's user | 404 `IDENTITY.USER_NOT_FOUND` |
| Rate limit | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- A successful login resets `AccessFailedCount` to 0 (failures must be consecutive).
- Lockout does not revoke existing sessions of the legitimate user.
- Wrong current password on change (US-01-05) and wrong overrider password (US-01-17) increment the same counter.
- Password reset (US-01-06) unlocks the account.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-031 | Integration | 5th failure locks, audit, LoginAttempt; correct password during lock → 423 | US-01-07-AC1, US-01-07-AC2 |
| TS-01-032 | Integration | Clock +15 min 1 s → login succeeds and resets counter | US-01-07-AC3 |
| TS-01-033 | Integration | Unknown email follows same 401/423 pattern | US-01-07-AC4 |
| TS-01-034 | Integration | Manager unlock in scope 204; cashier 403; other-org user 404 | US-01-07-AC5, US-01-07-AC6 |
| TS-01-035 | Integration | Login history cursor pagination and field filtering | US-01-07-AC7 |
| TS-01-036 | Integration | 31st attempt per IP per minute → 429 across 2 nodes | US-01-07-AC8 |
