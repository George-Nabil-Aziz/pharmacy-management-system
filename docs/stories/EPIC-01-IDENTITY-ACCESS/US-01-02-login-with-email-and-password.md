# US-01-02: Login with Email and Password

| Field | Value |
|---|---|
| Story ID | US-01-02 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |
| Related Business Rules | BR-01-001, BR-01-002, BR-01-006, BR-01-022, BR-G-23 |
| Dependencies | US-01-08, SPEC-02 organization provisioning (an organization with users exists) |

## User Story
As an organization user, I want to log in with my email and password so that I can access the features and branches I am authorized for.

## Business Value
Individual accounts are the basis of accountability for every sale, dispensing, and stock movement (BRQ-01).

## Preconditions
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

## Acceptance Criteria

### US-01-02-AC1: Successful login issues tokens and creates a session
- **Given** an `Active` user `mona@example.eg` with a valid password
- **When** she posts `/api/v1/auth/login` with ` Mona@Example.eg ` (mixed case, surrounding spaces) and the correct password
- **Then** the response is 200 with `accessToken`, `expiresIn = 900`, `sessionId`, `mfaRequired = false`
- **And** the access token contains `sub`, `org`, `sid`, `stamp`, `amr = ["pwd"]` and expires 15 minutes after issue
- **And** a `Set-Cookie` refresh token with `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` is returned
- **And** a `UserSession` and a `RefreshToken` with a new `FamilyId` exist, `LastLoginAt` is updated, and a `LoginAttempt` with outcome `Succeeded` is recorded.

### US-01-02-AC2: Generic failure for wrong password, unknown email, and deactivated user
- **Given** a wrong password for an existing user, an email not registered on the platform, and a `Deactivated` user with the correct password
- **When** each is submitted to `/api/v1/auth/login`
- **Then** all three responses are 401 with code `IDENTITY.INVALID_CREDENTIALS` and byte-identical bodies except `traceId`
- **And** no session or cookie is created and a `LoginAttempt` with outcome `Failed` is recorded for each.

### US-01-02-AC3: Current principal is returned by /auth/me
- **Given** a logged-in `PHARMACIST` assigned to branches `CAI01` (default) and `GIZ01`
- **When** she calls `GET /api/v1/auth/me` with her access token
- **Then** the response is 200 with her user id, full name, organization id and name, roles `[PHARMACIST]`, the effective permission codes of that role, both branches with `CAI01` flagged default, `hasOrganizationWideScope = false`, `mustChangePassword = false`, and `restriction = null`.

### US-01-02-AC4: Unauthenticated call to /auth/me is rejected
- **Given** no access token, an expired access token, or a token signed with an unknown key
- **When** `GET /api/v1/auth/me` is called
- **Then** the response is 401 `IDENTITY.UNAUTHENTICATED` with header `WWW-Authenticate: Bearer`.

### US-01-02-AC5: Session cap revokes least recently active session
- **Given** a user with 10 active sessions
- **When** he logs in an 11th time
- **Then** login succeeds and the session with the oldest `LastActivityAt` is revoked with reason `SessionLimit`, leaving 10 active sessions.

### US-01-02-AC6: Platform administrator credentials do not work on organization login
- **Given** a `PlatformUser` `ops@platform.example`
- **When** those credentials are posted to `/api/v1/auth/login`
- **Then** the response is 401 `IDENTITY.INVALID_CREDENTIALS`.

## Validation Rules
- VR-01-001 (`email`); `password` required, 1–128 characters (policy is not re-evaluated on login).
- Missing fields → 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- `/auth/login` is anonymous; `/auth/me` requires any valid access token (no permission).
- Only `Active` users obtain sessions (BR-01-002). `Invited` signup Owners: see US-01-01; `Locked`: see US-01-07.
- Login is pre-authentication and cannot produce a permission-based 403; invalid credentials use the same 401 response and throttling uses 429. This is why no 403 permission-denied scenario applies to `/auth/login`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Wrong password / unknown email / deactivated user / invited (non-signup) user | 401 `IDENTITY.INVALID_CREDENTIALS` |
| Missing email or password | 400 `COMMON.VALIDATION_FAILED` |
| Locked account | 423 `IDENTITY.ACCOUNT_LOCKED` (US-01-07) |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` (US-01-07) |
| `/auth/me` without valid token | 401 `IDENTITY.UNAUTHENTICATED` |

## Edge Cases
- Password with leading/trailing spaces is used as typed (not trimmed).
- Arabic-script password characters are accepted.
- A user whose only assigned branch is `Inactive` logs in successfully; `/auth/me` returns an empty branch list.
- Stored hash with older iteration count is re-hashed on successful login (FR-01-012).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-008 | Integration | Successful login: tokens, claims, cookie attributes, session/token rows, LoginAttempt | US-01-02-AC1 |
| TS-01-009 | Integration | Three failure kinds return identical 401 bodies | US-01-02-AC2 |
| TS-01-010 | Performance | Known vs unknown email p95 timing difference ≤ 50 ms over 1,000 attempts | US-01-02-AC2 |
| TS-01-011 | Integration | `/auth/me` content for multi-branch pharmacist; 401 cases | US-01-02-AC3, US-01-02-AC4 |
| TS-01-012 | Integration | 11th login revokes oldest session; platform credentials rejected | US-01-02-AC5, US-01-02-AC6 |
