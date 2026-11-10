# SPEC-01: Identity & Access Management

**Version:** 1.0
**Status:** Draft — ready for review
**Owner:** Business Analysis / Solution Architecture
**Related ADRs:** ADR-002 (multi-tenancy), ADR-005 (authentication & tokens), ADR-008 (audit), ADR-009 (localization), ADR-010 (frontend state)
**Related BRQs:** BRQ-01, BRQ-02, BRQ-12, BRQ-13

---

## 1. Purpose

Define how people prove who they are, what they are allowed to do, and in which branches they are allowed to do it. This specification covers authentication of organization users and platform administrators, token and session lifecycle, password management, roles and fine-grained permissions, branch-level access restriction, user lifecycle (invitation, activation, deactivation), POS manager override re-authentication, and the identity-related audit events emitted to the audit log owned by SPEC-10.

## 2. Business Context

A pharmacy organization in Egypt typically runs one to several branches staffed by an Owner, branch managers, pharmacists, cashiers, inventory staff, and an accountant. Staff turnover is frequent, several staff share counters and terminals, and cash and controlled medicines create a strong need for individual accountability (BRQ-01) and tamper-evident records of sensitive actions (BRQ-12). Data of one organization must never be visible to another (BRQ-02). Every downstream module relies on this specification for:

- the authenticated principal (`UserId`, `OrganizationId`, session id) attached to each request;
- the effective permission set and branch scope evaluated on every request (§5.3 of DOCUMENTATION-CONVENTIONS);
- the manager override capability used by POS (BR-G-32).

## 3. Scope

| Area | Included |
|---|---|
| Organization self-registration | Anonymous signup endpoint and Owner email verification; organization/branch creation behavior is delegated to SPEC-02 |
| Authentication | Email + password login, `/auth/me`, logout, logout from all devices |
| Tokens | JWT access tokens (15 min), opaque refresh tokens with rotation, family reuse detection and family revocation (ADR-005) |
| Passwords | Policy, hashing, change, forgot/reset, password history, admin-initiated reset, temporary passwords |
| Lockout & throttling | Account lockout, login attempt history, rate limiting of anonymous endpoints |
| Roles & permissions | Permission catalog, six seeded system roles, custom roles (create, clone, edit, delete), anti-escalation |
| Branch access | `UserBranchAssignment`, default branch, organization-wide scope flag |
| User lifecycle | Invite, resend/revoke invitation, accept, direct creation with temporary password, profile update, deactivate, reactivate, unlock |
| Sessions | List/revoke own sessions; list/revoke other users' sessions |
| Manager override | Re-authentication of a second user at the POS producing a single-use `ManagerOverride` (BR-G-32) |
| Audit | Emission of identity audit events (storage, hash chain, and viewing are SPEC-10) |
| MFA (P2) | TOTP enrollment, login challenge, recovery codes, enforcement for Owner/Manager, admin reset |
| Platform administrators | Separate principal store, login/refresh/logout, token audience isolation |

## 4. Out of Scope

- Organization, branch, settings, subscription and `SupportAccessGrant` behavior (SPEC-02). This spec only exposes the signup endpoint and calls the SPEC-02 provisioning contract.
- Audit log storage, hash chaining, querying and retention (SPEC-10).
- Email/notification delivery infrastructure and templates rendering (SPEC-10); this spec defines *when* identity emails are requested and their content intent.
- User interface preferences storage (`UserPreference`: language, theme) — SPEC-10; this spec only accepts the initial preferred language at invitation/signup and forwards it.
- Discount limit evaluation and consumption context of overrides inside a sale (SPEC-06).
- External identity providers (Google/Microsoft SSO, SAML, OIDC federation), SMS/WhatsApp one-time passwords, WebAuthn/passkeys, biometric login.
- Changing a user's email address (v1: deactivate and re-invite; see OD-01-02).
- One person belonging to more than one organization with the same email (OD-01-03).
- Platform administrator management console and organization management (SPEC-02).

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Description |
|---|---|
| Anonymous visitor | Unauthenticated caller of signup, login, refresh, password forgot/reset, invitation and verification endpoints |
| Organization user | Any `User` with status `Active` holding ≥1 role in exactly one organization |
| Owner | User holding the `OWNER` system role; always organization-wide scope |
| User administrator | User holding `identity.users.*` and/or `identity.roles.*` permissions (Owner by default; Manager within assigned branches) |
| Overrider | Second user who re-authenticates at a POS terminal to authorize an action (BR-G-32) |
| Platform administrator | `PLATFORM_ADMIN` principal stored in `PlatformUser`, outside any organization |
| Downstream module | SPEC-02…SPEC-10 code calling the identity facade (authorization evaluation, `ManagerOverride` consumption) |

### 5.2 Permissions used by this specification

All permissions below are canonical (DOCUMENTATION-CONVENTIONS §5.2). **No new permission codes are introduced by SPEC-01.**

| Permission | Grants |
|---|---|
| `identity.users.read` | List/view users in scope, view login attempt history |
| `identity.users.create` | Invite users, resend/revoke invitations, create users with a temporary password |
| `identity.users.update` | Update profile, assign roles, unlock users |
| `identity.users.deactivate` | Deactivate and reactivate users |
| `identity.users.reset-password` | Admin-initiated password reset; admin MFA reset (P2) |
| `identity.roles.read` | View roles and the permission catalog |
| `identity.roles.manage` | Create, clone, update, delete custom roles |
| `identity.sessions.read` | List other users' sessions |
| `identity.sessions.revoke` | Revoke other users' sessions |
| `org.branch-assignments.manage` | Replace a user's branch assignments and default branch |
| `sales.pos.sell` | Required for the *requesting* user of a manager override |
| Override-eligible permissions | `sales.discounts.override`, `sales.sales.void`, `sales.returns.approve` — required for the *overriding* user (set to be confirmed with SPEC-06, OD-01-05) |

Every authenticated user may, without any permission: call `/auth/me`, change own password, list/revoke own sessions, log out, manage own MFA.

### 5.3 Default permission sets of system roles

System roles are seeded per organization at provisioning and are read-only (BR-01-012). The matrix below is the proposed default (confirmation: OD-01-10). `OWNER` always holds every permission in the catalog, including permissions added in later releases.

| Role | Default permissions |
|---|---|
| `OWNER` | All permissions |
| `MANAGER` | `identity.users.read\|create\|update\|deactivate\|reset-password`, `identity.roles.read`, `identity.sessions.read\|revoke`, `org.organization.read`, `org.branches.read`, `org.branch-assignments.manage`, `catalog.medicines.read\|create\|update\|deactivate\|export`, `catalog.prices.update`, `catalog.reference-data.manage`, all `inventory.*`, all `procurement.*`, all `sales.*`, `patients.profiles.read\|manage`, `patients.medical.read`, `prescriptions.prescriptions.read`, `finance.expenses.manage`, `finance.cash.manage`, `reports.sales.read`, `reports.inventory.read`, `reports.finance.read`, `reports.export`, `notifications.read`, `notifications.rules.manage`, `audit.logs.read`, `settings.branch.manage` |
| `PHARMACIST` | `catalog.medicines.read`, `inventory.stock.read`, `inventory.batches.read`, `inventory.movements.read`, `sales.pos.sell`, `sales.sales.read`, `sales.discounts.apply`, `sales.returns.create`, `sales.cash-sessions.open-close`, `patients.profiles.read\|manage`, `patients.medical.read\|manage`, `prescriptions.prescriptions.read\|create\|verify\|cancel`, `prescriptions.dispense`, `prescriptions.controlled.dispense`, `notifications.read` |
| `CASHIER` | `catalog.medicines.read`, `inventory.stock.read`, `sales.pos.sell`, `sales.sales.read`, `sales.discounts.apply`, `sales.returns.create`, `sales.cash-sessions.open-close`, `patients.profiles.read`, `prescriptions.prescriptions.read`, `notifications.read` |
| `INVENTORY` | `catalog.medicines.read`, `inventory.stock.read`, `inventory.batches.read\|update-metadata`, `inventory.movements.read`, `inventory.adjustments.create`, `inventory.write-offs.create`, `inventory.stocktakes.manage`, `inventory.transfers.create\|dispatch\|receive`, `procurement.suppliers.read`, `procurement.purchase-orders.read\|create`, `procurement.receipts.create\|post`, `procurement.supplier-returns.create`, `reports.inventory.read`, `notifications.read` |
| `ACCOUNTANT` | `catalog.medicines.read`, `inventory.stock.read`, `inventory.movements.read`, `procurement.suppliers.read`, `procurement.purchase-orders.read`, `procurement.supplier-invoices.manage`, `procurement.supplier-payments.create`, `sales.sales.read`, `finance.expenses.manage`, `finance.cash.manage`, `reports.sales.read`, `reports.inventory.read`, `reports.finance.read`, `reports.export`, `notifications.read`, `audit.logs.read` |

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-01-001 | The system shall expose anonymous `POST /api/v1/auth/signup` that, when the platform setting `Identity:SelfSignupEnabled` is `true`, creates the Organization, its first Branch, the six seeded system roles, and the Owner user in one transaction by calling the SPEC-02 organization provisioning contract; when the setting is `false` the endpoint shall return 404. | P1 | BRQ-01, BRQ-02 | US-01-01 |
| FR-01-002 | The system shall create the signup Owner with status `Invited`, send a verification email containing a single-use `SignupVerification` token valid for 72 hours, and set the Owner to `Active` only when the token is redeemed; a login with correct credentials before verification shall return 403 `IDENTITY.EMAIL_NOT_VERIFIED`. | P1 | BRQ-01 | US-01-01 |
| FR-01-003 | The system shall authenticate a user by email (trimmed, case-insensitive) and password and, on success, create a `UserSession`, return a JWT access token valid 15 minutes containing claims `sub`, `org`, `sid`, `amr`, `stamp`, and set an opaque refresh token cookie belonging to a new token family. | P0 | BRQ-01 | US-01-02 |
| FR-01-004 | The system shall return the same 401 `IDENTITY.INVALID_CREDENTIALS` response body for an unknown email, a wrong password, and a `Deactivated` user, and shall perform a password hash verification for unknown emails so that the p95 response time difference between known and unknown emails is ≤ 50 ms. | P0 | BRQ-01 | US-01-02 |
| FR-01-005 | The system shall expose `GET /api/v1/auth/me` returning the user id, full name, email, organization id and name, roles, effective permission codes, assigned branches with the default branch, the organization-wide scope flag, `mustChangePassword`, `mfaEnabled`, and the session restriction (if any). | P0 | BRQ-01 | US-01-02 |
| FR-01-006 | The system shall limit each user to 10 active sessions; creating an 11th session shall revoke the session with the oldest `LastActivityAt` with revoke reason `SessionLimit`. | P1 | BRQ-01 | US-01-02, US-01-16 |
| FR-01-007 | The system shall rotate refresh tokens on every `POST /api/v1/auth/refresh`: the presented token is marked rotated, a new refresh token in the same family and a new access token are issued; the refresh token expires 14 days after its issue (sliding) and never later than 30 days after family creation (absolute); refresh shall fail with 401 `IDENTITY.REFRESH_TOKEN_INVALID` and clear the cookie when the token is unknown, expired, its session is revoked, or the user is not `Active`. | P0 | BRQ-01 | US-01-03 |
| FR-01-008 | When a refresh token that was already rotated or revoked is presented, the system shall revoke every token of that family and the associated session, return 401 `IDENTITY.REFRESH_TOKEN_REUSED`, and emit the audit event `identity.refresh-token.reuse-detected` (CS-12). | P0 | BRQ-01, BRQ-12 | US-01-03 |
| FR-01-009 | The system shall deliver refresh tokens only in a cookie with attributes `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`, never in a response body; access tokens shall be returned in the response body and held by the frontend in memory only (not `localStorage`/`sessionStorage`). | P0 | BRQ-01 | US-01-03 |
| FR-01-010 | The system shall provide `POST /api/v1/auth/logout` (revokes the current session and its token family, clears the cookie, returns 204 even if already revoked) and `POST /api/v1/auth/logout-all` (revokes all of the user's sessions, including the current one). | P0 | BRQ-01 | US-01-04 |
| FR-01-011 | The system shall reject with 401 `IDENTITY.SESSION_REVOKED`, within ≤ 60 seconds of the event, any access token whose `sid` refers to a revoked session or whose `stamp` differs from the user's current security stamp. | P0 | BRQ-01 | US-01-04, US-01-15, US-01-16 |
| FR-01-012 | The system shall enforce the password policy on every password set (signup, invitation acceptance, change, reset): length 10–128 characters, ≥1 letter and ≥1 digit, not present in the platform blocked-password list (≥10,000 entries), not containing the email local part when that part is ≥4 characters (case-insensitive), and not equal to any of the user's last 5 passwords; passwords shall be stored only as ASP.NET Core Identity v3 hashes (PBKDF2-HMAC-SHA512, ≥100,000 iterations) and re-hashed at login when stored parameters are weaker than current. | P0 | BRQ-01 | US-01-05, US-01-06, US-01-11, US-01-01 |
| FR-01-013 | The system shall let an authenticated user change their own password by supplying the current password; on success it shall rotate the security stamp, revoke all other sessions of the user, keep the current session, and clear `MustChangePassword`. | P0 | BRQ-01 | US-01-05 |
| FR-01-014 | The system shall accept `POST /api/v1/auth/password/forgot` and always return 202 with an identical body; only for `Active` or `Locked` users it shall invalidate previous unused reset tokens and request an email containing a single-use reset token valid for 30 minutes. | P0 | BRQ-01 | US-01-06 |
| FR-01-015 | The system shall accept `POST /api/v1/auth/password/reset` with a valid reset token and a policy-compliant password, then set the password, consume the token, set a `Locked` user to `Active` and reset the failed-attempt counter, rotate the security stamp, and revoke all sessions of the user; an unknown, expired, or consumed token shall return 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED`. | P0 | BRQ-01 | US-01-06 |
| FR-01-016 | The system shall set a user to `Locked` with `LockedUntil = now + 15 minutes` after 5 consecutive failed password verifications (login or manager override), return 423 `IDENTITY.ACCOUNT_LOCKED` with `retryAfterSeconds` for every login attempt during the lock (including correct credentials), apply the same counting and response to unknown emails, return the user to `Active` on the first successful login after `LockedUntil`, and allow an early unlock via `POST /api/v1/users/{userId}/unlock`. | P0 | BRQ-01 | US-01-07 |
| FR-01-017 | The system shall record every login attempt as an append-only `LoginAttempt` (timestamp, SHA-256 of normalized email, user id when known, IP address, user agent, outcome, failure code) and expose `GET /api/v1/users/{userId}/login-attempts` with cursor pagination. | P1 | BRQ-01, BRQ-12 | US-01-07 |
| FR-01-018 | The system shall rate-limit anonymous endpoints and return 429 `COMMON.RATE_LIMITED` with a `Retry-After` header when exceeded: login 10/min per (IP, email) and 30/min per IP; forgot password 3/hour per email and 10/hour per IP; signup 5/hour per IP; invitation/verification/reset token redemption 10/hour per IP. | P0 | BRQ-01 | US-01-07, US-01-06, US-01-01, US-01-11 |
| FR-01-019 | The system shall maintain a code-defined, read-only permission catalog (code, module, Arabic/English name and description, override-eligible flag) and expose it grouped by module via `GET /api/v1/permissions`. | P0 | BRQ-01 | US-01-08 |
| FR-01-020 | The system shall seed the six system roles (`OWNER`, `MANAGER`, `PHARMACIST`, `CASHIER`, `INVENTORY`, `ACCOUNTANT`) with the default permission sets of §5.3 for every new organization, reject any modification or deletion of a system role with 409 `IDENTITY.SYSTEM_ROLE_IMMUTABLE`, and grant `OWNER` every permission added to the catalog in later releases. | P0 | BRQ-01 | US-01-08 |
| FR-01-021 | The system shall let users with `identity.roles.manage` create a custom role (unique English and Arabic names per organization, description, ≥1 permission), clone any role into a new custom role, update a custom role with `If-Match`, and delete a custom role only when no user holds it (otherwise 409 `IDENTITY.ROLE_IN_USE`). | P1 | BRQ-01 | US-01-09 |
| FR-01-022 | The system shall reject with 403 `IDENTITY.PRIVILEGE_ESCALATION` any attempt by an actor to create or update a role containing a permission the actor does not hold, or to assign a role whose permissions are not a subset of the actor's effective permissions; only an Owner may assign the `OWNER` role or the organization-wide scope flag. | P0 | BRQ-01 | US-01-09, US-01-14 |
| FR-01-023 | The system shall evaluate on every authenticated request: effective permission (union of the user's roles) AND branch scope (route `branchId` ∈ assigned branches or organization-wide scope) AND organization match; endpoints without a declared permission policy shall be denied by default, and an automated test shall fail the build when any non-anonymous endpoint lacks a policy. | P0 | BRQ-01, BRQ-02 | US-01-10 |
| FR-01-024 | The system shall return 403 `IDENTITY.BRANCH_ACCESS_DENIED` when a route `branchId` belongs to the caller's organization but is not in the caller's scope (CS-07), and 404 with a body indistinguishable from a non-existent resource when a route or body identifier belongs to another organization (CS-08). | P0 | BRQ-01, BRQ-02 | US-01-10 |
| FR-01-025 | The system shall apply changes to role permissions, user roles, branch assignments, and organization-wide scope to the next request served by the same application node and to all nodes within ≤ 60 seconds. | P0 | BRQ-01 | US-01-10, US-01-09, US-01-14 |
| FR-01-026 | The system shall let users with `identity.users.create` invite a user (email, full name, ≥1 role, branch assignments, preferred language), creating a `User` with status `Invited` and a single-use invitation token valid 72 hours sent by email; resending shall invalidate the previous token, and revoking an invitation shall set the user to `Deactivated`. | P0 | BRQ-01 | US-01-11 |
| FR-01-027 | The system shall let an invited person accept an invitation with a valid token and a policy-compliant password, setting the user to `Active` and consuming the token; an unknown, expired, consumed, or revoked token shall return 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED`. | P0 | BRQ-01 | US-01-11 |
| FR-01-028 | The system shall let users with `identity.users.create` create an `Active` user directly with a system-generated 12-character temporary password returned once in the response and `MustChangePassword = true`; sessions of a user with `MustChangePassword = true` shall be restricted so that every endpoint except `/auth/me`, `/auth/password/change`, and `/auth/logout` returns 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED`. | P1 | BRQ-01 | US-01-12 |
| FR-01-029 | The system shall let users with `identity.users.reset-password` reset another user's password in mode `email` (sends a reset token per FR-01-014) or `temporaryPassword` (generated, returned once, sets `MustChangePassword`), and in both modes rotate the security stamp and revoke all of the target user's sessions. | P1 | BRQ-01 | US-01-12 |
| FR-01-030 | The system shall expose a paginated user directory filterable by status, role, branch, and text (name/email, ≥2 characters), a user detail view, and a profile update (full name, phone) requiring `If-Match`; actors without organization-wide scope shall see only users sharing ≥1 assigned branch with them. | P0 | BRQ-01 | US-01-13 |
| FR-01-031 | The system shall let authorized users replace a user's role set (≥1 role, `identity.users.update`), branch assignment set with exactly one default branch (`org.branch-assignments.manage`), and organization-wide scope flag (Owner only); a user without organization-wide scope shall always have ≥1 assigned `Active` branch. | P0 | BRQ-01, BRQ-02 | US-01-14 |
| FR-01-032 | The system shall return 403 `IDENTITY.USER_OUTSIDE_SCOPE` when an actor without organization-wide scope manages a user who has a branch outside the actor's branches, holds `OWNER`, or has organization-wide scope, and 403 `IDENTITY.SELF_MODIFICATION_FORBIDDEN` when an actor changes their own roles, branch assignments, scope, or status. | P0 | BRQ-01 | US-01-13, US-01-14, US-01-15 |
| FR-01-033 | The system shall ensure every organization keeps ≥1 `Active` user holding `OWNER`; any deactivation or role change that would violate this shall return 409 `IDENTITY.LAST_OWNER`. | P0 | BRQ-01 | US-01-14, US-01-15 |
| FR-01-034 | The system shall let users with `identity.users.deactivate` deactivate a user with a mandatory reason, setting status `Deactivated`, `DeactivatedAt`, `DeactivatedBy`, and revoking all of the user's refresh tokens and sessions in the same transaction (BR-G-30), and reactivate a `Deactivated` user to `Active` with reset failed-attempt counter and no restored sessions. | P0 | BRQ-01 | US-01-15 |
| FR-01-035 | The system shall let every authenticated user list their own active sessions (session id, device label derived from user agent, IP address, created at, last activity at, current flag) and revoke any of them; revoking the current session shall behave as logout. | P1 | BRQ-01 | US-01-16 |
| FR-01-036 | The system shall let users with `identity.sessions.read` list, and users with `identity.sessions.revoke` revoke one or all, active sessions of users within their management scope (FR-01-032). | P1 | BRQ-01 | US-01-16 |
| FR-01-037 | The system shall expose `POST /api/v1/branches/{branchId}/auth/override` for a caller holding `sales.pos.sell` in that branch, accepting the overrider's email and password, an override-eligible permission, a context type, and a context hash, and on success return a single-use override grant valid 120 seconds bound to organization, branch, requesting user, overriding user, permission, and context hash. | P0 | BRQ-01, BRQ-07 | US-01-17 |
| FR-01-038 | The system shall deny an override with the single response 403 `IDENTITY.OVERRIDE_DENIED` when the overrider credentials are wrong, the overrider is not `Active`, lacks the requested permission, is not in scope for the branch, or is the requesting user; wrong passwords shall count toward the overrider's lockout (FR-01-016); no session or token shall be issued to the overrider. | P0 | BRQ-01 | US-01-17 |
| FR-01-039 | The system shall provide an in-process identity facade operation that validates and consumes a `ManagerOverride` inside the caller's database transaction, rejecting expired, consumed, or mismatched (organization, branch, requesting user, permission, context hash) grants with 403 `IDENTITY.OVERRIDE_GRANT_INVALID`. | P0 | BRQ-01, BRQ-12 | US-01-17 |
| FR-01-040 | The system shall emit, in the same database transaction as the change (BR-G-16), the identity audit events listed in §8.3 with actor, target user, organization, branch (when applicable), IP address, before/after values for role, branch, scope and status changes, and never include passwords, tokens, token hashes, or MFA secrets. | P0 | BRQ-12 | US-01-01, US-01-03, US-01-05, US-01-06, US-01-07, US-01-09, US-01-11, US-01-12, US-01-14, US-01-15, US-01-16, US-01-17, US-01-19 |
| FR-01-041 | The system shall let a user enroll a TOTP factor (RFC 6238, SHA-1, 6 digits, 30-second step, 160-bit secret encrypted at rest) by returning an `otpauth://` URI and activating the factor only after a valid code is confirmed, then returning 10 single-use recovery codes once. | P2 | BRQ-01 | US-01-18 |
| FR-01-042 | When a user with an active TOTP factor logs in, the system shall return 200 with `mfaRequired: true` and a single-use MFA token valid 5 minutes instead of session tokens, and issue session tokens only after `POST /api/v1/auth/login/mfa` with a valid code (±1 time step, the same time step not accepted twice) or an unused recovery code; 5 failed codes shall invalidate the MFA token and count toward lockout. | P2 | BRQ-01 | US-01-18 |
| FR-01-043 | When the organization setting `RequireMfaForOwnerAndManager` is ON (default OFF), the system shall restrict sessions of users holding `OWNER` or `MANAGER` without an active factor so that every endpoint except `/auth/me`, the MFA enrollment endpoints, and `/auth/logout` returns 403 `IDENTITY.MFA_ENROLLMENT_REQUIRED`. | P2 | BRQ-01 | US-01-19 |
| FR-01-044 | The system shall let a user regenerate recovery codes (requires a valid TOTP code), disable their own factor (requires password and a valid code; rejected with 409 `IDENTITY.MFA_REQUIRED_BY_POLICY` when enforced for the user), and let users with `identity.users.reset-password` reset another user's factor, which revokes all of that user's sessions. | P2 | BRQ-01 | US-01-19 |
| FR-01-045 | The system shall authenticate platform administrators only against the separate `PlatformUser` store through `/api/v1/platform/auth/{login, refresh, logout}`, issue tokens with audience `platform` and no `org` claim, use a refresh cookie scoped to `/api/v1/platform/auth`, reject platform tokens on organization endpoints and organization tokens on platform endpoints with 401, create platform administrator accounts only through a deployment provisioning command, and require passwords of ≥14 characters for them. | P1 | BRQ-01, BRQ-02 | US-01-20 |

**MFA scheduling note (2026-11-10):** FR-01-041…FR-01-044 keep priority P2, but the release plan schedules US-01-18 and US-01-19 for V1 (RELEASE-PLAN §3). MFA for platform administrators is a SaaS launch gate (V1.3); see OD-01-09.

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-01-001 | The email address is the login identifier; it is unique across the whole platform (case-insensitive, trimmed); in v1 one user belongs to exactly one organization. | Analysis (OD-01-03) |
| BR-01-002 | Only `Active` users can obtain sessions. `Invited` and `Deactivated` users cannot log in; `Locked` users cannot log in until `LockedUntil` has passed, an administrator unlocks them, or they complete a password reset. | Analysis |
| BR-01-003 | Allowed user status transitions: `Invited → Active` (acceptance/verification), `Invited → Deactivated` (invitation revoked), `Active → Locked` (lockout), `Locked → Active` (lock expiry, unlock, reset), `Active/Locked → Deactivated`, `Deactivated → Active` (reactivation). Any other transition returns 409 `IDENTITY.INVALID_STATUS_TRANSITION`. | Analysis; §6.1 |
| BR-01-004 | Deactivating a user revokes all their refresh tokens and sessions in the same transaction; their access tokens are rejected within ≤ 60 s (stricter than the ≤ 15 min ceiling). | BR-G-30 |
| BR-01-005 | A refresh token is single-use. Presenting an already rotated or revoked token revokes the whole token family and its session. | ADR-005, CS-12 |
| BR-01-006 | Access token lifetime is 15 minutes; refresh token lifetime is 14 days sliding and 30 days absolute per family. | ADR-005 |
| BR-01-007 | Every organization has at least one `Active` user holding `OWNER`. | Analysis |
| BR-01-008 | A user cannot change their own roles, branch assignments, organization-wide scope, or status. | Analysis |
| BR-01-009 | An actor can only grant permissions (through role definition or role assignment) that the actor already holds. | Analysis |
| BR-01-010 | Only an Owner can assign the `OWNER` role or the organization-wide scope flag; holders of `OWNER` always have organization-wide scope. | §5.1 |
| BR-01-011 | A user without organization-wide scope has ≥1 branch assignment and exactly one default branch among them. | §5.3 |
| BR-01-012 | System roles are read-only; customization is done by cloning into a custom role. | §5.1 |
| BR-01-013 | An actor without organization-wide scope may view users sharing ≥1 branch and may manage only users whose every assigned branch is in the actor's scope and who neither hold `OWNER` nor have organization-wide scope. | BR-G-17 |
| BR-01-014 | Changing one's own password revokes all other sessions; any password reset (self or admin) revokes all sessions. | Analysis |
| BR-01-015 | A manager override is valid only when the overrider is a different, `Active` user holding the requested override-eligible permission and in scope for the branch; the grant is single-use and expires 120 s after issue. | BR-G-32 |
| BR-01-016 | A manager override never creates a session or token for the overrider. | Analysis |
| BR-01-017 | Users are never hard-deleted; they are deactivated. | BR-G-33 |
| BR-01-018 | Every sensitive identity operation writes an audit event in the same transaction; denied overrides and refresh token reuse write the audit event in their own committed transaction because the triggering request fails. | BR-G-16 |
| BR-01-019 | Platform administrators are separate principals without organization membership and have no access to organization business data except through a SPEC-02 `SupportAccessGrant`. | §5.1 |
| BR-01-020 | Authorization is enforced on the backend for every request; UI hiding is never the control. | BR-G-17 |
| BR-01-021 | Refresh, reset, invitation, verification, MFA, and override tokens are ≥256-bit random values, stored only as SHA-256 hashes, and are single-use. | Analysis |
| BR-01-022 | Anonymous account flows (login failure, forgot password) do not reveal whether an email is registered. | Analysis |
| BR-01-023 | A user holding `MustChangePassword` or an unmet MFA enrollment obligation can only use the endpoints listed for that restriction until the obligation is met. | Analysis |

## 8. Data Requirements

### 8.1 Entities (schema `identity`)

Conventions of DOCUMENTATION-CONVENTIONS §6 apply (UUIDv7 `Id`, `OrganizationId`, audit columns, `RowVersion` on mutable aggregates). Entities marked **(new)** are introduced by this specification.

| Entity | Key attributes | Notes |
|---|---|---|
| `User` | `Id`, `OrganizationId`, `Email`, `NormalizedEmail` (unique platform-wide), `FullName`, `PhoneNumber?`, `PasswordHash?`, `SecurityStamp`, `Status` (`Invited`/`Active`/`Locked`/`Deactivated`), `HasOrganizationWideScope`, `MustChangePassword`, `EmailVerifiedAt?`, `AccessFailedCount`, `LockedUntil?`, `LastLoginAt?`, `MfaEnabled`, `DeactivatedAt?`, `DeactivatedBy?`, `DeactivationReason?`, `RowVersion` | Mutable aggregate root |
| `Role` | `Id`, `OrganizationId`, `SystemCode?` (`OWNER`…`ACCOUNTANT`, null for custom), `NameEn`, `NameAr`, `Description?`, `IsSystem`, `ClonedFromRoleId?`, `RowVersion` | Unique (`OrganizationId`, lower(`NameEn`)) and (`OrganizationId`, `NameAr`) |
| `Permission` | `Code` (PK), `Module`, `NameEn`, `NameAr`, `DescriptionEn`, `DescriptionAr`, `IsOverrideEligible` | Global reference data seeded from code; not tenant-owned |
| `RolePermission` | `OrganizationId`, `RoleId`, `PermissionCode` | PK (`RoleId`, `PermissionCode`) |
| `UserRole` | `OrganizationId`, `UserId`, `RoleId` | PK (`UserId`, `RoleId`) |
| `UserBranchAssignment` | `OrganizationId`, `UserId`, `BranchId`, `IsDefault`, `AssignedAt`, `AssignedBy` | PK (`UserId`, `BranchId`); partial unique index: one `IsDefault = true` per user |
| `UserSession` | `Id` (= `sid`), `OrganizationId`, `UserId`, `CreatedAt`, `LastActivityAt`, `IpAddress`, `UserAgent`, `DeviceLabel`, `AuthMethods` (`pwd`, `mfa`), `Restriction` (`None`/`PasswordChangeRequired`/`MfaEnrollmentRequired`), `RevokedAt?`, `RevokedBy?`, `RevokeReason?` | Revoke reasons: `Logout`, `LogoutAll`, `UserRevoked`, `AdminRevoked`, `Deactivated`, `PasswordChanged`, `PasswordReset`, `TokenReuse`, `SessionLimit`, `MfaReset`, `Expired` |
| `RefreshToken` | `Id`, `OrganizationId`, `UserId`, `SessionId`, `FamilyId`, `TokenHash` (unique), `IssuedAt`, `ExpiresAt`, `FamilyExpiresAt`, `RotatedAt?`, `ReplacedByTokenId?`, `RevokedAt?`, `RevokeReason?` | One family per session |
| `PasswordResetToken` | `Id`, `OrganizationId`, `UserId`, `TokenHash`, `ExpiresAt`, `ConsumedAt?`, `InvalidatedAt?`, `RequestedFromIp`, `IssuedByUserId?` | `IssuedByUserId` set for admin email reset |
| `LoginAttempt` | `Id`, `OrganizationId?`, `UserId?`, `EmailHash`, `OccurredAt`, `IpAddress`, `UserAgent`, `Outcome` (`Succeeded`/`Failed`/`Locked`/`NotVerified`/`MfaRequired`/`MfaFailed`/`RateLimited`), `FailureCode?` | Append-only; `OrganizationId` null for unknown emails |
| `UserInvitation` **(new)** | `Id`, `OrganizationId`, `UserId`, `Kind` (`Invitation`/`SignupVerification`), `TokenHash`, `ExpiresAt`, `InvitedBy?`, `SentAt`, `AcceptedAt?`, `RevokedAt?` | At most one non-consumed, non-revoked row per user |
| `UserPasswordHistory` **(new)** | `Id`, `OrganizationId`, `UserId`, `PasswordHash`, `CreatedAt` | Last 5 retained per user |
| `ManagerOverride` **(new; owned by SPEC-01, consumed by SPEC-06)** | `Id`, `OrganizationId`, `BranchId`, `Scope` (`Discount`/`ReturnApproval`/`RefundMethod`/`SaleVoid`), `PermissionCode`, `ContextType`, `ContextHash`, `RequestedByUserId`, `ApprovedByUserId`, `ApprovedMaxDiscountPercent?`, `Reason?`, `IssuedAt`, `ExpiresAt`, `ConsumedAt?`, `ConsumedByDocumentType?`, `ConsumedByDocumentId?` | Single canonical POS override entity (same name in SPEC-06 §8.5). `ContextType` values owned by SPEC-06 (e.g., `DiscountAboveLimit`, `SaleVoid`, `ReturnApproval`) |
| `UserMfaFactor` **(new, P2)** | `Id`, `OrganizationId`, `UserId`, `Type` (`Totp`), `EncryptedSecret`, `ConfirmedAt?`, `LastUsedTimeStep?`, `DisabledAt?` | Secret encrypted with application data-protection keys stored outside the database |
| `MfaRecoveryCode` **(new, P2)** | `Id`, `OrganizationId`, `UserId`, `CodeHash`, `UsedAt?` | 10 per generation |
| `PlatformUser` **(new)** | `Id`, `Email`, `NormalizedEmail` (unique), `FullName`, `PasswordHash`, `SecurityStamp`, `Status` (`Active`/`Locked`/`Deactivated`), `AccessFailedCount`, `LockedUntil?`, `MfaEnabled` | No `OrganizationId`; excluded from tenant query filters |
| `PlatformSession`, `PlatformRefreshToken` **(new)** | Same shape as `UserSession` / `RefreshToken` without `OrganizationId` | Separate tables to keep tenant RLS policies uniform |

### 8.2 Settings introduced

| Setting | Level | Default | Notes |
|---|---|---|---|
| `Identity:SelfSignupEnabled` | Platform configuration | `false` | FR-01-001 |
| `Identity:Lockout:MaxFailedAttempts` | Platform configuration | `5` | FR-01-016 |
| `Identity:Lockout:DurationMinutes` | Platform configuration | `15` | FR-01-016 |
| `Identity:BlockedPasswordList` | Platform configuration (file) | ≥10,000 entries | FR-01-012 |
| `RequireMfaForOwnerAndManager` | `OrganizationSettings` (SPEC-02 stores it) | `false` | FR-01-043, P2 |

### 8.3 Identity audit events (catalog owned by SPEC-10; names proposed)

`identity.user.invited`, `identity.invitation.resent`, `identity.invitation.revoked`, `identity.user.activated`, `identity.user.created-with-temporary-password`, `identity.user.profile-updated`, `identity.user.roles-changed`, `identity.user.branches-changed`, `identity.user.scope-changed`, `identity.user.deactivated`, `identity.user.reactivated`, `identity.user.locked`, `identity.user.unlocked`, `identity.password.changed`, `identity.password.reset-completed`, `identity.password.admin-reset`, `identity.role.created`, `identity.role.updated`, `identity.role.deleted`, `identity.session.revoked`, `identity.sessions.revoked-all`, `identity.refresh-token.reuse-detected`, `identity.override.granted`, `identity.override.denied`, `identity.override.consumed`, `identity.mfa.enabled`, `identity.mfa.disabled`, `identity.mfa.reset`, `identity.mfa.recovery-codes-regenerated`, `identity.organization.signup-verified`.

Successful and failed logins are recorded in `LoginAttempt` (FR-01-017), not in `AuditLog`, except the transition to `Locked` (`identity.user.locked`).

### 8.4 Access token claims (example)

```json
{
  "iss": "https://api.example-pharmacy.eg",
  "aud": "org",
  "sub": "01933b6e-8f1a-7c2e-9d40-5b1a2c3d4e5f",
  "org": "01933b6e-7a00-7000-8000-000000000001",
  "sid": "01933b6f-0000-7abc-8def-000000000123",
  "stamp": "c1f7a0",
  "amr": ["pwd"],
  "iat": 1762700000,
  "exp": 1762700900,
  "kid": "2026-11-a"
}
```

Permissions and branch assignments are **not** embedded in the token; they are resolved server-side per request from a cache invalidated on change (FR-01-025).

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-01-001 | `email` | Required; trimmed; ≤254 characters; valid addr-spec with a domain containing a dot | `IDENTITY.EMAIL_INVALID` |
| VR-01-002 | `email` (invite, create, signup) | Not already used by any user on the platform (normalized) | `IDENTITY.EMAIL_ALREADY_EXISTS` (409) |
| VR-01-003 | `password` / `newPassword` | Length 10–128 | `IDENTITY.PASSWORD_TOO_SHORT`, `IDENTITY.PASSWORD_TOO_LONG` |
| VR-01-004 | `password` / `newPassword` | ≥1 letter (any script) and ≥1 digit | `IDENTITY.PASSWORD_MISSING_LETTER`, `IDENTITY.PASSWORD_MISSING_DIGIT` |
| VR-01-005 | `password` / `newPassword` | Not in blocked list; does not contain email local part (≥4 chars) | `IDENTITY.PASSWORD_BLOCKLISTED`, `IDENTITY.PASSWORD_CONTAINS_EMAIL` |
| VR-01-006 | `newPassword` | Not equal to any of last 5 passwords | `IDENTITY.PASSWORD_REUSED` |
| VR-01-007 | `currentPassword` | Must verify against stored hash | `IDENTITY.CURRENT_PASSWORD_INVALID` |
| VR-01-008 | `fullName` | Required; 2–100 characters; Arabic or Latin letters, spaces, `.`, `'`, `-` | `IDENTITY.FULL_NAME_INVALID` |
| VR-01-009 | `phoneNumber` | Optional; E.164 (`+20…`) or Egyptian mobile `01[0125]` + 8 digits; stored as E.164 | `IDENTITY.PHONE_INVALID` |
| VR-01-010 | `preferredLanguage` | `ar` or `en` | `IDENTITY.LANGUAGE_INVALID` |
| VR-01-011 | Role `nameEn`, `nameAr` | Required; 2–60 characters; unique per organization (case-insensitive for `nameEn`) | `IDENTITY.ROLE_NAME_INVALID`, `IDENTITY.ROLE_NAME_EXISTS` (409) |
| VR-01-012 | Role `permissions` | ≥1 entry; every code exists in the catalog; no duplicates | `IDENTITY.ROLE_PERMISSIONS_REQUIRED`, `IDENTITY.UNKNOWN_PERMISSION` |
| VR-01-013 | User `roleIds` | ≥1 entry; every role exists in the caller's organization | `IDENTITY.ROLES_REQUIRED`, `IDENTITY.ROLE_NOT_FOUND` |
| VR-01-014 | User `branches` | When not organization-wide: ≥1 entry; each branch `Active` and in the caller's organization; exactly one `isDefault = true` | `IDENTITY.BRANCH_ASSIGNMENT_REQUIRED`, `IDENTITY.BRANCH_INVALID`, `IDENTITY.DEFAULT_BRANCH_INVALID` |
| VR-01-015 | Deactivation `reason` | Required; 3–500 characters | `IDENTITY.REASON_REQUIRED` |
| VR-01-016 | Reset / invitation / verification `token` | Base64url, 43 characters | `IDENTITY.TOKEN_INVALID_OR_EXPIRED` |
| VR-01-017 | MFA `code` | 6 digits; or recovery code format `XXXXX-XXXXX` (base32) | `IDENTITY.MFA_CODE_INVALID` |
| VR-01-018 | Override `permission` | Must be override-eligible in the catalog | `IDENTITY.OVERRIDE_PERMISSION_NOT_ELIGIBLE` |
| VR-01-019 | Override `contextType`, `contextHash`, `reason` | `contextType` in SPEC-06 list; `contextHash` 64 hex characters (SHA-256); `reason` ≤200 characters | `COMMON.VALIDATION_FAILED` |
| VR-01-020 | Signup `acceptTerms` | Must be `true` | `IDENTITY.TERMS_NOT_ACCEPTED` |
| VR-01-021 | Signup organization/branch fields | Delegated to SPEC-02 validation | `ORG.*` codes (SPEC-02) |
| VR-01-022 | `If-Match` on user/role updates | Required; must equal current ETag | `COMMON.PRECONDITION_REQUIRED` (428), `COMMON.CONCURRENCY_CONFLICT` (412) |
| VR-01-023 | List `search` | When provided, 2–100 characters | `COMMON.VALIDATION_FAILED` |

All validation failures return 400 Problem Details with `code = COMMON.VALIDATION_FAILED` at the top level and field-level codes in `errors`, unless another status is stated.

## 10. API Requirements

Base path `/api/v1`. Anonymous endpoints are marked "Anonymous". "Authenticated" means any authenticated organization user without a specific permission.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| POST | `/auth/signup` | Self-register organization + first branch + Owner (SPEC-02 provisioning) | Anonymous | Optional `Idempotency-Key` |
| POST | `/auth/signup/verify` | Redeem signup verification token | Anonymous | Natural (single-use token) |
| POST | `/auth/login` | Email/password login | Anonymous | No |
| POST | `/auth/login/mfa` | Complete MFA challenge (P2) | Anonymous (MFA token) | No |
| POST | `/auth/refresh` | Rotate refresh token, issue access token | Anonymous (refresh cookie) | No |
| POST | `/auth/logout` | Revoke current session | Refresh cookie or Authenticated | Natural |
| POST | `/auth/logout-all` | Revoke all own sessions | Authenticated | Natural |
| GET | `/auth/me` | Current principal, permissions, branches | Authenticated | n/a |
| POST | `/auth/password/change` | Change own password | Authenticated | No |
| POST | `/auth/password/forgot` | Request reset email | Anonymous | No |
| POST | `/auth/password/reset` | Reset password with token | Anonymous | Natural |
| POST | `/auth/invitations/validate` | Check invitation token, return masked email and organization name | Anonymous | n/a |
| POST | `/auth/invitations/accept` | Accept invitation and set password | Anonymous | Natural |
| GET | `/auth/sessions` | List own sessions | Authenticated | n/a |
| DELETE | `/auth/sessions/{sessionId}` | Revoke own session | Authenticated | Natural |
| POST | `/auth/mfa/totp/enroll` | Start TOTP enrollment (P2) | Authenticated | No |
| POST | `/auth/mfa/totp/confirm` | Confirm enrollment, get recovery codes (P2) | Authenticated | No |
| DELETE | `/auth/mfa/totp` | Disable own TOTP (P2) | Authenticated | Natural |
| POST | `/auth/mfa/recovery-codes` | Regenerate recovery codes (P2) | Authenticated | No |
| POST | `/branches/{branchId}/auth/override` | Manager override re-authentication | `sales.pos.sell` (caller) + override-eligible permission (overrider) | No |
| GET | `/permissions` | Permission catalog | `identity.roles.read` | n/a |
| GET | `/roles` | List roles | `identity.roles.read` | n/a |
| GET | `/roles/{roleId}` | Role detail with permissions | `identity.roles.read` | n/a |
| POST | `/roles` | Create custom role | `identity.roles.manage` | No |
| POST | `/roles/{roleId}/clone` | Clone role into custom role | `identity.roles.manage` | No |
| PUT | `/roles/{roleId}` | Update custom role (`If-Match`) | `identity.roles.manage` | `If-Match` |
| DELETE | `/roles/{roleId}` | Delete unused custom role (`If-Match`) | `identity.roles.manage` | `If-Match` |
| GET | `/users` | User directory | `identity.users.read` | n/a |
| GET | `/users/{userId}` | User detail | `identity.users.read` | n/a |
| PATCH | `/users/{userId}` | Update profile (`If-Match`) | `identity.users.update` | `If-Match` |
| POST | `/users/invitations` | Invite user | `identity.users.create` | Optional `Idempotency-Key` |
| POST | `/users/{userId}/invitation/resend` | Resend invitation | `identity.users.create` | No |
| DELETE | `/users/{userId}/invitation` | Revoke invitation | `identity.users.create` | Natural |
| POST | `/users` | Create user with temporary password | `identity.users.create` | Optional `Idempotency-Key` |
| PUT | `/users/{userId}/roles` | Replace role set (`If-Match`) | `identity.users.update` | `If-Match` |
| PUT | `/users/{userId}/branches` | Replace branch assignments (`If-Match`) | `org.branch-assignments.manage` | `If-Match` |
| PUT | `/users/{userId}/scope` | Set organization-wide scope (`If-Match`) | Owner only (`OWNER` role) | `If-Match` |
| POST | `/users/{userId}/deactivate` | Deactivate user | `identity.users.deactivate` | Natural |
| POST | `/users/{userId}/reactivate` | Reactivate user | `identity.users.deactivate` | Natural |
| POST | `/users/{userId}/unlock` | Unlock user | `identity.users.update` | Natural |
| POST | `/users/{userId}/password-reset` | Admin reset (`email` / `temporaryPassword`) | `identity.users.reset-password` | No |
| DELETE | `/users/{userId}/mfa` | Admin reset MFA (P2) | `identity.users.reset-password` | Natural |
| GET | `/users/{userId}/login-attempts` | Login history (cursor) | `identity.users.read` | n/a |
| GET | `/users/{userId}/sessions` | List user's sessions | `identity.sessions.read` | n/a |
| DELETE | `/users/{userId}/sessions/{sessionId}` | Revoke one session | `identity.sessions.revoke` | Natural |
| DELETE | `/users/{userId}/sessions` | Revoke all sessions of user | `identity.sessions.revoke` | Natural |
| POST | `/platform/auth/login` | Platform admin login | Anonymous | No |
| POST | `/platform/auth/refresh` | Platform token rotation | Anonymous (platform cookie) | No |
| POST | `/platform/auth/logout` | Platform logout | Platform cookie | Natural |

"Natural" = repeating the call has no additional effect and returns the same final state.

Example — login success:

```json
POST /api/v1/auth/login
{ "email": "mona@example.eg", "password": "********" }

200 OK  (Set-Cookie: rt=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth)
{ "accessToken": "eyJ...", "expiresIn": 900, "tokenType": "Bearer",
  "sessionId": "01933b6f-0000-7abc-8def-000000000123",
  "restriction": null, "mfaRequired": false }
```

Example — manager override:

```json
POST /api/v1/branches/{branchId}/auth/override
{ "overriderEmail": "manager@example.eg", "password": "********",
  "permission": "sales.discounts.override", "contextType": "DiscountAboveLimit",
  "contextHash": "9f2c…(64 hex)", "reason": "Loyal customer" }

200 OK
{ "managerOverrideId": "01933b70-...", "expiresAt": "2026-11-09T10:15:42Z",
  "overridingUser": { "id": "01933b6e-...", "fullName": "Ahmed Samir" } }
```

## 11. Authorization Requirements

1. Effective access follows DOCUMENTATION-CONVENTIONS §5.3; the identity module provides the single authorization evaluator used by all modules (FR-01-023).
2. Organization id is taken only from the token; any organization id in a body or query is ignored for authorization.
3. Branch-scoped routes (`/branches/{branchId}/…`): own-organization branch not in scope → 403 `IDENTITY.BRANCH_ACCESS_DENIED`; branch of another organization or non-existent → 404 `ORG.BRANCH_NOT_FOUND`.
4. Organization-level resources referenced by id from another organization → 404 (resource-specific `*_NOT_FOUND` code), never 403.
5. User management endpoints additionally apply the scope rule BR-01-013 and the self-modification rule BR-01-008.
6. Restricted sessions (`PasswordChangeRequired`, `MfaEnrollmentRequired`) are enforced by the evaluator before permission checks.
7. Platform tokens (audience `platform`) are rejected by organization endpoints with 401 and vice versa.
8. Missing, malformed, or expired access token → 401 `IDENTITY.UNAUTHENTICATED` with `WWW-Authenticate: Bearer`.

## 12. Error Handling

All errors use RFC 9457 Problem Details with `code`, `traceId`, `errors`, and a message localized by `Accept-Language` (`ar`/`en`).

| HTTP | Code | When |
|---|---|---|
| 400 | `COMMON.VALIDATION_FAILED` (+ field codes of §9) | Invalid input |
| 400 | `IDENTITY.TOKEN_INVALID_OR_EXPIRED` | Reset/invitation/verification token unknown, expired, consumed, revoked |
| 400 | `IDENTITY.CURRENT_PASSWORD_INVALID` | Wrong current password on change |
| 400 | `IDENTITY.MFA_CODE_INVALID` | Wrong/expired TOTP or recovery code (P2) |
| 401 | `IDENTITY.UNAUTHENTICATED` | Missing/invalid/expired access token |
| 401 | `IDENTITY.INVALID_CREDENTIALS` | Login failure (generic) |
| 401 | `IDENTITY.REFRESH_TOKEN_INVALID` | Refresh token unknown/expired/session revoked/user not Active |
| 401 | `IDENTITY.REFRESH_TOKEN_REUSED` | Rotated/revoked refresh token presented (family revoked) |
| 401 | `IDENTITY.SESSION_REVOKED` | Access token of revoked session or stale security stamp |
| 403 | `IDENTITY.PERMISSION_DENIED` | Missing permission (generic, used by all modules) |
| 403 | `IDENTITY.BRANCH_ACCESS_DENIED` | Branch not in caller's scope (CS-07) |
| 403 | `IDENTITY.EMAIL_NOT_VERIFIED` | Signup Owner logs in before verification |
| 403 | `IDENTITY.PASSWORD_CHANGE_REQUIRED` | Restricted session |
| 403 | `IDENTITY.MFA_ENROLLMENT_REQUIRED` | Restricted session (P2) |
| 403 | `IDENTITY.PRIVILEGE_ESCALATION` | Granting permissions/roles beyond own |
| 403 | `IDENTITY.USER_OUTSIDE_SCOPE` | Target user outside actor's management scope |
| 403 | `IDENTITY.SELF_MODIFICATION_FORBIDDEN` | Changing own roles/branches/scope/status |
| 403 | `IDENTITY.OVERRIDE_DENIED` | Override re-authentication failed (generic) |
| 403 | `IDENTITY.OVERRIDE_GRANT_INVALID` | Grant expired/consumed/mismatched |
| 404 | `IDENTITY.USER_NOT_FOUND`, `IDENTITY.ROLE_NOT_FOUND`, `IDENTITY.SESSION_NOT_FOUND`, `ORG.BRANCH_NOT_FOUND` | Not found or other organization (CS-08); `ORG.BRANCH_NOT_FOUND` owned by SPEC-02 |
| 404 | (empty Problem Details, `COMMON.NOT_FOUND`) | `/auth/signup` when self-signup disabled |
| 409 | `IDENTITY.EMAIL_ALREADY_EXISTS` | Duplicate email |
| 409 | `IDENTITY.ROLE_NAME_EXISTS`, `IDENTITY.ROLE_IN_USE`, `IDENTITY.SYSTEM_ROLE_IMMUTABLE` | Role conflicts |
| 409 | `IDENTITY.LAST_OWNER` | Would leave no Active Owner |
| 409 | `IDENTITY.INVALID_STATUS_TRANSITION` | Disallowed status transition |
| 409 | `IDENTITY.MFA_ALREADY_ENABLED`, `IDENTITY.MFA_REQUIRED_BY_POLICY` | MFA conflicts (P2) |
| 412 | `COMMON.CONCURRENCY_CONFLICT` | `If-Match` mismatch |
| 423 | `IDENTITY.ACCOUNT_LOCKED` | Account locked; body includes `retryAfterSeconds` |
| 428 | `COMMON.PRECONDITION_REQUIRED` | `If-Match` missing |
| 429 | `COMMON.RATE_LIMITED` | Rate limit exceeded; `Retry-After` header |

## 13. Edge Cases

1. **Two browser tabs refresh simultaneously** with the same refresh token: the second request is treated as reuse and revokes the family (OD-01-01). Mitigation: the frontend serializes refresh across tabs (single-flight with a cross-tab lock) and broadcasts the new access token.
2. **User deactivated while mid-sale:** the access token is rejected within ≤ 60 s; a sale submitted after rejection returns 401 and the client-side cart is retained (SPEC-06).
3. **Branch deactivated (SPEC-02)** while users are assigned: assignments remain for history; the branch is excluded from scope evaluation and from `/auth/me` branches; a user whose only branch becomes inactive can log in but has no branch to work in (UI shows a message).
4. **Permission added to the catalog in a new release:** granted automatically to `OWNER`; added to other system roles only through a documented release migration; never added to custom roles automatically.
5. **Role deleted while a user is logged in with it:** deletion is blocked while assigned (FR-01-021), so this cannot happen.
6. **Invitation accepted after the inviter is deactivated:** acceptance succeeds; roles/branches set at invitation time remain.
7. **Email of an invited user is later used for signup:** rejected with 409 `IDENTITY.EMAIL_ALREADY_EXISTS` (OD-01-07).
8. **Forgot password for an `Invited` user:** returns 202, no email sent; the user must use the invitation (resend by administrator).
9. **Override requested by a user who also holds the override permission:** the POS applies the action directly under the caller's own permission (SPEC-06); an override naming the caller as overrider returns 403 `IDENTITY.OVERRIDE_DENIED`.
10. **Overrider is locked:** override returns 403 `IDENTITY.OVERRIDE_DENIED` (no lock disclosure at a shared terminal).
11. **Clock skew between nodes:** JWT validation tolerates ≤ 30 s skew; TOTP tolerates ±1 step.
12. **Absolute expiry reached during active use:** refresh fails with 401 `IDENTITY.REFRESH_TOKEN_INVALID`; the user logs in again; no data loss beyond the client-side cart (persisted locally by SPEC-06).
13. **Session cap reached on a shared POS terminal:** the least-recently-active session of that user is revoked (FR-01-006).
14. **Owner demotes themselves:** blocked by BR-01-008; another Owner must do it, and BR-01-007 still applies.
15. **Signup provisioning fails in SPEC-02** (e.g., database error): the whole transaction rolls back; no user, organization, or branch remains (BR-G-19).

## 14. Acceptance Criteria

| ID | Spec-level acceptance criterion |
|---|---|
| SAC-01-01 | A user can log in, work for 8 hours with automatic silent refreshes, and log out; after logout the refresh cookie is rejected. |
| SAC-01-02 | Replaying a rotated refresh token revokes the whole family and session (CS-12) and produces an audit event. |
| SAC-01-03 | A user assigned only to branch A receives 403 on every branch-B route (CS-07); any identifier from another organization yields 404 with no data (CS-08). |
| SAC-01-04 | Five wrong passwords lock the account for 15 minutes; reset password or administrator unlock restores access. |
| SAC-01-05 | A Manager cannot grant permissions they do not hold, cannot manage Owners, and cannot modify themselves. |
| SAC-01-06 | Deactivating a user stops all their API access within 60 seconds and writes an audit event. |
| SAC-01-07 | A cashier obtains a manager override for a discount above limit; the grant is usable once within 120 seconds by SPEC-06. |
| SAC-01-08 | Every endpoint in the API has a declared permission policy or is on the anonymous list; the automated policy test passes. |
| SAC-01-09 | Identity UI flows (login, invitation acceptance, reset, change password) work in Arabic (RTL) and English (LTR). |
| SAC-01-10 | Platform administrator tokens cannot access any organization endpoint. |

## 15. Dependencies

| Dependency | Direction | Contract |
|---|---|---|
| SPEC-02 Organization & Branches | SPEC-01 → SPEC-02 | Organization provisioning contract (create Organization, first Branch, settings) inside signup transaction; branch existence/status queries; `OrganizationSettings.RequireMfaForOwnerAndManager`; `SupportAccessGrant` for platform admin access; error `ORG.BRANCH_NOT_FOUND` |
| SPEC-10 Notifications, Audit & Settings | SPEC-01 → SPEC-10 | Audit event write API (same transaction); email dispatch for invitation, verification, reset, security notices; `UserPreference` initial language |
| SPEC-06 Sales & POS | SPEC-06 → SPEC-01 | `ManagerOverride` consumption facade; override-eligible permissions and `ContextType` values; per-role discount limit via the `RoleDiscountLimits` setting (OD-01-04 resolved) |
| All modules | → SPEC-01 | Authorization evaluator, current principal, `IDENTITY.PERMISSION_DENIED` / `IDENTITY.BRANCH_ACCESS_DENIED` semantics |
| ADR-005 | — | Token design (lifetimes, rotation, cookie) |
| ADR-002 | — | Tenant filter + RLS; `PlatformUser`/`Permission` excluded from tenant filter |
| ADR-008 | — | Audit write in same transaction |
| ADR-009 | — | Localized error messages |

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01-001 | `POST /auth/login` p95 ≤ 600 ms and p99 ≤ 1 s server time, including password hashing, at 10 logins/s sustained per application node. |
| NFR-01-002 | `POST /auth/refresh` p95 ≤ 150 ms; `GET /auth/me` p95 ≤ 200 ms at 200 requests/s per node. |
| NFR-01-003 | Authorization evaluation adds ≤ 5 ms p95 per request with a warm permission cache. |
| NFR-01-004 | Permission, role, branch-assignment, and scope changes propagate to all nodes within ≤ 60 s (FR-01-025). |
| NFR-01-005 | Session revocation, deactivation, password change/reset, and family revocation are enforced against access tokens within ≤ 60 s on all nodes (FR-01-011). |
| NFR-01-006 | All security tokens have ≥256 bits of entropy from a cryptographically secure generator and are stored as SHA-256 hashes; TOTP secrets are encrypted with keys stored outside the database. |
| NFR-01-007 | Access tokens are signed with RS256 (≥2048-bit) or ES256; signing keys rotate every 90 days with ≥30 minutes of verification overlap so that rotation logs out 0 users; private keys are never stored in source control. |
| NFR-01-008 | p95 response-time difference between known and unknown emails on login and forgot-password is ≤ 50 ms. |
| NFR-01-009 | Rate limits of FR-01-018 are enforced across all nodes with ≤ 10% overshoot of the configured limit. |
| NFR-01-010 | Login, invitation acceptance, password reset/change, and MFA screens meet WCAG 2.2 AA (NFR-G-08) and are fully available in Arabic (RTL) and English (LTR). |
| NFR-01-011 | Logs never contain passwords, tokens, token hashes, TOTP secrets, or recovery codes; emails in logs are masked (first character + domain) (NFR-G-10). |
| NFR-01-012 | JWT validation clock-skew tolerance ≤ 30 s. |
| NFR-01-013 | `LoginAttempt` rows are retained 180 days by default (configurable; final period pending REG-05); expired/revoked refresh tokens are purged 30 days after `FamilyExpiresAt` by a background job. |
| NFR-01-014 | Login and refresh remain available when email delivery (SPEC-10) is unavailable; email requests are queued via the outbox and retried for ≥ 24 h. |

## 17. Security and Privacy Considerations

- Threats addressed: credential stuffing (rate limits, lockout, blocked-password list), account enumeration (generic errors, timing equalization), token theft (HttpOnly cookie, short access tokens, rotation, reuse detection), CSRF on refresh (`SameSite=Strict`, cookie path, refresh requires `POST` and an `X-Requested-With` header), privilege escalation (BR-01-009, BR-01-010, BR-01-013), insider misuse (audit events, session visibility), shared POS terminals (manager override without session, session cap).
- OWASP ASVS v4 chapters V2 (Authentication), V3 (Session Management), and V4 (Access Control) are used as a design checklist; this is not a certification claim.
- Personal data stored about staff: name, email, phone, IP addresses and user agents of logins and sessions. Applicability of Egyptian personal data protection legislation is pending REG-04; retention of login history pending REG-05.
- Email content never includes passwords; temporary passwords are shown once in the administrator's UI and never emailed.
- Platform administrators have no standing access to organization data (BR-01-019).
- Security notices: the user is emailed when their password is changed or reset, MFA is reset, or refresh-token reuse is detected (via SPEC-10).

## 18. Testing Considerations

- **Critical scenarios:** CS-07 (TS-01-049), CS-08 (TS-01-050, TS-01-062), CS-12 (TS-01-014).
- **Authorization matrix test:** enumerate every endpoint × each system role × in-scope/out-of-scope branch × other organization; expected 200/403/404 table generated from policies (FR-01-023).
- **Concurrency:** parallel refresh with the same token (exactly one rotation succeeds, the other triggers reuse handling); concurrent deactivation of the last two Owners (exactly one succeeds, the other gets `IDENTITY.LAST_OWNER`); concurrent override grant consumption (exactly one succeeds).
- **Time-based:** lockout expiry, token expiries (reset 30 min, invitation 72 h, override 120 s, MFA token 5 min, refresh 14/30 days) using an injectable clock.
- **Security tests:** timing difference measurement (NFR-01-008), cookie attributes, absence of secrets in logs, JWT `alg` confusion and `none` rejection, signing key rotation without logout.
- **Localization:** all identity error codes have Arabic and English messages.

## 19. Open Decisions

| ID | Decision needed | Proposed default |
|---|---|---|
| OD-01-01 | Grace window for concurrent refresh with the same token (multi-tab race) | No server grace; frontend single-flight refresh with cross-tab lock |
| OD-01-02 | Login identifier for staff without email (username or Egyptian mobile number) and email change flow | v1: email required; email change = deactivate + re-invite |
| OD-01-03 | One person working for several organizations with the same email | v1: not supported (BR-01-001) |
| OD-01-04 | Storage of per-role discount limit for BR-G-32 | **Resolved 2026-11-10:** organization setting `RoleDiscountLimits` (role code → max discount %) defined by SPEC-06 and stored in the SPEC-10 settings registry; no column on `Role`. |
| OD-01-05 | Final override-eligible permission set; PIN-based quick override as alternative to password | `sales.discounts.override`, `sales.sales.void`, `sales.returns.approve`; password only |
| OD-01-06 | NFR-G-07 anonymous endpoint list must be extended with `/auth/signup`, `/auth/signup/verify`, `/auth/login/mfa`, `/auth/invitations/validate\|accept`, `/platform/auth/login\|refresh` | Amend NFR-G-07 |
| OD-01-07 | Email-existence disclosure via 409 on invite/signup versus an enumeration-safe asynchronous flow | v1: 409 with rate limiting |
| OD-01-08 | Storage of platform administrator audit events (outside organization hash chains) | Separate platform audit stream in SPEC-10 |
| OD-01-09 | Make MFA mandatory for platform administrators before SaaS launch (MFA is P2) | Mandatory for platform admins as soon as US-01-18 ships |
| OD-01-10 | Confirmation of the default system role permission matrix (§5.3) | As proposed in §5.3 |
| OD-01-11 | Password reset via SMS/WhatsApp OTP for the Egyptian market | Out of scope v1 |

## 20. Regulatory Review Items

- REG-04 — staff personal data (name, email, phone, IP addresses, user agents) in login history and sessions.
- REG-05 — retention period of login history and identity audit events.
- REG-08 — individual attribution of pharmacist actions relies on per-user accounts and the manager override; confirm any requirement on who may authorize dispensing-related overrides.
