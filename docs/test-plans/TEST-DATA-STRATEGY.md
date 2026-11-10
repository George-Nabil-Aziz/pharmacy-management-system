# Test Data Strategy

**Version:** 1.0 (2026-11-10) · **Parent:** [MASTER-TEST-STRATEGY.md](MASTER-TEST-STRATEGY.md)

## 1. Principles

1. **No real patient or customer data in any non-production environment.** Data is synthetic, or anonymized irreversibly with an approval recorded under REG-04. Production restores used for drills stay inside the production security boundary and are destroyed after the drill.
2. **Tests build their own data.** Integration tests never depend on a shared mutable database. Each test or test class creates its own organization through builders.
3. **Deterministic.** Fixed random seeds, an injected clock, and injected ID generation are used where the test asserts on order or values.
4. **Realistic Egyptian context.** Arabic and English names, EGP amounts, the `Africa/Cairo` time zone, Egyptian mobile formats (`+2010…`, `+2011…`, `+2012…`, `+2015…`), split packs, wholesale bonus quantities, and refrigerated items.
5. **Medical data is fictional.** Medicine names in fixtures are invented brand names with real-looking generic structure, for example "Paracetol 500 mg tablets". Interaction or clinical data is never invented as if it were real (REG-09).

## 2. Data layers

| Layer | Purpose | Mechanism | Used by |
|---|---|---|---|
| L0 Reference seed | Permissions catalog, system roles, audit action catalog, settings registry, dosage forms, default tax category (0%) | EF Core seed / migration data | All environments |
| L1 Builders | Fluent builders per aggregate: `OrganizationBuilder`, `BranchBuilder`, `UserBuilder.WithRole(PHARMACIST).AssignedTo(branch)`, `MedicineBuilder`, `BatchBuilder.Expiring(days)`, `SaleBuilder`, `PrescriptionBuilder`… | `tests/TestKit` shared library; builders call application commands, not raw SQL, so invariants and audit hold | Unit (domain builders), integration |
| L2 Scenario fixtures | Named, reusable situations: "last unit", "expired only batch", "two batches FEFO", "PO 100 packs", "Rx 60 tablets", "two orgs isolation" | Fixture classes composed from builders | Integration, API, E2E |
| L3 Demo dataset | "Demo pharmacy" for E2E, UAT, and demos | Seeder command `pms seed demo` | Nightly E2E, staging |
| L4 Volume dataset | Performance testing at scale | Seeder command `pms seed volume --profile v1` (bulk COPY, then ledger-consistent balances) | Performance env |

## 3. Standard fixtures (L2)

| Fixture | Contents | Covers |
|---|---|---|
| `TwoOrganizationsFixture` | Org A (branches A1, A2), Org B (branch B1); users of all 6 roles per org; one user assigned only to A1 | CS-07, CS-08 |
| `LastUnitFixture` | Medicine M1 in A1 with one batch, OnHand 1 | CS-01 |
| `ExpiryFixture` | M2 with batch expired yesterday (branch date), batch expiring today, batch inside do-not-sell window, valid batch | CS-02, BR-G-07/27 |
| `FefoFixture` | M3 with three batches: expiry +30, +60 (received earlier), +60 (received later) | FEFO ordering |
| `ProcurementFixture` | Supplier S1, approved PO for 100 packs, PackSize 20 | CS-03 |
| `TransferFixture` | Stock in A1, destination A2, approver ≠ requester | CS-06, BR-G-28 |
| `SaleWithLinesFixture` | Completed sale: 3 lines with discount and tax, cash + card payments | CS-05, returns, reports |
| `PrescriptionFixture` | Patient P1 with allergy to ingredient I1; verified Rx for 60 tablets of M4 (Rx-only); controlled medicine M5 | CS-04, CS-13, allergy alerts |
| `CashSessionFixture` | Open session with float 500.00 EGP | cash flows, Z-report |
| `FinanceDayFixture` | One business day with sales, return, void, discounts, expenses, receipts — with golden expected totals | SPEC-09 golden files |

## 4. Demo dataset (L3)

| Element | Volume |
|---|---|
| Organizations | 2 ("صيدلية النور / Al-Nour Pharmacy" with 3 branches; "Demo Pharmacy B" with 1 branch — for isolation demos) |
| Users | 12 per org across all roles; known demo passwords stored only in the staging secret store |
| Medicines | 1,500 (OTC, Rx-only, controlled, refrigerated, split-pack, multiple barcodes) |
| Batches | 4,000 with expiry spread −30…+900 days |
| Suppliers | 15 with POs, receipts, invoices, payments |
| History | 90 days of sales (≈ 20,000), returns, transfers, stocktakes, prescriptions (≈ 3,000), patients (≈ 2,000 fictional, phone numbers in a reserved fictional range) |

The demo seeder posts everything through application commands, so ledgers, audit chains, and document numbers are valid. After seeding, the reconciliation job must report zero drift.

## 5. Volume dataset (L4)

| Entity | Count |
|---|---|
| Branches | 50 (large org) |
| Medicines | 50,000 |
| Batches | 500,000 |
| Stock movements | 20,000,000 (partitioned monthly over 24 months) |
| Sales | 500,000 per year with ≈ 1.6 M lines |
| Patients | 500,000 |
| Prescriptions | 1,000,000 |
| Audit rows | 50,000,000 |

To keep generation time reasonable, it uses bulk `COPY`. Afterwards a consistency pass recomputes `BatchBalance` and `BalanceAfter` from movements, rebuilds the audit hash chain, and runs the reconciliation job, which must report zero drift. Generation is scripted and versioned with the schema.

## 6. Anonymization (if ever needed)

Production data must not be copied to lower environments by default. If a production defect needs production-shaped data, use the anonymization procedure:

1. Anonymization runs inside production.
2. Names, phones, emails, addresses, notes, and prescription images are replaced or removed. Dates are shifted per patient, and the inventory and financial structure is kept.
3. A verification query confirms that no original identifiers remain.
4. Approval is recorded (REG-04).

## 7. Data lifecycle

| Environment | Reset policy |
|---|---|
| CI | Containers destroyed after each run |
| Nightly E2E | Re-seeded from L3 every night |
| Staging | Re-seeded each release candidate; restore drills use production backups only inside the production boundary |
| Performance | L4 regenerated when the schema changes; otherwise snapshotted and restored per run |

## 8. Ownership

QA owns the builders and fixtures, with each module's developers contributing builders for their aggregates. Every new aggregate requires a builder before its first integration test (Definition of Ready R3/R4).
