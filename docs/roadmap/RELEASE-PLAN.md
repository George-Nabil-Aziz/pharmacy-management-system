# Release Plan — MVP, V1, Future

**Version:** 1.0 (2026-11-10) · **Related:** [IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md) · [DEFINITION-OF-DONE.md](DEFINITION-OF-DONE.md) · [REGULATORY-CONSIDERATIONS-EGYPT.md](../REGULATORY-CONSIDERATIONS-EGYPT.md)

> The story tables in §4–§6 are **generated** from the story files by `node scripts/docs/gen-release-plan.mjs`. Edit the release rules in §2/§3 (and the override list in the script), not the tables.

## 1. Release overview

| Release | Purpose | Deployment target | Exit gate |
|---|---|---|---|
| **R1 — MVP** | Smallest version that can run a real pharmacy (1 organization, 1–2 branches) **safely**: correct batch/expiry inventory, atomic POS sales, returns, cash control, basic prescriptions and patients, core reports, audit, Arabic/English | Single pharmacy pilot | DoD release-level + all *Blocking for go-live* REG items confirmed |
| **R2 — V1** | Full operational system for chains: purchase orders and supplier accounting, transfers, stocktakes, recalls, full patient privacy toolset, full reporting, real-time notifications, MFA, platform administration (SaaS onboarding) | Multi-branch chains; first SaaS tenants | Same gates at V1 load profile (50 branches) |
| **Future** | Enhancements and advanced features that need external sources, licensing, or validated demand | Per feature | Feature-specific go/no-go in [ADVANCED-FEATURES.md](../ADVANCED-FEATURES.md) |

<!-- BEGIN:SUMMARY -->
| Release | Stories | P0 | P1 | P2 | P3 | Estimated effort (ideal dev-days) |
|---|---|---|---|---|---|---|
| MVP | 134 | 106 | 28 | 0 | 0 | 305 |
| V1 | 62 | 0 | 58 | 4 | 0 | 158.5 |
| Future | 27 | 0 | 0 | 17 | 10 | 72 |

<!-- END:SUMMARY -->

Effort uses XS = 0.5, S = 1, M = 2.5, L = 4.5 ideal developer-days for implementation including tests. It excludes Phase 0 foundation, hardening, and contingency (see the roadmap).

## 2. Release assignment rules

1. A story is **MVP** when the epic README marks it MVP. The READMEs applied the MVP definition below.
2. Otherwise **P1** stories go to **V1**, and **P2/P3** stories go to **Future**.
3. Explicit overrides are listed in §3. They win over rules 1–2.

**MVP definition (safety-first minimum):**
- **Tenancy and access:** single organization, provisioned by bootstrap command; 1–2 branches. Tenant isolation is complete from day one: tenant context, EF filters, **RLS enabled and forced**, branch authorization, and the cross-org test suite.
- **Identity:** login, refresh rotation with reuse detection, password policy and reset, lockout, system roles, user invitation, activation and deactivation, sessions, POS manager override.
- **Catalog:** reference data, medicines with barcodes, pack and split-pack, Rx classification, pricing with branch override, Arabic/English search.
- **Inventory:**
  - batch ledger with FEFO allocation, override and posting guarantees;
  - opening balances (file import);
  - adjustments, write-offs and approvals;
  - expiry flagging;
  - low-stock detection;
  - reconciliation;
  - valuation.
- **Procurement:** suppliers and direct goods receipt with batch and expiry validation, reversal.
- **POS:**
  - cash sessions with blind close and Z-report;
  - atomic, idempotent sales with cash, card and split payments;
  - discounts with manager override, taxes;
  - receipts, reprint, history;
  - void, returns with inspection disposition, refund rules.
- **Patients:** profile, consent, allergies, access logging, allergy alert at POS.
- **Prescriptions:**
  - registration with image;
  - pharmacist verification;
  - dispensing through POS with partial dispensing;
  - Rx-only and controlled enforcement;
  - controlled-medicine register;
  - reversal on void.
- **Reports:** daily sales, gross profit, current valuation, near-expiry, Z-report, CSV export.
- **Platform:** audit pipeline with hash chain and search; in-app low-stock and expiry notifications; settings; language, theme and localization.

**Explicitly not in MVP:**
- offline POS;
- payment-terminal integration (card amounts are recorded manually with a reference);
- e-invoice submission;
- purchase orders, supplier invoices and payments;
- transfers;
- stocktakes;
- OCR;
- drug interactions;
- loyalty;
- email/SMS.

## 3. Release overrides (decisions 2026-11-10)

| Story | From | To | Reason |
|---|---|---|---|
| US-01-01 Organization self-signup | MVP | V1 | MVP has one organization provisioned with the bootstrap command (US-02-04); self-signup is a SaaS onboarding feature |
| US-01-09 Manage custom roles | MVP | V1 | Six system roles cover a pilot pharmacy; reduces MVP scope |
| US-04-16 Reorder settings & low-stock detection | V1 | MVP | US-10-09 (MVP) low-stock notifications depend on it; low-stock alerts are in the owner's MVP expectations |
| US-08-15 Controlled medicine register | V1 | MVP | BR-G-22 requires a register entry for every controlled dispensing; without it, controlled medicines could not be sold in MVP |
| US-10-03 Audit hash chain & verification | V1 | MVP | P0; tamper evidence (BRQ-12) is a critical control and must not be deferred |
| US-01-18, US-01-19 MFA | Future (P2) | V1 | Security control for Owner/Manager accounts before multi-tenant SaaS onboarding |
| US-07-16, US-07-17 Patient export / anonymize | Future (P2) | V1 | Data-subject rights likely required (REG-04); also needed to honor deletion requests without hard deletes |

## 4. MVP scope (R1)

<!-- BEGIN:MVP -->
| Epic | Story | Title | Priority | Complexity |
|---|---|---|---|---|
| EPIC-01 | [US-01-02](../stories/EPIC-01-IDENTITY-ACCESS/US-01-02-login-with-email-and-password.md) | Login with Email and Password | P0 | M |
| EPIC-01 | [US-01-03](../stories/EPIC-01-IDENTITY-ACCESS/US-01-03-refresh-token-rotation-and-reuse-detection.md) | Refresh Token Rotation and Reuse Detection | P0 | M |
| EPIC-01 | [US-01-04](../stories/EPIC-01-IDENTITY-ACCESS/US-01-04-logout-and-logout-all-devices.md) | Logout and Logout from All Devices | P0 | S |
| EPIC-01 | [US-01-05](../stories/EPIC-01-IDENTITY-ACCESS/US-01-05-password-policy-and-change-own-password.md) | Password Policy and Change Own Password | P0 | S |
| EPIC-01 | [US-01-06](../stories/EPIC-01-IDENTITY-ACCESS/US-01-06-forgot-and-reset-password.md) | Forgot and Reset Password | P0 | M |
| EPIC-01 | [US-01-07](../stories/EPIC-01-IDENTITY-ACCESS/US-01-07-account-lockout-and-login-history.md) | Account Lockout, Login Rate Limiting and Login History | P0 | M |
| EPIC-01 | [US-01-08](../stories/EPIC-01-IDENTITY-ACCESS/US-01-08-permission-catalog-and-system-roles.md) | Permission Catalog and Seeded System Roles | P0 | S |
| EPIC-01 | [US-01-10](../stories/EPIC-01-IDENTITY-ACCESS/US-01-10-backend-authorization-enforcement.md) | Backend Authorization Enforcement (Permission, Branch, Organization) | P0 | M |
| EPIC-01 | [US-01-11](../stories/EPIC-01-IDENTITY-ACCESS/US-01-11-invite-user-and-accept-invitation.md) | Invite a User and Accept the Invitation | P0 | M |
| EPIC-01 | [US-01-12](../stories/EPIC-01-IDENTITY-ACCESS/US-01-12-temporary-password-and-admin-reset.md) | Create User with Temporary Password and Admin Password Reset | P1 | S |
| EPIC-01 | [US-01-13](../stories/EPIC-01-IDENTITY-ACCESS/US-01-13-user-directory-and-profile.md) | View and update users in management scope | P0 | M |
| EPIC-01 | [US-01-14](../stories/EPIC-01-IDENTITY-ACCESS/US-01-14-manage-user-roles-and-branch-scope.md) | Manage user roles and branch scope | P0 | M |
| EPIC-01 | [US-01-15](../stories/EPIC-01-IDENTITY-ACCESS/US-01-15-activate-and-deactivate-users.md) | Activate and deactivate users | P0 | M |
| EPIC-01 | [US-01-16](../stories/EPIC-01-IDENTITY-ACCESS/US-01-16-manage-user-sessions.md) | Manage own and in-scope user sessions | P1 | M |
| EPIC-01 | [US-01-17](../stories/EPIC-01-IDENTITY-ACCESS/US-01-17-pos-manager-override-reauthentication.md) | Re-authenticate a manager for a POS override | P0 | M |
| EPIC-02 | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) | Tenant Context Resolution and Global Query Filters | P0 | M |
| EPIC-02 | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) | Cross-Organization Isolation Test Suite | P0 | M |
| EPIC-02 | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) | PostgreSQL Row-Level Security Defense in Depth | P0 | M |
| EPIC-02 | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) | Provision an Organization | P0 | M |
| EPIC-02 | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) | View and Update Organization Profile and Settings | P1 | S |
| EPIC-02 | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) | Create and Update Branches | P0 | M |
| EPIC-02 | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) | Configure Branch Settings | P0 | M |
| EPIC-02 | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) | Gapless Document Numbering Sequences | P0 | M |
| EPIC-02 | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) | Manage User Branch Scope and Assignments | P0 | M |
| EPIC-02 | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) | Enforce Branch-Scoped Authorization and Branch Inventory Ownership | P0 | S |
| EPIC-02 | [US-02-13](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-13-organization-reporting-scope.md) | Organization-Level Reporting Scope | P1 | S |
| EPIC-03 | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) | Manage manufacturers, active ingredients, and dosage forms | P0 | M |
| EPIC-03 | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) | Manage hierarchical medicine categories | P0 | S |
| EPIC-03 | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) | Manage tax categories | P0 | S |
| EPIC-03 | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) | Create and update a medicine | P0 | M |
| EPIC-03 | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) | Define active-ingredient composition and strength | P0 | S |
| EPIC-03 | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) | Manage medicine barcodes and barcode lookup | P0 | M |
| EPIC-03 | [US-03-07](../stories/EPIC-03-MEDICINE-CATALOG/US-03-07-manage-organization-selling-price.md) | Manage organization selling price with history | P0 | M |
| EPIC-03 | [US-03-08](../stories/EPIC-03-MEDICINE-CATALOG/US-03-08-branch-price-override.md) | Manage branch price overrides | P1 | S |
| EPIC-03 | [US-03-09](../stories/EPIC-03-MEDICINE-CATALOG/US-03-09-set-prescription-classification.md) | Set and change prescription classification | P0 | S |
| EPIC-03 | [US-03-10](../stories/EPIC-03-MEDICINE-CATALOG/US-03-10-deactivate-reactivate-delete-medicine.md) | Deactivate, reactivate, and delete a medicine | P0 | S |
| EPIC-03 | [US-03-11](../stories/EPIC-03-MEDICINE-CATALOG/US-03-11-search-medicines.md) | Search medicines in Arabic and English | P0 | L |
| EPIC-03 | [US-03-12](../stories/EPIC-03-MEDICINE-CATALOG/US-03-12-list-and-view-medicines.md) | List, filter, and view medicine details | P0 | M |
| EPIC-03 | [US-03-19](../stories/EPIC-03-MEDICINE-CATALOG/US-03-19-catalog-facade-and-integration-events.md) | Catalog facade, effective sale info, and integration events | P0 | M |
| EPIC-04 | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) | Batch model, status derivation, and batch views | P0 | M |
| EPIC-04 | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) | Stock movement ledger and posting service | P0 | L |
| EPIC-04 | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) | Inbound find-or-create and return-to-batch contracts | P0 | M |
| EPIC-04 | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) | FEFO allocation service | P0 | L |
| EPIC-04 | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) | FEFO override with permission | P1 | S |
| EPIC-04 | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) | Posting transactions, idempotency, and failure guarantees | P0 | M |
| EPIC-04 | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) | Branch stock overview | P0 | M |
| EPIC-04 | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) | Stock card and movement history | P0 | M |
| EPIC-04 | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) | Opening balance documents and lock | P0 | M |
| EPIC-04 | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) | Opening balance file import | P0 | M |
| EPIC-04 | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) | Stock adjustments with reason codes | P0 | M |
| EPIC-04 | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) | Adjustment and write-off approval | P0 | S |
| EPIC-04 | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) | Damaged and expired write-offs | P0 | M |
| EPIC-04 | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) | Batch metadata correction and selling price override | P1 | S |
| EPIC-04 | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) | Nightly expiry flagging and near-expiry detection | P0 | M |
| EPIC-04 | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) | Reorder settings and low-stock detection | P1 | M |
| EPIC-04 | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) | Ledger ↔ balance reconciliation job | P0 | M |
| EPIC-04 | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) | Inventory valuation snapshot and as-of valuation | P1 | M |
| EPIC-05 | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) | Manage supplier records | P0 | M |
| EPIC-05 | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) | Deactivate and reactivate a supplier | P1 | S |
| EPIC-05 | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) | Manage supplier contacts | P1 | S |
| EPIC-05 | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) | Create a draft direct goods receipt | P0 | M |
| EPIC-05 | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) | Validate batch expiry and shelf life on receipt | P0 | S |
| EPIC-05 | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) | Post a goods receipt to inventory | P0 | L |
| EPIC-05 | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) | Reverse a posted goods receipt | P1 | M |
| EPIC-05 | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) | View goods receipts and purchase history | P1 | S |
| EPIC-06 | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) | POS Medicine Search | P0 | M |
| EPIC-06 | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) | Barcode Scanning and Unknown Barcode Handling | P0 | M |
| EPIC-06 | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) | POS Cart with Pack and Base-Unit Quantities | P0 | M |
| EPIC-06 | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) | Price Resolution and Server Quote | P0 | M |
| EPIC-06 | [US-06-05](../stories/EPIC-06-SALES-POS/US-06-05-tax-calculation.md) | Tax Calculation per Tax Category | P0 | S |
| EPIC-06 | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) | Line and Invoice Discounts within Role Limits | P0 | M |
| EPIC-06 | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) | Manager Override at the POS | P0 | M |
| EPIC-06 | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) | Open Cash Session with Opening Float | P0 | S |
| EPIC-06 | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) | Cash In and Cash Out Movements | P1 | S |
| EPIC-06 | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) | Close Cash Session with Blind Count and Z-Report | P0 | M |
| EPIC-06 | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) | Force-Close Another User's Cash Session | P1 | S |
| EPIC-06 | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) | Complete a Sale Atomically | P0 | L |
| EPIC-06 | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) | Cash, Card, and Split Payments with Change | P0 | M |
| EPIC-06 | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) | Sale Completion Idempotency, Concurrency, and Failure Safety | P0 | M |
| EPIC-06 | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) | Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) | P0 | M |
| EPIC-06 | [US-06-17](../stories/EPIC-06-SALES-POS/US-06-17-reprint-with-copy-marking.md) | Reprint Sales Invoice with COPY Marking | P1 | S |
| EPIC-06 | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) | Sales History Search and Sale Detail | P1 | M |
| EPIC-06 | [US-06-19](../stories/EPIC-06-SALES-POS/US-06-19-line-cogs-and-gross-profit.md) | Line COGS and Gross Profit | P1 | S |
| EPIC-06 | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) | Void a Sale | P1 | M |
| EPIC-06 | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) | Create a Sales Return with Refund | P0 | L |
| EPIC-06 | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) | Return Approval Above Threshold or Outside Window | P1 | M |
| EPIC-06 | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) | Refund Method Rules and Cash-in-Drawer Limit | P0 | M |
| EPIC-06 | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) | Return Disposition Inspection (Restock or Discard) | P0 | M |
| EPIC-06 | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) | Link a Patient to a Sale with Allergy Decision Support | P1 | M |
| EPIC-06 | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) | Prescription-Linked Sale with Rx-Only and Controlled Enforcement | P0 | L |
| EPIC-06 | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) | Partial Prescription Fulfillment at the POS | P0 | S |
| EPIC-07 | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) | Create and Maintain Patient Profile | P0 | M |
| EPIC-07 | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) | Search Patients by Phone, Name, and Code | P0 | M |
| EPIC-07 | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) | Record Patient Consent for Medical Data and Notifications | P0 | S |
| EPIC-07 | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) | Record and Manage Patient Allergies | P0 | M |
| EPIC-07 | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) | Log and Review Medical Data Access | P0 | M |
| EPIC-07 | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) | Link a Patient to a Sale at the POS | P0 | S |
| EPIC-07 | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) | Allergy Alert and Acknowledgement at POS and Dispensing | P0 | L |
| EPIC-08 | [US-08-01](../stories/EPIC-08-PRESCRIPTIONS/US-08-01-prescription-settings.md) | Prescription Settings | P1 | S |
| EPIC-08 | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) | Manage Prescribers | P1 | S |
| EPIC-08 | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) | Register a Draft Prescription | P0 | M |
| EPIC-08 | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) | Add and Edit Prescription Items | P0 | M |
| EPIC-08 | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) | Upload Prescription Attachments with Malware Scanning | P0 | M |
| EPIC-08 | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) | View Prescription Attachments via Pre-signed URL | P0 | S |
| EPIC-08 | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) | Submit Prescription for Verification | P0 | S |
| EPIC-08 | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) | Pharmacist Verification | P0 | M |
| EPIC-08 | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) | Search, View, and Track Prescription History | P1 | M |
| EPIC-08 | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) | Cancel a Prescription | P1 | S |
| EPIC-08 | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) | Prescription Expiry | P1 | S |
| EPIC-08 | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) | Dispense Prescription Items Through POS (Partial Dispensing) | P0 | L |
| EPIC-08 | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) | Enforce Prescription for Rx-only and Controlled Medicines at Sale | P0 | M |
| EPIC-08 | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) | Reverse Dispensing When a Sale Is Voided | P1 | M |
| EPIC-08 | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) | Controlled Medicine Register | P1 | M |
| EPIC-09 | [US-09-01](../stories/EPIC-09-FINANCE-REPORTING/US-09-01-report-filters-and-scoping.md) | Report Filters, Business-Date Presets, and Scoping | P0 | M |
| EPIC-09 | [US-09-03](../stories/EPIC-09-FINANCE-REPORTING/US-09-03-daily-sales-report.md) | Daily Sales Report | P0 | M |
| EPIC-09 | [US-09-05](../stories/EPIC-09-FINANCE-REPORTING/US-09-05-gross-profit-and-cogs-report.md) | Gross Profit and COGS Report | P0 | M |
| EPIC-09 | [US-09-07](../stories/EPIC-09-FINANCE-REPORTING/US-09-07-cash-session-z-report-and-reconciliation.md) | Cash Session X/Z Report and Cash Reconciliation | P0 | L |
| EPIC-09 | [US-09-08](../stories/EPIC-09-FINANCE-REPORTING/US-09-08-current-inventory-valuation.md) | Current Inventory Valuation (Stock on Hand) | P0 | M |
| EPIC-09 | [US-09-10](../stories/EPIC-09-FINANCE-REPORTING/US-09-10-near-expiry-report.md) | Near-Expiry and Expired Stock Report | P0 | M |
| EPIC-09 | [US-09-18](../stories/EPIC-09-FINANCE-REPORTING/US-09-18-synchronous-csv-report-export.md) | Synchronous CSV Report Export | P0 | M |
| EPIC-10 | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) | Audit Log Write Pipeline | P0 | M |
| EPIC-10 | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) | Sensitive-Operation Catalog Registry and Conformance | P0 | M |
| EPIC-10 | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) | Per-Organization Audit Hash Chain and Verification | P0 | L |
| EPIC-10 | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) | Audit Log Search and Filter | P0 | M |
| EPIC-10 | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) | Notification Store, Default Routing, and Notification Center API | P0 | M |
| EPIC-10 | [US-10-09](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-09-low-stock-and-expiry-notifications.md) | Low-Stock and Expiry Notifications | P0 | M |
| EPIC-10 | [US-10-13](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-13-notification-center-interface.md) | Notification Center Interface | P0 | M |
| EPIC-10 | [US-10-17](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-17-settings-registry-and-resolution.md) | Settings Registry and Resolution | P0 | M |
| EPIC-10 | [US-10-18](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-18-organization-settings.md) | Organization Settings | P0 | M |
| EPIC-10 | [US-10-19](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-19-branch-settings.md) | Branch Settings and Overrides | P0 | M |
| EPIC-10 | [US-10-20](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-20-user-language-and-theme-preferences.md) | User Language and Theme Preferences | P0 | S |
| EPIC-10 | [US-10-21](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-21-arabic-english-localization-and-direction.md) | Arabic-English Localization and RTL-LTR | P0 | L |
| EPIC-10 | [US-10-22](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-22-localized-digits-dates-and-money.md) | Localized Digits Dates Money and Medicine Names | P0 | M |
| EPIC-10 | [US-10-23](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-23-light-dark-system-themes.md) | Light Dark and System Themes | P0 | M |

<!-- END:MVP -->

## 5. V1 scope (R2)

<!-- BEGIN:V1 -->
| Epic | Story | Title | Priority | Complexity |
|---|---|---|---|---|
| EPIC-01 | [US-01-01](../stories/EPIC-01-IDENTITY-ACCESS/US-01-01-organization-self-signup.md) | Organization Self-Signup with Owner Email Verification | P1 | M |
| EPIC-01 | [US-01-09](../stories/EPIC-01-IDENTITY-ACCESS/US-01-09-manage-custom-roles.md) | Manage Custom Roles | P1 | M |
| EPIC-01 | [US-01-18](../stories/EPIC-01-IDENTITY-ACCESS/US-01-18-enroll-and-authenticate-with-totp.md) | Enroll and authenticate with TOTP | P2 | L |
| EPIC-01 | [US-01-19](../stories/EPIC-01-IDENTITY-ACCESS/US-01-19-enforce-and-administer-mfa.md) | Enforce and administer MFA | P2 | M |
| EPIC-01 | [US-01-20](../stories/EPIC-01-IDENTITY-ACCESS/US-01-20-platform-administrator-authentication.md) | Authenticate platform administrators separately | P1 | M |
| EPIC-02 | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) | Deactivate and Reactivate a Branch | P1 | M |
| EPIC-02 | [US-02-12](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-12-stock-transfer-policy.md) | Stock Transfer Route and Approval Policy | P1 | S |
| EPIC-02 | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) | Platform Administration of Organizations (List, Suspend, Reactivate) | P1 | M |
| EPIC-02 | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) | Owner Manages Support Access Grants | P1 | S |
| EPIC-02 | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) | Platform Administrator Read-Only Support Session | P1 | M |
| EPIC-03 | [US-03-13](../stories/EPIC-03-MEDICINE-CATALOG/US-03-13-manage-alternative-medicines.md) | Manage alternative medicines and suggestions | P1 | M |
| EPIC-03 | [US-03-14](../stories/EPIC-03-MEDICINE-CATALOG/US-03-14-import-medicines-dry-run.md) | Import medicines: template and dry-run validation | P1 | L |
| EPIC-03 | [US-03-15](../stories/EPIC-03-MEDICINE-CATALOG/US-03-15-import-medicines-commit.md) | Import medicines: idempotent commit | P1 | M |
| EPIC-03 | [US-03-16](../stories/EPIC-03-MEDICINE-CATALOG/US-03-16-export-medicines.md) | Export medicines | P1 | S |
| EPIC-04 | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) | Batch quarantine, release, and recall | P1 | M |
| EPIC-04 | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) | Transfer drafting, submission, and cancellation | P1 | M |
| EPIC-04 | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) | Transfer approval with reservation, rejection | P1 | M |
| EPIC-04 | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) | Transfer dispatch and in-transit visibility | P1 | M |
| EPIC-04 | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) | Transfer receipt with short, over, and rejected quantities | P1 | L |
| EPIC-04 | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) | Stocktake creation and start with snapshot | P1 | M |
| EPIC-04 | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) | Stocktake blind counting and submission | P1 | M |
| EPIC-04 | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) | Stocktake review, recount, approval, and variance posting | P1 | L |
| EPIC-04 | [US-04-27](../stories/EPIC-04-BATCH-INVENTORY/US-04-27-multi-branch-stock-visibility.md) | Multi-branch stock visibility | P1 | S |
| EPIC-05 | [US-05-09](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-09-create-draft-purchase-order.md) | Create and Edit a Draft Purchase Order | P1 | M |
| EPIC-05 | [US-05-10](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-10-submit-and-approve-purchase-order.md) | Submit, Approve, and Reject a Purchase Order | P1 | M |
| EPIC-05 | [US-05-11](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-11-cancel-and-close-purchase-order.md) | Cancel and Close a Purchase Order | P1 | S |
| EPIC-05 | [US-05-12](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-12-receive-goods-against-purchase-order.md) | Receive Goods Against a Purchase Order | P1 | M |
| EPIC-05 | [US-05-13](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-13-draft-supplier-invoice-from-receipts.md) | Draft a Supplier Invoice from Receipts | P1 | M |
| EPIC-05 | [US-05-14](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-14-match-and-post-supplier-invoice.md) | Match and Post a Supplier Invoice | P1 | M |
| EPIC-05 | [US-05-15](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-15-cancel-supplier-invoice.md) | Cancel a Supplier Invoice | P1 | S |
| EPIC-05 | [US-05-16](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-16-draft-supplier-return-with-reservation.md) | Draft a Supplier Return with Batch Reservation | P1 | M |
| EPIC-05 | [US-05-17](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-17-post-supplier-return-and-debit-note.md) | Post a Supplier Return and Debit Note | P1 | M |
| EPIC-05 | [US-05-18](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-18-record-supplier-payment.md) | Record a Supplier Payment with Allocations | P1 | M |
| EPIC-05 | [US-05-19](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-19-allocate-credit-and-reverse-payment.md) | Allocate Unapplied Credit and Reverse a Payment | P1 | M |
| EPIC-05 | [US-05-20](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-20-supplier-opening-balance-and-ledger.md) | Supplier Opening Balance and Ledger Statement | P1 | M |
| EPIC-05 | [US-05-21](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-21-supplier-balances-and-aging.md) | Supplier Balances and Aging Report | P1 | M |
| EPIC-07 | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) | Manage Chronic Conditions | P1 | S |
| EPIC-07 | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) | Record Restricted Pharmacist Notes | P1 | S |
| EPIC-07 | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) | View Medication and Purchase History | P1 | M |
| EPIC-07 | [US-07-11](../stories/EPIC-07-PATIENT-RECORDS/US-07-11-view-prescription-history-links.md) | View Prescription History Links | P1 | S |
| EPIC-07 | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) | Configure Patient Privacy Settings and Optional National ID | P1 | M |
| EPIC-07 | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) | Export a Patient's Data (Data Subject Request) | P2 | M |
| EPIC-07 | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) | Anonymize a Patient | P2 | M |
| EPIC-09 | [US-09-02](../stories/EPIC-09-FINANCE-REPORTING/US-09-02-daily-branch-summary-projection.md) | DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation | P1 | L |
| EPIC-09 | [US-09-04](../stories/EPIC-09-FINANCE-REPORTING/US-09-04-sales-analysis-breakdowns.md) | Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour | P1 | M |
| EPIC-09 | [US-09-06](../stories/EPIC-09-FINANCE-REPORTING/US-09-06-returns-and-refunds-report.md) | Returns and Refunds Report | P1 | S |
| EPIC-09 | [US-09-09](../stories/EPIC-09-FINANCE-REPORTING/US-09-09-historical-inventory-valuation.md) | Historical Inventory Valuation | P1 | M |
| EPIC-09 | [US-09-11](../stories/EPIC-09-FINANCE-REPORTING/US-09-11-inventory-loss-report.md) | Inventory Loss Report | P1 | M |
| EPIC-09 | [US-09-12](../stories/EPIC-09-FINANCE-REPORTING/US-09-12-purchase-report.md) | Purchase Report | P1 | M |
| EPIC-09 | [US-09-13](../stories/EPIC-09-FINANCE-REPORTING/US-09-13-supplier-balances-and-aging.md) | Supplier Balances and Aging | P1 | M |
| EPIC-09 | [US-09-14](../stories/EPIC-09-FINANCE-REPORTING/US-09-14-expense-categories-and-expense-reporting.md) | Expense Categories and Expense Reporting | P1 | L |
| EPIC-09 | [US-09-15](../stories/EPIC-09-FINANCE-REPORTING/US-09-15-expense-cash-payout-and-reversal.md) | Expense Cash Payout and Reversal | P1 | M |
| EPIC-09 | [US-09-17](../stories/EPIC-09-FINANCE-REPORTING/US-09-17-tax-summary-report.md) | Tax Summary Report | P1 | M |
| EPIC-09 | [US-09-19](../stories/EPIC-09-FINANCE-REPORTING/US-09-19-background-report-exports.md) | Background Report Exports | P1 | L |
| EPIC-09 | [US-09-20](../stories/EPIC-09-FINANCE-REPORTING/US-09-20-branch-dashboard.md) | Branch and Organization Dashboard | P1 | M |
| EPIC-09 | [US-09-21](../stories/EPIC-09-FINANCE-REPORTING/US-09-21-branch-comparison-and-operating-summary.md) | Branch Comparison and Operating Summary | P1 | L |
| EPIC-10 | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) | Audit Log Export | P1 | S |
| EPIC-10 | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) | API Action Log | P1 | M |
| EPIC-10 | [US-10-10](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-10-operational-event-notifications.md) | Operational Event Notifications | P1 | M |
| EPIC-10 | [US-10-11](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-11-notification-rule-management.md) | Notification Rule Management | P1 | M |
| EPIC-10 | [US-10-12](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-12-real-time-notification-delivery.md) | Real-Time Notification Delivery and Recovery | P1 | L |
| EPIC-10 | [US-10-24](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-24-platform-health-jobs-and-backups.md) | Platform Health Jobs and Backups | P1 | L |

<!-- END:V1 -->

V1 is delivered in four increments so value reaches pilot customers early:

| Increment | Theme | Content |
|---|---|---|
| V1.1 | Procurement completion | Purchase orders, receiving against PO (CS-03), supplier invoices and matching, supplier returns, payments, ledger, aging |
| V1.2 | Multi-branch operations | Transfers (CS-06), branch deactivation, transfer policy, multi-branch visibility, quarantine/recall, stocktakes |
| V1.3 | SaaS & security | Platform admin auth and organization administration, support grants, self-signup, custom roles, MFA, API action log, audit export |
| V1.4 | Reporting, privacy & real-time | Remaining finance reports, projections, background exports, dashboards, patient history/timeline/privacy tools, export/anonymize, SignalR real-time, notification rules, catalog import/export and alternatives |

## 6. Future scope

<!-- BEGIN:FUTURE -->
| Epic | Story | Title | Priority | Complexity |
|---|---|---|---|---|
| EPIC-03 | [US-03-17](../stories/EPIC-03-MEDICINE-CATALOG/US-03-17-generate-internal-barcode.md) | Generate an internal barcode | P2 | S |
| EPIC-03 | [US-03-18](../stories/EPIC-03-MEDICINE-CATALOG/US-03-18-print-shelf-labels.md) | Print shelf labels | P2 | M |
| EPIC-04 | [US-04-28](../stories/EPIC-04-BATCH-INVENTORY/US-04-28-rebalancing-suggestions.md) | Multi-branch rebalancing suggestions | P3 | M |
| EPIC-05 | [US-05-22](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-22-purchasing-suggestions.md) | Purchasing Suggestions from Reorder Levels | P2 | M |
| EPIC-05 | [US-05-23](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-23-supplier-performance-metrics.md) | Supplier Performance Metrics | P2 | M |
| EPIC-05 | [US-05-24](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-24-supplier-price-comparison.md) | Supplier Price Comparison | P2 | S |
| EPIC-06 | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) | Explicit Batch Selection at the POS (FEFO Override) | P2 | S |
| EPIC-06 | [US-06-28](../stories/EPIC-06-SALES-POS/US-06-28-loyalty-points-accrual.md) | Loyalty Points Accrual (P3, subject to OD-06-08) | P3 | M |
| EPIC-06 | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) | Loyalty Points Redemption as Payment (P3, subject to OD-06-08) | P3 | M |
| EPIC-06 | [US-06-30](../stories/EPIC-06-SALES-POS/US-06-30-e-invoice-data-readiness.md) | Electronic Invoice / Receipt Data Readiness (P3, pending REG-07) | P3 | S |
| EPIC-07 | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) | Patient Interaction Timeline | P2 | M |
| EPIC-07 | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) | Detect Duplicate Patients | P2 | M |
| EPIC-07 | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) | Merge Duplicate Patients | P2 | L |
| EPIC-08 | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) | Generic Substitution | P2 | M |
| EPIC-08 | [US-08-17](../stories/EPIC-08-PRESCRIPTIONS/US-08-17-allergy-alerts.md) | Allergy Alerts at Verification and Dispensing | P2 | S |
| EPIC-08 | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) | Dispensing Labels | P2 | M |
| EPIC-08 | [US-08-19](../stories/EPIC-08-PRESCRIPTIONS/US-08-19-prescription-refills.md) | Prescription Refills | P2 | M |
| EPIC-08 | [US-08-20](../stories/EPIC-08-PRESCRIPTIONS/US-08-20-ocr-extraction.md) | OCR Extraction Suggestions | P3 | L |
| EPIC-08 | [US-08-21](../stories/EPIC-08-PRESCRIPTIONS/US-08-21-ocr-suggestion-review.md) | Review and Decide OCR Suggestions | P3 | M |
| EPIC-08 | [US-08-22](../stories/EPIC-08-PRESCRIPTIONS/US-08-22-drug-interaction-checks.md) | Drug Interaction Checks and Overrides | P3 | L |
| EPIC-09 | [US-09-16](../stories/EPIC-09-FINANCE-REPORTING/US-09-16-expense-approval-workflow.md) | Expense Approval Workflow | P2 | M |
| EPIC-09 | [US-09-22](../stories/EPIC-09-FINANCE-REPORTING/US-09-22-abc-and-operational-analytics.md) | ABC and Operational Analytics | P3 | L |
| EPIC-10 | [US-10-07](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-07-suspicious-activity-reports.md) | Suspicious Activity Reports | P2 | M |
| EPIC-10 | [US-10-14](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-14-platform-announcements.md) | Platform Announcements | P2 | M |
| EPIC-10 | [US-10-15](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-15-email-and-digest-notifications.md) | Email and Digest Notifications | P2 | L |
| EPIC-10 | [US-10-16](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-16-customer-refill-reminders.md) | Customer Refill Reminders | P3 | M |
| EPIC-10 | [US-10-25](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-25-organization-data-export.md) | Organization Data Export | P3 | L |

<!-- END:FUTURE -->

Future features are started only when their go/no-go criteria in [ADVANCED-FEATURES.md](../ADVANCED-FEATURES.md) are met. Those criteria cover a licensed data source (REG-09), privacy review (REG-10), and validated customer demand.

## 7. MVP go-live checklist

1. All MVP stories meet the [Definition of Done](DEFINITION-OF-DONE.md).
2. Quality gates G1–G13 ([MASTER-TEST-STRATEGY §7](../test-plans/MASTER-TEST-STRATEGY.md)) pass at the MVP load profile.
3. E2E MVP journeys (E2E-01…E2E-19, E2E-C1, E2E-C2) pass in Arabic and English.
4. Penetration test has no open Critical/High findings. RLS and the isolation suite are green.
5. Opening balances are imported and reconciled for the pilot branch. A physical count matches the system at ≥ 99.5% of lines.
6. The backup and PITR restore drill is completed (RPO ≤ 15 min, RTO ≤ 4 h).
7. Every *Blocking for go-live* REG item (REG-01, 02, 04, 05, 06, 07, 08, 11) has a recorded professional confirmation, and settings are configured accordingly.
8. Pharmacist SME UAT sign-off covers dispensing, returns, controlled medicines and Arabic receipts.
9. Operational runbook, on-call contact, and rollback procedure are rehearsed on staging.
10. Users are trained: cashiers, pharmacists, manager, owner.

## 8. Release cadence after MVP

- V1 increments ship every 4–6 weeks behind feature flags. Every release passes the full regression suite.
- Patch releases ship as needed for Critical/High defects. A hotfix still passes G1–G6.
- Database migrations follow expand/contract so the previous application version keeps working during rollout (DEPLOYMENT-ARCHITECTURE §7).
