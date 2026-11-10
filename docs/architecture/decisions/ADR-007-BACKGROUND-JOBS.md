# ADR-007: Background Jobs — Hangfire with PostgreSQL Storage

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, DevOps lead |
| Related BRQs | BRQ-10, BRQ-11, BRQ-14 |
| Related ADRs | ADR-001, ADR-003, ADR-006, ADR-008 |
| Supersedes | — |

## 1. Context

The system needs reliable asynchronous and scheduled work:

| Job | Type | Owner spec |
|---|---|---|
| Outbox dispatcher (integration events, notifications, SignalR pushes) | Continuous / short interval | SPEC-10 |
| Nightly batch expiry flagging (`Expired` status) and near-expiry alerts | Recurring, per branch time zone | SPEC-04 / SPEC-10 |
| Low-stock evaluation against `ReorderSetting` | Recurring | SPEC-04 / SPEC-10 |
| Nightly ledger reconciliation (ADR-003) | Recurring | SPEC-04 |
| `DailyBranchSummary` projection build | Recurring + on demand | SPEC-09 |
| Large report exports (NFR-G-03) | Fire-and-forget, user-triggered | SPEC-09 |
| Medicine catalog import | Fire-and-forget | SPEC-03 |
| Orphan file cleanup, idempotency record purge (24 h) | Recurring | SPEC-10 |
| Audit hash-chain verification (ADR-008) | Recurring | SPEC-10 |
| Backup verification hooks | Recurring | SPEC-10 |

Requirements: persistence across restarts, retries with backoff, visibility (dashboard), multi-instance safety (a recurring job runs once even with several app replicas), per-organization tenant context, and no additional infrastructure beyond PostgreSQL where possible.

## 2. Decision Drivers

1. **Durability** — jobs survive restarts and deployments.
2. **No new infrastructure** — reuse PostgreSQL; no message broker required for v1.
3. **Operability** — dashboard to inspect, retry, and delete jobs; metrics.
4. **Distributed safety** — recurring jobs execute once across replicas.
5. **Team familiarity and ecosystem maturity** in .NET.
6. **Licensing** — free tier sufficient for v1.

## 3. Considered Options

### Option A — Hangfire with PostgreSQL storage (chosen)
- **Pros:** Mature, widely used .NET job library; persistent fire-and-forget, delayed, recurring (cron with time zones) and continuation jobs; automatic retries; built-in dashboard; distributed locks for recurring jobs; can run in-process or in a separate worker host with the same code; LGPL core usable commercially.
- **Cons:** The PostgreSQL storage provider (`Hangfire.PostgreSql`) is a **community-maintained package**, not maintained by the Hangfire core vendor — upgrade cadence and fixes depend on community maintainers; polling-based storage adds DB load; dashboard needs securing; some advanced features (batches, throttling) are in paid Hangfire Pro.

### Option B — Quartz.NET with ADO.NET job store (PostgreSQL)
- **Pros:** Powerful scheduling (calendars, misfire policies); clustering support; vendor-supported PostgreSQL job store; Apache 2.0 license.
- **Cons:** No built-in dashboard (third-party only); fire-and-forget queuing with retries less ergonomic; more boilerplate; job data serialization and DI integration require more care.

### Option C — ASP.NET Core hosted services (`BackgroundService`) only, with custom tables
- **Pros:** No dependency; full control; minimal footprint.
- **Cons:** Must build persistence, retries, scheduling, distributed locking, and observability ourselves — significant hidden cost and bug risk; no dashboard.

### Option D — Message broker (e.g., RabbitMQ) with consumers
- **Pros:** Scales and decouples well; standard for microservices.
- **Cons:** New infrastructure for every deployment including single pharmacies; scheduling still requires another tool; unnecessary inside a modular monolith (ADR-001).

## 4. Decision

Adopt **Option A — Hangfire with `Hangfire.PostgreSql` storage**:

1. Hangfire storage uses a dedicated schema (`hangfire`) in the application database.
2. The Hangfire server runs **in-process** in the API host by default; the same image can run as a **separate worker host** (environment flag disables HTTP endpoints) for larger deployments.
3. Queues: `critical` (outbox dispatch), `default` (alerts, projections), `reports` (exports/imports), so long-running exports cannot starve outbox dispatch.
4. Every job payload includes `OrganizationId` (and `BranchId` when relevant) and a `CorrelationId`; a job filter establishes tenant context (ADR-002) and logging scope. Platform-wide recurring jobs enumerate organizations and enqueue per-organization child jobs.
5. Jobs are **idempotent** (safe to retry); business effects of jobs (e.g., expiry flagging) go through module facades and are audited where sensitive.
6. Recurring jobs that depend on business date (expiry flagging) run per branch time zone (`Africa/Cairo` default, BR-G-23).
7. Execution history summarized into `BackgroundJobRun` for in-app operational monitoring (SPEC-10). The Hangfire dashboard is exposed only to platform operators behind authentication and network restrictions.
8. Hangfire is wrapped behind an `IJobScheduler` abstraction so the provider can be replaced.

## 5. Consequences

**Positive**
- Durable, observable background processing without additional infrastructure.
- Same mechanism for outbox dispatch, schedules, and user-triggered exports.
- Horizontal scaling by adding worker hosts.

**Negative**
- Additional polling load on PostgreSQL; must be tuned (poll interval, queue count).
- Dependency on a community-maintained storage provider.
- Hangfire's serialization of job arguments requires discipline (small payloads, ids not entities).

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `Hangfire.PostgreSql` is community-maintained: slower fixes, possible incompatibility with new .NET/Npgsql/PostgreSQL versions | Pin versions; include in dependency-update review; upgrade testing in CI against PostgreSQL 17; `IJobScheduler` abstraction allows switching to Quartz.NET (Option B); monitor project activity as a revisit trigger |
| Polling load affects OLTP latency | Tune `QueuePollInterval`; separate worker host; measure against NFR-G-02 |
| Dashboard exposure | Platform-operator-only authorization; not reachable from public network in SaaS |
| Non-idempotent jobs double-apply effects on retry | Idempotency by design; job-level dedup keys; tests that run each job twice |
| Long export jobs blocking critical work | Separate queues and worker counts |

## 7. Revisit Triggers

- `Hangfire.PostgreSql` becomes unmaintained (no release supporting a required .NET/Npgsql/PostgreSQL version within 3 months of need) or has an unresolved critical defect.
- Job volume makes polling a measurable contributor to DB load (>5% of DB CPU).
- Need for cross-service messaging (module extraction) → introduce a broker for integration events while keeping scheduling.

## 8. Related Documents

- [ADR-001](ADR-001-ARCHITECTURE-STYLE.md) — outbox pattern
- [ADR-003](ADR-003-INVENTORY-LEDGER.md) — reconciliation job
- [ADR-008](ADR-008-AUDIT-LOGGING.md) — hash-chain verification job
- SPEC-10 Notifications, Audit & Settings in [specs/](../../specs/)
