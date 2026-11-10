# US-01-19: Enforce and administer MFA

| Field | Value |
|---|---|
| Story ID | US-01-19 |
| Epic | EPIC-01 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-01-040, FR-01-043, FR-01-044 |
| Related Business Rules | BR-01-018, BR-01-021, BR-01-023 |
| Dependencies | US-01-08, US-01-10, US-01-14, US-01-18, SPEC-02 MFA settings |

## User Story
As an Owner, I want to require MFA for Owners and Managers and manage recovery or reset of factors so that elevated accounts meet the Organization's configured authentication policy.

## Business Value
Policy enforcement extends TOTP protection to privileged roles and gives administrators a controlled recovery process.

## Preconditions
- TOTP is enabled and the Organization setting `RequireMfaForOwnerAndManager` is available.
- The actor has the required self-service or `identity.users.reset-password` authority.

## Acceptance Criteria
### US-01-19-AC1: Enforce MFA enrollment policy
- **Given** `RequireMfaForOwnerAndManager` is ON and an Owner or Manager has no active factor
- **When** they access an endpoint outside `/auth/me`, MFA enrollment, and logout
- **Then** the response is 403 `IDENTITY.MFA_ENROLLMENT_REQUIRED`; exempt endpoints remain available.

### US-01-19-AC2: Manage recovery codes and disable own factor
- **Given** a user with an active TOTP factor and valid current credentials
- **When** they regenerate recovery codes or disable their own factor with a valid password and code
- **Then** old recovery codes are invalidated, new codes are returned once, and disabling is rejected with 409 when MFA is required by policy.

### US-01-19-AC3: Reset another user's factor within scope
- **Given** an administrator with `identity.users.reset-password` and a target User in management scope
- **When** they reset the target factor
- **Then** the factor is disabled, all target sessions are revoked, and the same-transaction audit event contains no secret or recovery code.

### US-01-19-AC4: Deny missing permission and conceal foreign users
- **Given** an administrator without reset permission or a target User from another Organization
- **When** they attempt factor reset
- **Then** the first request returns 403 `IDENTITY.PERMISSION_DENIED`, the second returns 404 `IDENTITY.USER_NOT_FOUND`, and no factor or session state is disclosed.

## Validation Rules
- Recovery and TOTP codes follow VR-01-017.
- Disabling requires a valid password and current TOTP code; policy-enforced disable returns `IDENTITY.MFA_REQUIRED_BY_POLICY`.

## Authorization Rules
- Own factor actions require an authenticated self context. Resetting another User's factor requires `identity.users.reset-password` plus management scope.
- Cross-Organization targets return 404; missing permission or out-of-scope targets return 403. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Privileged user has not enrolled under enforced policy | 403 `IDENTITY.MFA_ENROLLMENT_REQUIRED` |
| MFA disable prohibited by policy | 409 `IDENTITY.MFA_REQUIRED_BY_POLICY` |
| Invalid code or password | 400 `IDENTITY.MFA_CODE_INVALID` / `IDENTITY.CURRENT_PASSWORD_INVALID` |
| Missing admin reset permission or target scope | 403 `IDENTITY.PERMISSION_DENIED` / `IDENTITY.USER_OUTSIDE_SCOPE` |
| Foreign Organization target | 404 `IDENTITY.USER_NOT_FOUND` |

## Edge Cases
- Regenerating recovery codes invalidates all previously issued unused codes in the same transaction.
- A factor reset revokes sessions with reason `MfaReset`; it does not reset or reveal the user's password.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-088 | Integration | Enforced Owner/Manager receives restriction while exempt endpoints remain usable | US-01-19-AC1 |
| TS-01-089 | Integration | Recovery-code rotation, own-factor disable, and policy block | US-01-19-AC2 |
| TS-01-090 | Integration | In-scope admin reset revokes sessions and audits without secrets | US-01-19-AC3 |
| TS-01-091 | Integration | Missing permission/scope return 403 and foreign user returns 404 (CS-08) | US-01-19-AC4 |
