# Pharmacy Management System — Documentation

Documentation-phase deliverables for a multi-organization, multi-branch Pharmacy Management System (ASP.NET Core .NET 10 modular monolith + React/TypeScript + PostgreSQL 17). Nothing in this folder is application code.

**Status (2026-11-10): documentation phase complete; validation clean; ready to start Phase 0 implementation.**

## Start here

1. [DOCUMENTATION-CONVENTIONS.md](DOCUMENTATION-CONVENTIONS.md): IDs, terminology, roles, permissions, canonical entities, global rules, templates.
2. [PROJECT-VISION.md](PROJECT-VISION.md), then [MASTER-SDD.md](MASTER-SDD.md).
3. [roadmap/RELEASE-PLAN.md](roadmap/RELEASE-PLAN.md) for MVP / V1 / Future, then [roadmap/IMPLEMENTATION-ROADMAP.md](roadmap/IMPLEMENTATION-ROADMAP.md).
4. [superpowers/plans/2026-11-10-implementation-execution-plan.md](superpowers/plans/2026-11-10-implementation-execution-plan.md) for the task breakdown, and [phase-0-foundation](superpowers/plans/2026-11-10-phase-0-foundation.md) for the first tasks step by step.

Original owner inputs are kept unchanged: `1. Project Vision.md`, `2. Master SDD.md`, `3. Specs & Stories Roadmap.md`, `4. Superpowers Workflow Prompt.md`.

## Tooling

| Command (from repo root) | Purpose |
|---|---|
| `node scripts/docs/docs-check.mjs` | Validates required files, spec headings, FR tables, story template, AC/TS IDs, traceability, CS coverage, table integrity, code fences. Exit 1 on errors |
| `node scripts/docs/docs-check.mjs --write` | Also regenerates [REQUIREMENTS.md](REQUIREMENTS.md) and [SPEC-STORY-TRACEABILITY.md](SPEC-STORY-TRACEABILITY.md) |
| `node scripts/docs/gen-release-plan.mjs` | Regenerates the MVP/V1/Future tables in RELEASE-PLAN from story files and README MVP flags |
| `node scripts/docs/gen-registers.mjs` | Regenerates the module open-decision register in ASSUMPTIONS-AND-OPEN-DECISIONS |
| `node scripts/docs/gen-test-cases.mjs` | Regenerates the detailed test-case catalog [test-cases/](test-cases/README.md) (one case per TS scenario) from the stories |

## Key numbers (verified by the validation script)

| Metric | Count |
|---|---|
| Specifications | 10 |
| Epics | 10 |
| User stories | 223 (MVP 134 · V1 62 · Future 27) |
| Functional requirements | 509 |
| Business rules | 35 global + 243 module |
| Non-functional requirements | 10 global + 114 module |
| Acceptance criteria (Given/When/Then) | 1,258 |
| Test scenarios / detailed test cases | 1,231 (all 13 critical scenarios covered) — catalog in [test-cases/](test-cases/README.md) |
| ADRs | 10 (ADR-002, 005 and 008 amended 2026-11-10) |
| Open decisions | 112 module + 8 global (each with a default) |
| Assumptions / risks | 30 / 25 |

## Execution rules for future work

- Run at most one authoring agent at a time (usage-limit protection).
- Never recreate completed files. Run the validation script before and after changes.
- Specifications are authoritative for module behavior. Architecture documents and ADRs must follow them, and any change is recorded as an amendment.
- Product-owner decisions recorded 2026-11-10:
  - PostgreSQL RLS is enabled from the MVP (ADR-002 amended);
  - no git repository yet; commit steps in the plans start when the owner approves.

## Progress checklist

### Foundation
- [x] Repository and Superpowers environment inspected
- [x] Conventions & canonical domain reference (incl. 39 spec-added permissions consolidated, §5.2.1)
- [x] PROJECT-VISION, MASTER-SDD, GLOSSARY, ADVANCED-FEATURES
- [x] REGULATORY-CONSIDERATIONS-EGYPT (REG-01…REG-11, questions pack)

### Specifications & stories
- [x] SPEC-01 … SPEC-10 (20 sections each)
- [x] EPIC-01 Identity: 20 stories
- [x] EPIC-02 Organization & Branches: 16 stories
- [x] EPIC-03 Catalog: 19 stories
- [x] EPIC-04 Inventory: 28 stories
- [x] EPIC-05 Procurement: 24 stories
- [x] EPIC-06 Sales/POS: 30 stories
- [x] EPIC-07 Patients: 17 stories
- [x] EPIC-08 Prescriptions: 22 stories
- [x] EPIC-09 Finance: 22 stories
- [x] EPIC-10 Notifications/Audit/Settings: 25 stories

### Architecture
- [x] SYSTEM, DATABASE, API, SECURITY, INVENTORY, DEPLOYMENT architecture
- [x] ADR-001 … ADR-010
- [x] Consistency review across specs, architecture and ADRs. Resolved 2026-11-10:
  - lock timeout;
  - audit sealing;
  - token claims;
  - rate limits;
  - error prefixes;
  - `ManagerOverride` naming;
  - restock rule;
  - partition key;
  - settings storage and key names;
  - `PricesIncludeTax` scope;
  - discount limits.

### Testing, roadmap, governance
- [x] Test plans: MASTER-TEST-STRATEGY, TEST-DATA, SECURITY, PERFORMANCE, INTEGRATION, E2E
- [x] Test-case catalog: 1,231 detailed cases in `test-cases/` (generated; T0 172 · T1 624 · T2 297 · T3 138)
- [x] IMPLEMENTATION-ROADMAP (Phases 0–9 + V1 increments), RELEASE-PLAN (MVP/V1/Future), DEFINITION-OF-DONE
- [x] ASSUMPTIONS-AND-OPEN-DECISIONS, RISKS-AND-MITIGATIONS
- [x] REQUIREMENTS + SPEC-STORY-TRACEABILITY (generated)
- [x] Final validation: 0 errors, 0 warnings, 0 broken links
- [x] Implementation execution plan (Superpowers `writing-plans`): task index for all phases + step-level Phase 0 plan

### Implementation progress (Phase 0 — see [execution plan](superpowers/plans/2026-11-10-implementation-execution-plan.md))
- [x] T-0.1 solution skeleton, health endpoint, AT-01 architecture test
- [x] T-0.2 Money value object (BR-G-18)
- [x] T-0.3 Result/Error + RFC 9457 Problem Details
- [x] T-0.8 frontend shell (i18next ar/en, RTL/LTR, themes, Tailwind)
- [ ] T-0.4 … T-0.7 tenant context + RLS, gapless numbering, idempotency, outbox/audit: **blocked — need Docker (Testcontainers PostgreSQL 17); Docker is not installed on the dev machine**
- [ ] T-0.9 Docker Compose + CI (also needs Docker to verify locally)
- [ ] T-0.10 … T-0.15

### Open items
- [ ] Docker Desktop (or another way to run PostgreSQL 17) on the dev machine
- [ ] Regulatory questions pack (REGULATORY-CONSIDERATIONS-EGYPT §4): owner decided not to send for now
