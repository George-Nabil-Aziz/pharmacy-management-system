# Architecture Decision Records (ADRs)

This folder records significant architecture decisions for the Pharmacy Management System. Each ADR states the context, decision drivers, at least three considered options with pros and cons, the decision, consequences, risks and mitigations, revisit triggers, and related documents. Decisions are consistent with the technical baseline in [DOCUMENTATION-CONVENTIONS.md §7](../../DOCUMENTATION-CONVENTIONS.md).

## Index

| ADR | Title | Status | Date | Decision summary | Main specs affected |
|---|---|---|---|---|---|
| [ADR-001](ADR-001-ARCHITECTURE-STYLE.md) | Architecture Style | Accepted | 2026-11-09 | Modular monolith (.NET 10 LTS), Clean Architecture per module, schema per module, facades + outbox integration events | All |
| [ADR-002](ADR-002-MULTI-TENANCY.md) | Multi-Tenancy | Accepted | 2026-11-09 | Shared schema, `OrganizationId` discriminator, EF Core global query filters, mandatory tenant context, PostgreSQL RLS enabled from Foundation / MVP (amended 2026-11-10) | SPEC-01, SPEC-02, all |
| [ADR-003](ADR-003-INVENTORY-LEDGER.md) | Inventory Ledger | Accepted | 2026-11-09 | Append-only `StockMovement` + transactionally maintained `BatchBalance`; nightly reconciliation | SPEC-04, SPEC-05, SPEC-06, SPEC-09 |
| [ADR-004](ADR-004-FEFO-STRATEGY.md) | FEFO Strategy & Concurrency | Accepted | 2026-11-09 | FEFO default with permissioned override; pessimistic `FOR UPDATE` locks in batch-id order; `on_hand >= 0` check constraint | SPEC-04, SPEC-06 |
| [ADR-005](ADR-005-AUTHENTICATION.md) | Authentication | Accepted | 2026-11-09 | ASP.NET Core Identity core + 15-min asymmetric-signed JWT + hashed rotating refresh tokens with family reuse detection in HttpOnly cookie | SPEC-01 |
| [ADR-006](ADR-006-FILE-STORAGE.md) | File Storage | Accepted | 2026-11-09 | S3-compatible object storage (MinIO in dev/on-prem), private buckets, pre-signed short-lived URLs, `FileObject` metadata | SPEC-05, SPEC-08, SPEC-10 |
| [ADR-007](ADR-007-BACKGROUND-JOBS.md) | Background Jobs | Accepted | 2026-11-09 | Hangfire with `Hangfire.PostgreSql` storage (community-maintained — tracked risk), in-process server, optional worker host | SPEC-04, SPEC-09, SPEC-10 |
| [ADR-008](ADR-008-AUDIT-LOGGING.md) | Audit Logging | Accepted | 2026-11-09 | Same-transaction append-only `AuditLog` via SaveChanges interceptor + explicit audit events; per-organization hash chain | SPEC-10, all |
| [ADR-009](ADR-009-LOCALIZATION.md) | Localization | Accepted | 2026-11-09 | i18next/react-i18next; backend resource files with stable error codes; `ar`/`en`; RTL via `dir` + Tailwind logical properties | All (UI), SPEC-10 |
| [ADR-010](ADR-010-FRONTEND-STATE-MANAGEMENT.md) | Frontend State Management | Accepted | 2026-11-09 | TanStack Query for server state; Zustand for client state (POS cart, auth session, UI prefs) | SPEC-06, all (UI) |

## Status lifecycle

`Proposed` → `Accepted` → (`Deprecated` | `Superseded by ADR-NNN`). Accepted ADRs are not edited in substance; a change of decision requires a new ADR that supersedes the old one, and the old ADR's status is updated with a link.

## Candidate future ADRs

Decisions identified in `docs/2. Master SDD.md` §14 that are not yet covered by an ADR and should be recorded when their phase approaches:

- Payment integration boundaries (card terminals, mobile wallets) — currently manual recording of non-cash payments.
- Database migration and deployment strategy (EF Core migrations bundle vs. SQL scripts, zero-downtime rules).
- Audit and data retention periods (blocked on REG-05).
- OCR provider and human verification workflow (blocked on REG-10; see [ADVANCED-FEATURES.md](../../ADVANCED-FEATURES.md)).
- Drug reference data source for interaction/allergy alerts (blocked on REG-09).
- Electronic invoicing integration (blocked on REG-07).

## Template

```
# ADR-NNN: <Title>
| Field | Value |  (Status, Date, Deciders, Related BRQs/BR-G/REG, Related ADRs, Supersedes)
## 1. Context
## 2. Decision Drivers
## 3. Considered Options      (≥ 3, each with pros/cons)
## 4. Decision
## 5. Consequences            (positive / negative)
## 6. Risks and Mitigations
## 7. Revisit Triggers
## 8. Related Documents
```
