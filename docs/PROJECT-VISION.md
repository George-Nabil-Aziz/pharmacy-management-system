# Pharmacy Management System — Project Vision

| Field | Value |
|---|---|
| Version | 2.0 (consolidated) |
| Status | Baseline for specification |
| Date | 2026-11-09 |
| Source | Builds on the product owner's original `docs/1. Project Vision.md` (v1.0, Initial Draft), which remains unchanged as the source input. All objectives, modules, differentiators, and boundaries of the original are preserved; this version adds personas, deployment models, BRQ mapping, measurable success metrics, MVP definition, and Egyptian market context. |
| Authority | Terminology, IDs, and rules follow [DOCUMENTATION-CONVENTIONS.md](DOCUMENTATION-CONVENTIONS.md). |
| Related | [MASTER-SDD.md](MASTER-SDD.md) · [GLOSSARY.md](GLOSSARY.md) · [ADVANCED-FEATURES.md](ADVANCED-FEATURES.md) · [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md) |

---

## 1. Problem Statement

Many pharmacies in Egypt — independent pharmacies and growing chains alike — run daily operations on a mix of basic POS software, spreadsheets, paper registers, and memory. This produces recurring, costly problems:

| Problem | Business impact |
|---|---|
| Stock is tracked as a single quantity per medicine, not per batch and expiry date | Expired stock is discovered on the shelf, sold by mistake, or written off too late; recalls cannot be traced to batches |
| Stock quantities drift from physical reality | Lost sales (system says "out of stock" when it is not), oversell (system says "in stock" when it is not), undetected shrinkage |
| Sales, returns, and voids can be edited without trace | Cash discrepancies, fraud risk, disputes with staff |
| Procurement is informal (phone orders, paper supplier invoices, bonus quantities not recorded) | Unknown supplier balances, wrong unit cost, overstated profit |
| Prescriptions and dispensing are not linked to sales | No dispensing history per patient, no partial-dispensing record, weak control over prescription-only and controlled medicines |
| Owners cannot see branches side by side | Decisions on transfers, purchasing, and staffing are made blind; stock sits idle in one branch while another runs out |
| Profit is confused with cash in the drawer | Owners misjudge business performance; COGS and inventory valuation are unknown |
| Software is English-only or Arabic-only, with poor RTL | Training cost and data-entry errors |

## 2. Vision

> Give every Egyptian pharmacy — from a single neighborhood pharmacy to a multi-branch chain — one trustworthy system of record for medicines, batches, stock, sales, prescriptions, suppliers, and money, so that the right medicine is sold from the right batch, every unit and every pound is accounted for, and owners make decisions from accurate numbers.

**Product type:** Multi-branch Pharmacy Management & ERP system, deployable as a single-pharmacy installation, a chain installation, or a multi-organization SaaS.

**Guiding qualities** (each made measurable in §9 and in the NFR baseline NFR-G-01…10):
- **Correct** — stock and money are never silently wrong (ledger-based, transactional, audited).
- **Fast at the counter** — scanning-first POS with minimal clicks.
- **Safe** — expired and quarantined stock cannot be sold; prescription-only controls are configurable; pharmacists verify.
- **Accountable** — every sensitive action is attributable to an individual and tamper-evident.
- **Bilingual** — first-class Arabic (RTL) and English (LTR).

## 3. Target Users and Personas

Roles correspond to the system roles in [conventions §5.1](DOCUMENTATION-CONVENTIONS.md). The original vision's "System Administrators" maps to two personas: the organization's **Owner** (who administers users and settings inside the organization) and the **Platform Administrator** (SaaS operator, outside any organization).

| Persona (role code) | Context | Goals | Pain points today | Key capabilities |
|---|---|---|---|---|
| **Owner** (`OWNER`) | Owns the pharmacy business; may own 1–50 branches; often a pharmacist; checks numbers daily, frequently from a phone or laptop away from the counter | Know real profit, cash, and stock value per branch; control staff permissions; prevent losses and expiry waste | Cannot separate cash from profit; does not trust stock numbers; discovers expired stock late; staff can alter sales | Organization dashboard, branch comparison, profit/COGS/valuation reports, roles and permissions, audit log, approvals |
| **Branch Manager** (`MANAGER`) | Runs one or a few branches; responsible for stock, staff shifts, cash | Keep shelves stocked without overstock; approve adjustments, transfers, discounts; close the day cleanly | Manual reorder lists; unexplained variances; no visibility of other branches' stock | Low-stock and near-expiry alerts, approvals, stocktakes, transfers, cash session oversight, branch reports |
| **Pharmacist** (`PHARMACIST`) | Licensed professional at the counter; dispenses, advises patients, verifies prescriptions | Dispense correctly and quickly; see patient history and allergies; record partial dispensing | Paper prescriptions; no history; pressure to sell Rx-only medicines without prescription; finding alternatives when out of stock | Prescription registration and verification, dispensing with batch traceability, patient profiles, alternatives lookup, decision-support alerts (advanced) |
| **Cashier** (`CASHIER`) | Front counter, high transaction volume, may not be a pharmacist | Scan, take payment, print invoice in seconds; avoid cash shortages at shift end | Slow search; price mistakes; manual change calculation; blamed for discrepancies | Barcode-first POS, pack/strip selling, payments and change, own cash session, returns initiation |
| **Inventory Staff** (`INVENTORY`) | Receives deliveries, counts stock, prepares transfers | Receive supplier deliveries accurately (batch, expiry, bonus quantity); count fast | Re-typing supplier invoices; bonus units recorded inconsistently; long counting days | Goods receipt against PO, batch/expiry entry, stocktake sessions, transfer dispatch/receipt (no approval rights) |
| **Accountant** (`ACCOUNTANT`) | In-house or external; monthly or daily | Reliable revenue, COGS, gross profit, expenses, supplier balances, cash reconciliation | Numbers assembled from many sources; no audit trail; returns and voids not separated | Finance reports, expenses, supplier payments, cash reconciliation, exports |
| **Platform Administrator** (`PLATFORM_ADMIN`) | SaaS operator staff (SaaS deployment only) | Onboard organizations, manage subscriptions, support customers, keep the platform healthy | Needs to help customers without seeing their business data | Organization lifecycle, subscription status, platform monitoring; business data only via Owner-approved, time-limited, audited support grant |

## 4. Deployment Models

| Model | Description | Organizations | Branches | Hosting | Notes |
|---|---|---|---|---|---|
| **Single pharmacy** | One independent pharmacy | 1 | 1 | On-premise server/PC or a hosted instance | Same product; branch features simply have one branch. Docker Compose footprint: app, PostgreSQL, MinIO |
| **Chain** | One legal business with several branches | 1 | 2–50 (design target) | Hosted or private cloud | Centralized catalog and reporting; per-branch inventory; transfers between branches |
| **SaaS** | Multi-organization platform operated by a provider | Many | Many per organization | Provider-operated cloud | Strict organization isolation (ADR-002); platform administrator role; data residency subject to REG-04 |

All three models run the **same codebase and schema**; a single pharmacy is an Organization with one Branch (BRQ-02).

## 5. Business Objectives Mapped to Business Requirements

The original vision's ten objectives are retained and mapped to the canonical business requirements (BRQ-01 … BRQ-15).

| # | Business objective (original wording preserved where possible) | BRQs |
|---|---|---|
| O-1 | Centralize pharmacy operations in one system of record | BRQ-02, BRQ-03, BRQ-06, BRQ-07 |
| O-2 | Maintain accurate medicine and inventory records | BRQ-03, BRQ-04, BRQ-05 |
| O-3 | Track medicine batches, expiry dates, and stock movements | BRQ-04, BRQ-05, BRQ-11 |
| O-4 | Streamline sales and prescription dispensing workflows | BRQ-07, BRQ-09 |
| O-5 | Maintain patient profiles and prescription history with privacy | BRQ-08, BRQ-09 |
| O-6 | Simplify purchasing and supplier management | BRQ-06 |
| O-7 | Provide financial and operational reporting | BRQ-10 |
| O-8 | Support multiple branches with centralized management | BRQ-02 |
| O-9 | Improve accountability through permissions and audit logs | BRQ-01, BRQ-12 |
| O-10 | Support Arabic and English interfaces | BRQ-13 |
| O-11 *(added)* | Alert users proactively to stock and expiry risks | BRQ-11 |
| O-12 *(added)* | Operate reliably in production with backup and restore | BRQ-14 |
| O-13 *(added)* | Remain configurable for Egyptian regulatory and tax requirements once validated by professionals | BRQ-15 |

## 6. Scope

### 6.1 Core scope (specified in SPEC-01 … SPEC-10)

| Capability (original module names) | Spec |
|---|---|
| User & Role Management | SPEC-01 Identity & Access |
| Branch Management (organization, branches, settings) | SPEC-02 Organization & Branches |
| Medicine Catalog Management | SPEC-03 Medicine Catalog |
| Medicine Batch Management, Inventory Management, Multi-Branch Stock Transfers | SPEC-04 Batch & Inventory |
| Supplier Management, Purchasing & Receiving | SPEC-05 Suppliers & Procurement |
| Point of Sale, Sales & Returns | SPEC-06 Sales & POS |
| Patient Management | SPEC-07 Patient Records |
| Prescription Management, Prescription Image Upload | SPEC-08 Prescriptions |
| Financial Management, Reports & Analytics | SPEC-09 Finance & Reporting |
| Notifications, Real-Time Notifications, Audit, System Settings, Background Jobs, Backup & Restore | SPEC-10 Notifications, Audit & Settings |
| Barcode scanning (as an input method at POS/receiving) | SPEC-03, SPEC-06 |
| Data Import & Export (medicine import/export, report export) | SPEC-03, SPEC-09 |

### 6.2 Advanced scope

Evaluated individually, with go/no-go criteria, in [ADVANCED-FEATURES.md](ADVANCED-FEATURES.md): barcode generation, drug interaction alerts, allergy alerts, alternative medicine suggestions, loyalty program, customer notifications, prescription OCR, supplier price comparison, advanced analytics (including expiry and low-stock forecasting), multi-branch inventory optimization, automated purchasing suggestions, advanced backup/restore, and advanced audit reporting.

### 6.3 Out of scope for v1
- Offline POS operation (the POS requires connectivity to the server; on-premise deployment is the mitigation for unreliable internet).
- Integrated card/wallet payment terminals (non-cash payments are recorded manually by method and reference).
- Electronic invoicing integration with tax authority systems (pending REG-07; designed as an extension point).
- National track-and-trace integration (pending REG-03).
- E-commerce, delivery apps, insurance claims processing, general-ledger accounting (exports provided instead).
- Clinical decision making of any kind (see §7).

## 7. Product Boundaries and Safety Disclaimers

Preserved from the original vision and made explicit:

1. The system is an **operational management tool, not a clinical decision system** and not a replacement for professional pharmaceutical or medical judgment.
2. It **must not** diagnose patients, prescribe medication, recommend dosages, or automatically approve prescriptions or OCR results (BR-G-14).
3. **Drug interaction, allergy, and alternative-medicine features are decision support only.** They require licensed, reliable reference data (REG-09), display a visible disclaimer, can be acknowledged/overridden by a pharmacist with a recorded reason, and their absence of a warning never implies safety.
4. **Alternative medicine suggestions** are based on catalog data (same active ingredients and strength) maintained by the organization; any substitution is the pharmacist's decision, subject to applicable rules (REG-08).
5. **Regulatory behavior is configurable, not asserted.** Defaults for prescription enforcement, controlled medicines, retention, tax, e-invoicing, and returns are documented in [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md) and must be confirmed by qualified Egyptian professionals before production use. **No compliance is claimed.**

## 8. Product Differentiators

Original differentiators retained, with how each is guaranteed:

| Differentiator | Guarantee mechanism |
|---|---|
| Batch-level inventory tracking | `Batch` per medicine per branch; integer base units (conventions §6) |
| FEFO-based stock allocation | Default allocation with audited, permissioned override (BR-G-06, ADR-004) |
| Full stock movement history | Append-only ledger linked to source documents (BR-G-05, ADR-003) |
| Prescription-to-sale traceability | `DispensingRecord` links prescription item ↔ sale line ↔ batch (BR-G-15) |
| Multi-branch inventory visibility | Organization-level stock reports; explicit transfer workflow (BR-G-13) |
| Detailed audit logging | Same-transaction, hash-chained audit log (BR-G-16, ADR-008) |
| Arabic RTL and English LTR | i18next, logical CSS properties (ADR-009) |
| Light, dark, and system themes | User preference (BRQ-13) |
| Configurable permissions | Permission codes + custom roles (conventions §5) |
| Reliable transaction handling | Atomic workflows, idempotency keys, concurrency control (BR-G-19, BR-G-35) |
| *(added)* Wholesale-aware receiving | Bonus quantities recorded at zero cost and reflected in batch unit cost (SPEC-05) |
| *(added)* Pack and split-pack selling | `PackSize`, `AllowSplitPack`, base-unit stock (conventions §6.3) |

## 9. Success Metrics

Measured in pilot and production; targets apply per branch unless stated.

| ID | Metric | Target | Measurement method | BRQ |
|---|---|---|---|---|
| SM-01 | Stock accuracy at stocktake (lines with zero variance ÷ lines counted) | ≥ 99.5% after 3 months of use | Stocktake variance reports (SPEC-04) | BRQ-04 |
| SM-02 | Oversell incidents (balance < 0 or sale of unavailable stock) | 0 in production; 0 in concurrency test suite (NFR-G-06) | Reconciliation job, DB constraint violations, CS-01 tests | BRQ-05 |
| SM-03 | Expired-stock sales | 0 | Sale allocations vs batch expiry audit query | BRQ-05 |
| SM-04 | POS interaction count for a scanned single-item cash sale | Sale completed in ≤ 3 clicks/keystrokes after scanning (e.g., Pay → confirm amount → Complete) | UX test script; usability test with cashiers | BRQ-07 |
| SM-05 | Sale completion latency | p95 ≤ 800 ms, p99 ≤ 1.5 s (NFR-G-02) | APM metrics | BRQ-07 |
| SM-06 | POS medicine search | p95 ≤ 300 ms server time (NFR-G-01) | APM metrics | BRQ-03 |
| SM-07 | Write-off value due to expiry | ≥ 30% reduction vs. pilot baseline after 6 months | Write-off reports (`WriteOffExpired`) vs baseline collected at onboarding | BRQ-04, BRQ-11 |
| SM-08 | Cash session discrepancies | ≥ 95% of sessions closed with zero discrepancy after 3 months | Cash session reports | BRQ-07, BRQ-10 |
| SM-09 | Ledger reconciliation mismatches | 0 unexplained mismatches | Nightly reconciliation job | BRQ-04, BRQ-12 |
| SM-10 | Dispensing traceability | 100% of prescription dispensing events linked to sale line and batch | Data integrity query | BRQ-09 |
| SM-11 | Cross-organization data exposure | 0 incidents; 100% of endpoints covered by CS-07/CS-08 tests | Security test suite, penetration test | BRQ-02 |
| SM-12 | Audit chain integrity | 100% of nightly verifications pass | Audit verification job | BRQ-12 |
| SM-13 | Localization completeness | 100% key parity `ar`/`en`; 0 untranslated strings in core flows | CI check | BRQ-13 |
| SM-14 | Availability | ≥ 99.5% monthly (NFR-G-04) | Uptime monitoring | BRQ-14 |
| SM-15 | Restore readiness | Monthly restore test passes within RTO ≤ 4 h, RPO ≤ 15 min (NFR-G-05) | Restore drill records | BRQ-14 |
| SM-16 | Report correctness | Net sales, COGS, gross profit match independent recomputation from ledgers to the piaster | Automated reconciliation tests (SPEC-09) | BRQ-10 |

## 10. MVP Summary

The MVP is the smallest release a real pharmacy (single branch, then a small chain) can run its counter on, end to end, with correct stock and money.

| Area | MVP includes | Deferred |
|---|---|---|
| Identity & access | Login, JWT + refresh rotation, roles/permissions, branch assignments, lockout, session revoke | MFA, SSO |
| Organization | Organization and branch setup, branch settings (time zone, near-expiry, do-not-sell window), document numbering | Subscriptions billing (P3) |
| Catalog | Medicines with barcodes, pack size/split pack, active ingredients, categories, manufacturers, prices (org + branch override), Rx-only/controlled flags, CSV import | Licensed external catalog import (REG-09) |
| Inventory | Batches, ledger, FEFO allocation, adjustments with approval, write-offs, stocktake, expiry flagging, low-stock/near-expiry alerts, transfers | Optimization, forecasting |
| Procurement | Suppliers, POs, goods receipt (partial, bonus quantities), supplier invoices, supplier returns, payments, balances | Price comparison, automated purchase suggestions |
| Sales | POS with barcode scanning, pack/base-unit selling, discounts with limits/override, cash and recorded non-cash payments, invoice printing, voids, returns with disposition, cash sessions | Loyalty, payment terminal integration |
| Patients & prescriptions | Patient profiles (minimal data), allergies/conditions as recorded data, prescription registration with image, pharmacist verification, partial dispensing, Rx-only enforcement setting | Interaction/allergy alerts, OCR |
| Finance & reporting | Sales, returns, net sales, COGS, gross profit, expenses, cash flow, inventory valuation, supplier balances, branch comparison, exports | Advanced analytics |
| Platform | Notifications (in-app + SignalR), audit log, settings, AR/EN, themes, monitoring, backups | Customer SMS/WhatsApp notifications |

Production use of the MVP is gated on: all CS-01 … CS-13 scenarios passing, the REG items affecting default behavior reviewed (at minimum REG-01, REG-02, REG-05, REG-06, REG-08, REG-11), and a successful restore drill.

## 11. Delivery Strategy

Incremental phases as in the original vision (Foundation & Architecture → Medicine Catalog & Inventory → Suppliers & Purchasing → Sales & POS → Patients & Prescriptions → Finance & Reporting → Multi-Branch Operations → Notifications & Advanced Features → Security Hardening & Production Readiness). Detailed release planning lives in [roadmap/](roadmap/). Security, tenancy, audit, and transaction-integrity foundations are built in the Foundation phase, not retrofitted.

## 12. Long-Term Vision

Evolve into a complete pharmacy operations ecosystem:
- Chain-level centralized purchasing and inter-branch stock optimization.
- Advanced analytics (demand forecasting, expiry risk forecasting, supplier performance).
- Validated integrations: electronic invoicing (REG-07), national traceability programmes if applicable (REG-03), licensed drug information databases (REG-09), payment providers, supplier ordering.
- Customer engagement (loyalty, refill reminders) with consent management (REG-04).
- Possible extraction of modules (e.g., reporting) into separate services when scale justifies it (ADR-001 revisit triggers).

## 13. Egyptian Market Context

| Characteristic | Product response |
|---|---|
| **Bilingual operations** — Arabic UI and receipts; medicine trade names often in Latin script | Full AR/EN with RTL/LTR, bidi-safe rendering of names and batch numbers, Arabic-normalized search (ADR-009) |
| **Cash-heavy payments** with growing card and mobile-wallet use | Cash sessions with opening float, cash in/out, closing count and discrepancy recording; non-cash payments recorded by method and reference; change calculation |
| **Strip/partial-pack sales** common at the counter | `PackSize` and `AllowSplitPack`; stock in base units |
| **Wholesale bonus quantities** (e.g., "buy 10 get 1") from distributors | Goods receipt lines record paid quantity and bonus quantity separately; batch unit cost reflects the effective cost; supplier invoice value excludes bonus |
| **Regulated medicine prices** and printed prices on packs | Price management with change audit; pricing rules pending REG-08 |
| **Prescription-only and controlled medicines** | Configurable enforcement (BR-G-21, BR-G-22) pending REG-01, REG-02 |
| **Single pharmacies with unreliable internet** | On-premise deployment option with the same software |
| **Business date in local time** | Branch time zone default `Africa/Cairo` (BR-G-23) |
| **Tax and e-invoicing** | Configurable tax categories; e-invoicing extension point; pending REG-06, REG-07 |
| **Personal data protection** | Data minimization, consent records, access logging; pending REG-04 |

**Regulatory note.** Egyptian legal, tax, and pharmaceutical requirements relevant to this product are listed as REG-01 … REG-11 in [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md). This document does not state what the law requires; every such item requires confirmation by qualified Egyptian professionals before production deployment.
