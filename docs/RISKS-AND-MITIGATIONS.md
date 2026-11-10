# Risks and Mitigations

**Version:** 1.0 (2026-11-10) · **Related:** [ASSUMPTIONS-AND-OPEN-DECISIONS.md](ASSUMPTIONS-AND-OPEN-DECISIONS.md) · [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md) · [roadmap/IMPLEMENTATION-ROADMAP.md](roadmap/IMPLEMENTATION-ROADMAP.md)

Scoring: Likelihood (L) and Impact (I) are each rated 1–5. Score = L × I. A score of 15 or more is **Critical**, 8–14 is **High**, and 7 or less is **Moderate**.

## 1. Risk register

| ID | Category | Risk | L | I | Score | Mitigation | Owner | Trigger / indicator |
|---|---|---|---|---|---|---|---|---|
| R-01 | Inventory correctness | Oversell or negative stock under concurrent sales (two cashiers, last unit) | 2 | 5 | **High 10** | Pessimistic locks in BatchId order + `CHECK (on_hand >= 0)` + CS-01 stress tests (1,000 runs) as release gate + nightly reconciliation | Tech lead | Any INV-01/02 violation in CI or reconciliation finding |
| R-02 | Tenant isolation | Cross-organization data leak through a missing filter, raw SQL, job, or file URL | 2 | 5 | **High 10** | Layered isolation: token tenant context, EF filters, **RLS enabled from MVP**, 404 semantics, generated isolation suite (CS-08) on every endpoint, report SQL helper asserting session variable, pen test | Security engineer | Isolation test failure; pen-test finding |
| R-03 | Regulatory | Professional confirmations (REG-01/02/04/05/06/08/11) arrive late or require behavior changes | 4 | 4 | **Critical 16** | Questions pack sent at Phase 0 start; all regulated behavior is settings-driven; go-live (not development) is gated on confirmations | Product owner | No answer by Phase 6 start |
| R-04 | Regulatory / tax | E-invoice/e-receipt submission becomes mandatory for the pilot before go-live, possibly synchronous at sale time | 3 | 5 | **Critical 15** | Data model keeps all submission fields; integration designed as outbox adapter; early tax-advisor review (REG-07); budget contingency in Phase 9 | Product owner | Tax advisor confirms obligation |
| R-05 | Financial integrity | Rounding/discount/tax calculation differences between client quote and server, or between documents and reports | 3 | 4 | **High 12** | Server is authoritative (re-price on completion, reject on mismatch); BR-G-18 decimal rules; golden-file and property-based reconciliation tests; shared calculation spec with worked examples | Tech lead | Golden-file test change; Z-report mismatch |
| R-06 | Payments | Card approved on standalone terminal but server rejects the sale (stock changed, price changed) → manual card reversal needed | 3 | 3 | **High 9** | Quote immediately before payment; UI flow takes card payment last; clear reversal instructions; event recorded and reported; terminal integration as future option | Product owner | Rejected-after-card events > 0.5% of card sales |
| R-07 | Performance | Per-branch invoice-number counter and hot-item batch locks serialize the end of sale completion at peak | 2 | 3 | **Moderate 6** | Counter update as last statement; short transactions; contention test measures counter lock hold time (≤ 20 ms p95) | Tech lead | PT-04 p99 > 1.5 s |
| R-08 | Performance | POS search too slow or poor results for Arabic spelling variants | 3 | 3 | **High 9** | pg_trgm + normalized columns; SME-reviewed test corpus; PT-01 measured from Phase 2 | Tech lead | PT-01 p95 > 300 ms |
| R-09 | Technology | Hangfire.PostgreSql is community-maintained; breaking changes or abandonment | 2 | 3 | **Moderate 6** | Thin job abstraction; pinned versions; Quartz.NET documented as fallback (ADR-007) | Tech lead | Unpatched critical issue > 30 days |
| R-10 | Data migration | Inaccurate opening balances at go-live (wrong batches/expiries) undermine trust | 3 | 4 | **High 12** | Opening balance import with dry-run validation; physical count reconciliation ≥ 99.5% before go-live; lock after acceptance | Operations manager | Count mismatch > 0.5% of lines |
| R-11 | Process | Segregation of duties (BR-G-28) blocks branches with a single approver | 3 | 2 | **Moderate 6** | Owner can approve any branch; documented assumption A-17; configurable exemption considered in V1 | Product owner | Pending approvals > 24 h |
| R-12 | Privacy | Patient data exposure through logs, exports, phone enumeration, or over-broad permissions | 2 | 5 | **High 10** | Permission split (profile vs medical), access logging (BR-G-29), log redaction scanner tests, phone masking, rate limits on search, export audit | Security engineer | SEC-D test failure; audit anomaly |
| R-13 | Availability | Access-log write failure blocks medical-data reads, which can stop sales linked to patients | 2 | 3 | **Moderate 6** | Access log in the same DB transaction (fails only when DB fails); POS can proceed without patient link; monitoring alert | Tech lead | Error rate on patient endpoints |
| R-14 | Clinical safety | Users treat allergy/interaction alerts as complete clinical checks | 2 | 5 | **High 10** | Decision-support disclaimers; exact-ingredient matching only; interactions disabled until licensed source (REG-09); pharmacist acknowledgement recorded | Product owner + SME | SME review finding |
| R-15 | Clinical safety | OCR output accepted without proper verification | 1 | 5 | **Moderate 5** | OCR disabled until Future; field-by-field pharmacist confirmation; never auto-approve (BR-G-14) | Product owner | — |
| R-16 | Delivery | MVP scope (134 stories, ≈ 305 dev-days) exceeds team capacity; schedule slips | 3 | 3 | **High 9** | Phase-by-phase DoD, story-level estimates, monthly re-baselining, MVP overrides already applied; candidates to cut further: US-06-17 reprint, US-06-22 return approval, US-04-14 metadata correction | Product owner | Velocity < 70% of plan for 2 iterations |
| R-17 | Quality | Documentation drift between specs, stories and implementation | 3 | 3 | **High 9** | `docs-check` in CI (G13); DoD D27/D28; IDs never reused; generated traceability and registers | Tech lead | docs-check failures |
| R-18 | Operations | Backup restore fails or exceeds RTO in a real incident | 2 | 5 | **High 10** | WAL archiving + daily base backups; monthly restore drills with reconciliation; RTO measured | DevOps | Drill exceeds 4 h or fails |
| R-19 | Security | Refresh-token theft or session hijacking | 2 | 4 | **High 8** | HttpOnly/Secure/SameSite cookie, rotation with family reuse detection (CS-12), short access tokens, CSP, MFA in V1 | Security engineer | Reuse-detected events |
| R-20 | Inventory process | Stocktake variances distorted by sales at the same instant as the snapshot (timestamp boundary) | 2 | 2 | **Moderate 4** | Variance uses movement `BatchSequence` after snapshot; residual risk documented in SPEC-04; recount option | Operations manager | Unexplained variances |
| R-21 | Dependency | Third-party library vulnerabilities (NuGet/npm) | 3 | 3 | **High 9** | Dependency scanning gate (G5), Renovate/Dependabot weekly, SBOM | DevOps | Critical CVE alert |
| R-22 | Scale | SaaS noisy neighbor: one large organization's reports degrade others | 2 | 3 | **Moderate 6** | Statement timeouts, background exports for large reports, per-organization rate limits, read replica path documented | Tech lead | p95 regression during report runs |
| R-23 | Adoption | Cashier speed at POS lower than legacy system (keyboard flow, Arabic UI) | 3 | 3 | **High 9** | Keyboard-first design, SME usability sessions in Phase 5, sale in ≤ 3 interactions after scanning (vision success metric) | Product owner | UAT feedback; sale time > legacy |
| R-24 | Audit integrity | A database superuser could rewrite audit rows and recompute the hash chain undetected, because chain heads are not yet anchored outside the database | 1 | 4 | **Moderate 4** | Superuser access restricted to break-glass procedure with separate audit; V1 hardening: daily signed chain-head digest exported to WORM object storage (ADR-008 amendment) | Security engineer | Break-glass access used |
| R-25 | Documentation | Architecture docs drift from specs (found 2026-11-10: DATABASE-DESIGN vs SPEC-01/02/04, ADR-005/008 vs SPEC-01/10) | 2 | 3 | **Moderate 6** | Consistency fixes applied 2026-11-10; specs declared authoritative over architecture docs for module behavior; DoD D27/D28 keep them in sync | Tech lead | Reviewer finds mismatch |

## 2. Top risks to watch

1. **R-03 and R-04 (Critical):** regulatory and e-invoicing obligations. The mitigation starts **now**: send the questions pack in REGULATORY-CONSIDERATIONS-EGYPT §4.
2. **R-01, R-02, R-12 (High, high impact):** inventory correctness, tenant isolation and privacy. They are covered by mandatory automated gates from Phase 0 and Phase 3.
3. **R-05 and R-10:** financial calculation consistency and opening-balance accuracy at go-live.

## 3. Review cadence

Risks are reviewed at each phase boundary and whenever a trigger fires. Closed risks stay in the register with their closure date and evidence.
