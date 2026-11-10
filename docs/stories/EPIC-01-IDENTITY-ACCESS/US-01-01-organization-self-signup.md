# US-01-01: Organization Self-Signup with Owner Email Verification

| Field | Value |
|---|---|
| Story ID | US-01-01 |
| Epic | EPIC-01 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |
| Related Business Rules | BR-01-001, BR-01-003, BR-01-021, BR-G-19, BR-G-16 |
| Dependencies | US-01-02, US-01-08, US-01-11, SPEC-02 organization provisioning contract |

## User Story
As a pharmacy owner, I want to register my organization and become its Owner so that I can start configuring my pharmacy without contacting the SaaS operator.

## Business Value
Removes manual onboarding work for the operator and gives a new organization a working Owner account with the six system roles in a single step.

## Preconditions
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

## Acceptance Criteria

### US-01-01-AC1: Successful signup creates organization, branch, roles and invited Owner atomically
- **Given** self-signup is enabled and `owner@newpharma.eg` is not used on the platform
- **When** an anonymous visitor posts `/api/v1/auth/signup` with valid organization name, branch name, owner full name, email, a policy-compliant password, `preferredLanguage = ar`, and `acceptTerms = true`
- **Then** the response is 201 with `organizationId`, `branchId`, `userId`, and `status = Invited`
- **And** one Organization, one Branch, six system roles, one `User` holding `OWNER` with organization-wide scope, and one `UserInvitation` of kind `SignupVerification` expiring in 72 hours exist
- **And** one verification email request is queued in the outbox.

### US-01-01-AC2: Verification activates the Owner
- **Given** a signup Owner with status `Invited` and an unexpired verification token
- **When** the visitor posts the token to `/api/v1/auth/signup/verify`
- **Then** the response is 204, the user status is `Active`, `EmailVerifiedAt` is set, the token is consumed, and the audit event `identity.organization.signup-verified` is written in the same transaction.

### US-01-01-AC3: Login before verification is refused with a specific code
- **Given** a signup Owner with status `Invited`
- **When** they log in with the correct email and password
- **Then** the response is 403 `IDENTITY.EMAIL_NOT_VERIFIED` and no session or refresh cookie is created
- **And** a login with a wrong password for the same user returns 401 `IDENTITY.INVALID_CREDENTIALS`.

### US-01-01-AC4: Duplicate email is rejected and nothing is created
- **Given** `owner@newpharma.eg` already belongs to a user of any organization
- **When** a signup is posted with that email
- **Then** the response is 409 `IDENTITY.EMAIL_ALREADY_EXISTS` and no Organization, Branch, Role, or User row is created.

### US-01-01-AC5: Self-signup disabled hides the endpoint
- **Given** `Identity:SelfSignupEnabled = false`
- **When** a visitor posts any body to `/api/v1/auth/signup`
- **Then** the response is 404 and nothing is created.

### US-01-01-AC6: Provisioning failure rolls back completely
- **Given** the SPEC-02 provisioning step fails after the user row was staged
- **When** the signup request is processed
- **Then** the response is 500 Problem Details with a `traceId`, and no Organization, Branch, Role, User, or UserInvitation row exists (BR-G-19).

### US-01-01-AC7: Expired or reused verification token is rejected
- **Given** a verification token that is older than 72 hours or already consumed
- **When** it is posted to `/api/v1/auth/signup/verify`
- **Then** the response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the user status is unchanged.

## Validation Rules
VR-01-001, VR-01-002, VR-01-003 – VR-01-005, VR-01-008, VR-01-010, VR-01-016, VR-01-020, VR-01-021. Password policy per FR-01-012.

## Authorization Rules
- Anonymous endpoints; no permission check applies. Protected by rate limit 5 signups/hour per IP and 10 token redemptions/hour per IP (FR-01-018).
- The Owner created receives `OWNER` and `HasOrganizationWideScope = true`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid field values | 400 `COMMON.VALIDATION_FAILED` with field codes |
| Weak password | 400 `COMMON.VALIDATION_FAILED` with `IDENTITY.PASSWORD_*` field code |
| `acceptTerms` false | 400 `COMMON.VALIDATION_FAILED` with `IDENTITY.TERMS_NOT_ACCEPTED` |
| Email already used | 409 `IDENTITY.EMAIL_ALREADY_EXISTS` |
| Self-signup disabled | 404 |
| 6th signup within 1 hour from same IP | 429 `COMMON.RATE_LIMITED` + `Retry-After` |
| Login before verification | 403 `IDENTITY.EMAIL_NOT_VERIFIED` |
| Expired/used verification token | 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` |

## Edge Cases
- Same `Idempotency-Key` resent after a network timeout returns the original 201 response without creating a second organization.
- Visitor never verifies: the `Invited` Owner remains; a new signup with the same email is rejected (409) — operator support resolves (OD-01-07).
- Verification link opened twice in quick succession: exactly one 204, the other 400.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-001 | Integration | Signup creates org, branch, 6 roles, Invited Owner, invitation row, outbox email | US-01-01-AC1 |
| TS-01-002 | Integration | Verify token activates Owner and writes audit event | US-01-01-AC2 |
| TS-01-003 | Integration | Login before verification → 403; wrong password → 401 | US-01-01-AC3 |
| TS-01-004 | Integration | Duplicate email → 409, row counts unchanged | US-01-01-AC4 |
| TS-01-005 | Integration | Setting disabled → 404 | US-01-01-AC5 |
| TS-01-006 | Integration | Injected provisioning failure → full rollback | US-01-01-AC6 |
| TS-01-007 | Integration | Expired (clock +72h 1s) and consumed tokens → 400; rate limit 429 | US-01-01-AC7 |
