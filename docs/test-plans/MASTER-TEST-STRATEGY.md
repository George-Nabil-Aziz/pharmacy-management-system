# Master Test Strategy

**Version:** 1.0 (2026-11-10) · **Owner:** QA / Test Architect
**Related:** [Test-case catalog](../test-cases/README.md) (1 detailed case per TS scenario, generated) · [TEST-DATA-STRATEGY](TEST-DATA-STRATEGY.md) · [INTEGRATION-TEST-PLAN](INTEGRATION-TEST-PLAN.md) · [SECURITY-TEST-PLAN](SECURITY-TEST-PLAN.md) · [PERFORMANCE-TEST-PLAN](PERFORMANCE-TEST-PLAN.md) · [E2E-TEST-PLAN](E2E-TEST-PLAN.md) · [DEFINITION-OF-DONE](../roadmap/DEFINITION-OF-DONE.md) · [SPEC-STORY-TRACEABILITY](../SPEC-STORY-TRACEABILITY.md)

## 1. Objectives

1. Prove that every acceptance criterion (`US-SS-NN-ACn`) is satisfied, through the test scenarios (`TS-SS-NNN`) declared in each story.
2. Prove the **non-negotiable invariants** under concurrency and failure:
   - no oversell;
   - no negative stock;
   - ledger equals balance;
   - no cross-tenant leakage;
   - atomic money and stock posting;
   - idempotent retries.
3. Detect regressions automatically on every pull request, before any human review.
4. Produce evidence (reports, traceability) that a phase or release meets its quality gates.

## 2. Guiding principles

- **Test-first for business logic.** Domain rules (FEFO, pricing, tax, discounts, returns, variance, COGS) are developed with TDD (Superpowers `test-driven-development` skill during implementation).
- **Real database for anything transactional.** Integration tests run against PostgreSQL 17 in Testcontainers with **RLS enabled and forced** and the application connecting with the non-owner role. The EF Core in-memory provider and SQLite are forbidden for integration tests, because they cannot reproduce locking, RLS, `numeric`, or constraint behavior.
- **Backend is the control.** Every authorization rule is tested at the API, never only in the UI.
- **Deterministic tests.** Injected clock (`TimeProvider`) and branch time zone; UUIDv7 generator injectable; no `Thread.Sleep`; concurrency tests use barriers, not timing.
- **Traceable.** Test names or attributes carry the scenario ID, for example `[Trait("TS", "TS-06-031")]` in xUnit or `it('TS-06-031 …')` in Vitest. The traceability matrix links ACs to TS IDs.

## 3. Test levels and types

| Level / type | Scope | Tools | Owner | Runs |
|---|---|---|---|---|
| Unit (backend) | Domain entities, value objects, domain services (FEFO ordering, money, tax, discount, variance), validators | xUnit, FluentAssertions, NSubstitute (only for ports) | Developers | Every commit (< 2 min) |
| Unit (frontend) | Hooks, Zustand stores (POS cart), utilities (money formatting, Arabic normalization), Zod schemas | Vitest | Developers | Every commit |
| Component (frontend) | Screens and components incl. RTL/LTR, dark/light, keyboard flows, permission gating | Vitest + React Testing Library + MSW + axe | Developers | Every commit |
| Architecture | Module dependency rules, layering, forbidden terminology, tenant column + RLS presence | NetArchTest-style rules + schema inspection test | Tech lead | Every PR |
| Integration (backend) | Application handlers + EF Core + PostgreSQL (transactions, locks, constraints, RLS, outbox) | xUnit + Testcontainers (PostgreSQL 17, MinIO) + Respawn | Developers | Every PR |
| API / contract | HTTP surface via `WebApplicationFactory`: status codes, Problem Details, auth, idempotency, ETag, pagination; OpenAPI snapshot diff | xUnit + `WebApplicationFactory`, OpenAPI diff | Developers | Every PR |
| Authorization matrix | Every endpoint × {anonymous, no permission, other branch, other organization, allowed} | Generated data-driven tests from the endpoint permission table | QA | Every PR |
| Database | Migrations apply/rollback, constraints, RLS policies, indexes used (EXPLAIN checks for hot queries), partition creation | xUnit + Testcontainers | Developers | Every PR (migrations), nightly (EXPLAIN) |
| Concurrency | Oversell, double posting, lock ordering/deadlock, sequence gaplessness, idempotency races | xUnit + Testcontainers, parallel tasks with barriers | QA + developers | Every PR (core set), nightly (stress set) |
| Inventory consistency | Ledger ↔ balance invariant after every inventory-touching test; reconciliation job | Shared assertion helper + property-based tests (FsCheck) | QA | Every PR |
| End-to-end | Critical user journeys through the UI against a full stack | Playwright (Chromium + WebKit), `ar` and `en` locales | QA | Nightly + pre-release |
| Security | SAST, dependency scan, secret scan, DAST, authz matrix, token/session attacks, upload attacks | CodeQL / Semgrep, `dotnet list package --vulnerable`, npm audit, gitleaks, OWASP ZAP | Security engineer | PR (static), nightly (DAST), pre-release (manual) |
| Performance | Load, stress, soak on POS search, sale completion, receiving, reports | k6 + seeded dataset, PostgreSQL `pg_stat_statements` | QA | Weekly + pre-release |
| Regression | Full automated suite plus E2E smoke on release candidate | CI pipeline | QA | Each release candidate |
| Accessibility | axe in component tests; manual keyboard/screen-reader pass on core flows | axe-core, NVDA | QA | PR (axe), pre-release (manual) |
| Backup/restore | PITR restore drill, data integrity check after restore | Scripts + reconciliation job | DevOps | Monthly + pre-release |

### 3.1 Test pyramid targets (per release)

| Layer | Share of automated tests | Max suite duration in CI |
|---|---|---|
| Unit (backend + frontend) | ≈ 60% | 3 min |
| Integration + API + authz matrix | ≈ 30% | 12 min (parallelized per module) |
| Component (frontend) | included in unit share | 3 min |
| E2E | ≈ 5–10% (critical journeys only) | 20 min nightly |

## 4. Invariants checked automatically

These assertions run after **every** integration test that touches inventory, sales, or procurement. A shared fixture runs them on teardown.

| ID | Invariant | Check |
|---|---|---|
| INV-01 | Ledger equals balance | For every batch touched: `Σ StockMovement.QuantityDelta = BatchBalance.OnHand` |
| INV-02 | No negative stock | `OnHand ≥ 0`, `Reserved ≥ 0`, `Reserved ≤ OnHand` |
| INV-03 | Balance chain | Each movement's `BalanceAfter` equals the previous `BalanceAfter` plus `QuantityDelta`, in `BatchSequence` order |
| INV-04 | Sale allocation completeness | `Σ SaleLineAllocation.Quantity = SaleLine.QuantityBaseUnits` for every completed sale line |
| INV-05 | Payment coverage | `Σ Payment.Amount − Change = Sale.Total` for completed sales (BR-G-35) |
| INV-06 | Return bound | Returned quantity per sale line ≤ sold quantity (BR-G-12) |
| INV-07 | Tenant consistency | Every row written during the test has the `organization_id` of the acting tenant; child rows match the parent's organization |
| INV-08 | Gapless numbering | Document numbers per branch/type/year have no gaps and no duplicates |
| INV-09 | Audit presence | Every sensitive operation executed in the test has exactly one audit row with matching correlation ID |
| INV-10 | Audit chain | The hash chain verifies for the test organization |

## 5. Critical cross-cutting scenarios (CS) — mandatory coverage

| CS | Scenario | Primary level | Detailed in | Release gate |
|---|---|---|---|---|
| CS-01 | Two cashiers sell the last unit simultaneously | Concurrency integration (100 iterations) + k6 contention test | INTEGRATION §5, PERFORMANCE §6 | MVP |
| CS-02 | Selling an expired / do-not-sell batch | Unit (FEFO filter) + integration + E2E | INTEGRATION §6 | MVP |
| CS-03 | Partial goods receiving then remainder | Integration + E2E | INTEGRATION §7 | V1 (PO); MVP covers direct receipt |
| CS-04 | Partial prescription dispensing across visits | Integration + E2E | INTEGRATION §8, E2E | MVP |
| CS-05 | Returns from a completed sale (partial, remaining, over-return) | Integration + E2E | INTEGRATION §6 | MVP |
| CS-06 | Branch-to-branch transfer incl. short receipt | Integration + E2E | INTEGRATION §7 | V1 |
| CS-07 | Cross-branch access denied (403) | Authorization matrix | SECURITY §5 | MVP |
| CS-08 | Cross-organization access (404, no leak) incl. RLS with app filter disabled | Authorization matrix + RLS DB tests | SECURITY §4 | MVP |
| CS-09 | Failed/unconfirmed payment → nothing persisted | Integration + E2E | INTEGRATION §6 | MVP |
| CS-10 | Database failure mid-deduction → full rollback | Fault-injection integration | INTEGRATION §9 | MVP |
| CS-11 | Duplicate request / retry with same Idempotency-Key | API + concurrency integration | INTEGRATION §10 | MVP |
| CS-12 | Refresh token reuse → family revoked | API + security | SECURITY §3 | MVP |
| CS-13 | Rx-only / controlled sold without verified prescription → blocked | Integration + E2E | INTEGRATION §8 | MVP |

## 6. Test prioritization

| Priority | Definition | Examples | Execution |
|---|---|---|---|
| T0 (blocker) | Breaks money, stock, isolation, or authentication | CS-01, CS-08, CS-10, INV-01..10, RLS tests, token reuse | Every PR; failure blocks merge |
| T1 (critical) | Core workflow broken for a role | Sale completion, receiving, return, dispensing, cash session close | Every PR |
| T2 (major) | Secondary workflow or report wrong | Reports, notifications, settings, stocktake | Every PR (integration) / nightly (E2E) |
| T3 (minor) | Cosmetic, non-blocking | Layout, translations wording | Nightly / pre-release |

Story priorities map to test priority as follows: P0 stories become T0/T1, P1 stories T1/T2, and P2/P3 stories T2/T3.

## 7. Quality gates (measurable)

| Gate | Threshold | Enforced at |
|---|---|---|
| G1 Build & unit tests | 100% pass | PR |
| G2 Integration/API/authz tests | 100% pass; zero flaky tests quarantined > 5 days | PR |
| G3 Coverage | Domain + Application ≥ 80% lines / ≥ 70% branches overall; Inventory, Sales, Finance domain ≥ 90% lines | PR (diff coverage ≥ 80%) |
| G4 Architecture tests | 100% pass | PR |
| G5 Static security | 0 new High/Critical SAST findings; 0 Critical dependency CVEs; 0 secrets | PR |
| G6 Invariants | INV-01..10 never violated in any test run | PR + nightly |
| G7 Concurrency | CS-01 stress: 0 oversells in 1,000 contention iterations; 0 deadlocks unhandled | Nightly + release |
| G8 E2E | 100% of MVP critical journeys pass in `ar` and `en` | Release candidate |
| G9 Performance | NFR-G-01 (search p95 ≤ 300 ms), NFR-G-02 (sale p95 ≤ 800 ms, p99 ≤ 1.5 s), NFR-G-03 met at target load | Release candidate |
| G10 Security (dynamic) | 0 open High/Critical from DAST + manual pen test | Release candidate |
| G11 Accessibility | 0 critical axe violations on core flows; manual keyboard pass | Release candidate |
| G12 Recovery | Restore drill meets RPO ≤ 15 min / RTO ≤ 4 h, reconciliation clean after restore | Release candidate |
| G13 Documentation | `node scripts/docs/docs-check.mjs` exits 0 | PR touching `docs/` |

## 8. Environments

| Environment | Purpose | Data | Notes |
|---|---|---|---|
| Developer / CI ephemeral | Unit, integration, API, architecture | Generated per test (builders) | Testcontainers; DB reset with Respawn per test class |
| Nightly E2E | Full stack in Docker Compose | Seeded "demo pharmacy" dataset | Two organizations, three branches; see TEST-DATA-STRATEGY |
| Performance | Production-like sizing | Synthetic volume dataset (50k medicines, 500k batches, 2M movements) | Isolated; results kept for trend analysis |
| Staging | Release candidate verification, DAST, restore drill | Anonymized/synthetic only — never real patient data | Same images and migrations as production |

## 9. Defect management

- **Severity:** Critical (data loss, money/stock wrong, cross-tenant leak, auth bypass), High (core workflow blocked), Medium (workaround exists), Low (cosmetic).
- Every Critical or High defect gets a regression test, tagged with the defect ID, before it is closed.
- Flaky tests are quarantined only with an issue and an owner, and fixed within 5 working days. Quarantined T0 tests block release.

## 10. Regression strategy

- Every PR runs the full automated unit, integration, API, authz and architecture suite. Selective test runs are not used because the suite budget is ≤ 15 min.
- Nightly runs add E2E, the concurrency stress set, EXPLAIN checks and DAST baseline.
- Each release candidate gets the full suite, performance, security, accessibility and the restore drill.
- A **golden-file regression** set covers financial calculations: fixed scenarios with expected totals (sale, return, Z-report, gross profit, valuation). Changes to expected values require a reviewed spec change.

## 11. Responsibilities

| Role | Responsibility |
|---|---|
| Developer | Unit, integration, API, and component tests for own stories; keep invariants green |
| QA / Test architect | Strategy, authz matrix generator, concurrency/E2E suites, test data, gate reporting |
| Security engineer | Security plan execution, threat-model updates, pen-test coordination |
| DevOps | CI pipelines, environments, performance rig, restore drills |
| Product owner / pharmacist SME | UAT of dispensing, returns, controlled medicines, and reports in Arabic |

## 12. Entry and exit criteria per phase

The **entry** criterion for a phase is that the previous phase's DoD is met and the test data builders for the new module exist. The **exit** criteria are:

- quality gates G1–G6 are green;
- every CS mapped to the phase in the roadmap passes;
- the traceability matrix shows every in-scope AC covered by an automated or documented manual test.
