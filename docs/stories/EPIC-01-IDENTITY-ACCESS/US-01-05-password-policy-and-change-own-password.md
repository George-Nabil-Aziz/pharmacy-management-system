# US-01-05: Password Policy and Change Own Password

| Field | Value |
|---|---|
| Story ID | US-01-05 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-01-012, FR-01-013, FR-01-040 |
| Related Business Rules | BR-01-014, BR-01-018 |
| Dependencies | US-01-02 |

## User Story
As an organization user, I want to change my password under a clear policy so that my account stays protected and other devices are signed out.

## Business Value
Reduces account takeover risk from weak or reused passwords on shared pharmacy terminals.

## Preconditions
- The user is logged in.
- The blocked-password list (≥10,000 entries) is deployed.

## Acceptance Criteria

### US-01-05-AC1: Successful change revokes other sessions
- **Given** a user with sessions `S1` (current) and `S2`
- **When** she posts `/api/v1/auth/password/change` with the correct current password and a compliant new password `Nile-Pharma-2026`
- **Then** the response is 204, the password hash is replaced, the previous hash is stored in `UserPasswordHistory`, the security stamp rotates, `S2` is revoked with reason `PasswordChanged`, `S1` stays active and receives a fresh access token on its next refresh
- **And** audit event `identity.password.changed` is written and a security notice email is queued.

### US-01-05-AC2: Policy violations are reported per rule
- **Given** a logged-in user with email `ahmed.samir@example.eg`
- **When** the new password is `abc` / `abcdefghijk` / `1234567890` / `password123` (blocked) / `ahmed.samir99`
- **Then** each response is 400 `COMMON.VALIDATION_FAILED` with field code respectively `IDENTITY.PASSWORD_TOO_SHORT`, `IDENTITY.PASSWORD_MISSING_DIGIT`, `IDENTITY.PASSWORD_MISSING_LETTER`, `IDENTITY.PASSWORD_BLOCKLISTED`, `IDENTITY.PASSWORD_CONTAINS_EMAIL`, and the password is unchanged.

### US-01-05-AC3: Reuse of the last 5 passwords is refused
- **Given** a user whose last 5 passwords include `Delta-Clinic-77`
- **When** she sets the new password `Delta-Clinic-77`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with field code `IDENTITY.PASSWORD_REUSED`.

### US-01-05-AC4: Wrong current password is refused
- **Given** a logged-in user
- **When** she submits an incorrect current password
- **Then** the response is 400 `IDENTITY.CURRENT_PASSWORD_INVALID`, no session is revoked, and the attempt counts toward lockout (US-01-07).

### US-01-05-AC5: Unauthenticated change is rejected
- **Given** no valid access token
- **When** `/api/v1/auth/password/change` is posted
- **Then** the response is 401 `IDENTITY.UNAUTHENTICATED`.

## Validation Rules
VR-01-003 – VR-01-007. Password storage per FR-01-012 (PBKDF2-HMAC-SHA512, ≥100,000 iterations). Passwords are never logged (NFR-01-011).

## Authorization Rules
- Any authenticated user may change only their own password; there is no permission and no way to target another user (no 403 case). Admin resets: US-01-12.
- Allowed for sessions with restriction `PasswordChangeRequired` (US-01-12).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Policy violation | 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.PASSWORD_*` |
| Reused password | 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.PASSWORD_REUSED` |
| Wrong current password | 400 `IDENTITY.CURRENT_PASSWORD_INVALID` |
| No token | 401 `IDENTITY.UNAUTHENTICATED` |

## Edge Cases
- New password equal to current password → `IDENTITY.PASSWORD_REUSED`.
- 128-character password accepted; 129 → `IDENTITY.PASSWORD_TOO_LONG`.
- Arabic letters satisfy the "letter" rule; Arabic-Indic digits (٠-٩) satisfy the "digit" rule.
- The frontend shows a live checklist of rules in the user's language; server remains authoritative.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-022 | Integration | Change revokes other sessions, keeps current, history row, audit, email queued | US-01-05-AC1 |
| TS-01-023 | Unit | Policy evaluator table-driven cases incl. Arabic letters/digits and length bounds | US-01-05-AC2 |
| TS-01-024 | Integration | Reuse of any of last 5 rejected; 6th-oldest accepted | US-01-05-AC3 |
| TS-01-025 | Integration | Wrong current password → 400 and lockout counter +1; no token → 401 | US-01-05-AC4, US-01-05-AC5 |
