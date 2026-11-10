# ADR-008: Audit Logging — Same-Transaction Append-Only AuditLog with Per-Organization Hash Chain

| Field | Value |
|---|---|
| Status | Accepted — amended 2026-11-10 (asynchronous sealer, external anchoring, sealer role; see §9) |
| Date | 2026-11-09 |
| Deciders | Solution architect, security lead, product owner |
| Related BRQs | BRQ-01, BRQ-08, BRQ-12 |
| Related BR-G | BR-G-16, BR-G-25, BR-G-29, BR-G-34 |
| Related REG | REG-02, REG-04, REG-05 |
| Related ADRs | ADR-001, ADR-002, ADR-007 |
| Supersedes | — |

## 1. Context

Every sensitive operation (SPEC-10 sensitive-operation catalog: e.g., sale void, discount override, stock adjustment approval, FEFO override, controlled-medicine dispensing, role/permission change, support access grant, price change, patient data export) must produce an audit entry atomically with the operation (BR-G-16) and be tamper-evident (BRQ-12). Patient medical-data reads must be access-logged (BR-G-29). Audit entries must never be modified or deleted by application users (BR-G-25, BR-G-34); retention is pending REG-05. Operational logs (Serilog) are a separate concern and must not contain patient medical data (NFR-G-10).

## 2. Decision Drivers

1. **Atomicity** — no operation without its audit entry, no audit entry for a rolled-back operation.
2. **Tamper evidence** — detect modification or deletion of audit rows, including by privileged DB users.
3. **Queryability** — owners/managers search audit history by user, entity, action, branch, and date within the app.
4. **Performance** — negligible impact on sale completion latency (NFR-G-02).
5. **Simplicity** — no extra infrastructure for single-pharmacy deployments.
6. **Separation** from technical logs and from the patient access log.

## 3. Considered Options

### Option A — Audit via application logs (Serilog sink to files/ELK)
- **Pros:** Trivial to add; no schema.
- **Cons:** Not transactional (entries for rolled-back operations or lost entries on crash); easily altered; hard to query per entity in-app; mixes with technical logs and violates log-content restrictions.

### Option B — Database triggers capturing row changes (generic history tables)
- **Pros:** Captures all changes regardless of code path, including manual SQL.
- **Cons:** Captures *data* changes, not *business intent* (who approved, why, override reason); no user context without session variables; noisy; hard to evolve; trigger logic is hidden from application tests.

### Option C — Event-sourced / external append-only store (e.g., dedicated ledger database or WORM storage)
- **Pros:** Strong immutability guarantees; independent of OLTP database.
- **Cons:** Not in the same transaction (needs outbox → eventual consistency); additional infrastructure; overkill for v1.

### Option D — Application-level append-only `AuditLog` table written in the same transaction via EF Core SaveChanges interceptor + explicit domain audit events, with per-organization hash chain (chosen)
- **Pros:** Atomic with the business operation; captures business intent (action code, reason, approver) plus field-level changes for tracked entities; queryable in-app; hash chain detects tampering; no extra infrastructure.
- **Cons:** A privileged DB user could still delete the tail of the chain (detected by anchoring); hash chaining serializes inserts per organization (contention point); code paths bypassing EF would not be captured (mitigated by architecture rules).

## 4. Decision

Adopt **Option D**:

1. **Table** `platform.audit_logs` (`AuditLog`, attributes per SPEC-10 §8.1): Id (UUIDv7), ChainKey (organization id or `platform`), OrganizationId, BranchId?, EventCode (e.g., `SALES.SALE_VOIDED`), Category, Outcome, ActorUserId?, ActorType, SupportGrantId?, EntityType, EntityId, Changes (jsonb: changed fields only; secrets never stored; patient medical values stored as SHA-256 hashes), Metadata, IpAddress, UserAgent, CorrelationId, OccurredAt, and the seal columns ChainSequence, PreviousHash, Hash, SealedAt (NULL until sealed).
2. **Writing:** an EF Core `SaveChangesInterceptor` records field-level changes for entities marked `[Audited]`; application services raise explicit `AuditEvent`s for business actions (void, override, approval, export). Both are persisted in the **same transaction** as the operation.
3. **Hash chain (amended 2026-11-10):** one chain per organization plus a `platform` chain. Business transactions only **insert** unsealed rows. An **asynchronous sealer** (every 10 s) seals committed unsealed rows per chain in visibility order, assigning a gapless `ChainSequence`, `PreviousHash` (64 zeros for sequence 1) and `Hash = hex(SHA-256(canonical ‖ PreviousHash))`, and updates `AuditChainHead` in the same transaction; p95 sealing lag ≤ 60 s; chain order = seal order (SPEC-10 FR-10-009, OD-10-02). This replaces the original synchronous chain-head `FOR UPDATE` at commit, which would have serialized every audited transaction of an organization.
4. **Verification and anchoring (amended 2026-11-10):** chains are verified nightly (02:30 `Africa/Cairo`) from the last checkpoint and on demand; a mismatch, gap, or entry unsealed for more than 15 minutes is a failure with a mandatory Owner notification and an operations alert (FR-10-010, FR-10-011). **External anchoring is V1 hardening:** a daily job writes a signed digest of every chain head (chain key, last sequence, head hash, date) to `AuditChainAnchor` and exports it to an object-storage bucket with object lock (WORM, retention ≥ the audit retention period, separate credentials), so that a consistent rewrite of a chain by a database superuser becomes detectable.
5. **Immutability and roles (amended 2026-11-10):** the application DB role (`pms_app`) has `INSERT`/`SELECT` only on audit tables. A separate `pms_audit_sealer` role may only set the four seal columns once (from NULL, enforced by trigger) and maintain `AuditChainHead`/`AuditChainAnchor`; every `DELETE` is rejected. Retention purge (after REG-05 confirmation) is a separate privileged, audited procedure that records a chain checkpoint.
6. **Patient access log:** `PatientAccessLog` (SPEC-07) records reads of medical data (BR-G-29) — kept separate due to volume, but follows the same append-only rule.
7. **Security events** (login failure, lockout, token family revocation, permission changes) are audit entries with action codes in the `identity.*` namespace.
8. **Querying:** `audit.logs.read` permission; cursor pagination; filters by date range, user, action, entity, branch; export via background job (`reports.export`).

## 5. Consequences

**Positive**
- Audit entries exist if and only if the operation committed.
- Tampering with historical rows is detectable by chain verification.
- Rich, business-meaningful audit trail queryable in-app.

**Negative**
- Sealing is asynchronous: an entry is tamper-evident only after it is sealed (p95 ≤ 60 s); unsealed entries older than 15 minutes are a verification failure.
- Storage growth; partitioning by month planned.
- Masking rules must be maintained for sensitive fields (passwords never present; patient medical fields masked in `Changes`).

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Chain-head lock contention at busy organizations | Removed by the asynchronous sealer (amendment 2026-11-10); only the sealer locks the chain head |
| Sealer outage | Backlog sealed on recovery; unsealed age > 15 min alerts (FR-10-011) |
| Developers forget explicit audit events | Sensitive-operation catalog in SPEC-10 mapped to tests; each story's ACs include audit assertions |
| Privileged DB tampering | DB role separation (`pms_app`, `pms_audit_sealer`); nightly verification; daily signed head digest in WORM object storage (V1) |
| Sensitive data leaking into audit `Changes` | Field-level masking attributes; review in security checklist |

## 7. Revisit Triggers

- Audit append adds > 50 ms p95 to sale completion.
- REG-02/REG-05 outcomes require certified/WORM storage or specific audit formats.
- Audit volume exceeds 100 million rows per year in a single organization.

## 8. Amendment Log

| Date | Change | Source |
|---|---|---|
| 2026-11-10 | Synchronous chain-head lock replaced by the asynchronous sealer (10 s) writing seal columns on `AuditLog` and `AuditChainHead` | SPEC-10 FR-10-009, OD-10-02 |
| 2026-11-10 | External anchoring of daily signed chain-head digests to WORM object storage promoted to V1 hardening | Coordinator decision; SECURITY-ARCHITECTURE §13 |
| 2026-11-10 | Separate `pms_audit_sealer` DB role; medical values in diffs stored as SHA-256 hashes | SPEC-10 FR-10-003, FR-10-004 |

## 9. Related Documents

- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §4, §6, §7
- [ADR-007](ADR-007-BACKGROUND-JOBS.md)
- [SECURITY-ARCHITECTURE.md](../SECURITY-ARCHITECTURE.md) §13, [DATABASE-DESIGN.md](../DATABASE-DESIGN.md) §3.10, §10
- SPEC-10 Notifications, Audit & Settings; SPEC-07 Patient Records in [specs/](../../specs/)
- [REGULATORY-CONSIDERATIONS-EGYPT.md](../../REGULATORY-CONSIDERATIONS-EGYPT.md)
