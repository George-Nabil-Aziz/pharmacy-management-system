# Advanced Features Evaluation

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | 2026-11-09 |
| Status | Evaluation — each feature requires a go decision before story implementation |
| Related | [PROJECT-VISION.md §6.2](PROJECT-VISION.md) · [MASTER-SDD.md](MASTER-SDD.md) · [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md) · [DOCUMENTATION-CONVENTIONS.md](DOCUMENTATION-CONVENTIONS.md) |

## 1. Purpose and Method

The original vision (`docs/1. Project Vision.md` §5) lists advanced modules beyond the core. This document evaluates each one separately so that it can be accepted, deferred, or rejected on its own merits. For every feature: description, value, owning spec, priority and phase, dependencies, data-source requirements, risks, safety boundaries, and go/no-go criteria.

**Phases** use the delivery sequence of the vision: Foundation · Catalog & Inventory · Suppliers & Purchasing · Sales & POS · Patients & Prescriptions · Finance & Reporting · Multi-Branch Operations · Notifications & Advanced Features · Security Hardening & Production Readiness · Post-v1.

## 2. Global Safety Boundaries (apply to every feature below)

1. The system is **decision support only** for anything clinical. It **never diagnoses, prescribes, recommends doses, or approves** prescriptions automatically.
2. **Pharmacist judgment is final.** Every clinical alert is shown to a pharmacist, who may acknowledge or override it; overrides record a reason and are audited (BR-G-16).
3. **Absence of an alert never implies safety.** Every clinical alert screen displays a disclaimer stating that the reference data may be incomplete.
4. **OCR output is never auto-approved** (BR-G-14); every extracted item is verified by a pharmacist before it can be dispensed.
5. **No medical reference data is invented or scraped.** Any drug-information content (interactions, allergy cross-sensitivities, monographs, catalog data) must come from a source that is (a) licensed for this use (REG-09), (b) reliable with a documented editorial/validation process, (c) updated on a documented frequency with versioning, and (d) validated by a pharmacist on a sample before go-live. The specific source is **to be selected**; this document does not name or endorse one.
6. **Personal data** use (notifications, loyalty, analytics, OCR) is subject to REG-04 and, for third-party processing, REG-10; consent is recorded in `PatientConsent`.

## 3. Summary

| # | Feature | Owning spec | Priority | Target phase | Blocking REG items | Recommendation |
|---|---|---|---|---|---|---|
| AF-01 | Barcode scanning & generation | SPEC-03, SPEC-06 | P0 (scanning) / P2 (generation) | Scanning: Catalog & Inventory / Sales & POS; generation: Notifications & Advanced | REG-03 (if serialization) | Go (scanning in MVP) |
| AF-02 | Drug interaction alerts | SPEC-08 | P3 | Post-v1 | REG-09 | Conditional — no go until licensed source contracted |
| AF-03 | Allergy alerts | SPEC-07, SPEC-08 | P2 (ingredient match) / P3 (cross-sensitivity) | Notifications & Advanced / Post-v1 | REG-04, REG-09 | Conditional — ingredient-level match may go first |
| AF-04 | Alternative medicine suggestions | SPEC-03 | P2 | Notifications & Advanced | REG-08, REG-09 (if external data) | Go (catalog-based) |
| AF-05 | Loyalty program | SPEC-06 (with SPEC-07) | P3 | Post-v1 | REG-04, REG-06 | Defer |
| AF-06 | Customer notifications (SMS/WhatsApp/email) | SPEC-10 | P3 | Post-v1 | REG-04 | Defer |
| AF-07 | OCR for prescriptions | SPEC-08 | P3 | Post-v1 | REG-10, REG-04 | Conditional — pilot only |
| AF-08 | Supplier price comparison | SPEC-05 | P2 | Notifications & Advanced | — | Go |
| AF-09 | Advanced analytics (incl. expiry & low-stock forecasting) | SPEC-09 | P2/P3 | Notifications & Advanced / Post-v1 | REG-04 (if patient-level) | Go for descriptive; forecasting after data history |
| AF-10 | Multi-branch inventory optimization | SPEC-04 | P3 | Post-v1 | — | Defer until ≥ 6 months of chain data |
| AF-11 | Automated purchasing suggestions | SPEC-05 (with SPEC-04) | P2 | Notifications & Advanced | — | Go (rule-based first) |
| AF-12 | Backup and restore (advanced, self-service) | SPEC-10 | P1 (operational backup) / P3 (self-service org export) | Security Hardening & Production Readiness | REG-04, REG-05 | Go (operational); defer self-service |
| AF-13 | Advanced audit reporting | SPEC-10 | P2 | Notifications & Advanced | REG-02, REG-05 | Go |

---

## AF-01 Barcode Generation & Scanning

| Aspect | Evaluation |
|---|---|
| Description | **Scanning:** USB/Bluetooth keyboard-wedge scanners at POS, receiving, stocktake, and transfer receipt; lookup by `MedicineBarcode` (a medicine may have several barcodes, e.g., manufacturer barcode and pack variants). **Generation:** print internal barcode labels for medicines without a manufacturer barcode and optional shelf labels; internal codes use a reserved organization prefix to avoid collision with manufacturer codes. Camera scanning on tablets is optional. |
| Value | Faster, more accurate POS and receiving; supports SM-04 (≤ 3 clicks after scanning); fewer wrong-item sales. |
| Owning spec | SPEC-03 (barcode registry, generation), SPEC-06 (POS scanning), SPEC-04/05 (stocktake, receiving) |
| Priority / phase | Scanning **P0** (MVP); generation **P2** |
| Dependencies | Catalog barcodes; POS search endpoint (NFR-G-01); label printer support (browser print with label templates) |
| Data source requirements | Barcodes come from the physical packs or supplier data entered/imported by the organization. No external barcode database is assumed. If a national product-identification or serialization scheme applies (REG-03), its data format must be confirmed before parsing structured codes (e.g., GS1 DataMatrix with batch/expiry). |
| Risks | Duplicate barcodes across medicines (catalog validation must reject within the organization); scanners configured with wrong keyboard layout (Arabic layout produces wrong characters); structured 2D codes with batch/expiry parsed incorrectly. |
| Safety boundaries | A scan selects a medicine, not a batch; batch selection still follows FEFO (BR-G-06) unless overridden with permission. If a 2D code contains batch/expiry in future, it may be used to *suggest* the batch and must still satisfy eligibility (BR-G-07). |
| Go / no-go | **Go** for scanning when: barcode uniqueness validation implemented; scanner input works under both Arabic and English OS keyboard layouts (test); POS search meets NFR-G-01. Generation go when label templates validated on at least two common label printer sizes. |

## AF-02 Drug Interaction Alerts

| Aspect | Evaluation |
|---|---|
| Description | When a sale/dispensing contains two or more medicines, or a medicine conflicts with the patient's recent medication history, show interaction warnings with a severity level from the licensed source. The pharmacist acknowledges or overrides with a reason. |
| Value | Supports pharmacist vigilance at the counter; differentiator for chains. |
| Owning spec | SPEC-08 (with SPEC-06 POS display and SPEC-07 medication history) |
| Priority / phase | **P3**; Post-v1 |
| Dependencies | Mapping of every catalog medicine to the source's identifiers via active ingredients (SPEC-03 `ActiveIngredient` mapping); patient medication history (SPEC-07); audit of overrides (SPEC-10). |
| Data source requirements | **No source is selected or assumed.** Requirements for any candidate: written license permitting use in a commercial multi-tenant product and display to pharmacists in Egypt (REG-09); documented clinical editorial process and evidence grading; coverage of medicines marketed in Egypt validated against the organization catalog (target ≥ 95% of active-ingredient mappings resolvable); update frequency at least monthly with versioned releases and change notes; Arabic or English content suitable for display; liability and indemnity terms reviewed by legal counsel. Each alert stores the source name, version, and retrieval date. |
| Risks | Alert fatigue (too many low-severity alerts → overrides by habit); incorrect mapping between catalog and source → false negatives; licensing cost; liability exposure if presented as authoritative. |
| Safety boundaries | Decision support only; disclaimer on every alert; no blocking of sales by default (configurable blocking only for the highest severity, organization opt-in, pharmacist override with reason); never presented as a complete safety check. |
| Go / no-go | **No-go** until: licensed source contracted (REG-09 confirmed); pharmacist-led validation on a test set of known interaction pairs shows sensitivity acceptable to the pharmacist advisory reviewer; alert severity filtering configurable; legal review of disclaimers complete. |

## AF-03 Allergy Alerts

| Aspect | Evaluation |
|---|---|
| Description | **Level 1 (ingredient match):** warn when a medicine contains an active ingredient recorded as an allergen in `PatientAllergy`. **Level 2 (cross-sensitivity / allergen classes):** warn on related substances, requiring licensed reference data. |
| Value | Reduces risk of dispensing to a patient with a documented allergy; uses data the pharmacy already records. |
| Owning spec | SPEC-07 (allergy records), SPEC-08 / SPEC-06 (alert display at dispensing/sale) |
| Priority / phase | Level 1 **P2** (Notifications & Advanced); Level 2 **P3** (Post-v1) |
| Dependencies | Patient linked to the sale/prescription; allergies recorded against `ActiveIngredient` entries (structured), not only free text; access logging (BR-G-29). |
| Data source requirements | Level 1: organization's own catalog ingredient data and patient-reported allergies — data quality depends on catalog maintenance. Level 2: licensed reference data meeting the same criteria as AF-02 (REG-09). Patient allergy data processing subject to REG-04. |
| Risks | Free-text allergies cannot be matched (false negatives); patients unlinked to anonymous sales get no alerts; reading allergy data must be access-logged. |
| Safety boundaries | Decision support only; alerts only when a patient is linked; UI states "no recorded allergy match" — never "safe"; override with reason, audited. |
| Go / no-go | Level 1 **go** when: allergies captured as structured ingredient references; alert shown in POS and dispensing flows; access logging verified; disclaimer approved. Level 2 **no-go** until licensed source as in AF-02. |

## AF-04 Alternative Medicine Suggestions

| Aspect | Evaluation |
|---|---|
| Description | When a medicine is out of stock or the patient asks for a cheaper option, list catalog medicines with identical active ingredients, strengths, and dosage form (computed), plus manually curated `MedicineAlternative` links, with branch stock and price. |
| Value | Recovers lost sales; helps patients with price; faster counter work. |
| Owning spec | SPEC-03 |
| Priority / phase | **P2**; Notifications & Advanced Features |
| Dependencies | Complete, structured ingredient/strength data in the catalog; branch stock query (SPEC-04). |
| Data source requirements | Primarily the organization's own catalog data. If a licensed external catalog is imported to enrich ingredients (REG-09), the import must record source and version. Rules on substitution (e.g., whether a pharmacist may substitute a prescribed trade name) require REG-08 confirmation. |
| Risks | Incorrect ingredient/strength data produces wrong equivalence; differences in release mechanism (e.g., modified-release vs immediate-release) not captured by ingredient matching; perceived as a recommendation. |
| Safety boundaries | Shown as "same recorded active ingredients and strength" — never "equivalent" or "recommended"; dosage form and release type must match for computed suggestions; substitution of prescribed items requires pharmacist action and is recorded on the dispensing record. |
| Go / no-go | **Go** when: catalog has structured ingredients for ≥ 90% of active medicines in pilot organization; dosage form/release attributes modeled; pharmacist reviewer approves the wording; REG-08 answer on substitution received or the feature limited to non-prescription contexts until then. |

## AF-05 Loyalty Program

| Aspect | Evaluation |
|---|---|
| Description | Points earned per net sales amount for identified customers, redeemable as discount; tiers optional. |
| Value | Customer retention for chains. |
| Owning spec | SPEC-06 (earning/redemption at POS), SPEC-07 (customer identity), SPEC-09 (liability reporting) |
| Priority / phase | **P3**; Post-v1 |
| Dependencies | Customer identification at POS without forcing medical-profile creation; discount engine (`DiscountRule`, P2); finance treatment of points liability. |
| Data source requirements | Internal data only. Customer contact data and purchase history processing subject to REG-04 with explicit consent. Tax treatment of point redemptions requires REG-06 confirmation. Any rules restricting incentives on medicines require REG-08 confirmation. |
| Risks | Incentivizing medicine consumption may be restricted (REG-08); points liability misreported; fraud (staff awarding points to own accounts). |
| Safety boundaries | Exclude Rx-only and controlled medicines from earning by default (configurable only after REG-08 review); points never tied to specific medicines' promotion. |
| Go / no-go | **Go** only when: REG-04, REG-06, REG-08 answers received; consent capture in place; finance reporting of liability specified; anti-fraud audit rules defined. |

## AF-06 Customer Notifications

| Aspect | Evaluation |
|---|---|
| Description | Outbound messages to customers: order ready, refill reminders for chronic medication, return status. Channels: SMS, WhatsApp Business, email — via a provider abstraction. |
| Value | Customer service and repeat sales for chronic-condition patients. |
| Owning spec | SPEC-10 (channels, templates), SPEC-07 (consent, preferences) |
| Priority / phase | **P3**; Post-v1 (internal in-app notifications are core in SPEC-10) |
| Dependencies | `PatientConsent` per channel and purpose; template localization (ar/en); outbox and Hangfire delivery; provider contract. |
| Data source requirements | Internal data. Message content must minimize health information (e.g., no medicine names in SMS by default). Provider data-processing terms and message-content restrictions subject to REG-04; provider location subject to REG-04. |
| Risks | Disclosure of health information via message previews; sending without consent; cost overruns; provider outage. |
| Safety boundaries | Refill reminders are informational, not medical advice; opt-in only; easy opt-out. |
| Go / no-go | **Go** when: consent model live; provider contracted with acceptable data terms (REG-04 confirmed); content templates reviewed for minimization; rate limiting and cost caps per organization. |

## AF-07 OCR for Prescriptions

| Aspect | Evaluation |
|---|---|
| Description | Extract prescriber, medicine names, and dosage text from uploaded prescription images to pre-fill items as **suggestions** (`OcrExtraction`), each with a confidence score and source region highlighted on the image. |
| Value | Reduces typing time for prescription registration. |
| Owning spec | SPEC-08 |
| Priority / phase | **P3**; Post-v1 (pilot) |
| Dependencies | Prescription attachments (ADR-006); catalog matching service; pharmacist verification flow (core). |
| Data source requirements | Images are sensitive health data. Third-party OCR processing requires data-processor terms, processing location, and retention commitments reviewed under REG-10 and REG-04; on-premise OCR engines are an alternative to evaluate. Handwritten Arabic/English prescriptions have low and variable recognition accuracy — accuracy must be measured on a consented, anonymized local sample, not assumed from vendor claims. |
| Risks | Misread medicine or strength accepted by a hurried user; privacy breach through the provider; cost per image; low accuracy on handwriting makes the feature net-negative. |
| Safety boundaries | **Never auto-approved** (BR-G-14); every suggested item must be explicitly confirmed or corrected by a pharmacist; low-confidence fields shown empty, not pre-filled; the original image always displayed side by side; audit records the suggestion and the pharmacist's final value. |
| Go / no-go | **Go (pilot)** only when: REG-10 and REG-04 confirmed for the chosen processing model; measured field-level accuracy on the local sample is reported to the product owner and judged useful (proposed threshold: time-to-register reduced ≥ 30% with zero increase in verification errors in a controlled pilot); kill switch per organization. |

## AF-08 Supplier Price Comparison

| Aspect | Evaluation |
|---|---|
| Description | Compare purchase cost per base unit for a medicine across suppliers using the organization's own goods receipt and supplier invoice history, including effective cost after bonus quantities and discounts. |
| Value | Better purchasing decisions; margin improvement. |
| Owning spec | SPEC-05 |
| Priority / phase | **P2**; Notifications & Advanced Features |
| Dependencies | Goods receipts with bonus quantity and cost (core); supplier invoices. |
| Data source requirements | Internal historical data only; no external price feeds assumed. Price lists entered manually or imported from supplier files may be added later with source and date recorded. |
| Risks | Stale prices misleading users; effective-cost calculation errors with bonus quantities. |
| Safety boundaries | Not applicable clinically; display date of last price observation. |
| Go / no-go | **Go** when effective unit cost calculation (paid quantity, bonus quantity, discounts) is specified and tested in SPEC-05. |

## AF-09 Advanced Analytics (including Expiry and Low-Stock Forecasting)

| Aspect | Evaluation |
|---|---|
| Description | Dashboards beyond standard reports: ABC/XYZ classification, dead-stock and slow movers, margin by category/supplier, basket analysis, branch benchmarking; **forecasting** of demand (low-stock forecasting) and of expiry risk (stock projected to expire before it sells). |
| Value | Inventory reduction, less expiry waste (SM-07), better purchasing. |
| Owning spec | SPEC-09 (with SPEC-04 data) |
| Priority / phase | Descriptive analytics **P2** (Notifications & Advanced); forecasting **P3** (Post-v1, requires history) |
| Dependencies | `DailyBranchSummary` and movement ledger; ≥ 6 months of sales history for forecasting; background exports (NFR-G-03). |
| Data source requirements | Internal transactional data. Patient-level analytics only on aggregated/pseudonymized data (REG-04). Forecast models must be back-tested on the organization's own history and their error reported. |
| Risks | Heavy queries degrade OLTP (mitigation: projections, replicas, background jobs); forecasts trusted blindly; insufficient history for small pharmacies. |
| Safety boundaries | Forecasts are labelled as estimates with their measured error; they never auto-create purchase orders. |
| Go / no-go | Descriptive: **go** when report queries meet NFR-G-03 against pilot data volumes. Forecasting: **go** when back-test error is reported and judged useful by pilot users. |

## AF-10 Multi-Branch Inventory Optimization

| Aspect | Evaluation |
|---|---|
| Description | Suggest stock transfers between branches: surplus or near-expiry stock in one branch matched to demand or shortage in another. |
| Value | Reduces expiry waste and stock-outs in chains. |
| Owning spec | SPEC-04 |
| Priority / phase | **P3**; Post-v1 |
| Dependencies | Transfer workflow (core); reorder settings; analytics (AF-09); ≥ 6 months of chain data. |
| Data source requirements | Internal data only. |
| Risks | Suggestions ignore transport cost or branch-specific constraints; users accept suggestions without review. |
| Safety boundaries | Suggestions create **draft** transfers only; standard approval and segregation of duties (BR-G-13, BR-G-28) still apply; near-expiry stock transferred must remain outside the do-not-sell window on arrival. |
| Go / no-go | **Go** when at least one chain pilot has ≥ 6 months of data and the suggestion logic is validated against manually chosen transfers. |

## AF-11 Automated Purchasing Suggestions

| Aspect | Evaluation |
|---|---|
| Description | Generate suggested purchase order lines from reorder settings (min/max), current sellable stock, open purchase orders, in-transit transfers, and (later) forecast demand; group by preferred supplier. |
| Value | Saves manager time; fewer stock-outs and overstock. |
| Owning spec | SPEC-05 (with SPEC-04 reorder settings) |
| Priority / phase | Rule-based **P2** (Notifications & Advanced); forecast-based **P3** |
| Dependencies | `ReorderSetting`; PO workflow; supplier price data (AF-08) optional. |
| Data source requirements | Internal data only. |
| Risks | Bad reorder settings propagate into bad orders; duplicates with open POs. |
| Safety boundaries | Creates **Draft** purchase orders only; approval workflow unchanged; never auto-submits to suppliers. |
| Go / no-go | **Go** when reorder settings exist for the pilot branch and suggestions are validated against a manager's manual order for 4 weeks. |

## AF-12 Backup and Restore

| Aspect | Evaluation |
|---|---|
| Description | **Operational (core):** PostgreSQL WAL archiving with PITR, scheduled base backups, object-storage versioning, encrypted off-site copies, monthly restore drills, documented runbooks (NFR-G-05). **Advanced:** per-organization logical export/restore (data portability, single-organization recovery in SaaS), and an Owner-facing backup status view for on-premise installations. |
| Value | Business continuity (BRQ-14); trust; data portability. |
| Owning spec | SPEC-10 |
| Priority / phase | Operational **P1** (Security Hardening & Production Readiness; designed in Foundation); per-organization export **P3** |
| Dependencies | Deployment architecture; ADR-002 (shared schema means per-organization restore is logical, not physical); ADR-006 (files). |
| Data source requirements | Not applicable. Backup storage location and encryption-key custody subject to REG-04; backup retention aligned with REG-05. |
| Risks | Untested backups; restoring one organization in a shared database overwrites others if done physically; on-premise installs without off-site copies. |
| Safety boundaries | Restore operations are platform-operator procedures with dual control and audit; never self-service overwrite of live data. |
| Go / no-go | Operational: **go-live gate** — a restore drill meets RPO ≤ 15 min and RTO ≤ 4 h. Per-organization export: go when export/import round-trip test passes on a full pilot organization. |

## AF-13 Advanced Audit Reporting

| Aspect | Evaluation |
|---|---|
| Description | Pre-built audit reports and anomaly views: voids and returns by cashier, discount overrides, FEFO overrides, after-hours activity, stock adjustments by user, patient-data access by user, controlled-medicine register report, audit chain verification status. |
| Value | Loss prevention, accountability (BRQ-12), readiness for inspections (REG-02, REG-05). |
| Owning spec | SPEC-10 (with SPEC-09 export) |
| Priority / phase | **P2**; Notifications & Advanced Features |
| Dependencies | Audit log with structured action codes (ADR-008); patient access log; controlled register. |
| Data source requirements | Internal data. Controlled-medicine register report format pending REG-02. |
| Risks | Over-collection or broad access to audit data exposing staff/patient information; heavy queries. |
| Safety boundaries | Access restricted to `audit.logs.read`; patient identifiers masked unless the user also holds `patients.medical.read`; exports audited. |
| Go / no-go | **Go** when audit action codes are catalogued in SPEC-10 and reports meet NFR-G-03 on pilot data. |
