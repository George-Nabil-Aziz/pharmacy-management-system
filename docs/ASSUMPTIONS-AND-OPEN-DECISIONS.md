# Assumptions and Open Decisions

**Version:** 1.0 (2026-11-10) · **Related:** [RISKS-AND-MITIGATIONS.md](RISKS-AND-MITIGATIONS.md) · [REGULATORY-CONSIDERATIONS-EGYPT.md](REGULATORY-CONSIDERATIONS-EGYPT.md) · [architecture/decisions/](architecture/decisions/README.md)

This register lists:
- **assumptions** made in place of unavailable information (A-xx);
- **resolved decisions** taken during the documentation phase;
- **global open decisions** (OD-G-xx);
- the **module open decisions** from every specification (OD-SS-xx, generated).

Every open decision has a default that the documentation and stories already follow, so implementation is not blocked. Changing a default requires a spec change and an update of the affected stories.

## 1. Assumptions

| ID | Assumption | Basis / impact if wrong | Owner to validate |
|---|---|---|---|
| A-01 | The first deployment is one organization with 1–2 branches in Egypt; architecture is still multi-organization from day one | Product brief; if wrong, nothing changes architecturally | Product owner |
| A-02 | Single currency per organization, EGP by default; no multi-currency documents | Egyptian market; multi-currency would affect SPEC-05/06/09 data models | Product owner |
| A-03 | Stock is tracked in integer base units; packs are `PackSize` base units; fractional base units (e.g., ml from a bottle) are not sold | Typical pharmacy practice; if wrong, quantity types change to decimal | Pharmacist SME |
| A-04 | POS requires a network connection to the server; no offline sales in MVP/V1 (OD-06-01) | Simplifies consistency; if wrong, a major offline-sync design is needed | Product owner |
| A-05 | Card payments are processed on a standalone bank terminal and recorded manually with a reference; no terminal or gateway integration | Common practice; integration would be an additive adapter | Product owner |
| A-06 | Receipts print through the browser to an 80 mm thermal printer or A4 printer; no native print agent | Simplicity; silent printing may need a kiosk configuration | DevOps |
| A-07 | Barcode scanners operate as keyboard wedges and send Enter after the code | Most USB scanners; otherwise a scanner configuration step is needed | Pharmacist SME |
| A-08 | Each cash session uses one physical drawer and one cashier | Standard; shared drawers would change session model | Product owner |
| A-09 | Patients are identified primarily by mobile number; phone optional is an open decision (OD-07-01) | Egyptian practice | Pharmacist SME |
| A-10 | National ID is not collected by default (`CollectNationalId` = OFF) | Data minimization (REG-04) | Privacy counsel |
| A-11 | Allergy alerts use exact active-ingredient matching on the organization's own catalog data; medicines without ingredient data produce no alert (and the UI says so) | No licensed reference source (REG-09) | Pharmacist SME |
| A-12 | The POS manager-override re-authentication also authorizes allergy-alert acknowledgements where `AllergyAlertMode` requires it | Reuse of SPEC-01 mechanism | Product owner |
| A-13 | Expiry dates printed as month/year are stored as the last day of that month | Common convention | Pharmacist SME |
| A-14 | Quantities lost in transit during a transfer return to the source branch's responsibility through a draft transit-loss adjustment | SPEC-04 default | Operations manager |
| A-15 | Once opening balances are locked for a branch, the lock cannot be undone; corrections go through adjustments | Ledger integrity | Product owner |
| A-16 | Wholesale bonus quantities are received into the same batch with cost spread over paid + bonus units (OD-05-01) | Common Egyptian wholesale practice; accountant confirmation needed | Accountant |
| A-17 | A branch normally has at least two users able to approve (Owner counts), so segregation of duties (BR-G-28) does not block single-manager branches | If wrong, a configurable SoD exemption is required (R-11) | Product owner |
| A-18 | Organization default UI language is Arabic; digits default to Latin (`DigitStyle` = Latn) | Egyptian business practice; configurable | Product owner |
| A-19 | Business day boundaries follow the branch time zone `Africa/Cairo`; branches do not operate across midnight in a way that requires a different business-day cutoff | If wrong, add a configurable day cutoff hour | Operations manager |
| A-20 | Single-region hosting; the operator can choose the region per deployment (REG-04 may require in-country hosting) | Deployment flexibility | Privacy counsel |
| A-21 | Single-organization restore from shared-database backups is not supported in v1; logical per-organization export is the mechanism (OD-10-01) | ADR-002 consequence | Product owner |
| A-22 | Team for implementation: 4 full-stack developers, 1 QA, part-time DevOps and SME (roadmap estimates depend on it) | Planning | Product owner |
| A-23 | Default tax rate is 0% until the organization configures tax categories; tax-inclusive pricing is configurable (`PricesIncludeTax`) | REG-06 unconfirmed | Tax advisor |
| A-24 | No e-invoice/e-receipt submission in MVP; data model keeps the fields required for later submission | REG-07 unconfirmed; may become a go-live blocker (R-04) | Tax advisor |
| A-25 | Returned medicines are not restocked without pharmacist inspection; refrigerated items cannot be restocked by default | REG-11 unconfirmed | Pharmaceutical counsel |
| A-26 | Prescription validity default is 30 days and dispensing is restricted to the registering branch (OD-08-01) | REG-01 unconfirmed | Pharmacist SME |
| A-27 | Report data for MVP is read from OLTP with indexes; the DailyBranchSummary projection is introduced in V1.4 | Sufficient at MVP volume (NFR-G-03) | Tech lead |
| A-28 | Browsers supported: current and previous major versions of Chrome, Edge, Firefox, Safari; desktop/laptop POS terminals at ≥ 1280 px width; tablets for back-office are best-effort | Typical pharmacy hardware | Product owner |
| A-29 | Malware scanning of uploads uses a ClamAV sidecar by default (OD-G-01) | Open-source, self-hosted | Security engineer |
| A-30 | All documentation-phase estimates and NFR targets are engineering targets, to be re-baselined after Phase 0 measurements | Planning | Tech lead |

## 2. Decisions resolved during the documentation phase

| Date | Decision | Where recorded |
|---|---|---|
| 2026-11-09 | Modular monolith + Clean Architecture per module | ADR-001 |
| 2026-11-09 | Shared database, shared schema, `OrganizationId` discriminator | ADR-002 |
| **2026-11-10** | **PostgreSQL RLS enabled and forced from Phase 0 / MVP** (product-owner decision; originally Phase 9) | ADR-002 (amended), SPEC-02 OD-02-08, US-02-03, DATABASE-DESIGN §12 |
| 2026-11-09 | Append-only stock movement ledger + transactional batch balance; pessimistic row locks in BatchId order; `lock_timeout` 3 s → 503 `COMMON.LOCK_TIMEOUT` | ADR-003, ADR-004, SPEC-04 |
| 2026-11-09 | ASP.NET Core Identity + JWT (15 min) + rotating refresh tokens with family reuse detection; separate platform-user store and audience | ADR-005, SPEC-01 |
| 2026-11-09 | S3-compatible object storage (MinIO locally) with pre-signed URLs | ADR-006 |
| 2026-11-09 | Hangfire with PostgreSQL storage | ADR-007 |
| 2026-11-09 | Same-transaction, hash-chained audit log | ADR-008 |
| 2026-11-09 | i18next; Arabic and English; RTL via logical properties | ADR-009 |
| 2026-11-09 | Zustand for client state, TanStack Query for server state (Redux Toolkit rejected) | ADR-010 |
| 2026-11-10 | Sale lines whose FEFO allocations carry different batch selling prices are split per price | SPEC-06 BR-06-033, SPEC-04 OD-04-01 |
| 2026-11-10 | Returned items default to `PendingInspection`; restock only into the original non-expired, non-quarantined batch | Conventions §10, SPEC-06 |
| 2026-11-10 | MVP scope and overrides (self-signup and custom roles to V1; low-stock detection, controlled register, audit hash chain into MVP) | RELEASE-PLAN §3 |
| 2026-11-10 | Frontend API client generated with openapi-typescript + typed fetch wrapper | API-DESIGN §15 |
| 2026-11-10 | Settings stored as typed key/value rows (SPEC-10 registry), canonical key names from the SPEC-10 catalog (`NearExpiryThresholdDays`, `AdjustmentApprovalThresholdAmount`, `Currency`) | SPEC-10 §8, SPEC-02 §8.4, DATABASE-DESIGN |
| 2026-11-10 | `PricesIncludeTax` is organization-level only (uniform tax mode) | SPEC-06, SPEC-02 OD-02-11 |
| 2026-11-10 | Per-role discount limits stored in the `RoleDiscountLimits` organization setting, not on `Role` | SPEC-06, SPEC-01 OD-01-04 |
| 2026-11-10 | Error prefix `IDENTITY.*` (not `AUTH.*`); POS override entity `ManagerOverride`; audit chain sealed asynchronously every 10 s with daily external anchoring in V1; ledger partitioned by `business_date`; lock timeout 3 s with 2 retries; restock into expired/quarantined batch forbidden | ADR-003, ADR-005, ADR-008, SPEC-01, SPEC-04, SPEC-06, SPEC-10 |

## 3. Global open decisions

| ID | Decision needed | Default until decided | Needed by |
|---|---|---|---|
| OD-G-01 | Malware scanning provider for uploads | ClamAV sidecar container; scan before object is marked available | Phase 6 |
| OD-G-02 | Production hosting provider and region (data residency, REG-04) | Any provider supporting managed PostgreSQL 17 with PITR, S3-compatible storage, and in-region hosting | Phase 9 |
| OD-G-03 | Observability backend (Seq vs Grafana/Loki/Tempo vs managed APM) | Seq locally; OpenTelemetry exporters so the backend can be swapped | Phase 9 |
| OD-G-04 | Email/SMS/WhatsApp providers for V1/Future notifications | None in MVP | V1.4 |
| OD-G-05 | OCR provider (self-hosted vs cloud) | Feature disabled | Future |
| OD-G-06 | Licensed drug-interaction data source | Feature disabled | Future |
| OD-G-07 | E-invoice/e-receipt integration timing (depends on REG-07) | Not in MVP | Before go-live confirmation |
| OD-G-08 | Pricing/subscription model for SaaS (affects `Subscription` entity, P3) | Not built | V1.3 planning |

## 4. Module open decisions (generated from specifications §19)

<!-- BEGIN:MODULE-OD -->
| ID | Spec | Decision needed | Default / recommendation until decided |
|---|---|---|---|
| OD-01-01 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Grace window for concurrent refresh with the same token (multi-tab race) | No server grace; frontend single-flight refresh with cross-tab lock |
| OD-01-02 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Login identifier for staff without email (username or Egyptian mobile number) and email change flow | v1: email required; email change = deactivate + re-invite |
| OD-01-03 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | One person working for several organizations with the same email | v1: not supported (BR-01-001) |
| OD-01-04 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Storage of per-role discount limit for BR-G-32 | **Resolved 2026-11-10:** organization setting `RoleDiscountLimits` (role code → max discount %) defined by SPEC-06 and stored in the SPEC-10 settings registry; no column on `Role`. |
| OD-01-05 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Final override-eligible permission set; PIN-based quick override as alternative to password | `sales.discounts.override`, `sales.sales.void`, `sales.returns.approve`; password only |
| OD-01-06 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | NFR-G-07 anonymous endpoint list must be extended with `/auth/signup`, `/auth/signup/verify`, `/auth/login/mfa`, `/auth/invitations/validate\|accept`, `/platform/auth/login\|refresh` | Amend NFR-G-07 |
| OD-01-07 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Email-existence disclosure via 409 on invite/signup versus an enumeration-safe asynchronous flow | v1: 409 with rate limiting |
| OD-01-08 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Storage of platform administrator audit events (outside organization hash chains) | Separate platform audit stream in SPEC-10 |
| OD-01-09 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Make MFA mandatory for platform administrators before SaaS launch (MFA is P2) | Mandatory for platform admins as soon as US-01-18 ships |
| OD-01-10 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Confirmation of the default system role permission matrix (§5.3) | As proposed in §5.3 |
| OD-01-11 | [SPEC-01](specs/SPEC-01-IDENTITY-ACCESS.md) | Password reset via SMS/WhatsApp OTP for the Egyptian market | Out of scope v1 |
| OD-02-01 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Offer self-service public organization sign-up (adds an unauthenticated endpoint to NFR-G-07) or keep platform-admin provisioning only. | Platform-admin provisioning and bootstrap command only. |
| OD-02-02 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Whether write-offs (`WOF`) and stocktakes (`STK`) receive BR-G-24 document numbers. | Not numbered; referenced by id. |
| OD-02-03 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Allow a configurable starting number per sequence for pharmacies migrating mid-year from another system. | All sequences start at 1. |
| OD-02-04 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Whether an Owner may opt in to include patient/prescription data in a support grant. | Always excluded. |
| OD-02-05 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Default `TransferApproverScope`. | `Source`. |
| OD-02-06 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Default `AdjustmentApprovalThresholdAmount` value. | 1,000.00 EGP. |
| OD-02-07 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Tax registration number format validation (length 9 digits assumed). | Digits only, 9 digits; to be confirmed with REG-07 review. |
| OD-02-08 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Enable RLS in MVP rather than in the security-hardening phase. | **Resolved 2026-11-10:** RLS is enabled from Phase 0 and is part of the MVP (ADR-002 amended). |
| OD-02-09 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Allow users to view sellable quantities in branches outside their scope (e.g., "available at other branches" at POS). | Not allowed. |
| OD-02-10 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Calendar year vs fiscal year for document numbering. | Calendar year of branch business date. |
| OD-02-11 | [SPEC-02](specs/SPEC-02-ORGANIZATION-BRANCHES.md) | Default `PricesIncludeTax`. | true; pending REG-06. Scope resolved 2026-11-10: organization-level (SPEC-06), not per branch. |
| OD-03-01 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Is the Arabic trade name mandatory? | Optional; UI falls back to English |
| OD-03-02 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Should the catalog store a regulated public price and block selling above it (REG-08)? | Not stored; no ceiling enforced |
| OD-03-03 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | External catalog source for initial load/updates and its licensing (REG-09) | None; manual entry and organization-owned files only |
| OD-03-04 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Model non-medicine items (cosmetics, devices, supplements) as `Medicine` with an item-kind flag, or as a separate entity | Same `Medicine` entity; ingredients and generic name optional |
| OD-03-05 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Scheduled (future-dated) price changes | Not supported; changes effective on commit |
| OD-03-06 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Whether `Controlled` needs sub-schedules and whether classification may vary by branch (REG-01, REG-02) | Single org-level class, three values |
| OD-03-07 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Seed tax categories and default rate (REG-06) | One `DEFAULT` 0.00% category flagged `RequiresReview` |
| OD-03-08 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Parse GS1 DataMatrix/GS1-128 (GTIN + batch + expiry + serial) at receiving and POS (REG-03) | GTIN-only lookup |
| OD-03-09 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Intermediate sellable units (strip/blister) between pack and base unit | Pack and base unit only |
| OD-03-10 | [SPEC-03](specs/SPEC-03-MEDICINE-CATALOG.md) | Default for alternative links: bidirectional or one-way | Bidirectional |
| OD-04-01 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Sale line whose FEFO allocations have different selling prices (batch overrides) | (a) — preserves BR-G-20 snapshots; owned with SPEC-06 |
| OD-04-02 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Segregation of duties in single-user branches | (a) for v1; revisit with pilot feedback |
| OD-04-03 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Default `AdjustmentApprovalThresholdAmount` | 1,000.00 EGP, editable per branch |
| OD-04-04 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Opening balance lock reversibility | (a) |
| OD-04-05 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Stale transfer reservations | (a) |
| OD-04-06 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Sales during counting of the same medicine | (a), with training note; (b) as P2 |
| OD-04-07 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Propagation of batch metadata corrections across transfer lineage | (a) |
| OD-04-08 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Valuation snapshot granularity and retention | per medicine per day; batch-level via as-of query |
| OD-04-09 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Month/year expiry normalization | last day of month; confirm with pharmacist advisor |
| OD-04-10 | [SPEC-04](specs/SPEC-04-BATCH-INVENTORY.md) | Accounting for short transfer receipts | (a) |
| OD-05-01 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Bonus costing: spread net cost over paid + bonus units (one batch) vs. separate zero-cost bonus quantity | Spread cost, single batch (BR-05-005); needs accountant confirmation |
| OD-05-02 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Whether supplier invoice price variances revalue remaining batch stock | No revaluation (BR-05-015) |
| OD-05-03 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Aging basis: invoice date vs. due date | Invoice date, with separate overdue column |
| OD-05-04 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Organization-level (central) supplier payments allocating across branches | Payments are branch-scoped; allocations within the same branch |
| OD-05-05 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Whether cash supplier payments must be drawn from a POS cash session (creating a `CashMovement`) | No link to cash sessions in v1 |
| OD-05-06 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Applying debit notes against specific invoices | Debit notes remain unapplied credits reducing balance |
| OD-05-07 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Capturing the printed public selling price per batch at receipt (regulated pricing, REG-08) | Not captured |
| OD-05-08 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Default `MinRemainingShelfLifeDaysOnReceipt` | 180 days |
| OD-05-09 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Cheque lifecycle (post-dated register, clearing, bounce handling) | Details recorded only; bounce handled by payment reversal |
| OD-05-10 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Line-level (partial) receipt reversal | Whole-receipt reversal only |
| OD-05-11 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Importing supplier e-invoices from the tax authority system | Out of scope (REG-07) |
| OD-05-12 | [SPEC-05](specs/SPEC-05-SUPPLIERS-PROCUREMENT.md) | Tax registration number format validation (9 digits) | 9 digits after normalization; to be confirmed |
| OD-06-01 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Offline POS | (a) — v1 requires connectivity |
| OD-06-02 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Cash rounding to coin increments (e.g., 0.25 / 0.50 EGP) | None; settle to 0.01 |
| OD-06-03 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Mobile wallet / instant-payment methods recorded with reference | Not supported |
| OD-06-04 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Card terminal (ECR) integration | None; manual reference |
| OD-06-05 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Base-unit price when not configured | Derive |
| OD-06-06 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Return approval threshold default and whether out-of-window returns are allowed at all | 1,000.00 + approval |
| OD-06-07 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Refund of card-paid sales in cash | Allowed with `RefundMethod` override |
| OD-06-08 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Loyalty program model (earn rate, point value, expiry, liability accounting, patient vs phone identity) | Not enabled (P3) |
| OD-06-09 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Selling the physically scanned GS1 batch when it differs from FEFO without `override-fefo` | Warn only, FEFO allocates |
| OD-06-10 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Returns of controlled medicines | Approval required; disposition per pharmacist (REG-02, REG-11) |
| OD-06-11 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Mandatory receipt/invoice fields and price display | Fields configurable, all printed when configured |
| OD-06-12 | [SPEC-06](specs/SPEC-06-SALES-POS.md) | Automatic closing of sessions open > 24 h | Notify only |
| OD-07-01 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Should mobile phone be optional for patients without a phone (e.g., elderly)? | Required |
| OD-07-02 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Legal basis for storing health data and whether explicit consent is required (REG-04). | `RequireConsentForMedicalData` = ON |
| OD-07-03 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Effect of `MedicalDataStorage` consent withdrawal on existing medical data (retain, inactivate, or anonymize medical part). | Retain; block new writes; keep allergy checks |
| OD-07-04 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Should medical/medication history be visible across all branches or only assigned branches? | Org-wide for `patients.medical.read` holders; purchase history branch-limited |
| OD-07-05 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Retention period for `PatientAccessLog`, acknowledgements, and inactive patients (REG-05). | Retain indefinitely |
| OD-07-06 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Anonymization blocking conditions and handling of patient-name snapshots on prescriptions (SPEC-08). | Block per FR-07-040; prescription snapshots unchanged |
| OD-07-07 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Support unmerge? | Not supported in v1 |
| OD-07-08 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Default seeded grants (CASHIER `patients.profiles.manage`; MANAGER medical access) and whether support grants may ever include medical data. | As §5.2; support grants exclude medical data |
| OD-07-09 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Export format: JSON only, or also bilingual PDF. | JSON only |
| OD-07-10 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Structured pregnancy/lactation and weight fields for decision support. | Not collected |
| OD-07-11 | [SPEC-07](specs/SPEC-07-PATIENT-RECORDS.md) | Data residency and cross-border hosting of patient data (REG-04). | Pending hosting decision |
| OD-08-01 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Allow dispensing of a prescription in a branch other than the registering branch (same organization)? | Not allowed (`PRESCRIPTIONS.BRANCH_MISMATCH`) |
| OD-08-02 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Should a sales return of a dispensed line restore the prescription's remaining quantity? (linked REG-11) | No restoration |
| OD-08-03 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Four-eyes rule: must the verifier differ from the registrant (at least for controlled medicines)? | Same user allowed |
| OD-08-04 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | HEIC preview conversion and EXIF-stripped viewing copy. | Original served; HEIC may not preview in all browsers |
| OD-08-05 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Malware scanning engine (self-hosted vs managed service). | Abstraction only; `NotScanned` outside Production |
| OD-08-06 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | OCR provider selection, data location, processor terms (REG-10, REG-04). | OCR disabled |
| OD-08-07 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Licensed drug interaction source and mapping of catalog ingredients to source codes (REG-09). | Interaction checks disabled |
| OD-08-08 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Dispensing label sizes and printer support beyond 50×30 mm PDF. | 50×30 mm PDF |
| OD-08-09 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Acceptance of pack-rounding excess (< 1 pack) when split packs are not allowed. | Allowed with reason `PackRounding` |
| OD-08-10 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Restrict `prescriptions.controlled.dispense` to users flagged as licensed pharmacists in SPEC-01 (REG-08). | Permission-based only; seeded to `PHARMACIST` |
| OD-08-11 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Refill semantics: maximum refills, minimum interval between fills, whether refills extend validity (REG-01). | Max 11, no interval, validity not extended |
| OD-08-12 | [SPEC-08](specs/SPEC-08-PRESCRIPTIONS.md) | Whether the prescription number must be gapless. | Unique per branch per year, gaps allowed |
| OD-09-01 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Whether and how to export to an external general ledger / accounting package (journal export format, account mapping) | Not provided (P3) |
| OD-09-02 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Week start day for presets (Saturday vs Sunday) | `Saturday`, configurable via `ReportWeekStartDay` |
| OD-09-03 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Use of a PostgreSQL read replica for reports | Primary database with read-only transactions |
| OD-09-04 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Whether SPEC-04 keeps batch status history so historical valuation can classify `Quarantined` | Historical classification by expiry only |
| OD-09-05 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Alignment of `CashMovement` types `ExpensePayout` / `ExpensePayoutReversal` with SPEC-06, and whether cashiers may pay expenses from the drawer | Types as named; requires `finance.cash.manage` |
| OD-09-06 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | COGS reversal attribution for restocked returns: disposition date (chosen) vs return date | Disposition date |
| OD-09-07 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Snapshot medicine category on sale lines for historical category reporting | Current category used |
| OD-09-08 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Multi-currency support | Single currency per organization, EGP |
| OD-09-09 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Confirm SPEC-06 restricts voids to the same open cash session | Late-correction handling covers cross-date voids |
| OD-09-10 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Tax summary layout alignment with any electronic invoice/receipt obligations | Informational layout (REG-06, REG-07) |
| OD-09-11 | [SPEC-09](specs/SPEC-09-FINANCE-REPORTING.md) | Retail value basis for near-expiry (current effective price vs last sale price) | Current effective selling price |
| OD-10-01 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Single-organization restore within the shared database | (a) for v1, documented runbook; revisit with (b) after P3 data export exists |
| OD-10-02 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Audit chain sealing mode and external anchoring | Async sealer; external anchoring P2 |
| OD-10-03 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Audit and API log retention periods and archival tier | No purge of audit in v1; API logs 180 days |
| OD-10-04 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Patient medical values in audit diffs | Hash, pending REG-04 |
| OD-10-05 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Email, SMS, WhatsApp providers | Provider-agnostic interface; SMTP reference for email |
| OD-10-06 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | SignalR scale-out when > 1 app instance | Redis backplane when the second instance is added |
| OD-10-07 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Default language and digit style for new Egyptian organizations | Validate with pilot pharmacies |
| OD-10-08 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Chart axis direction in RTL | LTR, validate in usability testing |
| OD-10-09 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Logging GET requests on sensitive resources in `ApiActionLog` | Mutating only; medical reads covered by audit |
| OD-10-10 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Notification retention configurable per organization | Fixed |
| OD-10-11 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Medicine names in refill reminder messages | Excluded pending REG-04 |
| OD-10-12 | [SPEC-10](specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md) | Whether per-organization export serves data portability obligations | Operational feature only |

<!-- END:MODULE-OD -->

## 5. Review cadence

The product owner reviews this register at the start of each roadmap phase. Decisions needed by that phase are resolved, or their defaults are confirmed explicitly, before the phase's stories enter development (Definition of Ready R5).
