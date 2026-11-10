# ADR-005: Authentication — ASP.NET Core Identity Core + JWT Access Tokens + Rotating Opaque Refresh Tokens

| Field | Value |
|---|---|
| Status | Accepted — amended 2026-11-10 (claims per SPEC-01, ES256 and key rotation, CSRF controls, `ManagerOverride`, platform principals; see §8) |
| Date | 2026-11-09 |
| Deciders | Solution architect, security lead |
| Related BRQs | BRQ-01, BRQ-02, BRQ-12 |
| Related BR-G | BR-G-17, BR-G-30 |
| Related CS | CS-07, CS-08, CS-12 |
| Related ADRs | ADR-002, ADR-008, ADR-010 |
| Supersedes | — |

## 1. Context

Every user belongs to exactly one Organization (platform administrators to none) and is assigned to one or more Branches. The SPA (React) calls a REST API; SignalR is used for notifications. Pharmacy staff share workstations, so sessions must be revocable immediately on deactivation (BR-G-30), refresh-token theft must be detectable (CS-12), and POS manager overrides require re-authentication at the counter (BR-G-32). The product must be deployable for a single pharmacy without external identity infrastructure, and in SaaS mode.

## 2. Decision Drivers

1. **Self-contained deployment** — no mandatory external identity provider for single-pharmacy installations.
2. **Security** — modern password hashing, lockout, short-lived access tokens, refresh-token rotation with reuse detection, XSS-resistant token storage.
3. **Stateless API scaling** — access token validation without a database call per request.
4. **Immediate revocation** of refresh capability (BR-G-30).
5. **Tenant context in the token** — `organization_id` and branch scope for ADR-002.
6. **Future SSO** for chains that request it.

## 3. Considered Options

### Option A — ASP.NET Core Identity (core stores and hashers) + self-issued JWT + opaque refresh tokens (chosen)
- **Pros:** No external dependency; mature password hashing (PBKDF2, Identity v3 format) and lockout; full control over claims (organization, branches, permissions version); refresh rotation and family revocation implemented in-house against our own tables; works offline from the internet for on-premise installs.
- **Cons:** We own token issuance security (key management, rotation, revocation logic); MFA, SSO, and federation must be built or added later.

### Option B — External IdP (self-hosted Keycloak, or Microsoft Entra ID / other cloud IdP) with OIDC
- **Pros:** Mature MFA, SSO, federation, admin UI; standards-based OIDC flows; offloads credential storage.
- **Cons:** Additional infrastructure to run, secure, back up, and upgrade (Keycloak) or a cloud dependency with cost and data-residency questions (REG-04); multi-tenant mapping of organization/branch claims across realms adds complexity; heavy for single-pharmacy deployments; POS re-authentication for manager override is awkward with redirect flows.

### Option C — Cookie-only session via a Backend-for-Frontend (BFF)
- **Pros:** No tokens in the browser at all; simple CSRF-protected cookie session; immediate server-side revocation.
- **Cons:** Requires server-side session store (sticky sessions or distributed cache) and a BFF layer in front of the API; complicates SignalR and future mobile/API clients; partially duplicates what Option A achieves by keeping the refresh token in an HttpOnly cookie.

## 4. Decision

Adopt **Option A**:

1. **Credentials:** ASP.NET Core Identity core components (`UserManager`/password hasher, lockout) over the `identity` schema; no Identity UI. Lockout after 5 failed attempts for 15 minutes (initial values, configurable); `LoginAttempt` recorded.
2. **Access token (amended 2026-11-10):** JWT, lifetime **15 minutes**, signed with **ES256** (RS256 ≥ 2048 bits permitted only where an HSM requires it, NFR-01-007); keys stored in the secret store/KMS, never in source control or images. **Key rotation every 90 days:** the next key is published to the verification key set ≥ 24 h before it starts signing; the retired key remains verifiable ≥ 30 minutes after its last token expires, so rotation logs out no user; emergency rotation removes a compromised key immediately and revokes affected sessions. Claims are exactly those of SPEC-01 §8.4: `iss`, `aud` (`org` or `platform`), `sub`, `org` (absent for `platform`), `sid`, `stamp` (security stamp hash), `amr`, `iat`, `exp`, `jti`, header `kid`; support sessions add `sgid` and `act` (SPEC-02). Permissions and branch assignments are **not** in the token; they are resolved server-side per request from an authorization cache invalidated on change (≤ 60 s on all nodes, FR-01-025).
3. **Refresh token:** opaque random value (≥256 bits), stored **hashed** (`RefreshToken` with `FamilyId`), **14-day sliding / 30-day absolute** lifetime, rotated on every use. Reuse of a rotated token revokes the entire family and the session (CS-12) and writes a security audit event.
4. **Transport/storage:** refresh token in an `HttpOnly; Secure; SameSite=Strict` cookie scoped to path `/api/v1/auth` (platform: `/api/v1/platform/auth`); access token held **in memory only** in the SPA (Zustand auth store, ADR-010), never in `localStorage`. **CSRF controls for the refresh/logout endpoints (amended 2026-11-10):** `SameSite=Strict` + narrow cookie path; `POST` only; mandatory `X-Requested-With` header (forces a CORS preflight); `Origin` (or `Referer`) must match the SPA origin allow-list; CORS credentials allowed only on the auth paths. All other endpoints use bearer tokens and are not CSRF-exposed.
5. **Revocation (amended 2026-11-10):** deactivating a user, resetting or changing a password, or revoking a session revokes refresh tokens; the access-token check rejects tokens whose `sid` is revoked or whose `stamp` differs from the current security stamp within ≤ 60 s on all nodes (FR-01-011, stricter than BR-G-30's 15 minutes).
6. **SignalR:** access token passed via the `access_token` query string only on the hub negotiate/connect path, with log redaction (NFR-G-10).
7. **POS manager override (BR-G-32):** a dedicated endpoint verifies the approver's credentials and issues a single-use, short-lived (`ManagerOverrideTtlSeconds`, default 120 s) `ManagerOverride` bound to organization, branch, requesting user, approving user, permission and context hash; it is consumed inside the business transaction; no session is created for the approver (SPEC-01 FR-01-037..039, SPEC-06 §8.5).
8. **MFA** (TOTP) has priority P2 in SPEC-01 but is scheduled for V1 (RELEASE-PLAN §3); MFA for platform administrators is a SaaS launch gate (V1.3).
9. **Platform principals (amended 2026-11-10):** platform administrators are a separate `PlatformUser` store with platform sessions and refresh tokens, tokens with audience `platform`, and no organization claim; organization tokens are rejected on platform endpoints and vice versa (SPEC-01 FR-01-045).

## 5. Consequences

**Positive**
- Self-contained; works in all deployment models.
- Stateless access-token validation; fast authorization path.
- Refresh tokens unreadable by JavaScript; theft detection through family reuse.

**Negative**
- Key management and rotation are our responsibility (documented in security design).
- Up to 60-second window where a revoked session's access token remains usable (session/stamp cache refresh).
- SSO/federation requires later work (revisit trigger).

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Signing key compromise | Keys in secret store/env, not repo; rotation procedure; short access-token lifetime |
| CSRF on refresh endpoint | `SameSite=Strict`, path-scoped cookie, custom header requirement, origin check |
| XSS stealing access token from memory | Strict CSP, no `dangerouslySetInnerHTML`, dependency scanning; short token lifetime |
| Brute force / credential stuffing | Lockout, rate limiting on `/auth/login`, login attempt logging and alerts |
| Shared workstation sessions left open | Idle timeout in SPA; explicit "switch user" on POS; session list with revoke (`identity.sessions.revoke`) |

## 7. Revisit Triggers

- An organization requires enterprise SSO/federation → introduce an external IdP behind the same token contract (Option B as an add-on).
- Security review requires MFA for all roles.
- Native mobile or third-party API clients are added (consider OAuth2 client credentials / PKCE flows).

## 8. Amendment Log

| Date | Change | Source |
|---|---|---|
| 2026-11-10 | Token claims aligned with SPEC-01 §8.4 (no roles, branches or permission version in the token) | SPEC-01 |
| 2026-11-10 | ES256 signing, 90-day key rotation with ≥ 24 h pre-publication and ≥ 30 min overlap | SECURITY-ARCHITECTURE §3.3, NFR-01-007 |
| 2026-11-10 | CSRF controls for refresh/logout (SameSite=Strict, path, POST, `X-Requested-With`, Origin allow-list) | SECURITY-ARCHITECTURE §3.4 |
| 2026-11-10 | Revocation enforced ≤ 60 s via `sid`/`stamp`; `ManagerOverride` naming; separate platform principals; MFA scheduling | SPEC-01, SPEC-06 |

## 9. Related Documents

- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §5, §7, NFR-G-07
- [ADR-002](ADR-002-MULTI-TENANCY.md), [ADR-008](ADR-008-AUDIT-LOGGING.md), [ADR-010](ADR-010-FRONTEND-STATE-MANAGEMENT.md)
- SPEC-01 Identity & Access in [specs/](../../specs/)
- [SECURITY-ARCHITECTURE.md](../SECURITY-ARCHITECTURE.md) §3
