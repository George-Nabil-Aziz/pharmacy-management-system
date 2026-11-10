# Regulatory Considerations — Egypt

**Status:** Unverified — every item requires confirmation by qualified Egyptian professionals
**Version:** 1.0 (2026-11-10)
**Related:** [DOCUMENTATION-CONVENTIONS.md §10](DOCUMENTATION-CONVENTIONS.md), [ASSUMPTIONS-AND-OPEN-DECISIONS.md](ASSUMPTIONS-AND-OPEN-DECISIONS.md), [RISKS-AND-MITIGATIONS.md](RISKS-AND-MITIGATIONS.md)

> **Disclaimer.** This document does **not** state what Egyptian law requires and does **not** claim that the product is compliant with any law, regulation, standard, or authority requirement. It cites no laws, decrees, or article numbers. It lists the areas where the design depends on legal, tax, privacy, or pharmaceutical rules, the **configurable default behavior** the product adopts until those rules are confirmed, and the questions that qualified Egyptian legal counsel, tax advisors, and pharmaceutical regulatory professionals must answer **before production deployment**. Bodies are referred to generically (e.g., "the national medicines regulator", "the tax authority").

## 1. How regulatory uncertainty is handled in the design

1. **Configurable, not hard-coded.** Every behavior that depends on an unconfirmed rule is controlled by an organization or branch setting (SPEC-10 settings registry) or by medicine classification data (SPEC-03), so a confirmed answer changes configuration, not code.
2. **Safe defaults.** Where the rule is unknown, the default is the more restrictive or more traceable option (e.g., Rx enforcement ON, restock-on-return OFF, no hard deletion of records).
3. **Record everything, delete nothing.** Ledgers, documents, prescriptions, and audit logs are retained indefinitely by default (BR-G-34) until retention periods are confirmed (REG-05). Retention reduction is a later, deliberate configuration change.
4. **Go-live gate.** Release R1 (see [roadmap/RELEASE-PLAN.md](roadmap/RELEASE-PLAN.md)) cannot be deployed for a real pharmacy until every item marked **Blocking for go-live** below has a documented answer from a qualified professional, recorded in the "Confirmation record" column of §3.

## 2. Summary table

| ID | Area | Default product behavior | Specs affected | Blocking for go-live |
|---|---|---|---|---|
| REG-01 | Prescription requirement & validity | `EnforcePrescriptionForRxOnly` = ON; `PrescriptionValidityDays` = 30; prescriptions retained indefinitely | SPEC-03, 06, 07, 08, 02, 10 | Yes |
| REG-02 | Controlled medicines | Controlled class requires Pharmacist + verified prescription + register entry; no export format assumed | SPEC-03, 04, 06, 07, 08, 10 | Yes (if controlled medicines are stocked) |
| REG-03 | Medicine traceability | Batch number + expiry mandatory on receipt; full movement ledger; no serialization | SPEC-03, 04, 05, 06 | No (design is extensible) |
| REG-04 | Personal & health data protection | Data minimization, purpose-based consent, medical-data access logging, no national ID by default, single-region hosting | SPEC-01, 02, 06, 07, 08, 09, 10 | Yes |
| REG-05 | Record retention | No hard deletion; patient anonymization instead of deletion | All | Yes |
| REG-06 | Tax treatment (VAT) | Tax categories configurable per medicine; default rate 0% until configured; tax-inclusive pricing setting | SPEC-03, 05, 06, 09 | Yes |
| REG-07 | Electronic invoicing / receipts | Sequential gapless invoice numbers; printable receipt; **no** e-invoice/e-receipt integration in MVP | SPEC-02, 05, 06, 09 | Yes (confirm whether integration is mandatory for the customer) |
| REG-08 | Pharmacy operating rules | Pharmacist role required for Rx/controlled dispensing; price change permission-controlled; generic substitution requires pharmacist + reason | SPEC-01, 02, 03, 04, 05, 06, 08 | Yes |
| REG-09 | Licensing of drug reference data | No external drug database; interactions feature disabled; catalog import from customer-owned files only | SPEC-03, 07, 08 | No (feature stays disabled) |
| REG-10 | Third-party processing of prescription images / OCR | OCR disabled; images stored in private storage in the deployment region | SPEC-07, 08 | No (feature stays disabled) |
| REG-11 | Restocking returned medicines | Returned items default to `PendingInspection`; `AllowDirectRestockOnReturn` = OFF | SPEC-02, 04, 06, 08, 09, 10 | Yes |

## 3. Detailed items

### REG-01 — Prescription requirement, validity, and retention
- **Why it matters:** Determines whether the POS may sell a medicine without a prescription, how long a prescription can be dispensed against, and whether partial dispensing over several visits is acceptable.
- **Default behavior:** Medicines carry a classification `OTC` / `PrescriptionOnly` / `Controlled` (SPEC-03). With `EnforcePrescriptionForRxOnly` = ON, a `PrescriptionOnly` medicine can only be sold when linked to a `Verified` prescription item (BR-G-21, CS-13). Prescription validity defaults to 30 days, after which the nightly job sets `Expired` (SPEC-08). Partial dispensing is supported (BR-G-15).
- **Must be confirmed:** (a) which medicines legally require a prescription and who maintains that classification; (b) validity period and whether it differs by class; (c) whether partial dispensing/refills are permitted and how they must be recorded; (d) whether the original paper prescription must be retained physically, and whether an image suffices; (e) prescription retention period.
- **Reviewer:** Pharmaceutical regulatory counsel; licensed pharmacist.
- **Design impact if different:** Change setting values and classification data; if paper retention is required, add a "physical prescription retained" checkbox (small change in SPEC-08).
- **Confirmation record:** *Pending.*

### REG-02 — Controlled medicines
- **Why it matters:** Narcotic and psychotropic medicines are typically subject to stricter custody, dispensing, register, and reporting obligations.
- **Default behavior:** `Controlled` medicines: dispensing only by a user with `prescriptions.controlled.dispense` (Pharmacist), verified prescription required, `ControlledMedicineRegisterEntry` written in the same transaction (BR-G-22), adjustments/write-offs on controlled medicines always require approval (SPEC-04), register is read-only and exportable.
- **Must be confirmed:** register format and mandatory fields; periodic reporting to authorities and its format; storage/custody requirements the software should support; whether prescriptions for controlled medicines need special forms; whether controlled medicines may be transferred between branches.
- **Reviewer:** Pharmaceutical regulatory counsel.
- **Design impact if different:** Additional register fields and report formats (SPEC-08, SPEC-09); possible block on transfers of controlled medicines (SPEC-04 policy setting).
- **Confirmation record:** *Pending.*

### REG-03 — Medicine traceability
- **Why it matters:** National track-and-trace or serialization programmes may require scanning unique pack identifiers or reporting movements.
- **Default behavior:** Batch-level traceability: batch number and expiry mandatory at receiving (SPEC-05), every quantity change in the stock movement ledger with source document (BR-G-05), recall support via batch quarantine (SPEC-04). GTIN barcodes validated where applicable (SPEC-03). **No** per-pack serial numbers, **no** 2D DataMatrix parsing, **no** reporting integration.
- **Must be confirmed:** whether any national traceability programme applies to retail pharmacies, timelines, and required data elements.
- **Reviewer:** Regulatory counsel.
- **Design impact if different:** Add serial-number capture on receiving/sale lines and an integration adapter — an additive module change; the ledger design does not need to change.
- **Confirmation record:** *Pending.*

### REG-04 — Personal and health data protection
- **Why it matters:** Patient profiles, allergies, conditions, and prescriptions are sensitive personal data.
- **Default behavior:** Data minimization (SPEC-07 lists data deliberately not collected; national ID OFF by default); separation of demographic and medical permissions; purpose-based consent records with `RequireConsentForMedicalData` = ON; every medical-data read access-logged (BR-G-29); encryption in transit; encrypted volumes at rest; logs never contain medical data (NFR-G-10); patient data export and anonymization (SPEC-07); single-region hosting with data residency configurable per deployment.
- **Must be confirmed:** applicability of Egyptian personal data protection legislation to pharmacies and to the SaaS operator; legal basis for processing health data (consent vs other); registration/licensing obligations of controller/processor; data residency and cross-border transfer rules (affects cloud region and any OCR/SMS provider); breach notification duties; data subject rights and response deadlines; minimum age for consent.
- **Reviewer:** Privacy / data protection counsel.
- **Design impact if different:** Consent flow wording and scope; hosting region; export format; possibly a DPO contact and breach workflow (SPEC-10).
- **Confirmation record:** *Pending.*

### REG-05 — Record retention
- **Why it matters:** Sales, purchase, tax, prescription, controlled-medicine, and audit records may each have minimum (and for personal data, maximum) retention periods.
- **Default behavior:** No application user can hard-delete financial, inventory, prescription, or audit records (BR-G-33, BR-G-34). Patient deletion requests are fulfilled by anonymization where records must be retained. Audit logs and stock movements are partitioned monthly so a confirmed retention period can be applied by detaching partitions (DATABASE-DESIGN §11).
- **Must be confirmed:** minimum retention per record type; maximum retention for personal data; whether electronic records are acceptable in place of paper.
- **Reviewer:** Legal and tax counsel.
- **Design impact if different:** Configure archival jobs per record type (Phase 9 operational task).
- **Confirmation record:** *Pending.*

### REG-06 — Tax treatment of medicines and other goods
- **Why it matters:** Sale totals, invoice layout, and the tax summary report depend on which goods are taxable and at what rate.
- **Default behavior:** Each medicine has a `TaxCategory` (SPEC-03); rates are organization configuration with effective dates; no rate is assumed by the product (seed category "Standard" has rate 0% until the organization configures it); tax-inclusive vs tax-exclusive pricing is an organization setting; tax snapshotted per sale line (BR-G-20); VAT collected report (SPEC-09).
- **Must be confirmed:** VAT applicability and rates for medicines, cosmetics, medical devices, and supplements; treatment of discounts; whether shelf prices must be tax-inclusive; supplier invoice input tax handling.
- **Reviewer:** Tax advisor.
- **Design impact if different:** Configuration only, unless multiple taxes per line are required (would extend SPEC-06 line model).
- **Confirmation record:** *Pending.*

### REG-07 — Electronic invoicing and electronic receipts
- **Why it matters:** The tax authority may require B2B e-invoices and/or B2C e-receipts to be submitted electronically with specific identifiers and signatures.
- **Default behavior:** Gapless, branch-unique invoice numbering (BR-G-24); printable 80 mm receipt and A4 invoice; immutable completed sales (BR-G-11); **no** submission integration in MVP or V1 (P3 in SPEC-06/SPEC-09). The sale data model keeps every field normally needed for later submission (seller tax ID, line tax, totals, timestamps, document UUID).
- **Must be confirmed:** whether and when e-receipt/e-invoice obligations apply to the customer's pharmacy; required data elements, signing, and real-time vs batch submission; behavior when submission fails.
- **Reviewer:** Tax advisor.
- **Design impact if different:** An outbox-driven integration adapter per ADR-001/ADR-007 (asynchronous, retryable), plus document status fields. If submission must be synchronous before printing, the POS sequence in SPEC-06 changes — this is the highest-impact unknown and is tracked as risk R-04.
- **Confirmation record:** *Pending.*

### REG-08 — Pharmacy operating requirements
- **Why it matters:** Rules on pharmacist presence, pricing of medicines, generic substitution, and price display constrain workflows and permissions.
- **Default behavior:** Pharmacist-only permissions for prescription verification and controlled dispensing; generic substitution requires pharmacist decision + reason + patient-consent flag (SPEC-08); selling price changes require `catalog.prices.update` and are audited with history (SPEC-03); organization stores license number fields without verifying them (SPEC-02).
- **Must be confirmed:** whether a licensed pharmacist must approve every sale of non-OTC items; regulated maximum prices and whether selling above them must be blocked; rules for generic substitution; label requirements for dispensed medicines.
- **Reviewer:** Pharmaceutical regulatory counsel.
- **Design impact if different:** Add a "regulated maximum price" field with a hard block (SPEC-03/SPEC-06); adjust role defaults.
- **Confirmation record:** *Pending.*

### REG-09 — Licensing of drug reference data
- **Why it matters:** Drug interaction, allergy cross-reactivity, and national catalog data must come from licensed, reliable, maintained sources.
- **Default behavior:** No external source is integrated or assumed. Allergy alerts use exact active-ingredient matching against the organization's own catalog data only (SPEC-07). Drug interaction alerts are **disabled** until a licensed source is contracted, validated, and approved (SPEC-08, [ADVANCED-FEATURES.md](ADVANCED-FEATURES.md)). Catalog import accepts customer-provided files only.
- **Must be confirmed:** licensing terms, permitted use, update frequency, liability, and clinical validation of any candidate source.
- **Reviewer:** Legal / procurement; clinical pharmacist for validation.
- **Design impact if different:** None until a source is chosen; the integration contract is specified in SPEC-08.
- **Confirmation record:** *Pending.*

### REG-10 — Third-party processing of prescription images and OCR
- **Why it matters:** Sending prescription images to an OCR provider is processing of health data by a third party, possibly cross-border.
- **Default behavior:** OCR feature disabled (P3). When enabled, OCR output is suggestion-only and always requires pharmacist confirmation field by field (BR-G-14). Images stay in private object storage in the deployment region.
- **Must be confirmed:** whether a processor agreement suffices; permitted provider locations; whether patient consent is needed specifically for OCR.
- **Reviewer:** Privacy / legal counsel.
- **Design impact if different:** Provider choice (self-hosted vs cloud); consent purpose added in SPEC-07.
- **Confirmation record:** *Pending.*

### REG-11 — Returns of dispensed medicines
- **Why it matters:** Whether a returned medicine can be resold affects patient safety, stock, and COGS.
- **Default behavior:** Sales returns record each line with disposition `PendingInspection` (no stock movement); a pharmacist sets `Restocked` (stock re-enters the original batch only if not expired and not quarantined) or `Discarded` (return loss). `AllowDirectRestockOnReturn` = OFF. Cold-chain items (refrigerated flag) cannot be restocked by default.
- **Must be confirmed:** whether returned medicines may be restocked at all, under which conditions, and whether refunds for medicines are restricted.
- **Reviewer:** Pharmaceutical regulatory counsel.
- **Design impact if different:** Configuration only (disable `Restocked` disposition, or disable returns of certain classes).
- **Confirmation record:** *Pending.*

## 4. Questions pack for professional review

The following list is intended to be sent as-is to the reviewers. Answers should be recorded in §3 "Confirmation record" with reviewer name, date, and reference.

1. Which medicine classes require a prescription, and who maintains the authoritative classification list? (REG-01)
2. How long is a prescription valid, may it be dispensed partially across visits, and must the paper original be retained? (REG-01)
3. What register, forms, and periodic reports apply to controlled medicines in a retail pharmacy? (REG-02)
4. Does any national traceability or serialization programme apply to retail pharmacies now or within 24 months? (REG-03)
5. Which personal data protection obligations apply to a pharmacy and to a SaaS provider hosting its data; where may the data be hosted? (REG-04)
6. What are the minimum retention periods for sales, purchase, tax, prescription, controlled-medicine, and audit records, and maximum periods for personal data? (REG-05)
7. Which VAT rates apply to medicines and other pharmacy goods, and must shelf prices be tax-inclusive? (REG-06)
8. Is the pharmacy required to issue electronic receipts/invoices to the tax authority, from when, and must submission succeed before the receipt is handed to the customer? (REG-07)
9. Are there regulated maximum selling prices for medicines that the POS must enforce? What are the rules for generic substitution and dispensing labels? (REG-08)
10. Which licensed drug-information sources are acceptable for interaction/allergy decision support? (REG-09)
11. May prescription images be processed by a cloud OCR provider, and where? (REG-10)
12. May returned medicines be restocked and resold, and under what conditions? (REG-11)
