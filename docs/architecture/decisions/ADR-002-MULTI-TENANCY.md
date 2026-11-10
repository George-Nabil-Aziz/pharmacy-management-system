# ADR-002: Multi-Tenancy — Shared Schema with OrganizationId Discriminator, Global Query Filters, and Row-Level Security

| Field | Value |
|---|---|
| Status | Accepted — amended 2026-11-10 (RLS from Phase 0; decisions 9–11) |
| Date | 2026-11-09 |
| Deciders | Solution architect, security lead, product owner |
| Related BRQs | BRQ-01, BRQ-02, BRQ-08, BRQ-12 |
| Related BR-G | BR-G-01, BR-G-02, BR-G-17 |
| Related ADRs | ADR-001, ADR-005, ADR-008 |
| Supersedes | — |

## 1. Context

The product must serve three deployment models with one codebase: a single pharmacy (one Organization, one Branch), a pharmacy chain (one Organization, many Branches), and SaaS (many Organizations operated by a platform administrator). The **Organization** is the tenant boundary (conventions §2). Data of one Organization must never be visible to another (BRQ-02; CS-08 requires cross-organization access to return 404 with no data leaked). Within an Organization, branch-level authorization is a separate concern handled by the authorization model (conventions §5.3), not by the tenancy mechanism.

The owner's Master SDD listed "single organization versus SaaS multi-tenancy" as a pending decision. Expected scale: hundreds of organizations, each up to ~50 branches, 50,000 medicines and 500,000 batches (NFR-G-01).

## 2. Decision Drivers

1. **Isolation strength** — a missing `WHERE` clause must not leak data across organizations.
2. **Operational cost** — migrations, backups, monitoring, and connection pooling must stay manageable for hundreds of organizations.
3. **Uniform model for all deployment models** — a single pharmacy is just one Organization.
4. **Platform-level operations** — onboarding an organization must be a data operation, not an infrastructure provisioning step.
5. **Reporting** — organization-level reports across branches must be efficient; cross-organization reports are only for platform metrics (non-business data).
6. **Data residency / per-tenant restore requests** — must remain possible, even if more expensive (REG-04).

## 3. Considered Options

### Option A — Database per organization
- **Pros:** Strongest isolation; per-organization backup/restore and residency trivial; noisy-neighbor impact limited; easy to delete an organization entirely.
- **Cons:** Migrations must run against N databases (drift risk); connection pool per database inflates resource use; provisioning step at onboarding; platform-level analytics require fan-out; cost prohibitive for small pharmacies on shared SaaS.

### Option B — Schema per organization (same database)
- **Pros:** Good logical isolation; per-schema dump possible; single server.
- **Cons:** Conflicts with ADR-001's schema-per-module layout (would need schema-per-module-per-organization, i.e., 10 × N schemas); PostgreSQL catalog bloat and migration time grow linearly with N; EF Core model caching per schema is awkward; still needs connection `search_path` handling that is easy to get wrong.

### Option C — Shared database, shared schema, `OrganizationId` discriminator, application filtering only
- **Pros:** Simplest operations; one migration; efficient pooling; trivial onboarding.
- **Cons:** Isolation depends entirely on application code; a single missed filter (raw SQL, report query, background job) leaks data.

### Option D — Shared schema + discriminator + EF Core global query filters + mandatory tenant context + PostgreSQL Row-Level Security (chosen)
- **Pros:** Operational simplicity of Option C; two independent layers of defense: (1) EF Core global query filters driven by a mandatory `ITenantContext` that throws if unset; (2) PostgreSQL RLS policies `organization_id = current_setting('app.organization_id')::uuid` on every tenant-owned table, so raw SQL and reporting queries are also constrained; composite indexes lead with `organization_id`.
- **Cons:** RLS adds per-query overhead (small, measurable) and complexity in setting the session variable on pooled connections; background jobs and platform operations must explicitly set or bypass context through a controlled, audited path; per-organization restore requires logical export rather than a database restore.

## 4. Decision

Adopt **Option D**:

1. Every tenant-owned table has `organization_id uuid NOT NULL`; branch-scoped tables additionally have `branch_id uuid NOT NULL`. All unique constraints and most indexes are prefixed with `organization_id`.
2. The tenant context (`OrganizationId`, `UserId`, assigned branches, scope) is resolved from the validated JWT (ADR-005) per request; it is **mandatory** — repository/DbContext access without context throws.
3. EF Core global query filters on every tenant-owned entity apply `OrganizationId == context.OrganizationId`. Ignoring filters (`IgnoreQueryFilters`) is permitted only in the platform module and is caught by an architecture test elsewhere.
4. PostgreSQL RLS policies are **created and ENABLED (`ENABLE` + `FORCE ROW LEVEL SECURITY`) from the Foundation phase and are part of the MVP / first deployable release** (session variable `app.organization_id` set via `SET LOCAL` at transaction start by a connection interceptor). Critical tenant-isolation controls are never deferred. *(Amended 2026-11-10 by product-owner decision: originally planned for the security-hardening phase.)* The application connects with a role that does not bypass RLS; migrations run with a separate owner role.
5. Background jobs carry `OrganizationId` in their payload and establish a tenant context before executing; platform-wide jobs (e.g., nightly expiry flagging) iterate organizations explicitly.
6. Cross-organization requests return **404** (CS-08); out-of-scope branch requests within the organization return **403** (CS-07).
7. `PLATFORM_ADMIN` has no access to organization business data except via an audited, time-limited `SupportAccessGrant` approved by the Owner (SPEC-02).
8. A per-organization logical export/restore procedure is documented for data portability and residency requests (pending REG-04).
9. **Session variable mechanics (amended 2026-11-10):** the interceptor sets `app.organization_id` with `set_config(..., false)` when the request- or job-scoped connection opens (covering reads outside explicit transactions) and re-asserts it with `SET LOCAL` at the start of every explicit transaction; Npgsql pool reset (`DISCARD ALL`) clears it on return. An unset variable matches no rows (DATABASE-DESIGN §12.2).
10. **Database roles (amended 2026-11-10):** `pms_owner` (migrations), `pms_app` (runtime, no `BYPASSRLS`, insert/select only on ledgers and audit), `pms_audit_sealer` (seal columns and chain heads only, ADR-008), `pms_platform` (`BYPASSRLS`, used only by platform-console endpoints and cross-organization job enumeration, every use audited on the `platform` chain), `pms_readonly`, `pms_backup`. Support-grant requests run as `pms_app` with the granted organization as tenant context, never as `pms_platform`.
11. **Tenant-scoped encryption keys (amended 2026-11-10):** selected restricted columns (patient national ID with an HMAC blind index; free-text health narratives such as patient notes, allergy/condition free text, prescription notes, OCR raw text) are encrypted at application level with AES-256-GCM using a per-organization data-encryption key wrapped by a key-encryption key in the secret store/KMS (SECURITY-ARCHITECTURE §8.3). Associated data binds ciphertext to table, column, row id and organization id.

## 5. Consequences

**Positive**
- One schema and migration path for all deployment models; onboarding is an insert.
- Defense in depth: a defect must exist in both the application filter and the RLS policy to leak data.
- Efficient organization-level reporting with `organization_id`-prefixed indexes.

**Negative**
- Every query carries the discriminator; developers must not hand-write SQL without the tenant session variable.
- Noisy-neighbor effects are possible in SaaS (one large organization's reports affect others); requires query timeouts and background exports (NFR-G-03).
- Per-organization point-in-time restore is not possible with physical backups; only logical export.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Missing filter in raw SQL / Dapper report queries | RLS enforced in production; report queries run through a helper that asserts session variable is set; CS-08 tests per endpoint |
| Session variable leaks between pooled connections | Set on connection open and re-asserted with `SET LOCAL` per transaction; Npgsql `DISCARD ALL` on return; integration test with pool reuse |
| RLS performance overhead | Benchmark against NFR-G-01/02 before enabling; policies use simple equality on indexed column |
| Platform admin overreach | No implicit bypass; support grants time-limited, audited (ADR-008) |
| Large-organization noisy neighbor | Statement timeouts; heavy reports as background exports; revisit trigger below |

## 7. Amendment Log

| Date | Change | Source |
|---|---|---|
| 2026-11-10 | RLS enabled and forced from Phase 0 / MVP (originally planned for the security-hardening phase) | Product-owner decision |
| 2026-11-10 | Session-variable mechanics, database role set, per-organization envelope encryption keys (decisions 9–11) | SECURITY-ARCHITECTURE §4.2, §8.3; DATABASE-DESIGN §12 |

## 8. Revisit Triggers

- A customer contractually requires dedicated database or in-country isolated hosting (outcome of REG-04) — consider a hybrid: Option D by default, Option A for premium/regulated organizations, same schema.
- Any single organization exceeds ~20% of total database load.
- RLS overhead measured > 10% on NFR-G-01/NFR-G-02 benchmarks.

## 9. Related Documents

- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §5.3, §6, §7
- [ADR-001](ADR-001-ARCHITECTURE-STYLE.md), [ADR-005](ADR-005-AUTHENTICATION.md), [ADR-008](ADR-008-AUDIT-LOGGING.md)
- [REGULATORY-CONSIDERATIONS-EGYPT.md](../../REGULATORY-CONSIDERATIONS-EGYPT.md) — REG-04
- SPEC-01 (Identity & Access), SPEC-02 (Organization & Branches) in [specs/](../../specs/)
