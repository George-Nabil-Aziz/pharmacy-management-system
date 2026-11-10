# Test Cases — EPIC-01 Identity & Access

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-01-IDENTITY-ACCESS/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (95 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-01-001 | Signup creates org, branch, 6 roles, Invited Owner, invitation row, outbox email | Integration | T2 | V1 | US-01-01-AC1 |
| TS-01-002 | Verify token activates Owner and writes audit event | Integration | T2 | V1 | US-01-01-AC2 |
| TS-01-003 | Login before verification → 403; wrong password → 401 | Integration | T2 | V1 | US-01-01-AC3 |
| TS-01-004 | Duplicate email → 409, row counts unchanged | Integration | T2 | V1 | US-01-01-AC4 |
| TS-01-005 | Setting disabled → 404 | Integration | T2 | V1 | US-01-01-AC5 |
| TS-01-006 | Injected provisioning failure → full rollback | Integration | T2 | V1 | US-01-01-AC6 |
| TS-01-007 | Expired (clock +72h 1s) and consumed tokens → 400; rate limit 429 | Integration | T2 | V1 | US-01-01-AC7 |
| TS-01-008 | Successful login: tokens, claims, cookie attributes, session/token rows, LoginAttempt | Integration | T1 | MVP | US-01-02-AC1 |
| TS-01-009 | Three failure kinds return identical 401 bodies | Integration | T1 | MVP | US-01-02-AC2 |
| TS-01-010 | Known vs unknown email p95 timing difference ≤ 50 ms over 1,000 attempts | Performance | T1 | MVP | US-01-02-AC2 |
| TS-01-011 | `/auth/me` content for multi-branch pharmacist; 401 cases | Integration | T1 | MVP | US-01-02-AC3, US-01-02-AC4 |
| TS-01-012 | 11th login revokes oldest session; platform credentials rejected | Integration | T1 | MVP | US-01-02-AC5, US-01-02-AC6 |
| TS-01-013 | Rotation updates rows; cookie attributes; no token in body | Integration | T1 | MVP | US-01-03-AC1 |
| TS-01-014 | **CS-12** — replay rotated RT1 after RT3 → family + session revoked, audit, email queued, RT3 rejected, access token 401 within 60 s | Integration | T0 | MVP | US-01-03-AC2 |
| TS-01-015 | Clock-driven absolute (30 d) and sliding (14 d) expiry | Integration | T1 | MVP | US-01-03-AC3, US-01-03-AC5 |
| TS-01-016 | Deactivated user / admin-revoked session cannot refresh | Integration | T1 | MVP | US-01-03-AC4 |
| TS-01-017 | 2 parallel refreshes with same token, repeated 100 times → exactly one success each run | Concurrency | T0 | MVP | US-01-03-AC6 |
| TS-01-018 | Logout revokes only current session; cookie cleared; token rejected after cache propagation | Integration | T1 | MVP | US-01-04-AC1 |
| TS-01-019 | Repeated logout returns 204 | Integration | T1 | MVP | US-01-04-AC2 |
| TS-01-020 | Logout-all revokes 3 sessions, rotates stamp, writes audit; unauthenticated → 401 | Integration | T1 | MVP | US-01-04-AC3, US-01-04-AC4 |
| TS-01-021 | Revocation enforced on a second node within 60 s | Multi-node | T1 | MVP | US-01-04-AC1, US-01-04-AC3 |
| TS-01-022 | Change revokes other sessions, keeps current, history row, audit, email queued | Integration | T1 | MVP | US-01-05-AC1 |
| TS-01-023 | Policy evaluator table-driven cases incl. Arabic letters/digits and length bounds | Unit | T1 | MVP | US-01-05-AC2 |
| TS-01-024 | Reuse of any of last 5 rejected; 6th-oldest accepted | Integration | T1 | MVP | US-01-05-AC3 |
| TS-01-025 | Wrong current password → 400 and lockout counter +1; no token → 401 | Integration | T1 | MVP | US-01-05-AC4, US-01-05-AC5 |
| TS-01-026 | Forgot for active user invalidates old token, creates hashed token, queues email | Integration | T1 | MVP | US-01-06-AC1 |
| TS-01-027 | Unknown/invited/deactivated emails → identical 202, no rows, timing check | Integration | T1 | MVP | US-01-06-AC2 |
| TS-01-028 | Reset unlocks, consumes token, revokes sessions, audit, notice | Integration | T1 | MVP | US-01-06-AC3 |
| TS-01-029 | Expired/consumed/invalidated tokens rejected; reused password keeps token | Integration | T1 | MVP | US-01-06-AC4, US-01-06-AC5 |
| TS-01-030 | 4th forgot request in 1 hour → 429 | Integration | T1 | MVP | US-01-06-AC6 |
| TS-01-031 | 5th failure locks, audit, LoginAttempt; correct password during lock → 423 | Integration | T1 | MVP | US-01-07-AC1, US-01-07-AC2 |
| TS-01-032 | Clock +15 min 1 s → login succeeds and resets counter | Integration | T1 | MVP | US-01-07-AC3 |
| TS-01-033 | Unknown email follows same 401/423 pattern | Integration | T1 | MVP | US-01-07-AC4 |
| TS-01-034 | Manager unlock in scope 204; cashier 403; other-org user 404 | Integration | T1 | MVP | US-01-07-AC5, US-01-07-AC6 |
| TS-01-035 | Login history cursor pagination and field filtering | Integration | T1 | MVP | US-01-07-AC7 |
| TS-01-036 | 31st attempt per IP per minute → 429 across 2 nodes | Integration | T1 | MVP | US-01-07-AC8 |
| TS-01-037 | Catalog equals §5.2 list; override-eligible flags; Arabic/English names non-empty | Unit | T1 | MVP | US-01-08-AC1 |
| TS-01-038 | Provisioning seeds six roles with §5.3 matrix | Integration | T1 | MVP | US-01-08-AC2 |
| TS-01-039 | PUT/DELETE on system role → 409; cashier GET permissions → 403; other-org role → 404 | Integration | T1 | MVP | US-01-08-AC3, US-01-08-AC4 |
| TS-01-040 | Migration adding a permission updates OWNER only | Integration | T1 | MVP | US-01-08-AC5 |
| TS-01-041 | Create and clone custom roles; audit content | Integration | T2 | V1 | US-01-09-AC1, US-01-09-AC2 |
| TS-01-042 | Update with ETag; effect on holder's next request; multi-node ≤ 60 s | Integration | T2 | V1 | US-01-09-AC3 |
| TS-01-043 | 412 and 428 cases | Integration | T2 | V1 | US-01-09-AC4 |
| TS-01-044 | Delete in-use vs unused | Integration | T2 | V1 | US-01-09-AC5 |
| TS-01-045 | Escalation 403; pharmacist 403; other-org role 404 | Integration | T2 | V1 | US-01-09-AC6, US-01-09-AC7 |
| TS-01-046 | Duplicate name, unknown permission, empty set | Integration | T2 | V1 | US-01-09-AC8 |
| TS-01-047 | Endpoint policy enumeration test fails on missing policy; unpoliced endpoint returns 403 | Architecture | T1 | MVP | US-01-10-AC1 |
| TS-01-048 | Missing permission → 403, no state change | Integration | T1 | MVP | US-01-10-AC2 |
| TS-01-049 | **CS-07** — user of branch A1 calls branch A2 routes (read and write) → 403 `IDENTITY.BRANCH_ACCESS_DENIED`, no data | Integration | T0 | MVP | US-01-10-AC3 |
| TS-01-050 | **CS-08** — ORG-B owner requests ORG-A branch/user/role ids → 404 identical to random ids | Integration | T0 | MVP | US-01-10-AC4 |
| TS-01-051 | Org-wide scope 200 on both branches; forged organizationId ignored | Integration | T1 | MVP | US-01-10-AC5, US-01-10-AC6 |
| TS-01-052 | Assignment change effective same node immediately and other node ≤ 60 s | Multi-node | T1 | MVP | US-01-10-AC7 |
| TS-01-053 | Authorization matrix: all endpoints × system roles × in/out-of-scope branch × other org | Integration | T0 | MVP | US-01-10-AC2, US-01-10-AC3, US-01-10-AC4 |
| TS-01-054 | Invite creates Invited user, hashed token, Arabic email, audit | Integration | T1 | MVP | US-01-11-AC1 |
| TS-01-055 | Validate + accept + login in Arabic and English UI | E2E | T1 | MVP | US-01-11-AC2 |
| TS-01-056 | Resend invalidates T1; revoke deactivates | Integration | T1 | MVP | US-01-11-AC3, US-01-11-AC4 |
| TS-01-057 | Expired token (clock +72 h 1 s) → 400 | Integration | T1 | MVP | US-01-11-AC5 |
| TS-01-058 | Manager escalation/scope 403s; pharmacist 403 | Integration | T1 | MVP | US-01-11-AC6, US-01-11-AC7 |
| TS-01-059 | Case-insensitive duplicate email → 409 | Integration | T1 | MVP | US-01-11-AC8 |
| TS-01-060 | Create with temp password; password returned once; audit without secret | Integration | T2 | MVP | US-01-12-AC1 |
| TS-01-061 | Restricted session 403 until change; then normal | Integration | T2 | MVP | US-01-12-AC2 |
| TS-01-062 | Admin reset temp mode and email mode; session revocation | Integration | T2 | MVP | US-01-12-AC3, US-01-12-AC4 |
| TS-01-063 | Cashier 403, manager→owner 403, self 403, other-org user 404 | Integration | T2 | MVP | US-01-12-AC5, US-01-12-AC6 |
| TS-01-064 | Filter and page directory; verify branch-sharing result set | Integration | T1 | MVP | US-01-13-AC1 |
| TS-01-065 | Update profile with current, stale, and missing ETag | Integration | T1 | MVP | US-01-13-AC2 |
| TS-01-066 | Missing permission and target outside scope return 403 | Integration | T1 | MVP | US-01-13-AC3 |
| TS-01-067 | Cross-Organization user id returns 404 indistinguishable from missing id (CS-08) | Integration | T0 | MVP | US-01-13-AC3 |
| TS-01-068 | Replace role set and verify audit plus effective permission snapshot | Integration | T1 | MVP | US-01-14-AC1 |
| TS-01-069 | Branch assignments enforce one default and Owner-only organization scope | Integration | T1 | MVP | US-01-14-AC2 |
| TS-01-070 | Self-change, privilege escalation, out-of-scope target, and last-Owner guard | Integration | T1 | MVP | US-01-14-AC3 |
| TS-01-071 | Permission/assignment invalidation reaches other node within 60 seconds; foreign IDs return 404 (CS-08) | Multi-node | T0 | MVP | US-01-14-AC4 |
| TS-01-072 | Deactivation records reason/audit and revokes sessions and refresh tokens atomically | Integration | T1 | MVP | US-01-15-AC1 |
| TS-01-073 | Deactivated User's access token is rejected within 60 seconds | Multi-node | T1 | MVP | US-01-15-AC1 |
| TS-01-074 | Reactivation resets failed attempts without restoring old sessions | Integration | T1 | MVP | US-01-15-AC2 |
| TS-01-075 | Self/permission/scope, last-Owner, and foreign Organization cases | Integration | T1 | MVP | US-01-15-AC3 |
| TS-01-076 | Own-session list includes required metadata and excludes other users | Integration | T2 | MVP | US-01-16-AC1 |
| TS-01-077 | Revoke own current and non-current sessions; verify token rejection | Integration | T2 | MVP | US-01-16-AC2 |
| TS-01-078 | Administrative reads/revokes enforce permissions and target scope | Integration | T2 | MVP | US-01-16-AC3 |
| TS-01-079 | Cross-Organization session id returns 404 and session cap remains 10 (CS-08) | Integration | T1 | MVP | US-01-16-AC3 |
| TS-01-080 | Valid grant claims, 120-second expiry, and no overrider session/token | Integration | T1 | MVP | US-01-17-AC1 |
| TS-01-081 | Grant consumed atomically and cannot be reused or consumed with changed context | Integration | T1 | MVP | US-01-17-AC2 |
| TS-01-082 | Missing requester permission, out-of-branch approver, and self-override are denied; failures count toward lockout | Integration | T1 | MVP | US-01-17-AC3 |
| TS-01-083 | Parallel consumption produces at most one success; foreign Organization lookup returns 404 (CS-08) | Concurrency | T0 | MVP | US-01-17-AC3 |
| TS-01-084 | Confirmed enrollment stores encrypted secret and returns 10 recovery codes once | Integration | T3 | V1 | US-01-18-AC1 |
| TS-01-085 | Valid TOTP challenge issues session tokens; same time step replay is rejected | Integration | T3 | V1 | US-01-18-AC2 |
| TS-01-086 | Expired, invalid, consumed recovery codes and five-failure lockout | Integration | T3 | V1 | US-01-18-AC3 |
| TS-01-087 | Missing auth returns 401; password-restricted session receives 403 | Integration | T3 | V1 | US-01-18-AC4 |
| TS-01-088 | Enforced Owner/Manager receives restriction while exempt endpoints remain usable | Integration | T3 | V1 | US-01-19-AC1 |
| TS-01-089 | Recovery-code rotation, own-factor disable, and policy block | Integration | T3 | V1 | US-01-19-AC2 |
| TS-01-090 | In-scope admin reset revokes sessions and audits without secrets | Integration | T3 | V1 | US-01-19-AC3 |
| TS-01-091 | Missing permission/scope return 403 and foreign user returns 404 (CS-08) | Integration | T3 | V1 | US-01-19-AC4 |
| TS-01-092 | Platform login returns platform audience, no org claim, scoped cookie | Integration | T2 | V1 | US-01-20-AC1 |
| TS-01-093 | Platform refresh rotates once; logout revokes the session | Integration | T2 | V1 | US-01-20-AC2 |
| TS-01-094 | Wrong audience tokens rejected on both platform and Organization APIs | Integration | T2 | V1 | US-01-20-AC3 |
| TS-01-095 | Platform authentication requires 14-character minimum and public provisioning is absent | Security | T1 | V1 | US-01-20-AC1, US-01-20-AC3 |

---

## US-01-01: Organization Self-Signup with Owner Email Verification

### TS-01-001: Signup creates org, branch, 6 roles, Invited Owner, invitation row, outbox email

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC1 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC1 — Successful signup creates organization, branch, roles and invited Owner atomically**

*Preconditions / test data*
1. self-signup is enabled and `owner@newpharma.eg` is not used on the platform

*Steps*
1. an anonymous visitor posts `/api/v1/auth/signup` with valid organization name, branch name, owner full name, email, a policy-compliant password, `preferredLanguage = ar`, and `acceptTerms = true`

*Expected results*
1. the response is 201 with `organizationId`, `branchId`, `userId`, and `status = Invited`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-002: Verify token activates Owner and writes audit event

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC2 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC2 — Verification activates the Owner**

*Preconditions / test data*
1. a signup Owner with status `Invited` and an unexpired verification token

*Steps*
1. the visitor posts the token to `/api/v1/auth/signup/verify`

*Expected results*
1. the response is 204, the user status is `Active`, `EmailVerifiedAt` is set, the token is consumed, and the audit event `identity.organization.signup-verified` is written in the same transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-003: Login before verification → 403; wrong password → 401

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC3 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC3 — Login before verification is refused with a specific code**

*Preconditions / test data*
1. a signup Owner with status `Invited`

*Steps*
1. they log in with the correct email and password

*Expected results*
1. the response is 403 `IDENTITY.EMAIL_NOT_VERIFIED` and no session or refresh cookie is created

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-004: Duplicate email → 409, row counts unchanged

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC4 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC4 — Duplicate email is rejected and nothing is created**

*Preconditions / test data*
1. `owner@newpharma.eg` already belongs to a user of any organization

*Steps*
1. a signup is posted with that email

*Expected results*
1. the response is 409 `IDENTITY.EMAIL_ALREADY_EXISTS` and no Organization, Branch, Role, or User row is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-005: Setting disabled → 404

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC5 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC5 — Self-signup disabled hides the endpoint**

*Preconditions / test data*
1. `Identity:SelfSignupEnabled = false`

*Steps*
1. a visitor posts any body to `/api/v1/auth/signup`

*Expected results*
1. the response is 404 and nothing is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-006: Injected provisioning failure → full rollback

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC6 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC6 — Provisioning failure rolls back completely**

*Preconditions / test data*
1. the SPEC-02 provisioning step fails after the user row was staged

*Steps*
1. the signup request is processed

*Expected results*
1. the response is 500 Problem Details with a `traceId`, and no Organization, Branch, Role, User, or UserInvitation row exists (BR-G-19).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-007: Expired (clock +72h 1s) and consumed tokens → 400; rate limit 429

| Field | Value |
|---|---|
| Story | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) — Organization Self-Signup with Owner Email Verification |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-01-AC7 |
| Requirements | FR-01-001, FR-01-002, FR-01-012, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform setting `Identity:SelfSignupEnabled` is `true` (unless the AC states otherwise).
- SPEC-02 provisioning contract is available.
- Email dispatch (SPEC-10) is configured; delivery is asynchronous through the outbox.

**US-01-01-AC7 — Expired or reused verification token is rejected**

*Preconditions / test data*
1. a verification token that is older than 72 hours or already consumed

*Steps*
1. it is posted to `/api/v1/auth/signup/verify`

*Expected results*
1. the response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the user status is unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-02: Login with Email and Password

### TS-01-008: Successful login: tokens, claims, cookie attributes, session/token rows, LoginAttempt

| Field | Value |
|---|---|
| Story | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) — Login with Email and Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-02-AC1 |
| Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |

**Story preconditions**
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

**US-01-02-AC1 — Successful login issues tokens and creates a session**

*Preconditions / test data*
1. an `Active` user `mona@example.eg` with a valid password

*Steps*
1. she posts `/api/v1/auth/login` with ` Mona@Example.eg ` (mixed case, surrounding spaces) and the correct password

*Expected results*
1. the response is 200 with `accessToken`, `expiresIn = 900`, `sessionId`, `mfaRequired = false`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-009: Three failure kinds return identical 401 bodies

| Field | Value |
|---|---|
| Story | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) — Login with Email and Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-02-AC2 |
| Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |

**Story preconditions**
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

**US-01-02-AC2 — Generic failure for wrong password, unknown email, and deactivated user**

*Preconditions / test data*
1. a wrong password for an existing user, an email not registered on the platform, and a `Deactivated` user with the correct password

*Steps*
1. each is submitted to `/api/v1/auth/login`

*Expected results*
1. all three responses are 401 with code `IDENTITY.INVALID_CREDENTIALS` and byte-identical bodies except `traceId`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-010: Known vs unknown email p95 timing difference ≤ 50 ms over 1,000 attempts

| Field | Value |
|---|---|
| Story | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) — Login with Email and Password |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-02-AC2 |
| Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |

**Story preconditions**
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

**US-01-02-AC2 — Generic failure for wrong password, unknown email, and deactivated user**

*Preconditions / test data*
1. a wrong password for an existing user, an email not registered on the platform, and a `Deactivated` user with the correct password

*Steps*
1. each is submitted to `/api/v1/auth/login`

*Expected results*
1. all three responses are 401 with code `IDENTITY.INVALID_CREDENTIALS` and byte-identical bodies except `traceId`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-011: `/auth/me` content for multi-branch pharmacist; 401 cases

| Field | Value |
|---|---|
| Story | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) — Login with Email and Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-02-AC3, US-01-02-AC4 |
| Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |

**Story preconditions**
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

**US-01-02-AC3 — Current principal is returned by /auth/me**

*Preconditions / test data*
1. a logged-in `PHARMACIST` assigned to branches `CAI01` (default) and `GIZ01`

*Steps*
1. she calls `GET /api/v1/auth/me` with her access token

*Expected results*
1. the response is 200 with her user id, full name, organization id and name, roles `[PHARMACIST]`, the effective permission codes of that role, both branches with `CAI01` flagged default, `hasOrganizationWideScope = false`, `mustChangePassword = false`, and `restriction = null`.

**US-01-02-AC4 — Unauthenticated call to /auth/me is rejected**

*Preconditions / test data*
1. no access token, an expired access token, or a token signed with an unknown key

*Steps*
1. `GET /api/v1/auth/me` is called

*Expected results*
1. the response is 401 `IDENTITY.UNAUTHENTICATED` with header `WWW-Authenticate: Bearer`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-012: 11th login revokes oldest session; platform credentials rejected

| Field | Value |
|---|---|
| Story | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) — Login with Email and Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-02-AC5, US-01-02-AC6 |
| Requirements | FR-01-003, FR-01-004, FR-01-005, FR-01-006 |

**Story preconditions**
- An `Active` user exists with at least one role and one assigned `Active` branch (or organization-wide scope).
- Signing keys are configured (ADR-005).

**US-01-02-AC5 — Session cap revokes least recently active session**

*Preconditions / test data*
1. a user with 10 active sessions

*Steps*
1. he logs in an 11th time

*Expected results*
1. login succeeds and the session with the oldest `LastActivityAt` is revoked with reason `SessionLimit`, leaving 10 active sessions.

**US-01-02-AC6 — Platform administrator credentials do not work on organization login**

*Preconditions / test data*
1. a `PlatformUser` `ops@platform.example`

*Steps*
1. those credentials are posted to `/api/v1/auth/login`

*Expected results*
1. the response is 401 `IDENTITY.INVALID_CREDENTIALS`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-03: Refresh Token Rotation and Reuse Detection

### TS-01-013: Rotation updates rows; cookie attributes; no token in body

| Field | Value |
|---|---|
| Story | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) — Refresh Token Rotation and Reuse Detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-03-AC1 |
| Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |

**Story preconditions**
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

**US-01-03-AC1 — Refresh rotates the token within the family**

*Preconditions / test data*
1. a valid, unrotated refresh token `RT1` of family `F` issued 2 days ago, family created 2 days ago

*Steps*
1. the client posts `/api/v1/auth/refresh` with the `RT1` cookie

*Expected results*
1. the response is 200 with a new access token (15 min) and a `Set-Cookie` with `RT2`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-014: **CS-12** — replay rotated RT1 after RT3 → family + session revoked, audit, email queued, RT3 rejected, access token 401 within 60 s

| Field | Value |
|---|---|
| Story | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) — Refresh Token Rotation and Reuse Detection |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-03-AC2 |
| Critical scenario | CS-12 |
| Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |

**Story preconditions**
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

**US-01-03-AC2 — Reuse of a rotated token revokes the whole family (CS-12)**

*Preconditions / test data*
1. `RT1` was rotated to `RT2` and `RT2` was rotated to `RT3`

*Steps*
1. `RT1` is presented to `/api/v1/auth/refresh`

*Expected results*
1. the response is 401 `IDENTITY.REFRESH_TOKEN_REUSED` and the cookie is cleared

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-015: Clock-driven absolute (30 d) and sliding (14 d) expiry

| Field | Value |
|---|---|
| Story | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) — Refresh Token Rotation and Reuse Detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-03-AC3, US-01-03-AC5 |
| Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |

**Story preconditions**
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

**US-01-03-AC3 — Absolute family expiry is enforced**

*Preconditions / test data*
1. a family created 30 days and 1 second ago whose latest token was issued 1 day ago

*Steps*
1. that token is presented

*Expected results*
1. the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`, the cookie is cleared, and the session is revoked with reason `Expired`.

**US-01-03-AC5 — Sliding expiry is honored**

*Preconditions / test data*
1. a token issued 14 days and 1 second ago in a family created 14 days ago

*Steps*
1. it is presented

*Expected results*
1. the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-016: Deactivated user / admin-revoked session cannot refresh

| Field | Value |
|---|---|
| Story | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) — Refresh Token Rotation and Reuse Detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-03-AC4 |
| Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |

**Story preconditions**
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

**US-01-03-AC4 — Refresh refused for non-active user or revoked session**

*Preconditions / test data*
1. a valid refresh token belonging to a user who has been `Deactivated`, or to a session revoked by an administrator

*Steps*
1. the token is presented

*Expected results*
1. the response is 401 `IDENTITY.REFRESH_TOKEN_INVALID`, no new token is issued, and the cookie is cleared.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-017: 2 parallel refreshes with same token, repeated 100 times → exactly one success each run

| Field | Value |
|---|---|
| Story | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) — Refresh Token Rotation and Reuse Detection |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-03-AC6 |
| Requirements | FR-01-007, FR-01-008, FR-01-009, FR-01-040 |

**Story preconditions**
- The user holds a valid refresh token cookie from US-01-02.
- An injectable clock is available for tests.

**US-01-03-AC6 — Concurrent refresh with the same token**

*Preconditions / test data*
1. two requests carrying the same unrotated `RT1` arrive within 50 ms

*Steps*
1. both are processed

*Expected results*
1. exactly one returns 200 with a new token, and the other returns 401 `IDENTITY.REFRESH_TOKEN_REUSED` and the family is revoked (default behavior pending OD-01-01).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-04: Logout and Logout from All Devices

### TS-01-018: Logout revokes only current session; cookie cleared; token rejected after cache propagation

| Field | Value |
|---|---|
| Story | [US-01-04](../stories/EPIC-01-IDENTITY-ACCESS/US-01-04-logout-and-logout-all-devices.md) — Logout and Logout from All Devices |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-04-AC1 |
| Requirements | FR-01-010, FR-01-011 |

**Story preconditions**
- The user has at least one active session (US-01-02).

**US-01-04-AC1 — Logout revokes the current session**

*Preconditions / test data*
1. a user with sessions `S1` (current) and `S2`

*Steps*
1. she posts `/api/v1/auth/logout` from `S1`

*Expected results*
1. the response is 204, the refresh cookie is cleared (`Max-Age=0`), `S1` and its token family are revoked with reason `Logout`, and `S2` remains active

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-019: Repeated logout returns 204

| Field | Value |
|---|---|
| Story | [US-01-04](../stories/EPIC-01-IDENTITY-ACCESS/US-01-04-logout-and-logout-all-devices.md) — Logout and Logout from All Devices |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-04-AC2 |
| Requirements | FR-01-010, FR-01-011 |

**Story preconditions**
- The user has at least one active session (US-01-02).

**US-01-04-AC2 — Logout is idempotent**

*Preconditions / test data*
1. the session is already revoked or the cookie is absent

*Steps*
1. `/api/v1/auth/logout` is posted again

*Expected results*
1. the response is 204 and no error is returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-020: Logout-all revokes 3 sessions, rotates stamp, writes audit; unauthenticated → 401

| Field | Value |
|---|---|
| Story | [US-01-04](../stories/EPIC-01-IDENTITY-ACCESS/US-01-04-logout-and-logout-all-devices.md) — Logout and Logout from All Devices |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-04-AC3, US-01-04-AC4 |
| Requirements | FR-01-010, FR-01-011 |

**Story preconditions**
- The user has at least one active session (US-01-02).

**US-01-04-AC3 — Logout from all devices**

*Preconditions / test data*
1. a user with 3 active sessions

*Steps*
1. he posts `/api/v1/auth/logout-all` with a valid access token

*Expected results*
1. the response is 204, all 3 sessions and their families are revoked with reason `LogoutAll`, the user's security stamp is rotated, and every previously issued access token returns 401 `IDENTITY.SESSION_REVOKED` within ≤ 60 s

**US-01-04-AC4 — Logout-all requires authentication**

*Preconditions / test data*
1. no valid access token

*Steps*
1. `/api/v1/auth/logout-all` is posted

*Expected results*
1. the response is 401 `IDENTITY.UNAUTHENTICATED` and no session is revoked.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-021: Revocation enforced on a second node within 60 s

| Field | Value |
|---|---|
| Story | [US-01-04](../stories/EPIC-01-IDENTITY-ACCESS/US-01-04-logout-and-logout-all-devices.md) — Logout and Logout from All Devices |
| Type / Execution | Multi-node / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-04-AC1, US-01-04-AC3 |
| Requirements | FR-01-010, FR-01-011 |

**Story preconditions**
- The user has at least one active session (US-01-02).

**US-01-04-AC1 — Logout revokes the current session**

*Preconditions / test data*
1. a user with sessions `S1` (current) and `S2`

*Steps*
1. she posts `/api/v1/auth/logout` from `S1`

*Expected results*
1. the response is 204, the refresh cookie is cleared (`Max-Age=0`), `S1` and its token family are revoked with reason `Logout`, and `S2` remains active

**US-01-04-AC3 — Logout from all devices**

*Preconditions / test data*
1. a user with 3 active sessions

*Steps*
1. he posts `/api/v1/auth/logout-all` with a valid access token

*Expected results*
1. the response is 204, all 3 sessions and their families are revoked with reason `LogoutAll`, the user's security stamp is rotated, and every previously issued access token returns 401 `IDENTITY.SESSION_REVOKED` within ≤ 60 s

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-05: Password Policy and Change Own Password

### TS-01-022: Change revokes other sessions, keeps current, history row, audit, email queued

| Field | Value |
|---|---|
| Story | [US-01-05](../stories/EPIC-01-IDENTITY-ACCESS/US-01-05-password-policy-and-change-own-password.md) — Password Policy and Change Own Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-05-AC1 |
| Requirements | FR-01-012, FR-01-013, FR-01-040 |

**Story preconditions**
- The user is logged in.
- The blocked-password list (≥10,000 entries) is deployed.

**US-01-05-AC1 — Successful change revokes other sessions**

*Preconditions / test data*
1. a user with sessions `S1` (current) and `S2`

*Steps*
1. she posts `/api/v1/auth/password/change` with the correct current password and a compliant new password `Nile-Pharma-2026`

*Expected results*
1. the response is 204, the password hash is replaced, the previous hash is stored in `UserPasswordHistory`, the security stamp rotates, `S2` is revoked with reason `PasswordChanged`, `S1` stays active and receives a fresh access token on its next refresh

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-023: Policy evaluator table-driven cases incl. Arabic letters/digits and length bounds

| Field | Value |
|---|---|
| Story | [US-01-05](../stories/EPIC-01-IDENTITY-ACCESS/US-01-05-password-policy-and-change-own-password.md) — Password Policy and Change Own Password |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-05-AC2 |
| Requirements | FR-01-012, FR-01-013, FR-01-040 |

**Story preconditions**
- The user is logged in.
- The blocked-password list (≥10,000 entries) is deployed.

**US-01-05-AC2 — Policy violations are reported per rule**

*Preconditions / test data*
1. a logged-in user with email `ahmed.samir@example.eg`

*Steps*
1. the new password is `abc` / `abcdefghijk` / `1234567890` / `password123` (blocked) / `ahmed.samir99`

*Expected results*
1. each response is 400 `COMMON.VALIDATION_FAILED` with field code respectively `IDENTITY.PASSWORD_TOO_SHORT`, `IDENTITY.PASSWORD_MISSING_DIGIT`, `IDENTITY.PASSWORD_MISSING_LETTER`, `IDENTITY.PASSWORD_BLOCKLISTED`, `IDENTITY.PASSWORD_CONTAINS_EMAIL`, and the password is unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-024: Reuse of any of last 5 rejected; 6th-oldest accepted

| Field | Value |
|---|---|
| Story | [US-01-05](../stories/EPIC-01-IDENTITY-ACCESS/US-01-05-password-policy-and-change-own-password.md) — Password Policy and Change Own Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-05-AC3 |
| Requirements | FR-01-012, FR-01-013, FR-01-040 |

**Story preconditions**
- The user is logged in.
- The blocked-password list (≥10,000 entries) is deployed.

**US-01-05-AC3 — Reuse of the last 5 passwords is refused**

*Preconditions / test data*
1. a user whose last 5 passwords include `Delta-Clinic-77`

*Steps*
1. she sets the new password `Delta-Clinic-77`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with field code `IDENTITY.PASSWORD_REUSED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-025: Wrong current password → 400 and lockout counter +1; no token → 401

| Field | Value |
|---|---|
| Story | [US-01-05](../stories/EPIC-01-IDENTITY-ACCESS/US-01-05-password-policy-and-change-own-password.md) — Password Policy and Change Own Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-05-AC4, US-01-05-AC5 |
| Requirements | FR-01-012, FR-01-013, FR-01-040 |

**Story preconditions**
- The user is logged in.
- The blocked-password list (≥10,000 entries) is deployed.

**US-01-05-AC4 — Wrong current password is refused**

*Preconditions / test data*
1. a logged-in user

*Steps*
1. she submits an incorrect current password

*Expected results*
1. the response is 400 `IDENTITY.CURRENT_PASSWORD_INVALID`, no session is revoked, and the attempt counts toward lockout (US-01-07).

**US-01-05-AC5 — Unauthenticated change is rejected**

*Preconditions / test data*
1. no valid access token

*Steps*
1. `/api/v1/auth/password/change` is posted

*Expected results*
1. the response is 401 `IDENTITY.UNAUTHENTICATED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-06: Forgot and Reset Password

### TS-01-026: Forgot for active user invalidates old token, creates hashed token, queues email

| Field | Value |
|---|---|
| Story | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) — Forgot and Reset Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-06-AC1 |
| Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |

**Story preconditions**
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

**US-01-06-AC1 — Forgot request for an active user sends a single valid token**

*Preconditions / test data*
1. an `Active` user `mona@example.eg` with one unused reset token issued 10 minutes ago

*Steps*
1. `/api/v1/auth/password/forgot` is posted with `mona@example.eg`

*Expected results*
1. the response is 202 with body `{ "status": "accepted" }`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-027: Unknown/invited/deactivated emails → identical 202, no rows, timing check

| Field | Value |
|---|---|
| Story | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) — Forgot and Reset Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-06-AC2 |
| Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |

**Story preconditions**
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

**US-01-06-AC2 — Non-existent, invited, or deactivated email gets the same response and no email**

*Preconditions / test data*
1. an email not on the platform, an `Invited` user, and a `Deactivated` user

*Steps*
1. each is posted to `/api/v1/auth/password/forgot`

*Expected results*
1. each response is 202 with the identical body and p95 timing difference ≤ 50 ms versus AC1, and no token or email is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-028: Reset unlocks, consumes token, revokes sessions, audit, notice

| Field | Value |
|---|---|
| Story | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) — Forgot and Reset Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-06-AC3 |
| Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |

**Story preconditions**
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

**US-01-06-AC3 — Reset with a valid token sets the password and revokes all sessions**

*Preconditions / test data*
1. a `Locked` user with 2 active sessions and an unexpired reset token

*Steps*
1. `/api/v1/auth/password/reset` is posted with the token and a compliant new password

*Expected results*
1. the response is 204, the password changes, the token is consumed, the user becomes `Active` with `AccessFailedCount = 0`, the security stamp rotates, both sessions are revoked with reason `PasswordReset`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-029: Expired/consumed/invalidated tokens rejected; reused password keeps token

| Field | Value |
|---|---|
| Story | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) — Forgot and Reset Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-06-AC4, US-01-06-AC5 |
| Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |

**Story preconditions**
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

**US-01-06-AC4 — Expired, consumed, or invalidated tokens are rejected**

*Preconditions / test data*
1. a token 30 minutes and 1 second old, a consumed token, and an invalidated token

*Steps*
1. each is used on `/api/v1/auth/password/reset`

*Expected results*
1. each response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the password is unchanged.

**US-01-06-AC5 — Policy still applies on reset**

*Preconditions / test data*
1. a valid token

*Steps*
1. the new password is one of the user's last 5 passwords

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `IDENTITY.PASSWORD_REUSED` and the token remains unconsumed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-030: 4th forgot request in 1 hour → 429

| Field | Value |
|---|---|
| Story | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) — Forgot and Reset Password |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-06-AC6 |
| Requirements | FR-01-012, FR-01-014, FR-01-015, FR-01-018, FR-01-040 |

**Story preconditions**
- Email dispatch through SPEC-10 outbox is configured.
- Frontend route `/reset-password?token=…` exists; the token is removed from the URL after it is read.

**US-01-06-AC6 — Forgot-password rate limit**

*Preconditions / test data*
1. 3 forgot requests for the same email within the last hour

*Steps*
1. a 4th is posted

*Expected results*
1. the response is 429 `COMMON.RATE_LIMITED` with a `Retry-After` header and no email is queued.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-07: Account Lockout, Login Rate Limiting and Login History

### TS-01-031: 5th failure locks, audit, LoginAttempt; correct password during lock → 423

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC1, US-01-07-AC2 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC1 — Five consecutive failures lock the account**

*Preconditions / test data*
1. an `Active` user with `AccessFailedCount = 4`

*Steps*
1. a 5th wrong password is submitted to `/api/v1/auth/login`

*Expected results*
1. the response is 423 `IDENTITY.ACCOUNT_LOCKED` with `retryAfterSeconds = 900`, the user status is `Locked` with `LockedUntil = now + 15 min`

**US-01-07-AC2 — Correct password during lock is still refused**

*Preconditions / test data*
1. a `Locked` user with `LockedUntil` 10 minutes in the future

*Steps*
1. the correct password is submitted

*Expected results*
1. the response is 423 `IDENTITY.ACCOUNT_LOCKED` with `retryAfterSeconds` ≤ 600 and no session is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-032: Clock +15 min 1 s → login succeeds and resets counter

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC3 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC3 — Lock expires automatically**

*Preconditions / test data*
1. a `Locked` user whose `LockedUntil` passed 1 second ago

*Steps*
1. the correct password is submitted

*Expected results*
1. login succeeds (200), the status becomes `Active`, and `AccessFailedCount = 0`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-033: Unknown email follows same 401/423 pattern

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC4 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC4 — Unknown emails behave identically**

*Preconditions / test data*
1. an email not on the platform

*Steps*
1. 5 attempts are made and then a 6th

*Expected results*
1. the first 4 responses are 401 `IDENTITY.INVALID_CREDENTIALS` and the 5th and 6th are 423 `IDENTITY.ACCOUNT_LOCKED`, indistinguishable from a real account.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-034: Manager unlock in scope 204; cashier 403; other-org user 404

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC5, US-01-07-AC6 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC5 — Administrator unlocks a user early**

*Preconditions / test data*
1. a Manager with `identity.users.update` whose branches include all of the locked user's branches

*Steps*
1. he posts `/api/v1/users/{userId}/unlock`

*Expected results*
1. the response is 204, the user is `Active` with `AccessFailedCount = 0`, and audit event `identity.user.unlocked` is written.

**US-01-07-AC6 — Unlock without permission is denied**

*Preconditions / test data*
1. a `CASHIER` without `identity.users.update`

*Steps*
1. she posts `/api/v1/users/{userId}/unlock`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED` and the user stays `Locked`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-035: Login history cursor pagination and field filtering

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC7 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC7 — Login history is visible to authorized users**

*Preconditions / test data*
1. a user with 60 recorded login attempts and an Owner with `identity.users.read`

*Steps*
1. the Owner calls `GET /api/v1/users/{userId}/login-attempts?limit=50`

*Expected results*
1. the response is 200 with 50 items ordered newest first (timestamp, IP, user agent, outcome, failure code) and a `nextCursor`
2. no password or email hash is returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-036: 31st attempt per IP per minute → 429 across 2 nodes

| Field | Value |
|---|---|
| Story | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) — Account Lockout, Login Rate Limiting and Login History |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-07-AC8 |
| Requirements | FR-01-016, FR-01-017, FR-01-018, FR-01-040 |

**Story preconditions**
- Platform configuration `Identity:Lockout:MaxFailedAttempts = 5`, `Identity:Lockout:DurationMinutes = 15`.

**US-01-07-AC8 — Per-IP login rate limit**

*Preconditions / test data*
1. 30 login attempts from one IP within the last minute across different emails

*Steps*
1. a 31st is made

*Expected results*
1. the response is 429 `COMMON.RATE_LIMITED` with a `Retry-After` header and a `LoginAttempt` with outcome `RateLimited` is recorded.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-08: Permission Catalog and Seeded System Roles

### TS-01-037: Catalog equals §5.2 list; override-eligible flags; Arabic/English names non-empty

| Field | Value |
|---|---|
| Story | [US-01-08](../stories/EPIC-01-IDENTITY-ACCESS/US-01-08-permission-catalog-and-system-roles.md) — Permission Catalog and Seeded System Roles |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-08-AC1 |
| Requirements | FR-01-019, FR-01-020 |

**Story preconditions**
- The permission catalog is defined in code and seeded by migration.

**US-01-08-AC1 — Catalog is complete and localized**

*Preconditions / test data*
1. a user with `identity.roles.read`

*Steps*
1. she calls `GET /api/v1/permissions`

*Expected results*
1. the response is 200 grouped by module, containing every permission code of DOCUMENTATION-CONVENTIONS §5.2, each with `code`, `module`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `isOverrideEligible`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-038: Provisioning seeds six roles with §5.3 matrix

| Field | Value |
|---|---|
| Story | [US-01-08](../stories/EPIC-01-IDENTITY-ACCESS/US-01-08-permission-catalog-and-system-roles.md) — Permission Catalog and Seeded System Roles |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-08-AC2 |
| Requirements | FR-01-019, FR-01-020 |

**Story preconditions**
- The permission catalog is defined in code and seeded by migration.

**US-01-08-AC2 — New organization receives six system roles**

*Preconditions / test data*
1. SPEC-02 provisions a new organization

*Steps*
1. role seeding runs inside the provisioning transaction

*Expected results*
1. six roles with `SystemCode` `OWNER`, `MANAGER`, `PHARMACIST`, `CASHIER`, `INVENTORY`, `ACCOUNTANT` exist with `IsSystem = true`, Arabic and English names, and the permission sets of SPEC-01 §5.3
2. `OWNER` holds every catalog permission.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-039: PUT/DELETE on system role → 409; cashier GET permissions → 403; other-org role → 404

| Field | Value |
|---|---|
| Story | [US-01-08](../stories/EPIC-01-IDENTITY-ACCESS/US-01-08-permission-catalog-and-system-roles.md) — Permission Catalog and Seeded System Roles |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-08-AC3, US-01-08-AC4 |
| Requirements | FR-01-019, FR-01-020 |

**Story preconditions**
- The permission catalog is defined in code and seeded by migration.

**US-01-08-AC3 — System roles cannot be modified or deleted**

*Preconditions / test data*
1. a user with `identity.roles.manage`

*Steps*
1. he sends `PUT /api/v1/roles/{managerRoleId}` or `DELETE /api/v1/roles/{managerRoleId}`

*Expected results*
1. the response is 409 `IDENTITY.SYSTEM_ROLE_IMMUTABLE` and the role is unchanged.

**US-01-08-AC4 — Catalog read requires permission**

*Preconditions / test data*
1. a `CASHIER` without `identity.roles.read`

*Steps*
1. she calls `GET /api/v1/permissions`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-040: Migration adding a permission updates OWNER only

| Field | Value |
|---|---|
| Story | [US-01-08](../stories/EPIC-01-IDENTITY-ACCESS/US-01-08-permission-catalog-and-system-roles.md) — Permission Catalog and Seeded System Roles |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-08-AC5 |
| Requirements | FR-01-019, FR-01-020 |

**Story preconditions**
- The permission catalog is defined in code and seeded by migration.

**US-01-08-AC5 — Permissions added in a release reach OWNER only**

*Preconditions / test data*
1. a release adds a new permission code (test fixture code `P-new`) to the catalog

*Steps*
1. the release migration runs

*Expected results*
1. every organization's `OWNER` role holds it, no custom role holds it, and other system roles hold it only if the migration explicitly lists them.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-09: Manage Custom Roles

### TS-01-041: Create and clone custom roles; audit content

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC1, US-01-09-AC2 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC1 — Create a custom role**

*Preconditions / test data*
1. an Owner

*Steps*
1. she posts `/api/v1/roles` with `nameEn = "Senior Cashier"`, `nameAr = "كاشير أول"`, description, and permissions `[sales.pos.sell, sales.sales.read, sales.returns.create, sales.returns.approve]`

*Expected results*
1. the response is 201 with the role id and an `ETag`, `IsSystem = false`, and audit event `identity.role.created` records the permission list.

**US-01-09-AC2 — Clone a system role**

*Preconditions / test data*
1. an Owner

*Steps*
1. she posts `/api/v1/roles/{cashierRoleId}/clone` with `nameEn = "Cashier Plus"`, `nameAr = "كاشير بلس"`

*Expected results*
1. the response is 201 with a custom role whose permissions equal `CASHIER`'s and `ClonedFromRoleId = cashierRoleId`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-042: Update with ETag; effect on holder's next request; multi-node ≤ 60 s

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC3 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC3 — Update with optimistic concurrency and prompt effect**

*Preconditions / test data*
1. custom role `R` held by user `U`, with current ETag `E1`

*Steps*
1. the Owner sends `PUT /api/v1/roles/{R}` with `If-Match: E1` removing `sales.returns.approve`

*Expected results*
1. the response is 200 with a new ETag, audit event `identity.role.updated` contains before/after permission lists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-043: 412 and 428 cases

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC4 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC4 — Stale ETag is rejected**

*Preconditions / test data*
1. the role was updated after the client read ETag `E1`

*Steps*
1. a `PUT` with `If-Match: E1` is sent

*Expected results*
1. the response is 412 `COMMON.CONCURRENCY_CONFLICT`
2. without `If-Match` the response is 428 `COMMON.PRECONDITION_REQUIRED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-044: Delete in-use vs unused

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC5 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC5 — Delete only unused roles**

*Preconditions / test data*
1. custom role `R1` held by 1 user and custom role `R2` held by none

*Steps*
1. the Owner deletes `R1` and then `R2`

*Expected results*
1. `R1` returns 409 `IDENTITY.ROLE_IN_USE` and `R2` returns 204 with audit event `identity.role.deleted`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-045: Escalation 403; pharmacist 403; other-org role 404

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC6, US-01-09-AC7 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC6 — Privilege escalation is blocked**

*Preconditions / test data*
1. a user holding `MANAGER` plus a custom role granting `identity.roles.manage`, and not holding `settings.organization.manage`

*Steps*
1. he creates a role containing `inventory.adjustments.approve` (which he holds) and `settings.organization.manage` (which he does not hold)

*Expected results*
1. the response is 403 `IDENTITY.PRIVILEGE_ESCALATION` and no role is created.

**US-01-09-AC7 — Role management requires permission**

*Preconditions / test data*
1. a `PHARMACIST` without `identity.roles.manage`

*Steps*
1. she posts `/api/v1/roles`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-046: Duplicate name, unknown permission, empty set

| Field | Value |
|---|---|
| Story | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) — Manage Custom Roles |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-09-AC8 |
| Requirements | FR-01-021, FR-01-022, FR-01-025, FR-01-040 |

**Story preconditions**
- System roles exist (US-01-08).
- Actor holds `identity.roles.manage`.

**US-01-09-AC8 — Duplicate name and invalid permissions are rejected**

*Preconditions / test data*
1. a custom role named `Senior Cashier` exists

*Steps*
1. a role named `senior cashier` is created, or a role with permission `sales.pos.fly`, or with an empty permission list

*Expected results*
1. the responses are 409 `IDENTITY.ROLE_NAME_EXISTS`, 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.UNKNOWN_PERMISSION`, and 400 `COMMON.VALIDATION_FAILED` + `IDENTITY.ROLE_PERMISSIONS_REQUIRED` respectively.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-10: Backend Authorization Enforcement (Permission, Branch, Organization)

### TS-01-047: Endpoint policy enumeration test fails on missing policy; unpoliced endpoint returns 403

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Architecture / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC1 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC1 — Every endpoint declares a policy (default deny)**

*Preconditions / test data*
1. the API host's endpoint metadata

*Steps*
1. the automated policy test enumerates all endpoints

*Expected results*
1. every endpoint either is on the anonymous allow-list (NFR-G-07 as amended by OD-01-06) or declares a permission policy, otherwise the test fails

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-048: Missing permission → 403, no state change

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC2 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC2 — Missing permission returns 403**

*Preconditions / test data*
1. `cashierA1` without `inventory.adjustments.create`

*Steps*
1. she posts `/api/v1/branches/{A1}/stock-adjustments`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED` and no data is changed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-049: **CS-07** — user of branch A1 calls branch A2 routes (read and write) → 403 `IDENTITY.BRANCH_ACCESS_DENIED`, no data

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC3 — Cross-branch access in own organization returns 403 (CS-07)**

*Preconditions / test data*
1. `cashierA1` holding `sales.sales.read`, assigned only to `A1`

*Steps*
1. she calls `GET /api/v1/branches/{A2}/sales`

*Expected results*
1. the response is 403 `IDENTITY.BRANCH_ACCESS_DENIED` and the body contains no sales data or branch name.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-050: **CS-08** — ORG-B owner requests ORG-A branch/user/role ids → 404 identical to random ids

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC4 — Cross-organization access returns 404 without leakage (CS-08)**

*Preconditions / test data*
1. `ownerB` of `ORG-B` (all permissions, organization-wide scope in `ORG-B`)

*Steps*
1. he calls `GET /api/v1/branches/{A1}/sales`, `GET /api/v1/users/{cashierA1Id}`, and `GET /api/v1/roles/{roleOfOrgA}`

*Expected results*
1. the responses are 404 `ORG.BRANCH_NOT_FOUND`, 404 `IDENTITY.USER_NOT_FOUND`, and 404 `IDENTITY.ROLE_NOT_FOUND`, byte-identical (except `traceId`) to requests for random non-existent ids.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-051: Org-wide scope 200 on both branches; forged organizationId ignored

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC5, US-01-10-AC6 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC5 — Organization-wide scope grants all own branches**

*Preconditions / test data*
1. `accountantA` with organization-wide scope and `reports.sales.read`

*Steps*
1. she calls a sales report for `A1` and for `A2`

*Expected results*
1. both return 200.

**US-01-10-AC6 — Organization id in body or query is ignored**

*Preconditions / test data*
1. `cashierA1`

*Steps*
1. she sends a request whose body or query contains `organizationId = ORG-B`

*Expected results*
1. the request is evaluated against `ORG-A` from the token and no `ORG-B` data is read or written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-052: Assignment change effective same node immediately and other node ≤ 60 s

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Multi-node / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC7 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC7 — Branch assignment change takes effect promptly**

*Preconditions / test data*
1. `cashierA1` is newly assigned to `A2` by an authorized user

*Steps*
1. she calls `GET /api/v1/branches/{A2}/sales` on the same node immediately after, and on another node 60 s after

*Expected results*
1. both return 200 without re-login.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-053: Authorization matrix: all endpoints × system roles × in/out-of-scope branch × other org

| Field | Value |
|---|---|
| Story | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) — Backend Authorization Enforcement (Permission, Branch, Organization) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-10-AC2, US-01-10-AC3, US-01-10-AC4 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-01-023, FR-01-024, FR-01-025 |

**Story preconditions**
- Organizations `ORG-A` (branches `A1`, `A2`) and `ORG-B` (branch `B1`) exist.
- User `cashierA1` (role `CASHIER`, branch `A1` only), `accountantA` (role `ACCOUNTANT`, organization-wide scope), `ownerB` (`OWNER` of `ORG-B`).

**US-01-10-AC2 — Missing permission returns 403**

*Preconditions / test data*
1. `cashierA1` without `inventory.adjustments.create`

*Steps*
1. she posts `/api/v1/branches/{A1}/stock-adjustments`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED` and no data is changed.

**US-01-10-AC3 — Cross-branch access in own organization returns 403 (CS-07)**

*Preconditions / test data*
1. `cashierA1` holding `sales.sales.read`, assigned only to `A1`

*Steps*
1. she calls `GET /api/v1/branches/{A2}/sales`

*Expected results*
1. the response is 403 `IDENTITY.BRANCH_ACCESS_DENIED` and the body contains no sales data or branch name.

**US-01-10-AC4 — Cross-organization access returns 404 without leakage (CS-08)**

*Preconditions / test data*
1. `ownerB` of `ORG-B` (all permissions, organization-wide scope in `ORG-B`)

*Steps*
1. he calls `GET /api/v1/branches/{A1}/sales`, `GET /api/v1/users/{cashierA1Id}`, and `GET /api/v1/roles/{roleOfOrgA}`

*Expected results*
1. the responses are 404 `ORG.BRANCH_NOT_FOUND`, 404 `IDENTITY.USER_NOT_FOUND`, and 404 `IDENTITY.ROLE_NOT_FOUND`, byte-identical (except `traceId`) to requests for random non-existent ids.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-11: Invite a User and Accept the Invitation

### TS-01-054: Invite creates Invited user, hashed token, Arabic email, audit

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC1 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC1 — Invite creates an Invited user and sends a token**

*Preconditions / test data*
1. a Manager assigned to branch `CAI01` with `identity.users.create`

*Steps*
1. he posts `/api/v1/users/invitations` with email `sara@example.eg`, full name `Sara Adel`, roles `[CASHIER]`, branches `[{ branchId: CAI01, isDefault: true }]`, `preferredLanguage = ar`

*Expected results*
1. the response is 201 with `userId` and `status = Invited`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-055: Validate + accept + login in Arabic and English UI

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC2 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC2 — Accept invitation activates the user**

*Preconditions / test data*
1. an unexpired invitation token for `sara@example.eg`

*Steps*
1. she posts `/api/v1/auth/invitations/validate` and then `/api/v1/auth/invitations/accept` with the token and a compliant password

*Expected results*
1. validate returns 200 with masked email `s***@example.eg` and the organization name, accept returns 204, the user becomes `Active`, the token is consumed, audit event `identity.user.activated` is written, and she can log in.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-056: Resend invalidates T1; revoke deactivates

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC3, US-01-11-AC4 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC3 — Resend invalidates the previous token**

*Preconditions / test data*
1. an `Invited` user with token `T1`

*Steps*
1. the Manager posts `/api/v1/users/{userId}/invitation/resend`

*Expected results*
1. the response is 204, `T1` returns 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` on accept, the new token works, and audit event `identity.invitation.resent` is written.

**US-01-11-AC4 — Revoke invitation deactivates the invited user**

*Preconditions / test data*
1. an `Invited` user

*Steps*
1. the Manager sends `DELETE /api/v1/users/{userId}/invitation`

*Expected results*
1. the response is 204, the user is `Deactivated`, any outstanding token is unusable, and audit event `identity.invitation.revoked` is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-057: Expired token (clock +72 h 1 s) → 400

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC5 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC5 — Expired invitation cannot be accepted**

*Preconditions / test data*
1. an invitation issued 72 hours and 1 second ago

*Steps*
1. it is accepted

*Expected results*
1. the response is 400 `IDENTITY.TOKEN_INVALID_OR_EXPIRED` and the user remains `Invited`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-058: Manager escalation/scope 403s; pharmacist 403

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC6, US-01-11-AC7 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC6 — Escalation and scope are enforced**

*Preconditions / test data*
1. a Manager assigned only to `CAI01` who does not hold `OWNER`

*Steps*
1. he invites a user with role `OWNER`, or with branch `GIZ01` outside his scope, or with organization-wide scope

*Expected results*
1. the responses are 403 `IDENTITY.PRIVILEGE_ESCALATION`, 403 `IDENTITY.USER_OUTSIDE_SCOPE`, and 403 `IDENTITY.PRIVILEGE_ESCALATION` respectively and no user is created.

**US-01-11-AC7 — Invite without permission is denied**

*Preconditions / test data*
1. a `PHARMACIST` without `identity.users.create`

*Steps*
1. she posts `/api/v1/users/invitations`

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-059: Case-insensitive duplicate email → 409

| Field | Value |
|---|---|
| Story | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) — Invite a User and Accept the Invitation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-11-AC8 |
| Requirements | FR-01-012, FR-01-018, FR-01-026, FR-01-027, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create`; to set branches, actor's scope covers them.
- Roles and branches exist in the organization.

**US-01-11-AC8 — Duplicate email**

*Preconditions / test data*
1. `sara@example.eg` already exists on the platform

*Steps*
1. an invitation is posted with `SARA@example.eg`

*Expected results*
1. the response is 409 `IDENTITY.EMAIL_ALREADY_EXISTS`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-12: Create User with Temporary Password and Admin Password Reset

### TS-01-060: Create with temp password; password returned once; audit without secret

| Field | Value |
|---|---|
| Story | [US-01-12](../stories/EPIC-01-IDENTITY-ACCESS/US-01-12-temporary-password-and-admin-reset.md) — Create User with Temporary Password and Admin Password Reset |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-12-AC1 |
| Requirements | FR-01-028, FR-01-029, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create` (creation) or `identity.users.reset-password` (reset).

**US-01-12-AC1 — Create user with temporary password**

*Preconditions / test data*
1. an Owner

*Steps*
1. she posts `/api/v1/users` with email, full name, roles `[INVENTORY]`, branches `[CAI01 default]`

*Expected results*
1. the response is 201 containing `temporaryPassword` (12 characters, policy-compliant) exactly once, the user is `Active` with `MustChangePassword = true`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-061: Restricted session 403 until change; then normal

| Field | Value |
|---|---|
| Story | [US-01-12](../stories/EPIC-01-IDENTITY-ACCESS/US-01-12-temporary-password-and-admin-reset.md) — Create User with Temporary Password and Admin Password Reset |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-12-AC2 |
| Requirements | FR-01-028, FR-01-029, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create` (creation) or `identity.users.reset-password` (reset).

**US-01-12-AC2 — Restricted session until password is changed**

*Preconditions / test data*
1. the new user logs in with the temporary password

*Steps*
1. she calls `GET /api/v1/branches/{CAI01}/stock` (any non-allowed endpoint)

*Expected results*
1. login returned 200 with `restriction = "PasswordChangeRequired"`, and the call returns 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-062: Admin reset temp mode and email mode; session revocation

| Field | Value |
|---|---|
| Story | [US-01-12](../stories/EPIC-01-IDENTITY-ACCESS/US-01-12-temporary-password-and-admin-reset.md) — Create User with Temporary Password and Admin Password Reset |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-12-AC3, US-01-12-AC4 |
| Requirements | FR-01-028, FR-01-029, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create` (creation) or `identity.users.reset-password` (reset).

**US-01-12-AC3 — Admin reset in temporaryPassword mode**

*Preconditions / test data*
1. an `Active` user with 2 sessions in scope of a Manager holding `identity.users.reset-password`

*Steps*
1. the Manager posts `/api/v1/users/{userId}/password-reset` with `mode = temporaryPassword`

*Expected results*
1. the response is 200 with a one-time `temporaryPassword`, the user has `MustChangePassword = true`, both sessions are revoked with reason `PasswordReset`, and audit event `identity.password.admin-reset` (mode only) is written.

**US-01-12-AC4 — Admin reset in email mode**

*Preconditions / test data*
1. an `Active` user

*Steps*
1. the Owner posts `/api/v1/users/{userId}/password-reset` with `mode = email`

*Expected results*
1. the response is 202, a reset token (30 min) is created with `IssuedByUserId` = Owner, an email is queued, and all sessions are revoked.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-063: Cashier 403, manager→owner 403, self 403, other-org user 404

| Field | Value |
|---|---|
| Story | [US-01-12](../stories/EPIC-01-IDENTITY-ACCESS/US-01-12-temporary-password-and-admin-reset.md) — Create User with Temporary Password and Admin Password Reset |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-12-AC5, US-01-12-AC6 |
| Requirements | FR-01-028, FR-01-029, FR-01-040 |

**Story preconditions**
- Actor holds `identity.users.create` (creation) or `identity.users.reset-password` (reset).

**US-01-12-AC5 — Reset without permission or outside scope is denied**

*Preconditions / test data*
1. a `CASHIER` without `identity.users.reset-password`, and a Manager targeting an Owner

*Steps*
1. each posts `/api/v1/users/{userId}/password-reset`

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED` and 403 `IDENTITY.USER_OUTSIDE_SCOPE`, and no password changes.

**US-01-12-AC6 — Self reset via admin endpoint is refused**

*Preconditions / test data*
1. an Owner

*Steps*
1. she targets her own user id on `/api/v1/users/{userId}/password-reset`

*Expected results*
1. the response is 403 `IDENTITY.SELF_MODIFICATION_FORBIDDEN` (she must use change/forgot password).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-13: View and update users in management scope

### TS-01-064: Filter and page directory; verify branch-sharing result set

| Field | Value |
|---|---|
| Story | [US-01-13](../stories/EPIC-01-IDENTITY-ACCESS/US-01-13-user-directory-and-profile.md) — View and update users in management scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-13-AC1 |
| Requirements | FR-01-030, FR-01-032 |

**Story preconditions**
- The caller is authenticated in an active Organization.
- The target User belongs to that Organization and is within the caller's management scope.

**US-01-13-AC1 — Search the paginated user directory**

*Preconditions / test data*
1. a user administrator with `identity.users.read`

*Steps*
1. they request `/api/v1/users` with status, role, branch, and a valid text filter

*Expected results*
1. the response is paginated and contains only users sharing at least one assigned Branch when the caller lacks organization-wide scope.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-065: Update profile with current, stale, and missing ETag

| Field | Value |
|---|---|
| Story | [US-01-13](../stories/EPIC-01-IDENTITY-ACCESS/US-01-13-user-directory-and-profile.md) — View and update users in management scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-13-AC2 |
| Requirements | FR-01-030, FR-01-032 |

**Story preconditions**
- The caller is authenticated in an active Organization.
- The target User belongs to that Organization and is within the caller's management scope.

**US-01-13-AC2 — Update a profile with an ETag**

*Preconditions / test data*
1. a User in scope and its current ETag

*Steps*
1. the administrator updates full name and phone with `If-Match`

*Expected results*
1. the response returns the updated profile and a new ETag
2. a stale ETag returns 412 and a missing ETag returns 428.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-066: Missing permission and target outside scope return 403

| Field | Value |
|---|---|
| Story | [US-01-13](../stories/EPIC-01-IDENTITY-ACCESS/US-01-13-user-directory-and-profile.md) — View and update users in management scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-13-AC3 |
| Requirements | FR-01-030, FR-01-032 |

**Story preconditions**
- The caller is authenticated in an active Organization.
- The target User belongs to that Organization and is within the caller's management scope.

**US-01-13-AC3 — Deny out-of-scope and unauthorized access**

*Preconditions / test data*
1. an administrator without `identity.users.update`, a target user outside their management scope, and a user id from another Organization

*Steps*
1. they update the profile in each case

*Expected results*
1. the first two requests return 403 with the appropriate identity denial code, the cross-Organization request returns 404, and no profile changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-067: Cross-Organization user id returns 404 indistinguishable from missing id (CS-08)

| Field | Value |
|---|---|
| Story | [US-01-13](../stories/EPIC-01-IDENTITY-ACCESS/US-01-13-user-directory-and-profile.md) — View and update users in management scope |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-13-AC3 |
| Critical scenario | CS-08 |
| Requirements | FR-01-030, FR-01-032 |

**Story preconditions**
- The caller is authenticated in an active Organization.
- The target User belongs to that Organization and is within the caller's management scope.

**US-01-13-AC3 — Deny out-of-scope and unauthorized access**

*Preconditions / test data*
1. an administrator without `identity.users.update`, a target user outside their management scope, and a user id from another Organization

*Steps*
1. they update the profile in each case

*Expected results*
1. the first two requests return 403 with the appropriate identity denial code, the cross-Organization request returns 404, and no profile changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-14: Manage user roles and branch scope

### TS-01-068: Replace role set and verify audit plus effective permission snapshot

| Field | Value |
|---|---|
| Story | [US-01-14](../stories/EPIC-01-IDENTITY-ACCESS/US-01-14-manage-user-roles-and-branch-scope.md) — Manage user roles and branch scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-14-AC1 |
| Requirements | FR-01-022, FR-01-025, FR-01-031, FR-01-032, FR-01-033, FR-01-040 |

**Story preconditions**
- The target User and Roles exist in the caller's Organization.
- The actor has the relevant role or Branch assignment management permission and the current User ETag.

**US-01-14-AC1 — Replace a user's role set**

*Preconditions / test data*
1. an administrator with `identity.users.update` and role-granting authority

*Steps*
1. they replace a user's roles with a non-empty set using `If-Match`

*Expected results*
1. the roles are replaced atomically, audit before/after values are recorded, and permission changes propagate on the same node immediately and across nodes within 60 seconds.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-069: Branch assignments enforce one default and Owner-only organization scope

| Field | Value |
|---|---|
| Story | [US-01-14](../stories/EPIC-01-IDENTITY-ACCESS/US-01-14-manage-user-roles-and-branch-scope.md) — Manage user roles and branch scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-14-AC2 |
| Requirements | FR-01-022, FR-01-025, FR-01-031, FR-01-032, FR-01-033, FR-01-040 |

**Story preconditions**
- The target User and Roles exist in the caller's Organization.
- The actor has the relevant role or Branch assignment management permission and the current User ETag.

**US-01-14-AC2 — Replace Branch assignments and organization scope**

*Preconditions / test data*
1. an Owner managing an in-scope User

*Steps*
1. they set one or more Active Branch assignments with exactly one default, or change the organization-wide scope flag

*Expected results*
1. the update succeeds with a new ETag
2. a non-organization-wide user always retains at least one Active Branch.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-070: Self-change, privilege escalation, out-of-scope target, and last-Owner guard

| Field | Value |
|---|---|
| Story | [US-01-14](../stories/EPIC-01-IDENTITY-ACCESS/US-01-14-manage-user-roles-and-branch-scope.md) — Manage user roles and branch scope |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-14-AC3 |
| Requirements | FR-01-022, FR-01-025, FR-01-031, FR-01-032, FR-01-033, FR-01-040 |

**Story preconditions**
- The target User and Roles exist in the caller's Organization.
- The actor has the relevant role or Branch assignment management permission and the current User ETag.

**US-01-14-AC3 — Reject self-change, privilege escalation, and loss of last Owner**

*Preconditions / test data*
1. an actor attempts to modify their own roles/scope, grant a permission they do not hold, assign an out-of-scope target, or remove the last Active Owner

*Steps*
1. they submit the update

*Expected results*
1. the request is denied with 403 for authorization violations or 409 `IDENTITY.LAST_OWNER` when the last Owner invariant would be broken
2. no partial change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-071: Permission/assignment invalidation reaches other node within 60 seconds; foreign IDs return 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-01-14](../stories/EPIC-01-IDENTITY-ACCESS/US-01-14-manage-user-roles-and-branch-scope.md) — Manage user roles and branch scope |
| Type / Execution | Multi-node / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-14-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-01-022, FR-01-025, FR-01-031, FR-01-032, FR-01-033, FR-01-040 |

**Story preconditions**
- The target User and Roles exist in the caller's Organization.
- The actor has the relevant role or Branch assignment management permission and the current User ETag.

**US-01-14-AC4 — Isolate assignment identifiers by Organization**

*Preconditions / test data*
1. a role or Branch id belonging to another Organization

*Steps*
1. the administrator includes it in an assignment request

*Expected results*
1. the request returns 404 or the documented organization-scoped reference error without disclosing the foreign resource.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-15: Activate and deactivate users

### TS-01-072: Deactivation records reason/audit and revokes sessions and refresh tokens atomically

| Field | Value |
|---|---|
| Story | [US-01-15](../stories/EPIC-01-IDENTITY-ACCESS/US-01-15-activate-and-deactivate-users.md) — Activate and deactivate users |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-15-AC1 |
| Requirements | FR-01-011, FR-01-032, FR-01-033, FR-01-034, FR-01-040 |

**Story preconditions**
- The actor holds `identity.users.deactivate` and the target User is within management scope.
- Deactivation includes a reason of 3–500 characters.

**US-01-15-AC1 — Deactivate user and revoke access**

*Preconditions / test data*
1. an Active User in scope

*Steps*
1. the administrator deactivates them with a valid reason

*Expected results*
1. status, deactivation metadata, refresh-token revocations, session revocations, and audit event commit atomically
2. access tokens are rejected within 60 seconds on every node.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-073: Deactivated User's access token is rejected within 60 seconds

| Field | Value |
|---|---|
| Story | [US-01-15](../stories/EPIC-01-IDENTITY-ACCESS/US-01-15-activate-and-deactivate-users.md) — Activate and deactivate users |
| Type / Execution | Multi-node / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-15-AC1 |
| Requirements | FR-01-011, FR-01-032, FR-01-033, FR-01-034, FR-01-040 |

**Story preconditions**
- The actor holds `identity.users.deactivate` and the target User is within management scope.
- Deactivation includes a reason of 3–500 characters.

**US-01-15-AC1 — Deactivate user and revoke access**

*Preconditions / test data*
1. an Active User in scope

*Steps*
1. the administrator deactivates them with a valid reason

*Expected results*
1. status, deactivation metadata, refresh-token revocations, session revocations, and audit event commit atomically
2. access tokens are rejected within 60 seconds on every node.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-074: Reactivation resets failed attempts without restoring old sessions

| Field | Value |
|---|---|
| Story | [US-01-15](../stories/EPIC-01-IDENTITY-ACCESS/US-01-15-activate-and-deactivate-users.md) — Activate and deactivate users |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-15-AC2 |
| Requirements | FR-01-011, FR-01-032, FR-01-033, FR-01-034, FR-01-040 |

**Story preconditions**
- The actor holds `identity.users.deactivate` and the target User is within management scope.
- Deactivation includes a reason of 3–500 characters.

**US-01-15-AC2 — Reactivate without restoring sessions**

*Preconditions / test data*
1. a Deactivated User who is not the last Active Owner

*Steps*
1. an authorized administrator reactivates them

*Expected results*
1. status becomes Active, the failed-attempt counter is reset, and no prior session or refresh token becomes valid.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-075: Self/permission/scope, last-Owner, and foreign Organization cases

| Field | Value |
|---|---|
| Story | [US-01-15](../stories/EPIC-01-IDENTITY-ACCESS/US-01-15-activate-and-deactivate-users.md) — Activate and deactivate users |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-15-AC3 |
| Requirements | FR-01-011, FR-01-032, FR-01-033, FR-01-034, FR-01-040 |

**Story preconditions**
- The actor holds `identity.users.deactivate` and the target User is within management scope.
- Deactivation includes a reason of 3–500 characters.

**US-01-15-AC3 — Reject unsafe transitions and last-Owner deactivation**

*Preconditions / test data*
1. the actor targets themselves, the last Active Owner, or a User from another Organization

*Steps*
1. they attempt deactivation or reactivation

*Expected results*
1. self and scope violations return 403, a last-Owner violation returns 409, and a foreign User id returns 404
2. status remains unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-16: Manage own and in-scope user sessions

### TS-01-076: Own-session list includes required metadata and excludes other users

| Field | Value |
|---|---|
| Story | [US-01-16](../stories/EPIC-01-IDENTITY-ACCESS/US-01-16-manage-user-sessions.md) — Manage own and in-scope user sessions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-16-AC1 |
| Requirements | FR-01-006, FR-01-011, FR-01-035, FR-01-036, FR-01-040 |

**Story preconditions**
- The caller is authenticated.
- Administrative session operations target a User within scope.

**US-01-16-AC1 — List own active sessions**

*Preconditions / test data*
1. an authenticated User with multiple sessions

*Steps*
1. they request `GET /api/v1/auth/sessions`

*Expected results*
1. the response lists only their active sessions with device label, IP address, created/last activity timestamps, and a current-session flag.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-077: Revoke own current and non-current sessions; verify token rejection

| Field | Value |
|---|---|
| Story | [US-01-16](../stories/EPIC-01-IDENTITY-ACCESS/US-01-16-manage-user-sessions.md) — Manage own and in-scope user sessions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-16-AC2 |
| Requirements | FR-01-006, FR-01-011, FR-01-035, FR-01-036, FR-01-040 |

**Story preconditions**
- The caller is authenticated.
- Administrative session operations target a User within scope.

**US-01-16-AC2 — Revoke own session**

*Preconditions / test data*
1. an active session owned by the caller

*Steps*
1. they revoke it

*Expected results*
1. the session and token family are revoked
2. revoking the current session behaves as logout and access is rejected within 60 seconds.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-078: Administrative reads/revokes enforce permissions and target scope

| Field | Value |
|---|---|
| Story | [US-01-16](../stories/EPIC-01-IDENTITY-ACCESS/US-01-16-manage-user-sessions.md) — Manage own and in-scope user sessions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-01-16-AC3 |
| Requirements | FR-01-006, FR-01-011, FR-01-035, FR-01-036, FR-01-040 |

**Story preconditions**
- The caller is authenticated.
- Administrative session operations target a User within scope.

**US-01-16-AC3 — Administer sessions only within permission and scope**

*Preconditions / test data*
1. an administrator missing `identity.sessions.revoke`, a target outside management scope, and a session id from another Organization

*Steps*
1. they list or revoke the target sessions

*Expected results*
1. unauthorized in-scope operations and out-of-scope targets return 403, while the foreign Organization session returns 404
2. no other User's session is disclosed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-079: Cross-Organization session id returns 404 and session cap remains 10 (CS-08)

| Field | Value |
|---|---|
| Story | [US-01-16](../stories/EPIC-01-IDENTITY-ACCESS/US-01-16-manage-user-sessions.md) — Manage own and in-scope user sessions |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-01-16-AC3 |
| Critical scenario | CS-08 |
| Requirements | FR-01-006, FR-01-011, FR-01-035, FR-01-036, FR-01-040 |

**Story preconditions**
- The caller is authenticated.
- Administrative session operations target a User within scope.

**US-01-16-AC3 — Administer sessions only within permission and scope**

*Preconditions / test data*
1. an administrator missing `identity.sessions.revoke`, a target outside management scope, and a session id from another Organization

*Steps*
1. they list or revoke the target sessions

*Expected results*
1. unauthorized in-scope operations and out-of-scope targets return 403, while the foreign Organization session returns 404
2. no other User's session is disclosed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-17: Re-authenticate a manager for a POS override

### TS-01-080: Valid grant claims, 120-second expiry, and no overrider session/token

| Field | Value |
|---|---|
| Story | [US-01-17](../stories/EPIC-01-IDENTITY-ACCESS/US-01-17-pos-manager-override-reauthentication.md) — Re-authenticate a manager for a POS override |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-17-AC1 |
| Requirements | FR-01-037, FR-01-038, FR-01-039, FR-01-040 |

**Story preconditions**
- The requesting user is authenticated, holds `sales.pos.sell`, and is assigned to the Branch.
- The overrider has an Active account and an override-eligible permission for that Branch.

**US-01-17-AC1 — Issue a bound single-use ManagerOverride**

*Preconditions / test data*
1. a requester and a different eligible overrider

*Steps*
1. the requester submits valid overrider credentials, permission, context type, and SHA-256 context hash

*Expected results*
1. the response is 200 with a grant bound to Organization, Branch, requester, overrider, permission, and context hash, expiring 120 seconds after issue
2. no session or token is created for the overrider.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-081: Grant consumed atomically and cannot be reused or consumed with changed context

| Field | Value |
|---|---|
| Story | [US-01-17](../stories/EPIC-01-IDENTITY-ACCESS/US-01-17-pos-manager-override-reauthentication.md) — Re-authenticate a manager for a POS override |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-17-AC2 |
| Requirements | FR-01-037, FR-01-038, FR-01-039, FR-01-040 |

**Story preconditions**
- The requesting user is authenticated, holds `sales.pos.sell`, and is assigned to the Branch.
- The overrider has an Active account and an override-eligible permission for that Branch.

**US-01-17-AC2 — Consume grant once in the caller transaction**

*Preconditions / test data*
1. a valid unexpired grant whose context matches

*Steps*
1. the consuming business operation validates it inside its database transaction

*Expected results*
1. consumption commits atomically with the operation, and every second use or mismatched context is rejected.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-082: Missing requester permission, out-of-branch approver, and self-override are denied; failures count toward lockout

| Field | Value |
|---|---|
| Story | [US-01-17](../stories/EPIC-01-IDENTITY-ACCESS/US-01-17-pos-manager-override-reauthentication.md) — Re-authenticate a manager for a POS override |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-01-17-AC3 |
| Requirements | FR-01-037, FR-01-038, FR-01-039, FR-01-040 |

**Story preconditions**
- The requesting user is authenticated, holds `sales.pos.sell`, and is assigned to the Branch.
- The overrider has an Active account and an override-eligible permission for that Branch.

**US-01-17-AC3 — Deny unauthorized override attempts without disclosure**

*Preconditions / test data*
1. a requester without `sales.pos.sell`, an overrider with invalid credentials or missing branch scope, a self-override attempt, or an identifier from another Organization

*Steps*
1. an override is requested or validated

*Expected results*
1. permission or override failures return 403 with the specified generic code, foreign Organization resources return 404, and no grant is issued
2. failed password verification counts toward lockout.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-083: Parallel consumption produces at most one success; foreign Organization lookup returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-01-17](../stories/EPIC-01-IDENTITY-ACCESS/US-01-17-pos-manager-override-reauthentication.md) — Re-authenticate a manager for a POS override |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-01-17-AC3 |
| Critical scenario | CS-08 |
| Requirements | FR-01-037, FR-01-038, FR-01-039, FR-01-040 |

**Story preconditions**
- The requesting user is authenticated, holds `sales.pos.sell`, and is assigned to the Branch.
- The overrider has an Active account and an override-eligible permission for that Branch.

**US-01-17-AC3 — Deny unauthorized override attempts without disclosure**

*Preconditions / test data*
1. a requester without `sales.pos.sell`, an overrider with invalid credentials or missing branch scope, a self-override attempt, or an identifier from another Organization

*Steps*
1. an override is requested or validated

*Expected results*
1. permission or override failures return 403 with the specified generic code, foreign Organization resources return 404, and no grant is issued
2. failed password verification counts toward lockout.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-18: Enroll and authenticate with TOTP

### TS-01-084: Confirmed enrollment stores encrypted secret and returns 10 recovery codes once

| Field | Value |
|---|---|
| Story | [US-01-18](../stories/EPIC-01-IDENTITY-ACCESS/US-01-18-enroll-and-authenticate-with-totp.md) — Enroll and authenticate with TOTP |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-18-AC1 |
| Requirements | FR-01-041, FR-01-042 |

**Story preconditions**
- TOTP support is enabled for the deployment.
- Enrollment begins from an authenticated session; the user has an authenticator capable of RFC 6238 TOTP.

**US-01-18-AC1 — Enroll only after confirming TOTP**

*Preconditions / test data*
1. an authenticated user without an active TOTP factor

*Steps*
1. they start enrollment and confirm a valid six-digit code

*Expected results*
1. the factor is activated using a 160-bit secret encrypted at rest and 10 single-use recovery codes are returned once.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-085: Valid TOTP challenge issues session tokens; same time step replay is rejected

| Field | Value |
|---|---|
| Story | [US-01-18](../stories/EPIC-01-IDENTITY-ACCESS/US-01-18-enroll-and-authenticate-with-totp.md) — Enroll and authenticate with TOTP |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-18-AC2 |
| Requirements | FR-01-041, FR-01-042 |

**Story preconditions**
- TOTP support is enabled for the deployment.
- Enrollment begins from an authenticated session; the user has an authenticator capable of RFC 6238 TOTP.

**US-01-18-AC2 — Complete login MFA challenge**

*Preconditions / test data*
1. an Active user with a confirmed TOTP factor

*Steps*
1. correct credentials are submitted and the user completes the five-minute MFA challenge with a valid code

*Expected results*
1. only the second step issues the 15-minute access token, session, and refresh cookie
2. the same TOTP time step cannot be accepted twice.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-086: Expired, invalid, consumed recovery codes and five-failure lockout

| Field | Value |
|---|---|
| Story | [US-01-18](../stories/EPIC-01-IDENTITY-ACCESS/US-01-18-enroll-and-authenticate-with-totp.md) — Enroll and authenticate with TOTP |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-18-AC3 |
| Requirements | FR-01-041, FR-01-042 |

**Story preconditions**
- TOTP support is enabled for the deployment.
- Enrollment begins from an authenticated session; the user has an authenticator capable of RFC 6238 TOTP.

**US-01-18-AC3 — Reject invalid or replayed MFA codes**

*Preconditions / test data*
1. an expired challenge, invalid code, reused time step, or consumed recovery code

*Steps*
1. the user submits it

*Expected results*
1. no session is issued
2. after five failed codes the MFA token is invalidated and failures count toward account lockout.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-087: Missing auth returns 401; password-restricted session receives 403

| Field | Value |
|---|---|
| Story | [US-01-18](../stories/EPIC-01-IDENTITY-ACCESS/US-01-18-enroll-and-authenticate-with-totp.md) — Enroll and authenticate with TOTP |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-18-AC4 |
| Requirements | FR-01-041, FR-01-042 |

**Story preconditions**
- TOTP support is enabled for the deployment.
- Enrollment begins from an authenticated session; the user has an authenticator capable of RFC 6238 TOTP.

**US-01-18-AC4 — Require authentication for factor enrollment**

*Preconditions / test data*
1. an unauthenticated caller or an authenticated restricted session that must change its password

*Steps*
1. they attempt to enroll a factor

*Expected results*
1. the request returns 401 for missing authentication or 403 `IDENTITY.PASSWORD_CHANGE_REQUIRED` for the restricted session.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-19: Enforce and administer MFA

### TS-01-088: Enforced Owner/Manager receives restriction while exempt endpoints remain usable

| Field | Value |
|---|---|
| Story | [US-01-19](../stories/EPIC-01-IDENTITY-ACCESS/US-01-19-enforce-and-administer-mfa.md) — Enforce and administer MFA |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-19-AC1 |
| Requirements | FR-01-040, FR-01-043, FR-01-044 |

**Story preconditions**
- TOTP is enabled and the Organization setting `RequireMfaForOwnerAndManager` is available.
- The actor has the required self-service or `identity.users.reset-password` authority.

**US-01-19-AC1 — Enforce MFA enrollment policy**

*Preconditions / test data*
1. `RequireMfaForOwnerAndManager` is ON and an Owner or Manager has no active factor

*Steps*
1. they access an endpoint outside `/auth/me`, MFA enrollment, and logout

*Expected results*
1. the response is 403 `IDENTITY.MFA_ENROLLMENT_REQUIRED`
2. exempt endpoints remain available.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-089: Recovery-code rotation, own-factor disable, and policy block

| Field | Value |
|---|---|
| Story | [US-01-19](../stories/EPIC-01-IDENTITY-ACCESS/US-01-19-enforce-and-administer-mfa.md) — Enforce and administer MFA |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-19-AC2 |
| Requirements | FR-01-040, FR-01-043, FR-01-044 |

**Story preconditions**
- TOTP is enabled and the Organization setting `RequireMfaForOwnerAndManager` is available.
- The actor has the required self-service or `identity.users.reset-password` authority.

**US-01-19-AC2 — Manage recovery codes and disable own factor**

*Preconditions / test data*
1. a user with an active TOTP factor and valid current credentials

*Steps*
1. they regenerate recovery codes or disable their own factor with a valid password and code

*Expected results*
1. old recovery codes are invalidated, new codes are returned once, and disabling is rejected with 409 when MFA is required by policy.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-090: In-scope admin reset revokes sessions and audits without secrets

| Field | Value |
|---|---|
| Story | [US-01-19](../stories/EPIC-01-IDENTITY-ACCESS/US-01-19-enforce-and-administer-mfa.md) — Enforce and administer MFA |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-19-AC3 |
| Requirements | FR-01-040, FR-01-043, FR-01-044 |

**Story preconditions**
- TOTP is enabled and the Organization setting `RequireMfaForOwnerAndManager` is available.
- The actor has the required self-service or `identity.users.reset-password` authority.

**US-01-19-AC3 — Reset another user's factor within scope**

*Preconditions / test data*
1. an administrator with `identity.users.reset-password` and a target User in management scope

*Steps*
1. they reset the target factor

*Expected results*
1. the factor is disabled, all target sessions are revoked, and the same-transaction audit event contains no secret or recovery code.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-091: Missing permission/scope return 403 and foreign user returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-01-19](../stories/EPIC-01-IDENTITY-ACCESS/US-01-19-enforce-and-administer-mfa.md) — Enforce and administer MFA |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-01-19-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-01-040, FR-01-043, FR-01-044 |

**Story preconditions**
- TOTP is enabled and the Organization setting `RequireMfaForOwnerAndManager` is available.
- The actor has the required self-service or `identity.users.reset-password` authority.

**US-01-19-AC4 — Deny missing permission and conceal foreign users**

*Preconditions / test data*
1. an administrator without reset permission or a target User from another Organization

*Steps*
1. they attempt factor reset

*Expected results*
1. the first request returns 403 `IDENTITY.PERMISSION_DENIED`, the second returns 404 `IDENTITY.USER_NOT_FOUND`, and no factor or session state is disclosed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-01-20: Authenticate platform administrators separately

### TS-01-092: Platform login returns platform audience, no org claim, scoped cookie

| Field | Value |
|---|---|
| Story | [US-01-20](../stories/EPIC-01-IDENTITY-ACCESS/US-01-20-platform-administrator-authentication.md) — Authenticate platform administrators separately |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-20-AC1 |
| Requirements | FR-01-045 |

**Story preconditions**
- A `PlatformUser` has been provisioned through the deployment provisioning command.
- Platform token-signing keys and the separate platform authentication store are available.

**US-01-20-AC1 — Login against the platform identity store**

*Preconditions / test data*
1. an Active PlatformUser with a password of at least 14 characters

*Steps*
1. they POST `/api/v1/platform/auth/login` with valid credentials

*Expected results*
1. the response contains an access token with audience `platform` and no `org` claim, plus a secure refresh cookie scoped to `/api/v1/platform/auth`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-093: Platform refresh rotates once; logout revokes the session

| Field | Value |
|---|---|
| Story | [US-01-20](../stories/EPIC-01-IDENTITY-ACCESS/US-01-20-platform-administrator-authentication.md) — Authenticate platform administrators separately |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-20-AC2 |
| Requirements | FR-01-045 |

**Story preconditions**
- A `PlatformUser` has been provisioned through the deployment provisioning command.
- Platform token-signing keys and the separate platform authentication store are available.

**US-01-20-AC2 — Rotate and revoke platform sessions**

*Preconditions / test data*
1. a platform refresh cookie

*Steps*
1. the administrator refreshes or logs out

*Expected results*
1. refresh rotation follows the single-use token-family rules, logout revokes the platform session, and no platform refresh token is returned in a response body.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-094: Wrong audience tokens rejected on both platform and Organization APIs

| Field | Value |
|---|---|
| Story | [US-01-20](../stories/EPIC-01-IDENTITY-ACCESS/US-01-20-platform-administrator-authentication.md) — Authenticate platform administrators separately |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-01-20-AC3 |
| Requirements | FR-01-045 |

**Story preconditions**
- A `PlatformUser` has been provisioned through the deployment provisioning command.
- Platform token-signing keys and the separate platform authentication store are available.

**US-01-20-AC3 — Reject credentials and cross-audience tokens**

*Preconditions / test data*
1. invalid platform credentials, an Organization token sent to platform endpoints, or a platform token sent to Organization endpoints

*Steps*
1. a login or authenticated request is made

*Expected results*
1. authentication fails with a generic 401 response and no session or business data is returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-01-095: Platform authentication requires 14-character minimum and public provisioning is absent

| Field | Value |
|---|---|
| Story | [US-01-20](../stories/EPIC-01-IDENTITY-ACCESS/US-01-20-platform-administrator-authentication.md) — Authenticate platform administrators separately |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-01-20-AC1, US-01-20-AC3 |
| Requirements | FR-01-045 |

**Story preconditions**
- A `PlatformUser` has been provisioned through the deployment provisioning command.
- Platform token-signing keys and the separate platform authentication store are available.

**US-01-20-AC1 — Login against the platform identity store**

*Preconditions / test data*
1. an Active PlatformUser with a password of at least 14 characters

*Steps*
1. they POST `/api/v1/platform/auth/login` with valid credentials

*Expected results*
1. the response contains an access token with audience `platform` and no `org` claim, plus a secure refresh cookie scoped to `/api/v1/platform/auth`.

**US-01-20-AC3 — Reject credentials and cross-audience tokens**

*Preconditions / test data*
1. invalid platform credentials, an Organization token sent to platform endpoints, or a platform token sent to Organization endpoints

*Steps*
1. a login or authenticated request is made

*Expected results*
1. authentication fails with a generic 401 response and no session or business data is returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

