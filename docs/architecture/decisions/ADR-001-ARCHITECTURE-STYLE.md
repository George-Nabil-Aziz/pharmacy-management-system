# ADR-001: Architecture Style — Modular Monolith with Clean Architecture per Module

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, technical lead, product owner |
| Related BRQs | BRQ-02, BRQ-05, BRQ-12, BRQ-14 |
| Related ADRs | ADR-002, ADR-003, ADR-007, ADR-008 |
| Supersedes | — |

## 1. Context

The Pharmacy Management System covers ten business capabilities (SPEC-01 … SPEC-10): identity, organizations and branches, medicine catalog, batch inventory, procurement, POS sales, patients, prescriptions, finance, and notifications/audit/settings. Several critical workflows cross module boundaries and must be strictly atomic (BR-G-09, BR-G-19, BR-G-35). For example, completing a sale must, in one database transaction, allocate batches (Inventory), write stock movements, record payments and cash movements (Sales), link dispensing records (Prescriptions), assign an invoice number (Organization document sequences), and write audit entries (Audit).

The development team is small, the product must ship incrementally (Foundation → Catalog & Inventory → … → Production Readiness), and it must be deployable both for a single pharmacy on modest infrastructure and as a multi-organization SaaS (BRQ-02). The owner's Master SDD (`docs/2. Master SDD.md`) already names "Modular Monolith + Clean Architecture" as the intended style; this ADR records the rationale, the alternatives, and the rules that keep the boundaries real.

## 2. Decision Drivers

1. **Transactional integrity across modules** — sale, return, receipt, transfer, and dispensing workflows must commit or roll back as a unit (BR-G-09, BR-G-19).
2. **Team size and delivery speed** — a small team cannot afford the operational overhead of many independently deployed services.
3. **Deployment simplicity** — single-pharmacy installations need a footprint of one application container plus PostgreSQL and object storage.
4. **Evolvability** — module boundaries must be explicit so a module could be extracted later if scale or organizational needs require it.
5. **Testability** — domain rules (FEFO, return limits, money rounding) must be unit-testable without infrastructure.
6. **Enforceable boundaries** — boundaries must be checked automatically, not by convention alone.

## 3. Considered Options

### Option A — Layered monolith (single Domain/Application/Infrastructure/API projects for the whole system)
- **Pros:** Simplest to start; the owner's initial solution sketch (`Pharmacy.Domain`, `Pharmacy.Application`, …) follows it; single transaction trivially available.
- **Cons:** Business capabilities are mixed inside each layer; coupling grows unchecked ("big ball of mud" risk); no clear ownership of tables; extraction later is very expensive; harder parallel work across teams.

### Option B — Microservices (one deployable service per module)
- **Pros:** Independent deployment and scaling; strong runtime isolation; technology freedom per service.
- **Cons:** Cross-module atomic workflows (sale completion) would require sagas/compensations and eventual consistency — directly conflicts with BR-G-09/BR-G-19/BR-G-35 and raises oversell risk; high operational cost (service discovery, distributed tracing, multiple databases, network failure modes); unaffordable for single-pharmacy deployments; premature for current scale (NFR-G-02 targets fit comfortably in one process).

### Option C — Modular monolith with Clean Architecture per module (chosen)
- **Pros:** Single deployable and single PostgreSQL database permit local ACID transactions across modules; explicit module boundaries (one DB schema per module, public contracts only); each module internally layered (Domain / Application / Infrastructure / Api contracts) and testable; low operational footprint; extraction path preserved through contracts and integration events.
- **Cons:** Boundaries can erode without automated enforcement; all modules share a release cadence and a runtime (a memory leak in one affects all); scaling is whole-application (horizontal replicas) rather than per module.

### Option D — Modular monolith with vertical slices only (no per-module layering)
- **Pros:** Less ceremony per feature; feature code co-located.
- **Cons:** Domain invariants (inventory ledger, money) risk being duplicated across slices; weaker separation of domain from infrastructure; the team prefers Clean Architecture's explicit dependency rule for critical domains. (Vertical-slice organization *inside* a module's Application layer remains permitted.)

## 4. Decision

Adopt **Option C**: a single ASP.NET Core host on **.NET 10 LTS** composed of ten modules aligned with SPEC-01 … SPEC-10. Rules:

1. **Module structure:** each module has `Domain`, `Application`, `Infrastructure`, and `Api` (contracts/endpoints) projects. Dependencies point inward (Infrastructure → Application → Domain).
2. **Data ownership:** each module owns one PostgreSQL schema (`identity`, `org`, `catalog`, `inventory`, `procurement`, `sales`, `patients`, `prescriptions`, `finance`, `platform`) and its own EF Core `DbContext`. No module reads or writes another module's tables directly.
3. **Cross-module communication:**
   - *Synchronous, same transaction:* through a module's **public facade interface** (e.g., `IInventoryAllocationService`) published in its contracts assembly. MediatR-style requests/handlers are internal to a module.
   - *Asynchronous:* through **integration events** written to the transactional outbox (`OutboxMessage`) and dispatched by a background worker (ADR-007).
4. **Shared transaction:** when a workflow spans modules (e.g., sale completion), the modules' DbContexts share one `NpgsqlConnection`/`DbTransaction` provided by a unit-of-work in the host; the originating module's application service owns the transaction boundary.
5. **Enforcement:** architecture tests (e.g., NetArchTest-style rules in `tests/ArchitectureTests`) fail the build if a module references another module's non-contract assembly or another schema's entities.
6. **Shared kernel:** limited to primitives (Money, identifiers, Result/Error types, tenant context, clock abstraction). No business logic.

## 5. Consequences

**Positive**
- Cross-module workflows are ACID; oversell and partial-state risks are controlled with database transactions and locks (ADR-003, ADR-004).
- One container image + PostgreSQL + S3-compatible storage is the full runtime footprint.
- Clear ownership of entities, permissions, and error codes per module maps 1:1 to SPEC/EPIC documents.
- Module extraction remains possible: facades become HTTP/gRPC clients and outbox events become broker messages.

**Negative**
- Shared-transaction coordination across DbContexts adds infrastructure complexity and must be tested (CS-10).
- A defect in one module can affect availability of all modules; mitigated by bulkheading background work (ADR-007) and health checks.
- Discipline is required to keep facades coarse-grained and to avoid "chatty" cross-module calls.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Boundary erosion (direct table access across schemas) | Architecture tests in CI; per-module DbContext only maps its own schema; code review checklist |
| Cross-module transaction misuse creates long-held locks | Facade methods documented with lock behavior; NFR-G-02 load tests; lock ordering by batch id (ADR-004) |
| Integration events lost or duplicated | Transactional outbox + idempotent consumers keyed by message id |
| Growing build time / coupling of releases | Modules compiled as separate projects; incremental builds; feature flags for staged rollout |

## 7. Revisit Triggers

- Sustained load exceeding NFR-G-02 targets that horizontal scaling of the single host cannot meet.
- A module requiring an independent release cadence or a separate team owning it end-to-end.
- A module needing a fundamentally different runtime or data store (e.g., analytics warehouse for advanced analytics).
- Architecture tests repeatedly suppressed, indicating boundaries are wrong.

## 8. Related Documents

- [MASTER-SDD.md](../../MASTER-SDD.md) — module catalog and high-level architecture
- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §6, §7
- [ADR-002](ADR-002-MULTI-TENANCY.md), [ADR-003](ADR-003-INVENTORY-LEDGER.md), [ADR-007](ADR-007-BACKGROUND-JOBS.md), [ADR-008](ADR-008-AUDIT-LOGGING.md)
- Source input: `docs/2. Master SDD.md` §1, §2, §4
