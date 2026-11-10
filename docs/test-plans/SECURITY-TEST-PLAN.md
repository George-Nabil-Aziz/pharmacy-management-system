# Security Test Plan

**Version:** 1.0 (2026-11-10) · **Parent:** [MASTER-TEST-STRATEGY.md](MASTER-TEST-STRATEGY.md) · **Architecture:** [SECURITY-ARCHITECTURE.md](../architecture/SECURITY-ARCHITECTURE.md), [ADR-002](../architecture/decisions/ADR-002-MULTI-TENANCY.md), [ADR-005](../architecture/decisions/ADR-005-AUTHENTICATION.md), [ADR-008](../architecture/decisions/ADR-008-AUDIT-LOGGING.md)

## 1. Objectives

1. Prove that no user can read or change another organization's data (CS-08) or another branch's data without assignment (CS-07). This is verified at the API **and** at the database (RLS is enabled from the MVP).
2. Prove that authentication, session, and token handling resist the threats in the threat model (credential stuffing, token theft and replay, CS-12).
3. Prove protection of patient medical data: permission separation, access logging (BR-G-29), and no leakage in logs.
4. Detect vulnerable dependencies, secrets, and common web vulnerabilities (OWASP Top 10, OWASP API Top 10) automatically.
5. Verify audit integrity, so that tampering is detectable.

Story testing notes declare about 220 `Security` scenarios, concentrated in EPIC-05…EPIC-10. This plan defines the cross-cutting suites that execute them systematically.

## 2. Test suites overview

| Suite | Type | Frequency | Gate |
|---|---|---|---|
| S1 Authorization matrix | Automated API (generated) | Every PR | 100% pass |
| S2 Tenant isolation incl. RLS | Automated API + DB | Every PR | 100% pass |
| S3 Authentication & sessions | Automated API | Every PR | 100% pass |
| S4 Input & file handling | Automated API + fuzz | PR (targeted) / nightly (fuzz) | 0 High |
| S5 Sensitive data | Automated (log scanning, response schema) | Every PR | 0 leaks |
| S6 Audit integrity | Automated | Every PR | 100% pass |
| S7 Static analysis | SAST, dependency, secret, container scan | Every PR | 0 new High/Critical |
| S8 Dynamic analysis | OWASP ZAP baseline + authenticated API scan | Nightly / release | 0 High |
| S9 Manual penetration test | Expert review | Before MVP go-live and each major release | 0 open High/Critical |

## 3. Authentication, tokens, and sessions (S3)

| ID | Test | Expected | Source |
|---|---|---|---|
| SEC-A-01 | Login with wrong password 5 times within 15 min | Account locked 15 min; generic error; audit `identity.user.locked` | US-01-07 |
| SEC-A-02 | Timing difference between known and unknown email | p95 difference ≤ 50 ms over 1,000 attempts | TS-01-010 |
| SEC-A-03 | Rate limit on login | 11th attempt within 1 min per IP+email, or 31st attempt within 1 min per IP → 429 + `Retry-After` | SPEC-01, API-DESIGN §10 |
| SEC-A-04 | **Refresh token reuse after rotation** | Whole token family revoked; all sessions of that family logged out; audit `identity.refresh-token.reuse-detected` | **CS-12**, TS-01-014 |
| SEC-A-05 | Parallel refresh with the same token | Exactly one success | TS-01-017 |
| SEC-A-06 | Expired, tampered-signature, `alg=none`, wrong audience (platform token on org API and vice versa), wrong issuer | 401 | SPEC-01 FR-01-045 |
| SEC-A-07 | Deactivated user | Refresh revoked immediately; access token rejected ≤ 60 s on every node | BR-G-30, TS-01-073 |
| SEC-A-08 | Refresh cookie attributes | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | ADR-005 |
| SEC-A-09 | CSRF on refresh endpoint | Request without anti-CSRF header/origin check rejected | SECURITY-ARCHITECTURE |
| SEC-A-10 | Password reset token | Single use, expires, does not reveal account existence | US-01-06 |
| SEC-A-11 | Manager override | Override token single-use, bound to cashier session and action, expires after `ManagerOverrideTtlSeconds` | US-06-07 |
| SEC-A-12 | MFA (V1) | TOTP required for Owner/Manager when enabled; recovery codes single use | SPEC-01 |

## 4. Tenant isolation (S2) — CS-08

**Method.** The test fixture creates two organizations (A and B), each with two branches and users of all roles. For every endpoint in the generated endpoint table (from OpenAPI), the suite:

1. calls the endpoint as org A with an ID that belongs to org B, and expects **404** with no data or identifying details in the body;
2. calls list or search endpoints as org A, and expects zero items from org B, including through filters with B's IDs;
3. attempts create or update referencing B's resources (for example, a sale line with B's medicine or batch ID), and expects 404 or 422 with no write.

**Database layer (RLS, enabled from MVP).**

| ID | Test | Expected |
|---|---|---|
| SEC-T-01 | Every tenant table has RLS enabled + forced and 4 policies | Schema test passes (TS-02-013) |
| SEC-T-02 | With EF Core global filters disabled by a test hook, run each repository query as org A | Zero rows of org B returned |
| SEC-T-03 | Connection without `app.organization_id` set | Zero rows / inserts rejected |
| SEC-T-04 | App DB role privileges | No `BYPASSRLS`, no DDL, no table ownership |
| SEC-T-05 | Raw SQL / Dapper report queries | Executed through helper asserting session variable; test fails if absent |
| SEC-T-06 | Background jobs | Each job sets tenant context per organization; a job processing org A cannot read org B |
| SEC-T-07 | Platform admin | No business data access without active `SupportAccessGrant`; grant is read-only, time-limited, audited (US-02-15, US-02-16) |
| SEC-T-08 | File download | Pre-signed URL only after authorization; URL expires; object keys not guessable; other-org file ID → 404 |

All 162 story scenarios tagged CS-08 run in this suite.

## 5. Branch authorization (S1) — CS-07

The **authorization matrix** is generated from the endpoint table: Method, Path, Permission, branch-scoped flag. For each endpoint the suite runs 5 principals:

| Principal | Expected |
|---|---|
| Anonymous | 401 (except public auth endpoints) |
| Same org, missing permission | 403 `COMMON.FORBIDDEN` |
| Same org, permission, **not assigned** to target branch | 403 (CS-07) |
| Same org, permission, assigned branch | 2xx |
| Other organization (any permission) | 404 (CS-08) |

Additional cases:
- Organization-wide scope users (Owner) access all branches. Reports with `reports.organization.read` aggregate only the caller's organization.
- Permission and assignment changes take effect on the same node immediately and on other nodes within 60 s (TS-01-052, TS-01-071).
- UI gating is not tested as a control. The backend matrix is the control.
- Segregation of duties (BR-G-28): the requester cannot approve their own adjustment or transfer above threshold, which returns 403.

All 112 story scenarios tagged CS-07 run in this suite.

## 6. Input, injection, and file handling (S4)

| ID | Test | Expected |
|---|---|---|
| SEC-I-01 | SQL injection payloads in search, filter, sort parameters | No error leakage; sort accepts only allow-listed fields (400) |
| SEC-I-02 | Mass assignment (extra JSON fields like `organizationId`, `unitCost`, `status`) | Ignored or 400; never applied |
| SEC-I-03 | Over-posting money/quantity precision (e.g., 3 decimals, negative, 1e20) | 400 with field errors |
| SEC-I-04 | Unicode/RTL control characters, Arabic normalization edge cases in names and search | Stored safely; no spoofed rendering in receipts |
| SEC-I-05 | Stored XSS in medicine names, notes, supplier names rendered in React and PDF/receipt | Escaped everywhere; CSP blocks inline script |
| SEC-I-06 | File upload: wrong MIME vs extension, polyglot files, oversize, zip bombs, SVG with script | Rejected per allow-list; size limits enforced; malware scan hook invoked |
| SEC-I-07 | CSV/XLSX import formula injection (`=cmd…`) in exports | Exported cells prefixed/escaped |
| SEC-I-08 | API fuzzing (OpenAPI-driven) | No 500s with stack traces; Problem Details only |
| SEC-I-09 | Pagination abuse (`pageSize=100000`) | Capped at 100 |
| SEC-I-10 | Rate limits on expensive endpoints (search, exports) | 429 with `Retry-After` |

## 7. Sensitive data protection (S5)

| ID | Test | Expected |
|---|---|---|
| SEC-D-01 | Log scanning: run the full integration suite with a log sink that fails on patterns (JWT, password, refresh token, allergy/condition values, phone numbers in clear) | 0 matches (NFR-G-10) |
| SEC-D-02 | `patients.profiles.read` without `patients.medical.read` | Medical fields absent from responses (not null-filled with values) |
| SEC-D-03 | Every medical-data read | One `PatientAccessLog` row (BR-G-29); failure to log blocks the read (SPEC-07) |
| SEC-D-04 | Patient list/search responses | Phone masked per SPEC-07; no medical data in list endpoints |
| SEC-D-05 | Error responses | No stack traces, SQL, or internal IDs of other tenants |
| SEC-D-06 | Export endpoints | Require explicit permission, audited, links expire in 24 h |
| SEC-D-07 | Cost visibility | `unitCost`/margin fields only with `sales.sales.read-cost` / finance permissions |

## 8. Audit integrity (S6)

| ID | Test | Expected |
|---|---|---|
| SEC-L-01 | Every operation in the SPEC-10 sensitive-operation catalog | Exactly one audit row with actor, branch, before/after, correlation ID, in the same transaction |
| SEC-L-02 | Rollback of a business transaction | Its audit row is also absent |
| SEC-L-03 | UPDATE/DELETE on `audit_logs` by app role | Denied |
| SEC-L-04 | Tampered row (owner role) | Hash-chain verification job and endpoint report the break and notify |
| SEC-L-05 | Suspicious activity reports | Voids/overrides above thresholds flagged (US-10-07) |

## 9. Static and dynamic analysis (S7, S8)

| Tool / check | Threshold |
|---|---|
| CodeQL (C#, TypeScript) or Semgrep | 0 new High/Critical |
| `dotnet list package --vulnerable --include-transitive`, `npm audit --omit=dev` | 0 Critical; High requires accepted exception with expiry |
| gitleaks on every PR | 0 secrets |
| Container image scan (Trivy) | 0 Critical OS/library CVEs in `api`, `web`, `worker` images |
| OWASP ZAP baseline (nightly, staging) and authenticated API scan (release) | 0 High; Medium triaged |
| Security headers check | HSTS, CSP (no `unsafe-inline` scripts), `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'` |
| TLS check | TLS 1.2+ only; no weak ciphers |

## 10. Manual penetration test (S9)

**Scope:**
- business logic abuse: price manipulation, discount stacking, negative quantities, return-more-than-sold via races, void after close;
- tenant breakout;
- privilege escalation via custom roles;
- token handling;
- file upload;
- support access grants;
- the SignalR hub (group join for another organization or branch must be refused).

**Timing:** before the MVP go-live, then before each major release.

**Output:** findings with CVSS. Critical and High findings are fixed and retested before release.

## 11. Exit criteria

- S1–S6 are 100% passing; S7 and S8 thresholds are met.
- Pen-test findings: 0 open Critical/High.
- The threat model in SECURITY-ARCHITECTURE has been reviewed for the release's new endpoints.
- Every security-relevant regulatory item (REG-04, REG-10) has its configured default verified by test.
