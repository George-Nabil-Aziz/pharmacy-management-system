# Implementation Execution Plan — MVP (R1) and V1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Each phase gets its own detailed, step-level plan (written with superpowers:writing-plans) **before** the phase starts. Phase 0 is already detailed: [2026-11-10-phase-0-foundation.md](2026-11-10-phase-0-foundation.md).

**Goal:** Deliver the MVP (134 stories, RELEASE-PLAN §4) and then V1 as small, ordered, independently testable tasks.

**Architecture:** ASP.NET Core .NET 10 modular monolith with Clean Architecture modules; PostgreSQL 17 with RLS enabled from the first migration; React + TypeScript frontend. Details are in `docs/architecture/*` and ADR-001…ADR-010.

**Tech Stack:** .NET 10, EF Core 10 + Npgsql, PostgreSQL 17, FluentValidation, Serilog, OpenTelemetry, Hangfire, MinIO/S3, SignalR (V1), React 18, TypeScript, Vite, Tailwind, TanStack Query, Zustand, React Hook Form, Zod, i18next, xUnit, Testcontainers, NetArchTest, Vitest, RTL, Playwright, k6.

**Spec:**
- [docs/MASTER-SDD.md](../../MASTER-SDD.md);
- specs SPEC-01…SPEC-10;
- stories in `docs/stories/EPIC-*`;
- [IMPLEMENTATION-ROADMAP.md](../../roadmap/IMPLEMENTATION-ROADMAP.md);
- [DEFINITION-OF-DONE.md](../../roadmap/DEFINITION-OF-DONE.md).

## Global Constraints

- Every task satisfies the story-level [Definition of Done](../../roadmap/DEFINITION-OF-DONE.md) (D1–D29) for the stories it implements.
- **Tenant isolation:** every tenant table has `organization_id NOT NULL` plus an EF global filter plus RLS (`ENABLE` + `FORCE` + policy) created **in the same migration** (ADR-002 amended 2026-11-10). Every endpoint has a permission policy, and branch routes carry branch authorization. Other organization → 404; other branch or missing permission → 403.
- **Stock changes:** only through the Inventory posting service. `StockMovement` and `BatchBalance` are written in the same transaction as the document. Locks are taken in BatchId order with `lock_timeout` 3 s, which returns 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1`.
- **Money:** `decimal`/`numeric` only; unit 4 dp; document 2 dp; `MidpointRounding.AwayFromZero` at line level (BR-G-18).
- **Idempotency:** `Idempotency-Key` is required on the endpoints listed in conventions §7 and API-DESIGN §9.
- **Audit:** every sensitive operation in the SPEC-10 catalog is audited in the same transaction.
- **Frontend:** no hard-coded strings (i18next `ar` + `en`); logical CSS properties; keyboard-operable POS.
- **Tests:** test names or traits carry TS/CS IDs. The integration tests use PostgreSQL 17 Testcontainers with RLS on.
- **No git repository yet** (owner decision 2026-11-10). Commit steps start once the owner approves repository creation.

## How to read the task tables

Each task has:
- an **ID** `T-<phase>.<n>` and an objective;
- the **stories** it implements, whose ACs are the acceptance criteria;
- the tasks it **depends on**;
- the **modules/files** it touches;
- the key **tests**;
- the **done-when** condition.

A task is sized to 1–5 developer-days and ends with an independently testable deliverable.

---

## Phase 0 — Foundation (detailed plan: [phase-0-foundation](2026-11-10-phase-0-foundation.md))

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| **T-0.1** | Solution skeleton, health endpoint, first architecture rule | — | — | `Pharmacy.sln`, `Directory.*.props`, `src/Host`, `src/BuildingBlocks/*`, `src/Modules/Organization/*`, `tests/Pharmacy.ArchitectureTests` | AT-01; health 200 | `dotnet test` green; AT-01 proven to fail on forbidden reference |
| T-0.2 | Money value object | — (BR-G-18) | T-0.1 | BuildingBlocks.Domain | Rounding theory tests | 5 tests pass |
| T-0.3 | Error/Result + RFC 9457 Problem Details | — | T-0.1 | BuildingBlocks.Domain/Web, Host | Status mapping; `code`/`traceId`/`errors` | Unhandled exception → 500 Problem Details without stack |
| T-0.4 | Tenant context + RLS from first migration | US-02-01, US-02-03 | T-0.3 | BuildingBlocks.Application/Infrastructure, Organization.Infrastructure, TestKit | SEC-T-01/02/03, TS-02-013 | Isolation holds with EF filters ignored |
| T-0.5 | Gapless document numbering | US-02-08 | T-0.4 | BuildingBlocks.Infrastructure, `org.document_sequences` | TS-02-044 pattern (20 workers, 10% rollback) | No gaps, no duplicates |
| T-0.6 | Idempotency filter + store | — (CS-11 foundation) | T-0.4 | BuildingBlocks.Web, `platform.idempotency_records` | INT-I-01/02/04 | Replay, 422, 428 behave per API-DESIGN §9 |
| T-0.7 | Outbox + append-only audit writer | US-10-01 (writer), US-10-02 (catalog registry skeleton) | T-0.4 | BuildingBlocks.Infrastructure, `platform.outbox_messages`, `platform.audit_logs` | Rollback leaves nothing; app role cannot UPDATE/DELETE audit | Tests pass |
| T-0.8 | Frontend shell: i18n ar/en, RTL/LTR, themes | US-10-21 (infra), US-10-23 | — | `web/` | Vitest shell tests | `ar` RTL default; `en` LTR; dark class |
| T-0.9 | Docker Compose + CI | — | T-0.1…T-0.8 | `deploy/compose`, `deploy/docker`, `.github/workflows/ci.yml` | CI jobs backend/frontend/docs | Stack healthy locally; CI green |
| T-0.10 | Clock & business calendar | — (BR-G-23) | T-0.1 | BuildingBlocks.Application (`IBusinessCalendar` using `TimeProvider` + branch time zone) | Cairo midnight boundary tests incl. DST rules from tzdb | Business date correct at 23:59/00:01 Cairo |
| T-0.11 | Logging & telemetry | — (NFR-G-10) | T-0.3 | Host: Serilog JSON, OpenTelemetry traces/metrics, correlation id, redaction enricher | Log-redaction test (SEC-D-01 harness) | No token/password/medical pattern in logs |
| T-0.12 | Background jobs | — (ADR-007) | T-0.4 | Hangfire + PostgreSQL storage; tenant-scoped job base class; `platform.idempotency-cleanup` | Job sets tenant context per org (SEC-T-06) | Cleanup job deletes records > 24 h |
| T-0.13 | File storage abstraction | — (ADR-006) | T-0.4 | `IFileStorage` (MinIO/S3), `platform.file_objects`, pre-signed URLs | Upload/download authorization; other-org file → 404 | MinIO Testcontainer tests pass |
| T-0.14 | Settings registry & resolution | US-10-17 | T-0.4 | Platform module: `settings` tables, org → branch resolution, change audit | US-10-17 ACs | Effective settings API returns value + source |
| T-0.15 | Frontend API client & app frame | — | T-0.8, T-0.3 | `openapi-typescript` generation, typed fetch wrapper, TanStack Query client, Problem Details → form errors mapper, router layout | Vitest for error mapper | Generated client compiles in CI |

## Phase 1 — Identity, organization, branches

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-1.1 | Organization provisioning (bootstrap command) | US-02-04 | T-0.* | Organization module; `pms org provision` CLI in Host | Seeds roles/settings/sequences; audit | New org + branch + Owner in one transaction |
| T-1.2 | Login, password hashing, lockout | US-01-02, US-01-05, US-01-07 | T-1.1 | Identity module (Identity core), `/api/v1/auth/login` | SEC-A-01/02/03 | Lockout and rate limits per SPEC-01 |
| T-1.3 | JWT + refresh rotation + reuse detection, logout | US-01-03, US-01-04 | T-1.2 | Token service (ES256), refresh cookie, families | CS-12 (TS-01-014), TS-01-017 | Reuse revokes family |
| T-1.4 | Forgot/reset & admin temporary password | US-01-06, US-01-12 | T-1.2 | Identity | Token single use/expiry | ACs pass |
| T-1.5 | Permission catalog, system roles, authorization enforcement | US-01-08, US-01-10, US-02-10 | T-1.3 | `RequirePermission`, branch authorization handler, AT-08/AT-09 | Authorization matrix generator (S1), CS-07/CS-08 | Every endpoint covered by matrix |
| T-1.6 | Cross-organization isolation suite | US-02-02 | T-1.5 | `tests/Pharmacy.Api.IntegrationTests` | S2 suite | Suite runs on every PR |
| T-1.7 | Users: invite, view/update, roles & branch scope, activate/deactivate | US-01-11, US-01-13, US-01-14, US-01-15, US-02-09 | T-1.5 | Identity + Organization | BR-G-30 revocation ≤ 60 s (TS-01-073) | ACs pass |
| T-1.8 | Sessions management | US-01-16 | T-1.3 | Identity | Multi-node invalidation tests | ACs pass |
| T-1.9 | POS manager override re-authentication | US-01-17 | T-1.5 | `ManagerOverride` (single use, TTL) | SEC-A-11 | ACs pass |
| T-1.10 | Organization profile/settings, branches, branch settings, reporting scope | US-02-05, US-02-06, US-02-07, US-02-13, US-10-18, US-10-19 | T-0.14, T-1.5 | Organization + Platform | Settings audit, ETag 412 | ACs pass |
| T-1.11 | Audit hash chain sealer + audit search | US-10-03, US-10-04 | T-0.7, T-1.5 | Platform audit; sealer job (10 s) | SEC-L-01…04 | Tamper detected |
| T-1.12 | Preferences & localized formatting | US-10-20, US-10-22 | T-0.8 | Web + Platform | RTL/LTR component tests | ACs pass |
| T-1.13 | Identity & admin UI | (UI of above) | T-1.2…T-1.12 | `web/src/features/auth`, `admin` | Component + E2E-01, E2E-02 | Journeys pass in ar/en |

## Phase 2 — Medicine catalog

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-2.1 | Reference data & tax categories | US-03-01, US-03-02, US-03-03 | T-1.5 | Catalog module | Uniqueness, depth ≤ 3 | ACs pass |
| T-2.2 | Medicine aggregate & composition | US-03-04, US-03-05, US-03-09 | T-2.1 | Catalog | Pack/split-pack rules; classification | ACs pass |
| T-2.3 | Barcodes & lookup | US-03-06 | T-2.2 | Catalog | GTIN checksum, uniqueness per org | ACs pass |
| T-2.4 | Pricing: org price history, branch override | US-03-07, US-03-08 | T-2.2 | Catalog | Effective price resolution | ACs pass |
| T-2.5 | Search (Arabic/English normalization, trigram) | US-03-11, US-03-12 | T-2.2 | Catalog + pg_trgm indexes | PT-01 baseline (TS-03-068) | p95 ≤ 300 ms at 50k medicines |
| T-2.6 | Deactivate/reactivate; catalog facade & events | US-03-10, US-03-19 | T-2.2 | `ICatalogQueries`, integration events | Contract tests | ACs pass |
| T-2.7 | Catalog UI | (UI) | T-2.1…T-2.6 | `web/src/features/catalog` | E2E-03 | Journey passes |

## Phase 3 — Batch & inventory

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-3.1 | Batch model, balances, ledger posting service | US-04-01, US-04-02 | T-2.6 | Inventory module; `batches`, `batch_balances`, `stock_movements` (partitioned by `business_date`) | INV-01…03 fixture | Ledger = balance in all tests |
| T-3.2 | Inbound find-or-create & return-to-batch contracts | US-04-03 | T-3.1 | Inventory.Contracts | Contract tests | ACs pass |
| T-3.3 | FEFO allocation service + override | US-04-04, US-04-05 | T-3.1 | `IInventoryAllocation` | CS-01 (TS-04-026/027), CS-02, PT-05 | 1,000-run stress: 0 oversell |
| T-3.4 | Posting transactions, idempotency, failure guarantees | US-04-06 | T-3.3, T-0.6 | Inventory | CS-10 (TS-04-039/040), CS-11 (TS-04-041…043) | Fault injection → full rollback |
| T-3.5 | Stock overview & stock card | US-04-07, US-04-08 | T-3.1 | Inventory queries + UI | PT-06 | ACs pass |
| T-3.6 | Opening balances (document, lock, file import) | US-04-09, US-04-10 | T-3.4 | Inventory | TS-04-065/074 | 5,000 lines ≤ 30 s |
| T-3.7 | Adjustments, write-offs, approvals | US-04-11, US-04-12, US-04-13 | T-3.4 | Inventory | BR-G-28 SoD, CS-10 | E2E-13 passes |
| T-3.8 | Batch metadata correction & selling price override | US-04-14 | T-3.1 | Inventory | Audit diff | ACs pass |
| T-3.9 | Expiry flagging, near-expiry, low-stock detection | US-04-15, US-04-16 | T-0.12, T-3.1 | Inventory jobs | TS-04-004, TS-04-107 | Jobs idempotent; events emitted |
| T-3.10 | Reconciliation job & valuation snapshot | US-04-18, US-04-26 | T-3.1 | Inventory jobs | Injected drift detected; TS-04-131 | ACs pass |

## Phase 4 — Suppliers & goods receiving

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-4.1 | Suppliers & contacts | US-05-01, US-05-02, US-05-03 | T-1.5 | Procurement module | CS-08 | ACs pass |
| T-4.2 | Draft direct receipt + batch/expiry/shelf-life validation | US-05-04, US-05-05 | T-4.1, T-3.2 | Procurement | Shelf-life override permission | ACs pass |
| T-4.3 | Post & reverse receipt | US-05-06, US-05-07 | T-4.2, T-3.4 | Procurement → Inventory inbound | TS-05-028/029/033 | Atomic and idempotent |
| T-4.4 | Receipt history & UI | US-05-08 | T-4.3 | Procurement + web | E2E-04 | Journey passes |

## Phase 5 — Sales & POS

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-5.1 | Cash sessions (open, cash in/out, close blind count, Z-report, force-close) | US-06-08, US-06-09, US-06-10, US-06-11 | T-1.5 | Sales module | TS-06-043/049/057/062 | ACs pass |
| T-5.2 | POS search, barcode, cart (packs/units) | US-06-01, US-06-02, US-06-03 | T-2.5 | Web POS feature + Zustand cart | PT-01, keyboard tests | ACs pass |
| T-5.3 | Quote: price resolution, tax, discounts, manager override | US-06-04, US-06-05, US-06-06, US-06-07 | T-2.4, T-1.9 | Sales pricing service | Golden-file money tests | Worked examples match SPEC-06 |
| T-5.4 | Sale completion (atomic) + payments | US-06-12, US-06-13 | T-5.1, T-5.3, T-3.3, T-0.5 | `CompleteSaleCommand` | CS-01 (TS-06-080/081), CS-02, CS-09 | PT-04 met |
| T-5.5 | Completion idempotency, concurrency, failure safety | US-06-14 | T-5.4 | Sales | CS-10 (TS-06-085), CS-11 (TS-06-082/083) | 100 duplicates → 1 sale |
| T-5.6 | COGS per line | US-06-19 | T-5.4 | Sales | INV-04 | ACs pass |
| T-5.7 | Receipts, reprint, history | US-06-16, US-06-17, US-06-18 | T-5.4 | Sales + web print views | Arabic receipt snapshot tests | ACs pass |
| T-5.8 | Void | US-06-20 | T-5.4 | Sales | TS-06-117/121 | ACs pass |
| T-5.9 | Returns, approvals, refund rules, inspection disposition | US-06-21, US-06-22, US-06-23, US-06-24 | T-5.4, T-3.2 | Sales | CS-05 (TS-06-123…125), TS-06-129/145 | E2E-09 passes |
| T-5.10 | POS UI integration & E2E | (UI) | T-5.1…T-5.9 | web POS | E2E-05…10, E2E-14, E2E-C1/C2 | Journeys pass ar/en |

## Phase 6 — Patients & prescriptions

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-6.1 | Patient profile, search, consent | US-07-01, US-07-02, US-07-03 | T-1.5 | Patients module | Phone normalization; masking | ACs pass |
| T-6.2 | Allergies + medical access logging | US-07-04, US-07-05 | T-6.1 | Patients | SEC-D-02/03 | Every medical read logged |
| T-6.3 | Patient link & allergy alert at POS | US-07-06, US-07-07, US-06-25 | T-6.2, T-5.4 | Patients ↔ Sales | TS-07-057 | ACs pass |
| T-6.4 | Prescription settings, prescribers, registration, items | US-08-01, US-08-02, US-08-03, US-08-04 | T-6.1 | Prescriptions module | Validation | ACs pass |
| T-6.5 | Attachments (upload/view) | US-08-05, US-08-06 | T-0.13, T-6.4 | Prescriptions + file storage | SEC-I-06, SEC-T-08 | ACs pass |
| T-6.6 | Submit, verify, search, cancel, expiry | US-08-07, US-08-08, US-08-09, US-08-10, US-08-11 | T-6.4 | Prescriptions | TS-08-052/063 | ACs pass |
| T-6.7 | Dispensing through POS (partial) + Rx/controlled enforcement + register + void reversal | US-08-12, US-08-13, US-08-14, US-08-15, US-06-26, US-06-27 | T-6.6, T-5.4 | Prescriptions ↔ Sales | CS-04 (TS-08-065), CS-13, TS-08-068 | E2E-11/12 pass |

## Phase 7 — Finance & reporting

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-7.1 | Report filters & scoping | US-09-01 | T-1.10 | Finance module | CS-07/CS-08 on reports | ACs pass |
| T-7.2 | Daily sales & gross profit/COGS | US-09-03, US-09-05 | T-7.1, T-5.6 | Finance queries | Golden files; TS-09-019/036 | Match golden totals |
| T-7.3 | Cash session X/Z & reconciliation | US-09-07 | T-5.1 | Finance | TS-09-046 | ACs pass |
| T-7.4 | Valuation & near-expiry reports | US-09-08, US-09-10 | T-3.10 | Finance | Valuation = Σ on-hand × cost | ACs pass |
| T-7.5 | CSV export | US-09-18 | T-7.2 | Finance + exports | Formula-injection escaping (SEC-I-07) | E2E-15 passes |

## Phase 8 — Notifications (MVP slice)

| ID | Objective | Stories | Depends on | Modules / files | Key tests | Done when |
|---|---|---|---|---|---|---|
| T-8.1 | Notification store, routing, center API | US-10-08 | T-0.7 | Platform notifications | PT-16 | ACs pass |
| T-8.2 | Low-stock & expiry notifications with de-duplication | US-10-09 | T-8.1, T-3.9 | Platform ← Inventory events | One per medicine/branch/24 h | ACs pass |
| T-8.3 | Notification center UI | US-10-13 | T-8.1 | web | E2E-16 | Journey passes |

## Phase 9 — Hardening & go-live (R1 MVP)

| ID | Objective | Depends on | Done when |
|---|---|---|---|
| T-9.1 | Security test plan S1–S8 complete + external pen test (S9) | Phases 1–8 | 0 open Critical/High |
| T-9.2 | Performance plan at MVP profile + V1 baseline, contention test | Phases 3–7 | Gate G9 met |
| T-9.3 | Accessibility pass (axe + manual) | UI phases | Gate G11 met |
| T-9.4 | Production environment, backups/PITR, monitoring/alerts (DEPLOYMENT-ARCHITECTURE) | T-0.9 | Restore drill meets RPO/RTO (G12) |
| T-9.5 | Opening balance migration rehearsal & physical count reconciliation | T-3.6 | ≥ 99.5% line match |
| T-9.6 | Regulatory confirmations recorded; settings configured | — | All *Blocking for go-live* REG items confirmed |
| T-9.7 | UAT (pharmacist SME), training, runbooks, go-live checklist | All | RELEASE-PLAN §7 complete |

## V1 increments (task-level breakdown is written per increment before it starts)

| Increment | Tasks (to be detailed) | Stories |
|---|---|---|
| V1.1 Procurement | T-10.1 PO lifecycle; T-10.2 receiving against PO (CS-03); T-10.3 supplier invoices & matching; T-10.4 supplier returns; T-10.5 payments, ledger, aging | US-05-09…21 |
| V1.2 Multi-branch | T-11.1 transfer workflow (CS-06); T-11.2 quarantine/recall; T-11.3 stocktakes; T-11.4 branch deactivation, transfer policy, multi-branch visibility | US-04-17, US-04-19…25, US-04-27, US-02-11, US-02-12 |
| V1.3 SaaS & security | T-12.1 platform auth & org administration; T-12.2 support grants; T-12.3 self-signup & custom roles; T-12.4 MFA; T-12.5 API action log & audit export | US-01-01, US-01-09, US-01-18…20, US-02-14…16, US-10-05, US-10-06 |
| V1.4 Reporting, privacy, real-time | T-13.1 projections & background exports; T-13.2 remaining reports & dashboards; T-13.3 patient history/privacy tools, export/anonymize; T-13.4 SignalR & notification rules; T-13.5 catalog import/export & alternatives; T-13.6 platform health page | US-09-02, US-09-04, US-09-06, US-09-09, US-09-11…15, US-09-17, US-09-19…21; US-07-08…11, US-07-13, US-07-16, US-07-17; US-10-10…12, US-10-24; US-03-13…16 |

## First task to execute

**T-0.1: Solution skeleton, health endpoint, first architecture rule.** Follow [phase-0-foundation Task 0.1](2026-11-10-phase-0-foundation.md#task-01-solution-skeleton-health-endpoint-first-architecture-test) step by step.

Prerequisites:
- .NET 10 SDK, Docker Desktop and Node 22 installed;
- the owner's decision on creating the git repository, which enables the commit steps.
