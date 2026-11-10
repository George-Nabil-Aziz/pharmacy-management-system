# US-01-11: Invite a User and Accept the Invitation

| Field | Value |
|---|---|
| Story ID | US-01-11 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |
| Related Business Rules | BR-01-001, BR-01-003, BR-01-009, BR-01-010, BR-01-011, BR-01-013, BR-01-021 |
| Dependencies | US-01-13, US-01-10, SPEC-10 email dispatch |

## User Story
As a branch manager, I want to invite a new employee by email with predefined roles and branches so that they set their own password and start working with the right access.

## Business Value
The employee chooses their own password (the manager never knows it), preserving individual accountability.

## Preconditions
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

## Acceptance Criteria

### US-01-11-AC1: Invite creates an Invited user and sends a token
- **Given** a Manager assigned to branch `CAI01` with `identity.users.create`
- **When** he posts `/api/v1/users/invitations` with email `sara@example.eg`, full name `Sara Adel`, roles `[CASHIER]`, branches `[{ branchId: CAI01, isDefault: true }]`, `preferredLanguage = ar`
- **Then** the response is 201 with `userId` and `status = Invited`
- **And** a `UserInvitation` (kind `Invitation`, expires in 72 h, hash only) exists, an Arabic invitation email is queued, and audit event `identity.user.invited` lists roles and branches.

### US-01-11-AC2: Accept invitation activates the user
- **Given** an unexpired invitation token for `sara@example.eg`
- **When** she posts `/api/v1/auth/invitations/validate` and then `/api/v1/auth/invitations/accept` with the token and a compliant password
- **Then** validate returns 200 with masked email `s***@example.eg` and the organization name, accept returns 204, the user becomes `Active`, the token is consumed, audit event `identity.user.activated` is written, and she can log in.

### US-01-11-AC3: Resend invalidates the previous token
- **Given** an `Invited` user with token `T1`
- **When** the Manager posts `/api/v1/users/{userId}/invitation/resend`
- **Then** the response is 204, `T1` returns 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` on accept, the new token works, and audit event `identity.invitation.resent` is written.

### US-01-11-AC4: Revoke invitation deactivates the invited user
- **Given** an `Invited` user
- **When** the Manager sends `DELETE /api/v1/users/{userId}/invitation`
- **Then** the response is 204, the user is `Deactivated`, any outstanding token is unusable, and audit event `identity.invitation.revoked` is written.

### US-01-11-AC5: Expired invitation cannot be accepted
- **Given** an invitation issued 72 hours and 1 second ago
- **When** it is accepted
- **Then** the response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the user remains `Invited`.

### US-01-11-AC6: Escalation and scope are enforced
- **Given** a Manager assigned only to `CAI01` who does not hold `OWNER`
- **When** he invites a user with role `OWNER`, or with branch `GIZ01` outside his scope, or with organization-wide scope
- **Then** the responses are 403 `IDENTITY.PRIVILEGE_ESCALATION`, 403 `IDENTITY.USER_OUTSIDE_SCOPE`, and 403 `IDENTITY.PRIVILEGE_ESCALATION` respectively and no user is created.

### US-01-11-AC7: Invite without permission is denied
- **Given** a `PHARMACIST` without `identity.users.create`
- **When** she posts `/api/v1/users/invitations`
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`.

### US-01-11-AC8: Duplicate email
- **Given** `sara@example.eg` already exists on the platform
- **When** an invitation is posted with `SARA@example.eg`
- **Then** the response is 409 `IDENTITY.EMAIL_ALREADY_EXISTS`.

## Validation Rules
VR-01-001, VR-01-002, VR-01-008 – VR-01-010, VR-01-013, VR-01-014, VR-01-016; password on accept: VR-01-003 – VR-01-005.

## Authorization Rules
- Invite, resend, revoke: `identity.users.create` + scope rule BR-01-013; role subset rule BR-01-009; `OWNER`/organization-wide only by Owner (BR-01-010).
- Validate/accept are anonymous, authorized by token possession; rate-limited 10/hour per IP (FR-01-018).
- Other organization's user id on resend/revoke → 404 `IDENTITY.USER_NOT_FOUND`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Role beyond actor's permissions / OWNER by non-Owner | 403 `IDENTITY.PRIVILEGE_ESCALATION` |
| Branch outside actor's scope | 403 `IDENTITY.USER_OUTSIDE_SCOPE` |
| No branch and not org-wide | 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.BRANCH_ASSIGNMENT_REQUIRED` |
| Duplicate email | 409 `IDENTITY.EMAIL_ALREADY_EXISTS` |
| Resend/revoke for non-`Invited` user | 409 `IDENTITY.INVALID_STATUS_TRANSITION` |
| Invalid/expired token | 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` |
| Rate limit on accept | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- Invitee forgets to accept within 72 h: Manager resends.
- Inviter deactivated before acceptance: acceptance still succeeds.
- Branch deactivated before acceptance: the user is activated; scope excludes the inactive branch.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-054 | Integration | Invite creates Invited user, hashed token, Arabic email, audit | US-01-11-AC1 |
| TS-01-055 | E2E | Validate + accept + login in Arabic and English UI | US-01-11-AC2 |
| TS-01-056 | Integration | Resend invalidates T1; revoke deactivates | US-01-11-AC3, US-01-11-AC4 |
| TS-01-057 | Integration | Expired token (clock +72 h 1 s) → 400 | US-01-11-AC5 |
| TS-01-058 | Integration | Manager escalation/scope 403s; pharmacist 403 | US-01-11-AC6, US-01-11-AC7 |
| TS-01-059 | Integration | Case-insensitive duplicate email → 409 | US-01-11-AC8 |
