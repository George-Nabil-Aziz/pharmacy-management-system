# US-01-18: Enroll and authenticate with TOTP

| Field | Value |
|---|---|
| Story ID | US-01-18 |
| Epic | EPIC-01 |
| Priority | P2 |
| Complexity | L |
| Related Requirements | FR-01-041, FR-01-042 |
| Related Business Rules | BR-01-018, BR-01-021, BR-01-023 |
| Dependencies | US-01-02, US-01-05, SPEC-02 MFA settings |

## User Story
As an organization user, I want to enroll a TOTP authenticator and complete a challenge at login so that a password alone is not sufficient when MFA is enabled.

## Business Value
An additional possession factor reduces the impact of a compromised password while preserving the existing access-token contract.

## Preconditions
- TOTP support is enabled for the deployment.
- Enrollment begins from an authenticated session; the user has an authenticator capable of RFC 6238 TOTP.

## Acceptance Criteria
### US-01-18-AC1: Enroll only after confirming TOTP
- **Given** an authenticated user without an active TOTP factor
- **When** they start enrollment and confirm a valid six-digit code
- **Then** the factor is activated using a 160-bit secret encrypted at rest and 10 single-use recovery codes are returned once.

### US-01-18-AC2: Complete login MFA challenge
- **Given** an Active user with a confirmed TOTP factor
- **When** correct credentials are submitted and the user completes the five-minute MFA challenge with a valid code
- **Then** only the second step issues the 15-minute access token, session, and refresh cookie; the same TOTP time step cannot be accepted twice.

### US-01-18-AC3: Reject invalid or replayed MFA codes
- **Given** an expired challenge, invalid code, reused time step, or consumed recovery code
- **When** the user submits it
- **Then** no session is issued; after five failed codes the MFA token is invalidated and failures count toward account lockout.

### US-01-18-AC4: Require authentication for factor enrollment
- **Given** an unauthenticated caller or an authenticated restricted session that must change its password
- **When** they attempt to enroll a factor
- **Then** the request returns 401 for missing authentication or 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` for the restricted session.

## Validation Rules
- TOTP code is six digits; recovery code is `XXXXX-XXXXX` base32 (VR-01-017).
- A TOTP secret is 160 bits, encrypted at rest, and never written to logs.

## Authorization Rules
- Factor enrollment and login MFA are self-service flows; the endpoints require the caller's own authenticated or challenge context and do not accept a target User id.
- They have no permission-based branch operation; therefore cross-branch 403 and cross-Organization resource 404 cases do not apply. Missing authentication is 401; restricted sessions use the specified 403.
- PostgreSQL RLS is enabled and forced from MVP for tenant-owned MFA data.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Enrollment without valid access token | 401 `IDENTITY.UNAUTHENTICATED` |
| Restricted session attempts enrollment | 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` |
| Invalid/expired/replayed code | 400 `IDENTITY.MFA_CODE_INVALID` |
| Five failed codes | 401 `IDENTITY.MFA_CODE_INVALID`; challenge invalidated and lockout counter incremented |
| Login throttled | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- TOTP verification allows a clock window of plus or minus one 30-second step, but a successfully used time step cannot be used again.
- Recovery codes are shown once, stored as hashes, and individually consumed.
- Disabling or resetting a factor is covered by US-01-19.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-084 | Integration | Confirmed enrollment stores encrypted secret and returns 10 recovery codes once | US-01-18-AC1 |
| TS-01-085 | Integration | Valid TOTP challenge issues session tokens; same time step replay is rejected | US-01-18-AC2 |
| TS-01-086 | Integration | Expired, invalid, consumed recovery codes and five-failure lockout | US-01-18-AC3 |
| TS-01-087 | Integration | Missing auth returns 401; password-restricted session receives 403 | US-01-18-AC4 |
