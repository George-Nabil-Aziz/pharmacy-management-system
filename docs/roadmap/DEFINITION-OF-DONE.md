# Definition of Done

**Version:** 1.0 (2026-11-10) · **Applies to:** every user story, task, phase, and release of the Pharmacy Management System
**Sources:** owner input `docs/2. Master SDD.md` §15 (extended), [DOCUMENTATION-CONVENTIONS.md](../DOCUMENTATION-CONVENTIONS.md), [test-plans/MASTER-TEST-STRATEGY.md](../test-plans/MASTER-TEST-STRATEGY.md)

A work item is **Done** only when every applicable item below is true and verified by evidence (CI run link, test report, reviewer approval). "Works on my machine" or "tests should pass" is not evidence.

## 1. Definition of Ready (entry gate for a story)

A story may enter a sprint/iteration only when:

| # | Criterion |
|---|---|
| R1 | Story file exists in `docs/stories/EPIC-SS-*/` and passes `node scripts/docs/docs-check.mjs`. |
| R2 | Related FRs, business rules, and acceptance criteria (≥3, Given/When/Then, including a negative and a permission-denied case) are present. |
| R3 | All story dependencies (`Dependencies` field) are Done, or explicitly stubbed with an agreed contract. |
| R4 | API endpoints, permissions, and error codes it uses exist in the owning spec. |
| R5 | Open decisions affecting it are resolved or have a documented default in [ASSUMPTIONS-AND-OPEN-DECISIONS.md](../ASSUMPTIONS-AND-OPEN-DECISIONS.md). |
| R6 | Complexity is XS, S, M or L (XL stories must be split). |

## 2. Story-level Definition of Done

### 2.1 Functional
| # | Criterion |
|---|---|
| D1 | Every acceptance criterion `US-SS-NN-ACn` is implemented and covered by at least one automated test whose name or attribute references the AC ID. |
| D2 | Every test scenario `TS-SS-NNN` listed in the story's Testing Notes is automated, or explicitly recorded as manual in the E2E plan with justification. |
| D3 | Business rules (BR-G-xx, BR-SS-xxx) referenced by the story are enforced in the domain/application layer, not only in the UI. |
| D4 | Validation rules are implemented with FluentValidation (backend) and Zod (frontend) using the same limits; backend is authoritative. |
| D5 | Errors return RFC 9457 Problem Details with the documented `code`; no unhandled exception reaches the client (500 only for genuine faults). |

### 2.2 Security & tenancy
| # | Criterion |
|---|---|
| D6 | Every new endpoint has: authentication, permission policy, branch authorization (branch-scoped routes), and tenant filter — verified by tests for 401, 403 (missing permission), 403 (other branch, CS-07) and 404 (other organization, CS-08). |
| D7 | New tenant-owned tables have `organization_id NOT NULL`, an EF Core global query filter, **and an enabled + forced RLS policy created in the same migration** (ADR-002, RLS from MVP). The architecture/database test confirming this passes. |
| D8 | Sensitive operations emit the audit event listed in the SPEC-10 sensitive-operation catalog, in the same transaction (BR-G-16). |
| D9 | No secrets, tokens, passwords, or patient medical data appear in logs, exceptions, or URLs (NFR-G-10). |
| D10 | Endpoints in the idempotency list require `Idempotency-Key` and pass the duplicate-request test (CS-11). |

### 2.3 Data integrity (inventory & money)
| # | Criterion |
|---|---|
| D11 | Any change to stock writes `StockMovement` rows and updates `BatchBalance` in the same transaction; the ledger-equals-balance assertion passes in the story's integration tests. |
| D12 | Money uses `decimal`/`numeric` only, rounding per BR-G-18; calculation tests include a worked example with exact expected values. |
| D13 | Multi-step write operations are atomic: a fault-injection test proves full rollback (CS-10 pattern) for posting operations. |
| D14 | Mutable aggregates use optimistic concurrency (`xmin`/ETag); conflicting update test returns 412. |

### 2.4 Quality
| # | Criterion |
|---|---|
| D15 | Unit + integration tests pass in CI; no skipped tests without a linked issue. |
| D16 | Line coverage of the changed Domain and Application projects ≥ 80% (branch coverage ≥ 70%); Inventory, Sales, and Finance domain ≥ 90%. |
| D17 | Architecture tests pass (module dependency rules, no cross-module DbContext access, terminology rules). |
| D18 | Static analysis: zero new warnings at severity ≥ warning (.NET analyzers, ESLint, TypeScript `strict`), zero new high/critical dependency vulnerabilities. |
| D19 | Code reviewed and approved by at least one other developer (or the review agent workflow) with all blocking comments resolved. |
| D20 | Performance-sensitive stories (POS search, sale completion, receipt posting, reports) meet their NFR targets in the performance test environment or have a recorded baseline. |

### 2.5 Frontend
| # | Criterion |
|---|---|
| D21 | All visible strings come from i18next resources in **both** `en` and `ar`; no hard-coded UI text. |
| D22 | The screen renders correctly in RTL and LTR (component tests for direction-sensitive layout) and in light and dark themes. |
| D23 | Forms use React Hook Form + Zod, show server validation errors mapped by field, and are keyboard-operable; POS flows are fully keyboard-driven. |
| D24 | Accessibility: no critical axe violations on the screen; WCAG 2.2 AA contrast in both themes (NFR-G-08). |
| D25 | UI permission gating mirrors backend permissions (but backend tests are the control). |

### 2.6 Documentation
| # | Criterion |
|---|---|
| D26 | OpenAPI is generated and the contract test passes; the frontend client is regenerated. |
| D27 | Spec/story documents are updated if behavior changed during implementation (change recorded; IDs not reused). |
| D28 | New settings, permissions, error codes, or entities are added to [DOCUMENTATION-CONVENTIONS.md](../DOCUMENTATION-CONVENTIONS.md) and the owning spec. |
| D29 | Migrations are reversible or documented as expand/contract; seed data updated when catalogs (permissions, audit actions, settings) change. |

## 3. Phase-level Definition of Done

A roadmap phase is Done when:
1. All stories planned for the phase meet §2.
2. The phase's test requirements in [IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md) pass in CI, including all critical scenarios (CS-xx) mapped to that phase.
3. The validation script and the full regression suite are green.
4. A demo of the phase's end-to-end workflow is recorded against a freshly migrated database with seed data.
5. Known defects: zero open Critical/High; Medium defects have owners and target phase.
6. Risks and assumptions affected by the phase are updated.

## 4. Release-level Definition of Done

A release (MVP, V1, …) is Done when:
1. All phase DoDs for included phases are met.
2. Quality gates in [MASTER-TEST-STRATEGY.md](../test-plans/MASTER-TEST-STRATEGY.md) pass (including CS-01 zero-oversell and the isolation suite).
3. Security test plan executed: no open Critical/High findings; dependency scan clean of Critical.
4. Performance plan executed: NFR-G-01, NFR-G-02, NFR-G-03 met at the release's target load.
5. Backup and restore drill executed successfully on the release candidate (NFR-G-05).
6. Deployment is automated, migrations run as a bundle, rollback procedure tested on staging.
7. For a real pharmacy go-live: every **Blocking for go-live** item in [REGULATORY-CONSIDERATIONS-EGYPT.md](../REGULATORY-CONSIDERATIONS-EGYPT.md) has a recorded professional confirmation.
8. Release notes, user-facing Arabic/English help for new screens, and operator runbook updates are published.
