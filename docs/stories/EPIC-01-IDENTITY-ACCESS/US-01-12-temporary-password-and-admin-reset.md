# US-01-12: Create User with Temporary Password and Admin Password Reset

| Field | Value |
|---|---|
| Story ID | US-01-12 |
| Epic | EPIC-01 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-01-028, FR-01-029, FR-01-040 |
| Related Business Rules | BR-01-013, BR-01-014, BR-01-023 |
| Dependencies | US-01-11, US-01-06 |

## User Story
As an Owner, I want to create a user with a one-time temporary password and reset a staff member's password at the counter so that staff with unreliable email access can still start or resume work the same day.

## Business Value
Many pharmacy staff check email rarely; on-the-spot onboarding and recovery avoids lost shifts while forcing the user to choose a private password.

## Preconditions
- Actor holds `identity.users.create` (creation) or `identity.users.reset-password` (reset).

## Acceptance Criteria

### US-01-12-AC1: Create user with temporary password
- **Given** an Owner
- **When** she posts `/api/v1/users` with email, full name, roles `[INVENTORY]`, branches `[CAI01 default]`
- **Then** the response is 201 containing `temporaryPassword` (12 characters, policy-compliant) exactly once, the user is `Active` with `MustChangePassword = true`
- **And** audit event `identity.user.created-with-temporary-password` is written without the password value; a later `GET /api/v1/users/{id}` never returns the password.

### US-01-12-AC2: Restricted session until password is changed
- **Given** the new user logs in with the temporary password
- **When** she calls `GET /api/v1/branches/{CAI01}/stock` (any non-allowed endpoint)
- **Then** login returned 200 with `restriction = "PasswordChangeRequired"`, and the call returns 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED`
- **And** after `POST /api/v1/auth/password/change` succeeds, the same call is evaluated normally and `MustChangePassword = false`.

### US-01-12-AC3: Admin reset in temporaryPassword mode
- **Given** an `Active` user with 2 sessions in scope of a Manager holding `identity.users.reset-password`
- **When** the Manager posts `/api/v1/users/{userId}/password-reset` with `mode = temporaryPassword`
- **Then** the response is 200 with a one-time `temporaryPassword`, the user has `MustChangePassword = true`, both sessions are revoked with reason `PasswordReset`, and audit event `identity.password.admin-reset` (mode only) is written.

### US-01-12-AC4: Admin reset in email mode
- **Given** an `Active` user
- **When** the Owner posts `/api/v1/users/{userId}/password-reset` with `mode = email`
- **Then** the response is 202, a reset token (30 min) is created with `IssuedByUserId` = Owner, an email is queued, and all sessions are revoked.

### US-01-12-AC5: Reset without permission or outside scope is denied
- **Given** a `CASHIER` without `identity.users.reset-password`, and a Manager targeting an Owner
- **When** each posts `/api/v1/users/{userId}/password-reset`
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED` and 403 `IDENTITY.USER_OUTSIDE_SCOPE`, and no password changes.

### US-01-12-AC6: Self reset via admin endpoint is refused
- **Given** an Owner
- **When** she targets her own user id on `/api/v1/users/{userId}/password-reset`
- **Then** the response is 403 `IDENTITY.SELF_MODIFICATION_FORBIDDEN` (she must use change/forgot password).

## Validation Rules
- Same as US-01-11 for user fields (VR-01-001, VR-01-002, VR-01-008 – VR-01-010, VR-01-013, VR-01-014).
- `mode` ∈ {`email`, `temporaryPassword`} → otherwise 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- Create: `identity.users.create` + BR-01-009/BR-01-010/BR-01-013. Reset: `identity.users.reset-password` + BR-01-013 + BR-01-008.
- Other organization's user → 404 `IDENTITY.USER_NOT_FOUND`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Target outside scope | 403 `IDENTITY.USER_OUTSIDE_SCOPE` |
| Self target | 403 `IDENTITY.SELF_MODIFICATION_FORBIDDEN` |
| Reset for `Invited` or `Deactivated` user | 409 `IDENTITY.INVALID_STATUS_TRANSITION` |
| Restricted session calling other endpoints | 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` |
| Duplicate email on create | 409 `IDENTITY.EMAIL_ALREADY_EXISTS` |

## Edge Cases
- Admin reset of a `Locked` user in `temporaryPassword` mode also unlocks the user (status `Active`, counter 0).
- Temporary passwords are excluded from history checks for the user's next chosen password only if different (policy still applies).
- Temporary password is displayed with a copy button and an on-screen warning; it is never emailed or logged.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-060 | Integration | Create with temp password; password returned once; audit without secret | US-01-12-AC1 |
| TS-01-061 | Integration | Restricted session 403 until change; then normal | US-01-12-AC2 |
| TS-01-062 | Integration | Admin reset temp mode and email mode; session revocation | US-01-12-AC3, US-01-12-AC4 |
| TS-01-063 | Integration | Cashier 403, manager→owner 403, self 403, other-org user 404 | US-01-12-AC5, US-01-12-AC6 |
