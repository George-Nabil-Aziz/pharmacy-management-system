# SPEC-03: Medicine Catalog

**Version:** 1.0 · **Status:** Draft for review · **Owner:** Business Analysis / Architecture · **Related ADRs:** ADR-001 (modular monolith), ADR-002 (multi-tenancy), ADR-006 (files), ADR-007 (background jobs), ADR-008 (audit), ADR-009 (localization) · **Related BRQs:** BRQ-01, BRQ-02, BRQ-03, BRQ-10, BRQ-12, BRQ-13, BRQ-15

---

## 1. Purpose

Define the organization-level Medicine catalog: the master definition of every medicine an organization can buy, stock, and sell, together with its reference data (categories, manufacturers, active ingredients, dosage forms, tax categories), barcodes, selling prices (organization default and branch override), prescription classification, alternatives, search, and bulk import/export. The catalog is the single source of medicine identity for SPEC-04 (Batch & Inventory), SPEC-05 (Procurement), SPEC-06 (Sales & POS), SPEC-08 (Prescriptions), and SPEC-09 (Reporting).

## 2. Business Context

An Egyptian community pharmacy typically carries 3,000–15,000 distinct medicines and para-pharmaceutical items, many with English trade names printed on the pack and Arabic names used verbally by staff and customers. Cashiers identify medicines by scanning a manufacturer barcode or typing a partial name in either language, frequently with Arabic spelling variants (أ/ا, ى/ي, ة/ه). Selling prices are maintained centrally by the owner, with occasional branch-specific differences. Pharmacists need to see the composition (active ingredients and strengths) to offer alternatives when a medicine is out of stock.

The catalog describes **what** a medicine is. **How much** of it exists, **where**, with **which batch number, expiry date and actual cost** is owned by SPEC-04. This separation is a deliberate design decision (see §8.1).

No official national drug database is integrated. Any external catalog source (for initial data load or ongoing updates) is an open decision subject to licensing (REG-09, OD-03-03). Initial catalog population is done by manual entry or by the organization's own CSV/XLSX file through the import function.

## 3. Scope

- Medicine create, update, view, list, deactivate, reactivate, and hard delete when unreferenced.
- Bilingual trade name (English required, Arabic optional — OD-03-01), generic name, internal medicine code.
- Active ingredient composition with strength per ingredient; dosage form; display strength text.
- Package information: `PackSize` (base units per pack), base unit name (en/ar), `AllowSplitPack`, pack description.
- Multiple barcodes per medicine: GTIN-8/12/13/14 with check-digit validation, internal barcodes, organization-wide uniqueness, primary barcode, barcode lookup.
- Prescription classification `OTC` / `PrescriptionOnly` / `Controlled` (storage of the classification only; enforcement is SPEC-06/SPEC-08 per BR-G-21/BR-G-22; semantics pending REG-01/REG-02).
- Selling price: organization default pack price, optional base-unit price, optional branch override, append-only price history, large-change confirmation.
- Reference purchase cost `LastPurchaseCost` (updated from posted goods receipts; actual cost lives on `Batch` in SPEC-04).
- Tax category per medicine (rates configured by the organization, pending REG-06).
- Default minimum stock threshold per medicine (per-branch override is `ReorderSetting` in SPEC-04).
- Storage condition (room temperature / refrigerated 2–8 °C / frozen), protect-from-light flag, storage instructions.
- Manually curated alternative medicines and an equivalence suggestion query.
- Reference data management: hierarchical categories (max depth 3), manufacturers, active ingredients, dosage forms, tax categories.
- Search: trade/generic/ingredient name, code, barcode; Arabic normalization; prefix and trigram matching; ranking.
- Import (CSV/XLSX, dry run, validation report, idempotent upsert by barcode or code) and export.
- Internal barcode generation and shelf-label printing (P2).
- Read facade and integration events for other modules.

## 4. Out of Scope

- Batches, batch numbers, expiry dates, stock quantities, reorder settings per branch, stock valuation (SPEC-04).
- Supplier-specific item codes and supplier price lists (SPEC-05).
- Discount rules and promotional pricing (SPEC-06).
- Drug–drug interaction and allergy checking content (SPEC-07/SPEC-08; any data source requires REG-09).
- Integration with any national drug registry, track-and-trace, or price list (REG-03, REG-08, REG-09).
- Parsing of GS1 DataMatrix / GS1-128 application identifiers (batch, expiry, serial) — OD-03-08.
- Intermediate sellable units between pack and base unit (e.g., strip) — OD-03-09.
- Scheduled (future-dated) price changes — OD-03-05.
- Medicine images.

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Catalog interaction |
|---|---|
| Owner | Full catalog control, organization default prices, tax categories, import/export |
| Branch Manager | Maintains medicines, branch price overrides for assigned branches, reference data, import/export |
| Pharmacist | Maintains medicines and composition, sets prescription classification, curates alternatives |
| Cashier | Searches and views medicines (no cost visibility) |
| Inventory Staff | Creates/updates medicines encountered during receiving, views cost |
| Accountant | Views catalog and costs, exports |
| System (other modules) | Reads catalog via facade; SPEC-05 publishes goods-receipt events that update `LastPurchaseCost` |

### 5.2 Permissions used

| Permission | Status | Purpose |
|---|---|---|
| `catalog.medicines.read` | Canonical | View, list, search, barcode lookup, price history, alternatives, shelf labels |
| `catalog.medicines.create` | Canonical | Create medicines (including the initial selling price) |
| `catalog.medicines.update` | Canonical | Update medicine attributes, composition, barcodes, alternatives, generate internal barcodes |
| `catalog.medicines.deactivate` | Canonical | Deactivate, reactivate, hard-delete unreferenced medicines |
| `catalog.medicines.import` | Canonical | Download template, dry run, commit imports |
| `catalog.medicines.export` | Canonical | Export catalog |
| `catalog.prices.update` | Canonical | Change organization default price (requires organization-wide scope) and branch overrides (requires branch assignment) |
| `catalog.reference-data.manage` | Canonical | Categories, manufacturers, active ingredients, dosage forms |
| `settings.organization.manage` | Canonical | Tax categories and catalog organization settings |
| `catalog.medicines.classify` | **New (SPEC-03)** | Set a classification other than `PrescriptionOnly` at creation, or change the classification of an existing medicine |
| `catalog.costs.read` | **New (SPEC-03)** | See `LastPurchaseCost` in API responses and exports |

### 5.3 Default role grants (seeded; editable per organization)

| Permission | OWNER | MANAGER | PHARMACIST | CASHIER | INVENTORY | ACCOUNTANT |
|---|---|---|---|---|---|---|
| `catalog.medicines.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `catalog.medicines.create` | ✓ | ✓ | ✓ | | ✓ | |
| `catalog.medicines.update` | ✓ | ✓ | ✓ | | ✓ | |
| `catalog.medicines.deactivate` | ✓ | ✓ | | | | |
| `catalog.medicines.classify` | ✓ | | ✓ | | | |
| `catalog.medicines.import` | ✓ | ✓ | | | | |
| `catalog.medicines.export` | ✓ | ✓ | | | | ✓ |
| `catalog.prices.update` | ✓ | ✓ | | | | |
| `catalog.costs.read` | ✓ | ✓ | | | ✓ | ✓ |
| `catalog.reference-data.manage` | ✓ | ✓ | ✓ | | | |
| `settings.organization.manage` | ✓ | | | | | |

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-03-001 | The system shall let a user with `catalog.reference-data.manage` create, update, list, and view manufacturers with `NameEn` (required), `NameAr` (optional), and `CountryCode` (optional ISO 3166-1 alpha-2), with names unique per organization after normalization (§13.1). | P0 | BRQ-03 | US-03-01 |
| FR-03-002 | The system shall let a user with `catalog.reference-data.manage` create, update, list, and view active ingredients with `NameEn` (required) and `NameAr` (optional), unique per organization after normalization. | P0 | BRQ-03 | US-03-01 |
| FR-03-003 | The system shall seed each new organization with the dosage-form list in §8.4 and let a user with `catalog.reference-data.manage` create, rename, and deactivate dosage forms, with `Code` unique per organization. | P0 | BRQ-03 | US-03-01 |
| FR-03-004 | The system shall allow deactivation and reactivation of any reference-data item (category, manufacturer, active ingredient, dosage form); an inactive item shall be rejected on medicine create/update with `CATALOG.REFERENCE_DATA_INACTIVE` while existing assignments remain unchanged, and hard deletion shall succeed only when the item is referenced by no medicine (otherwise 409 `CATALOG.REFERENCE_DATA_IN_USE`). | P0 | BRQ-03 | US-03-01, US-03-02 |
| FR-03-005 | The system shall maintain hierarchical medicine categories with a maximum depth of 3 levels, reject moves that create a cycle (`CATALOG.CATEGORY_CYCLE`) or exceed depth 3 including the moved subtree (`CATALOG.CATEGORY_DEPTH_EXCEEDED`), enforce name uniqueness among siblings, and reject deactivation of a category that has active child categories (`CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN`). | P0 | BRQ-03 | US-03-02 |
| FR-03-006 | The system shall let a user with `settings.organization.manage` create, update, and deactivate tax categories (`Code`, `NameEn`, `NameAr`, `RatePercent` 0.00–100.00), seed one category `DEFAULT` at 0.00% marked `RequiresReview = true` (REG-06), apply rate changes only to transactions completed after the change commits, and reject deactivation of the category referenced by organization setting `DefaultTaxCategoryId` (`CATALOG.TAX_CATEGORY_IS_DEFAULT`). | P0 | BRQ-15 | US-03-03 |
| FR-03-007 | The system shall let a user with `catalog.medicines.create` create a medicine with the attributes in §8.2, returning 201 with `Location` and `ETag`, status `Active`, and a generated `Code` of the form `MED-NNNNNN` (6-digit organization sequence) when no code is supplied. | P0 | BRQ-03 | US-03-04 |
| FR-03-008 | The system shall let a user with `catalog.medicines.update` update medicine attributes only with a matching `If-Match` ETag, returning 412 `COMMON.CONCURRENCY_CONFLICT` on mismatch and 428 `COMMON.PRECONDITION_REQUIRED` when `If-Match` is absent. | P0 | BRQ-03 | US-03-04 |
| FR-03-009 | The system shall store package information — `PackSize` (integer 1–10,000 base units per pack), `BaseUnitNameEn`/`BaseUnitNameAr`, `AllowSplitPack`, `PackDescription` — and reject a `PackSize` change with 409 `CATALOG.PACK_SIZE_CHANGE_BLOCKED` while any batch of the medicine in any branch has `OnHand > 0` or `Reserved > 0`. | P0 | BRQ-03 | US-03-04 |
| FR-03-010 | The system shall store `StorageCondition` (`RoomTemperature`, `Refrigerated2To8C`, `Frozen`), `ProtectFromLight`, and bilingual storage instructions (≤ 500 characters each), and expose `IsRefrigerated = (StorageCondition = Refrigerated2To8C)` in medicine read models. | P1 | BRQ-03 | US-03-04 |
| FR-03-011 | The system shall store an optional `DefaultMinStock` (integer base units, 0–1,000,000) per medicine and expose it through the catalog facade so that SPEC-04 resolves the effective threshold as the branch `ReorderSetting` minimum when present, otherwise `DefaultMinStock`. | P1 | BRQ-11 | US-03-04, US-03-19 |
| FR-03-012 | On create, the system shall reject with 409 `CATALOG.POSSIBLE_DUPLICATE` (listing up to 5 matching medicine ids/codes/names) when an active medicine exists with the same normalized `TradeNameEn`, `DosageFormId`, and normalized `StrengthText`, unless the request sets `confirmDuplicate = true`. | P2 | BRQ-03 | US-03-04 |
| FR-03-013 | The system shall let a user with `catalog.medicines.update` replace a medicine's active-ingredient composition (0–10 rows, each with `ActiveIngredientId`, `StrengthValue` > 0, `StrengthUnit` from §8.4, `SortOrder`), rejecting duplicate ingredients (`CATALOG.INGREDIENT_DUPLICATE`), and compose `StrengthText` from the rows when `StrengthText` is empty. | P0 | BRQ-03 | US-03-05 |
| FR-03-014 | The system shall allow 0–10 barcodes per medicine, each with `Format` (`Gtin` or `Internal`) and `Source` (`Manual`, `Import`, `Generated`), keep exactly one `IsPrimary = true` barcode whenever at least one exists, and promote the oldest remaining barcode to primary when the primary is removed. | P0 | BRQ-03 | US-03-06 |
| FR-03-015 | The system shall validate `Gtin` barcodes as 8, 12, 13, or 14 digits with a valid GS1 mod-10 check digit (`CATALOG.BARCODE_INVALID_CHECKSUM`), and `Internal` barcodes as 1–32 characters from `[A-Za-z0-9-._]` (`CATALOG.BARCODE_INVALID_FORMAT`). | P0 | BRQ-03 | US-03-06 |
| FR-03-016 | The system shall enforce barcode uniqueness per organization across active and inactive medicines, comparing `Gtin` barcodes in their 14-digit left-zero-padded normalized form, returning 409 `CATALOG.BARCODE_DUPLICATE` that identifies the conflicting medicine's id and code. | P0 | BRQ-03 | US-03-06 |
| FR-03-017 | The system shall resolve a scanned or typed barcode to exactly one medicine by exact match on the normalized value (digits-only inputs of length 8/12/13/14 normalized to 14 digits), returning the medicine with its status, or 404 `CATALOG.BARCODE_NOT_FOUND`. | P0 | BRQ-03, BRQ-07 | US-03-06, US-03-11 |
| FR-03-018 | The system shall require an organization default selling price `PackPrice` (> 0, ≤ 1,000,000.0000, `numeric(19,4)`) at medicine creation, accept an optional explicit `BaseUnitPrice` only when `AllowSplitPack = true`, and otherwise derive the base-unit price as `round(PackPrice / PackSize, 2, AwayFromZero)`. | P0 | BRQ-03, BRQ-07 | US-03-04, US-03-07 |
| FR-03-019 | The system shall let a user with `catalog.prices.update` and organization-wide scope change the organization default price with a mandatory reason (3–200 characters), writing in one transaction the new `MedicinePrice`, an append-only `MedicinePriceHistory` row (old/new pack and base-unit prices, scope, reason, user, timestamp), an audit log entry, and a `MedicinePriceChanged` outbox event. | P0 | BRQ-03, BRQ-12 | US-03-07 |
| FR-03-020 | The system shall reject a price change whose pack price differs from the current price by more than organization setting `PriceChangeConfirmThresholdPercent` (default 20) with 422 `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED` unless the request sets `confirmLargeChange = true`. | P1 | BRQ-03 | US-03-07 |
| FR-03-021 | The system shall return a medicine's price history newest first, paginated, filterable by scope (`Organization` or a `branchId`), restricted to the organization default and to branches the user can access. | P1 | BRQ-03, BRQ-12 | US-03-07, US-03-08 |
| FR-03-022 | When organization setting `AllowBranchPriceOverride` is ON (default ON), the system shall let a user with `catalog.prices.update` assigned to the branch set or remove a branch price override (`PackPrice`, optional `BaseUnitPrice`) with a reason, recording history, audit, and event as in FR-03-019; when OFF it shall reject with 409 `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED`. | P1 | BRQ-03 | US-03-08 |
| FR-03-023 | The system shall resolve the effective selling price for a (medicine, branch) as the branch override when one exists, otherwise the organization default, and apply any price change only to sales completed after the change commits (BR-G-20). | P0 | BRQ-07 | US-03-08, US-03-19 |
| FR-03-024 | The system shall require `PrescriptionClass` ∈ {`OTC`, `PrescriptionOnly`, `Controlled`} on every medicine; a creator without `catalog.medicines.classify` may only create `PrescriptionOnly` medicines (the default when the field is omitted), otherwise 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED`. | P0 | BRQ-09, BRQ-15 | US-03-04, US-03-09 |
| FR-03-025 | The system shall let a user with `catalog.medicines.classify` change an existing medicine's classification through a dedicated endpoint with a mandatory reason (3–200 characters), writing an audit entry with old/new values and a `MedicineClassificationChanged` outbox event in the same transaction; the general update endpoint shall reject a `PrescriptionClass` value different from the stored one with 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT`. | P0 | BRQ-09, BRQ-12 | US-03-09 |
| FR-03-026 | The system shall let a user with `catalog.medicines.deactivate` deactivate a medicine with a reason (requiring `acknowledgeStock = true` when any branch holds `OnHand > 0`, otherwise 409 `CATALOG.MEDICINE_HAS_STOCK`), reactivate it, and hard-delete it only when no batch, document line, prescription item, or dispensing record references it (otherwise 409 `CATALOG.MEDICINE_IN_USE`) (BR-G-33). | P0 | BRQ-03 | US-03-10 |
| FR-03-027 | The system shall provide medicine search over `TradeNameEn`, `TradeNameAr`, `GenericName`, active-ingredient names (en/ar), `Code`, and barcodes, requiring ≥ 2 characters (except exact code/barcode), returning at most `limit` (default 20, max 50) results, Active medicines only unless `includeInactive = true`, and the effective price when an accessible `branchId` is supplied. | P0 | BRQ-03, BRQ-07 | US-03-11 |
| FR-03-028 | The system shall apply the normalization in §13.1 (Arabic alef/yaa/taa-marbuta/hamza folding, tashkeel and tatweel removal, Arabic-Indic digit folding, Latin case folding, whitespace collapsing) identically to stored searchable text and to queries. | P0 | BRQ-03, BRQ-13 | US-03-11 |
| FR-03-029 | The system shall rank search results in the tiers of §13.2 (exact barcode/code → exact trade name → trade-name prefix → generic/ingredient prefix → trigram similarity ≥ 0.30 for queries ≥ 3 characters), with deterministic tie-breaking by similarity descending, `TradeNameEn` ascending, then `Id`. | P0 | BRQ-03 | US-03-11 |
| FR-03-030 | The system shall provide a paginated medicine list filterable by status, category (including all descendant categories), manufacturer, dosage form, prescription class, active ingredient, storage condition, tax category, and has-barcode, sortable by `tradeNameEn`, `tradeNameAr`, `code`, `createdAt`, `updatedAt`. | P0 | BRQ-03 | US-03-02, US-03-12 |
| FR-03-031 | The system shall return medicine details including composition, barcodes, organization default price, branch overrides for branches the user can access, alternatives count, and storage data, and shall include `LastPurchaseCost` and `LastPurchaseCostAt` only when the caller holds `catalog.costs.read` (fields omitted otherwise). | P0 | BRQ-03, BRQ-01 | US-03-12 |
| FR-03-032 | The system shall let a user with `catalog.medicines.update` link and unlink alternative medicines (target must be an Active medicine of the same organization, not itself, not already linked, at most 20 per medicine), creating the reverse link as well when `bidirectional = true` (default). | P1 | BRQ-03 | US-03-13 |
| FR-03-033 | The system shall return equivalence suggestions for a medicine: Active medicines with the same `DosageFormId` and an identical set of (`ActiveIngredientId`, `StrengthValue`, `StrengthUnit`) rows, excluding itself and already-linked alternatives, at most 20, labelled as suggestions for pharmacist review. | P1 | BRQ-03 | US-03-13 |
| FR-03-034 | The system shall provide a downloadable import template in CSV (UTF-8 with BOM) and XLSX formats containing the columns of §8.6 and one example row. | P1 | BRQ-03 | US-03-14 |
| FR-03-035 | The system shall accept an import file (CSV UTF-8 or XLSX first worksheet, ≤ 10 MB, ≤ 20,000 data rows) in dry-run mode, validate every row against §9 without changing data, and produce a report with per-row outcome (`Create`, `Update`, `Unchanged`, `Error`), column, error code, and localized message, plus totals per outcome. | P1 | BRQ-03 | US-03-14 |
| FR-03-036 | The import shall resolve category (path `Level1 > Level2 > Level3`), manufacturer, active ingredient, dosage form, and tax category by normalized name or code, report unresolved values as row errors unless `createMissingReferenceData = true` (which requires `catalog.reference-data.manage`), and reject price columns without `catalog.prices.update`, cost columns without `catalog.costs.read`, and non-`PrescriptionOnly` classification values without `catalog.medicines.classify` with `CATALOG.IMPORT_COLUMN_NOT_PERMITTED`. | P1 | BRQ-03, BRQ-01 | US-03-14, US-03-15 |
| FR-03-037 | The system shall commit an import as a background job (one active import per organization, else 409 `CATALOG.IMPORT_IN_PROGRESS`), upserting by `matchBy` = `barcode` or `code`, in mode `AllOrNothing` (default; no change if any row has an error) or `SkipInvalid`, requiring an `Idempotency-Key`, so that re-importing an identical file yields only `Unchanged` rows and no new history, audit, or event rows; reports are retained 30 days. | P1 | BRQ-03 | US-03-15 |
| FR-03-038 | The system shall export medicines matching the list filters to CSV or XLSX using template-compatible columns, omit cost columns without `catalog.costs.read`, neutralize cells beginning with `=`, `+`, `-`, `@` by prefixing an apostrophe, return the file directly for ≤ 5,000 rows, and run a background job with a 15-minute pre-signed download link for larger exports. | P1 | BRQ-03 | US-03-16 |
| FR-03-039 | The system shall generate, on request, an internal EAN-13 barcode for a medicine composed of organization setting `InternalBarcodePrefix` (2 digits, 20–29), a 10-digit organization sequence, and a mod-10 check digit, stored with `Format = Internal`, `Source = Generated`, and guaranteed unique per organization. | P2 | BRQ-03 | US-03-17 |
| FR-03-040 | The system shall generate a printable PDF of shelf labels for a branch (1–500 medicines, 1–100 copies each, ≤ 2,000 labels) in two templates (38×25 mm and 50×30 mm) showing trade name (en and ar), strength text, dosage form, effective branch pack price, primary barcode (EAN-13 symbology for 13-digit numeric codes, Code 128 otherwise), and print date in the branch time zone. | P2 | BRQ-03, BRQ-13 | US-03-18 |
| FR-03-041 | The catalog shall expose an in-process facade and a REST read endpoint returning, for a (medicine, branch), status, prescription class, `PackSize`, `AllowSplitPack`, base unit names, effective pack and base-unit price, tax category and rate, storage condition, and `DefaultMinStock`, resolvable by medicine id or barcode, always within the caller's organization. | P0 | BRQ-03, BRQ-07 | US-03-19 |
| FR-03-042 | The system shall update `LastPurchaseCost` (per base unit, `numeric(19,4)`) and `LastPurchaseCostAt` on consuming a `GoodsReceiptPosted` event from SPEC-05, only when the receipt's posting time is later than the stored `LastPurchaseCostAt`, processing each event id at most once. | P1 | BRQ-03, BRQ-10 | US-03-19 |
| FR-03-043 | The system shall publish through the transactional outbox the integration events `MedicineCreated`, `MedicineUpdated`, `MedicineStatusChanged`, `MedicinePriceChanged`, and `MedicineClassificationChanged`, each committed in the same transaction as the change. | P1 | BRQ-03 | US-03-19 |
| FR-03-044 | The system shall write an audit log entry, in the same transaction, for: medicine create, `PackSize` change, deactivate/reactivate/delete, barcode add/remove/primary change, price change (organization and branch, including override removal), classification change, tax category create/rate change/deactivate/set-default, and import commit (one entry per job with outcome totals) (BR-G-16). | P0 | BRQ-12 | US-03-03, US-03-06, US-03-07, US-03-08, US-03-09, US-03-10, US-03-15 |
| FR-03-045 | The system shall enforce organization isolation on every catalog endpoint and facade call: a medicine, reference-data item, import job, or price of another organization shall return 404 with the same body as a non-existent resource (CS-08), and a branch-scoped call for a branch outside the user's assignments shall return 403 `COMMON.FORBIDDEN` (CS-07). | P0 | BRQ-01, BRQ-02 | US-03-01, US-03-02, US-03-03, US-03-04, US-03-05, US-03-06, US-03-07, US-03-08, US-03-09, US-03-10, US-03-11, US-03-12, US-03-13, US-03-14, US-03-15, US-03-16, US-03-17, US-03-18, US-03-19 |

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-03-001 | The Medicine catalog is organization-level: one catalog per organization, shared by all its branches. The only branch-specific catalog data is the branch price override; branch reorder settings live in SPEC-04. | BR-G-01, BR-G-02 |
| BR-03-002 | The catalog never stores stock quantities, batch numbers, expiry dates, or actual unit costs; these exist only on `Batch`/`BatchBalance` (SPEC-04). | BR-G-03, BR-G-04 |
| BR-03-003 | A medicine referenced by any batch, document line, prescription item, or dispensing record cannot be hard-deleted; it is deactivated. | BR-G-33 |
| BR-03-004 | A barcode value identifies at most one medicine per organization, including inactive medicines. `Gtin` values are compared in 14-digit normalized form so that `5901234123457` and `05901234123457` are the same barcode. | — |
| BR-03-005 | An `Inactive` medicine cannot be added to a new sale, purchase order, goods receipt, or prescription dispensing. Existing stock of an inactive medicine remains visible and may be adjusted, written off, transferred, counted, or returned to a supplier (SPEC-04/SPEC-05). | BR-G-33 |
| BR-03-006 | `PackSize` is an integer ≥ 1 and cannot change while any batch of the medicine has `OnHand > 0` or `Reserved > 0` in any branch. | §6.3 conventions |
| BR-03-007 | When `AllowSplitPack = true` and no explicit `BaseUnitPrice` is set, the base-unit price is `round(PackPrice / PackSize, 2)` with `MidpointRounding.AwayFromZero`. | BR-G-18 |
| BR-03-008 | Price, tax-rate, and classification changes apply only to transactions completed after the change commits; completed documents keep their snapshots. | BR-G-20, BR-G-11 |
| BR-03-009 | `MedicinePriceHistory` is append-only; rows are never updated or deleted. | BR-G-25 |
| BR-03-010 | Effective selling price for (medicine, branch) = branch override if present, else organization default. Removing an override reverts to the organization default immediately. | — |
| BR-03-011 | The catalog stores `PrescriptionClass` only. Enforcement at sale/dispensing is owned by SPEC-06/SPEC-08. The meaning and assignment of each class for Egyptian practice is pending REG-01 and REG-02. | BR-G-21, BR-G-22 |
| BR-03-012 | A user without `catalog.medicines.classify` cannot create a medicine with class `OTC` or `Controlled` nor change any classification; omitted classification defaults to `PrescriptionOnly`. | — |
| BR-03-013 | Categories form a forest with depth ≤ 3; a category cannot be its own ancestor. | — |
| BR-03-014 | Inactive reference data cannot be newly assigned to a medicine; medicines already referencing it keep the reference and remain valid. | — |
| BR-03-015 | Tax rates are organization configuration, not product-defined values; the seeded `DEFAULT` 0.00% category is a placeholder that the organization must confirm with its tax advisor (REG-06). | — |
| BR-03-016 | `LastPurchaseCost` is informational only; it is never used for COGS, gross profit, or inventory valuation, which use `Batch.UnitCost` (SPEC-04, SPEC-09). | §2 money terms |
| BR-03-017 | Alternatives and equivalence suggestions are decision support for a pharmacist; the system makes no claim of therapeutic equivalence or interchangeability. | §8.3 conventions |
| BR-03-018 | Import never creates batches, stock, or opening balances; opening stock is recorded through SPEC-04 (`OpeningBalance` movements). | BR-G-05 |
| BR-03-019 | An import row matches at most one existing medicine via the selected key; a row whose barcodes resolve to two or more different medicines is an error. | — |
| BR-03-020 | Generated internal barcodes use a GS1 restricted-circulation prefix (20–29) and are never stored with `Format = Gtin`. | — |
| BR-03-021 | `LastPurchaseCost` is visible only to holders of `catalog.costs.read`, in API responses, exports, and import reports. | BRQ-01 |
| BR-03-022 | No external drug database or national catalog is integrated in v1; any external catalog source requires licensing approval (REG-09). | — |
| BR-03-023 | Sensitive catalog operations (FR-03-044) are audited in the same transaction as the change. | BR-G-16 |
| BR-03-024 | Authorization is enforced on the backend for every request; cross-organization access returns 404 and out-of-assignment branch access returns 403. | BR-G-17 |

## 8. Data Requirements

### 8.1 Design decision: Medicine (catalog) and Batch (inventory) are separate

| Concern | Medicine (SPEC-03) | Batch (SPEC-04) |
|---|---|---|
| Identity | What the product is (names, composition, form, pack) | A physical received quantity: batch number + expiry date |
| Scope | Organization-level (one row per medicine per organization) | Branch-level (BR-G-02, BR-G-04) |
| Cardinality | ~50,000 rows max per organization | Many per medicine per branch (~500,000 per organization, NFR-G-01) |
| Mutability | Master data, edited over time with history | Identity fields (batch number, expiry, unit cost) fixed at receipt; quantities changed only through the append-only movement ledger (BR-G-05) |
| Cost | `LastPurchaseCost` (reference only) | `UnitCost` (actual cost used for COGS and valuation) |
| Status drivers | Commercial decision (`Active`/`Inactive`) | Expiry, recall/quarantine, depletion |

Reasons for the separation:
1. **Different lifecycles and owners:** a medicine is defined once by the organization; batches are created by every goods receipt in every branch and are governed by FEFO, expiry blocking, and quarantine (BR-G-06, BR-G-07), none of which apply to the catalog definition.
2. **Accurate costing:** the same medicine is bought at different costs over time; only batch-level cost yields correct COGS and inventory valuation (BRQ-10).
3. **Traceability and recalls:** recalls and regulatory traceability (REG-03) target batch numbers, not the medicine definition.
4. **Performance:** POS search runs against ~50,000 catalog rows with denormalized normalized search text, without scanning ~500,000 batches (NFR-G-01). Stock is joined only for the returned page by SPEC-04/SPEC-06.
5. **Module boundaries (ADR-001):** Inventory depends on Catalog, never the reverse. Where the catalog needs a stock fact (PackSize lock BR-03-006, deactivation warning FR-03-026), it calls an `IMedicineStockProbe` interface declared in Catalog contracts and implemented by Inventory (dependency inversion), so no compile-time cycle exists. Until SPEC-04 is delivered the probe implementation returns "no stock".

### 8.2 Entities (schema `catalog`)

All tables follow §6 conventions (UUIDv7 `Id`, `OrganizationId`, audit columns, `RowVersion` on mutable aggregates).

**Medicine**

| Field | Type | Constraints |
|---|---|---|
| Code | varchar(20) | Required; unique (OrganizationId, Code); generated `MED-NNNNNN` if omitted |
| TradeNameEn | varchar(200) | Required |
| TradeNameAr | varchar(200) | Optional (OD-03-01) |
| GenericName | varchar(300) | Optional |
| CategoryId | uuid FK MedicineCategory | Required |
| ManufacturerId | uuid FK Manufacturer | Optional |
| DosageFormId | uuid FK DosageForm | Required |
| StrengthText | varchar(100) | Optional; composed from ingredients when empty (FR-03-013) |
| PackSize | int | Required; 1–10,000 |
| BaseUnitNameEn / BaseUnitNameAr | varchar(30) | En required; Ar optional |
| AllowSplitPack | bool | Required; default false |
| PackDescription | varchar(100) | Optional (e.g., "3 strips × 10 tablets") |
| DescriptionEn / DescriptionAr | varchar(2000) | Optional |
| PrescriptionClass | enum | `OTC`, `PrescriptionOnly`, `Controlled`; default `PrescriptionOnly` |
| TaxCategoryId | uuid FK TaxCategory | Required; defaults to `DefaultTaxCategoryId` |
| DefaultMinStock | int | Optional; 0–1,000,000 base units |
| StorageCondition | enum | `RoomTemperature` (default), `Refrigerated2To8C`, `Frozen` |
| ProtectFromLight | bool | Default false |
| StorageInstructionsEn / Ar | varchar(500) | Optional |
| LastPurchaseCost | numeric(19,4) | Optional; per base unit; set at create/import or by FR-03-042 |
| LastPurchaseCostAt | timestamptz | Optional |
| Status | enum | `Active`, `Inactive` |
| DeactivatedAt / DeactivatedBy / DeactivationReason | timestamptz / uuid / varchar(200) | Set on deactivation, cleared on reactivation |
| SearchText | text | Internal; normalized concatenation (§13.1); GIN trigram index |

**MedicineIngredient** — MedicineId, ActiveIngredientId, StrengthValue `numeric(12,4)` > 0, StrengthUnit (enum §8.4), SortOrder int; unique (MedicineId, ActiveIngredientId); max 10 per medicine.

**MedicineBarcode** — MedicineId, Code varchar(32) (as entered), NormalizedCode varchar(32) (14-digit left-zero-padded for `Gtin` and for digits-only `Internal` codes of length 8/12/13/14; trimmed upper-case for other `Internal` codes), Format (`Gtin`, `Internal`), Source (`Manual`, `Import`, `Generated`), IsPrimary bool, CreatedAt/By. Unique (OrganizationId, NormalizedCode); partial unique (MedicineId) where IsPrimary.

**MedicineCategory** — ParentId (nullable self FK), NameEn varchar(100), NameAr varchar(100), Level smallint 1–3, SortOrder, IsActive. Unique (OrganizationId, ParentId, normalized NameEn) and (…, normalized NameAr).

**Manufacturer** — NameEn varchar(150), NameAr varchar(150), CountryCode char(2), IsActive.

**ActiveIngredient** — NameEn varchar(200), NameAr varchar(200), IsActive.

**DosageForm** — Code varchar(30), NameEn varchar(100), NameAr varchar(100), IsActive, IsSeeded.

**TaxCategory** — Code varchar(20), NameEn, NameAr varchar(100), RatePercent numeric(5,2) 0–100, RequiresReview bool, IsActive.

**MedicinePrice** (organization default; 1:1 with Medicine) — PackPrice numeric(19,4), BaseUnitPrice numeric(19,4) nullable, UpdatedAt/By, RowVersion.

**BranchMedicinePrice** (override) — MedicineId, BranchId, PackPrice numeric(19,4), BaseUnitPrice numeric(19,4) nullable; unique (MedicineId, BranchId).

**MedicinePriceHistory** (**new entity**, append-only) — MedicineId, BranchId (null = organization default), ChangeType (`Initial`, `Change`, `OverrideSet`, `OverrideRemoved`, `Import`), OldPackPrice, NewPackPrice, OldBaseUnitPrice, NewBaseUnitPrice, Reason varchar(200), ImportJobId nullable, ChangedAt, ChangedBy.

**MedicineAlternative** — MedicineId, AlternativeMedicineId, CreatedAt/By, Note varchar(200); unique (MedicineId, AlternativeMedicineId); check MedicineId ≠ AlternativeMedicineId.

**CatalogImportJob** (**new entity**) — FileObjectId (source), ReportFileObjectId, Format (`Csv`, `Xlsx`), DryRun bool, MatchBy (`Barcode`, `Code`), Mode (`AllOrNothing`, `SkipInvalid`), CreateMissingReferenceData bool, ConfirmLargePriceChanges bool, Status (`Queued`, `Running`, `Completed`, `CompletedWithErrors`, `Failed`), TotalRows, CreatedCount, UpdatedCount, UnchangedCount, ErrorCount, FileSha256, IdempotencyKey, StartedAt, FinishedAt, ReportExpiresAt (FinishedAt + 30 days).

Sequences: `MED-NNNNNN` codes and internal barcode sequence numbers use the organization's `DocumentSequence` with document types `MedicineCode` and `InternalBarcode` (organization scope, no branch, no yearly reset).

### 8.3 Organization settings introduced (in `OrganizationSettings`)

| Setting | Type | Default | Range |
|---|---|---|---|
| `AllowBranchPriceOverride` | bool | true | — |
| `PriceChangeConfirmThresholdPercent` | int | 20 | 1–1000 |
| `DefaultTaxCategoryId` | uuid | seeded `DEFAULT` | active tax category |
| `InternalBarcodePrefix` | char(2) | `20` | `20`–`29` |

### 8.4 Controlled lists

- **StrengthUnit:** `mg`, `g`, `mcg`, `IU`, `mL`, `%`, `mg/mL`, `mg/5mL`, `mcg/mL`, `IU/mL`, `mg/g`, `mcg/dose`, `mg/dose`.
- **Seeded dosage forms (code — en):** `TABLET` Tablet, `FILM_COATED_TABLET` Film-coated tablet, `EFFERVESCENT_TABLET` Effervescent tablet, `CAPSULE` Capsule, `SYRUP` Syrup, `SUSPENSION` Suspension, `SOLUTION` Oral solution, `DROPS` Drops, `INJECTION` Injection, `CREAM` Cream, `OINTMENT` Ointment, `GEL` Gel, `SUPPOSITORY` Suppository, `INHALER` Inhaler, `SPRAY` Spray, `SACHET` Sachet, `LOZENGE` Lozenge, `PATCH` Patch, `OTHER` Other. Arabic names are provided in seed data reviewed by a pharmacist (A-candidate).

### 8.5 Example: create medicine request

```json
{
  "tradeNameEn": "Panadol Extra",
  "tradeNameAr": "بنادول اكسترا",
  "genericName": "Paracetamol + Caffeine",
  "categoryId": "0192f0a4-...",
  "manufacturerId": "0192f0a4-...",
  "dosageFormId": "0192f0a4-...",
  "ingredients": [
    { "activeIngredientId": "0192f0a4-...", "strengthValue": 500, "strengthUnit": "mg", "sortOrder": 1 },
    { "activeIngredientId": "0192f0a4-...", "strengthValue": 65, "strengthUnit": "mg", "sortOrder": 2 }
  ],
  "packSize": 24,
  "baseUnitNameEn": "tablet",
  "baseUnitNameAr": "قرص",
  "allowSplitPack": true,
  "prescriptionClass": "OTC",
  "taxCategoryId": null,
  "storageCondition": "RoomTemperature",
  "defaultMinStock": 48,
  "barcodes": [ { "code": "6221234567890", "format": "Gtin" } ],
  "price": { "packPrice": 72.0000, "baseUnitPrice": null }
}
```

### 8.6 Import/export columns (stable English keys; header order free; unknown columns are a file error)

`code`, `tradeNameEn`*, `tradeNameAr`, `genericName`, `category`* (path `A > B > C`), `manufacturer`, `dosageForm`* (code or name), `strengthText`, `ingredients` (`Name:Value:Unit;Name:Value:Unit`), `packSize`*, `baseUnitNameEn`*, `baseUnitNameAr`, `allowSplitPack` (`TRUE`/`FALSE`), `prescriptionClass`, `taxCategory` (code), `storageCondition`, `protectFromLight`, `storageInstructionsEn`, `storageInstructionsAr`, `defaultMinStock`, `barcodes` (`;`-separated; digits-only of length 8/12/13/14 treated as `Gtin`; prefix `INT:` forces `Internal`), `sellingPrice`* (pack), `baseUnitPrice`, `lastPurchaseCost` (applied on create only), `descriptionEn`, `descriptionAr`, `status` (`Active`/`Inactive`). `*` = required on create. On update, an empty cell leaves the field unchanged; non-empty `barcodes` are added (existing barcodes are never removed by import); non-empty `ingredients` replace the composition.

## 9. Validation Rules

Field-level failures return 400 `COMMON.VALIDATION_FAILED` with per-field codes in `errors`; business-rule failures return the status and top-level code shown.

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-03-001 | Medicine.TradeNameEn | Required after trim; 1–200 characters | `COMMON.REQUIRED`, `COMMON.MAX_LENGTH` |
| VR-03-002 | Medicine.TradeNameAr, GenericName | ≤ 200 / ≤ 300 characters | `COMMON.MAX_LENGTH` |
| VR-03-003 | Medicine.Code | 1–20 characters `[A-Z0-9-]` (input upper-cased); unique per organization | `CATALOG.CODE_INVALID`, 409 `CATALOG.CODE_DUPLICATE` |
| VR-03-004 | CategoryId, ManufacturerId, DosageFormId, TaxCategoryId | Must exist in caller's organization and be active | `CATALOG.REFERENCE_DATA_NOT_FOUND`, `CATALOG.REFERENCE_DATA_INACTIVE` |
| VR-03-005 | Medicine.PackSize | Integer 1–10,000 | `COMMON.OUT_OF_RANGE` |
| VR-03-006 | Medicine.BaseUnitNameEn / Ar | En required 1–30; Ar ≤ 30 | `COMMON.REQUIRED`, `COMMON.MAX_LENGTH` |
| VR-03-007 | Medicine.PrescriptionClass, StorageCondition | Member of enum | `COMMON.INVALID_ENUM` |
| VR-03-008 | Medicine.DefaultMinStock | Null or integer 0–1,000,000 | `COMMON.OUT_OF_RANGE` |
| VR-03-009 | Description / StorageInstructions / PackDescription | ≤ 2000 / ≤ 500 / ≤ 100 characters | `COMMON.MAX_LENGTH` |
| VR-03-010 | Ingredients | ≤ 10 rows; no duplicate `ActiveIngredientId` | `CATALOG.INGREDIENT_LIMIT_EXCEEDED`, `CATALOG.INGREDIENT_DUPLICATE` |
| VR-03-011 | Ingredient.StrengthValue / StrengthUnit | > 0 and ≤ 999,999.9999, ≤ 4 decimals; unit in §8.4 | `COMMON.OUT_OF_RANGE`, `COMMON.INVALID_ENUM` |
| VR-03-012 | Barcode (Internal) | 1–32 characters `[A-Za-z0-9-._]` | `CATALOG.BARCODE_INVALID_FORMAT` |
| VR-03-013 | Barcode (Gtin) | Digits only, length 8/12/13/14; valid mod-10 check digit | `CATALOG.BARCODE_INVALID_FORMAT`, `CATALOG.BARCODE_INVALID_CHECKSUM` |
| VR-03-014 | Barcodes per medicine | ≤ 10 | `CATALOG.BARCODE_LIMIT_EXCEEDED` |
| VR-03-015 | Barcode uniqueness | Normalized code unused in organization | 409 `CATALOG.BARCODE_DUPLICATE` |
| VR-03-016 | Price.PackPrice | > 0, ≤ 1,000,000.0000, ≤ 4 decimals | `CATALOG.PRICE_INVALID` |
| VR-03-017 | Price.BaseUnitPrice | Null, or > 0 and ≤ PackPrice, only when `AllowSplitPack = true` | `CATALOG.PRICE_INVALID` |
| VR-03-018 | Reason (price, classification, deactivation) | Required, 3–200 characters | `COMMON.REQUIRED`, `COMMON.MAX_LENGTH` |
| VR-03-019 | Category | Name En 1–100, Ar ≤ 100; unique among siblings; depth ≤ 3; no cycle | 409 `CATALOG.NAME_DUPLICATE`, 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED`, 422 `CATALOG.CATEGORY_CYCLE` |
| VR-03-020 | Manufacturer | NameEn 1–150 unique (normalized); CountryCode ISO 3166-1 alpha-2 | 409 `CATALOG.NAME_DUPLICATE`, `CATALOG.COUNTRY_CODE_INVALID` |
| VR-03-021 | ActiveIngredient | NameEn 1–200 unique (normalized); NameAr ≤ 200 | 409 `CATALOG.NAME_DUPLICATE` |
| VR-03-022 | DosageForm | Code `[A-Z_]{2,30}` unique; NameEn 1–100 | `CATALOG.CODE_INVALID`, 409 `CATALOG.CODE_DUPLICATE` |
| VR-03-023 | TaxCategory | Code `[A-Z0-9_]{2,20}` unique; RatePercent 0.00–100.00, ≤ 2 decimals | `CATALOG.CODE_INVALID`, `COMMON.OUT_OF_RANGE` |
| VR-03-024 | Search `q` / `limit` | `q` 1–100 characters; non-exact queries ≥ 2 normalized characters; `limit` 1–50 | `CATALOG.SEARCH_QUERY_TOO_SHORT`, `COMMON.OUT_OF_RANGE` |
| VR-03-025 | Alternative | Target ≠ source; target Active; not already linked; ≤ 20 per medicine | 422 `CATALOG.ALTERNATIVE_SELF_REFERENCE`, 422 `CATALOG.MEDICINE_INACTIVE`, 409 `CATALOG.ALTERNATIVE_DUPLICATE`, 422 `CATALOG.ALTERNATIVE_LIMIT_EXCEEDED` |
| VR-03-026 | Import file | `.csv` (UTF-8) or `.xlsx`; ≤ 10 MB; ≤ 20,000 data rows; required header columns present; no unknown columns | 400 `CATALOG.IMPORT_FILE_INVALID`, 413 `CATALOG.IMPORT_FILE_TOO_LARGE`, 422 `CATALOG.IMPORT_TOO_MANY_ROWS` |
| VR-03-027 | Import row | Key unique within file; matches ≤ 1 medicine; permission-gated columns allowed | `CATALOG.IMPORT_DUPLICATE_KEY_IN_FILE`, `CATALOG.IMPORT_AMBIGUOUS_MATCH`, `CATALOG.IMPORT_COLUMN_NOT_PERMITTED` |
| VR-03-028 | Shelf-label request | 1–500 distinct active medicines; copies 1–100 each; total ≤ 2,000 | 422 `CATALOG.LABEL_LIMIT_EXCEEDED`, 422 `CATALOG.MEDICINE_INACTIVE` |
| VR-03-029 | Settings | `PriceChangeConfirmThresholdPercent` 1–1000; `InternalBarcodePrefix` `20`–`29` | `COMMON.OUT_OF_RANGE` |

## 10. API Requirements

Base path `/api/v1`. Organization from token. Updates of `Medicine`, reference data, and prices require `If-Match`.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| GET | `/catalog/medicines` | Paginated list with filters (FR-03-030) | `catalog.medicines.read` | N/A |
| GET | `/catalog/medicines/search?q=&branchId=&limit=&includeInactive=` | Ranked search (FR-03-027–029) | `catalog.medicines.read` (+ branch access if `branchId`) | N/A |
| GET | `/catalog/medicines/by-barcode/{code}` | Barcode lookup | `catalog.medicines.read` | N/A |
| GET | `/catalog/medicines/{id}` | Details | `catalog.medicines.read` | N/A |
| POST | `/catalog/medicines` | Create | `catalog.medicines.create` (+ `catalog.medicines.classify` if class ≠ `PrescriptionOnly`) | Not required |
| PUT | `/catalog/medicines/{id}` | Update attributes (If-Match) | `catalog.medicines.update` | Not required |
| PUT | `/catalog/medicines/{id}/ingredients` | Replace composition (If-Match) | `catalog.medicines.update` | Not required |
| POST | `/catalog/medicines/{id}/barcodes` | Add barcode | `catalog.medicines.update` | Not required |
| DELETE | `/catalog/medicines/{id}/barcodes/{barcodeId}` | Remove barcode | `catalog.medicines.update` | N/A |
| PUT | `/catalog/medicines/{id}/barcodes/{barcodeId}/primary` | Set primary | `catalog.medicines.update` | N/A |
| POST | `/catalog/medicines/{id}/barcodes/generate` | Generate internal EAN-13 (P2) | `catalog.medicines.update` | Not required |
| PUT | `/catalog/medicines/{id}/classification` | Change classification with reason | `catalog.medicines.classify` | Not required |
| PUT | `/catalog/medicines/{id}/price` | Change organization default price (If-Match) | `catalog.prices.update` + organization-wide scope | Not required |
| GET | `/catalog/medicines/{id}/price-history` | Price history | `catalog.medicines.read` | N/A |
| PUT | `/branches/{branchId}/catalog/medicines/{id}/price` | Set branch override | `catalog.prices.update` + branch access | Not required |
| DELETE | `/branches/{branchId}/catalog/medicines/{id}/price` | Remove branch override (reason in body) | `catalog.prices.update` + branch access | N/A |
| GET | `/branches/{branchId}/catalog/medicines/{id}/effective` | Effective sale info (FR-03-041) | `catalog.medicines.read` + branch access | N/A |
| GET | `/branches/{branchId}/catalog/medicines/by-barcode/{code}/effective` | Effective sale info by barcode | `catalog.medicines.read` + branch access | N/A |
| POST | `/catalog/medicines/{id}/deactivate` | Deactivate | `catalog.medicines.deactivate` | Not required |
| POST | `/catalog/medicines/{id}/reactivate` | Reactivate | `catalog.medicines.deactivate` | Not required |
| DELETE | `/catalog/medicines/{id}` | Hard delete if unreferenced | `catalog.medicines.deactivate` | N/A |
| GET | `/catalog/medicines/{id}/alternatives` | List alternatives (optional `branchId` for prices) | `catalog.medicines.read` | N/A |
| POST | `/catalog/medicines/{id}/alternatives` | Link alternative | `catalog.medicines.update` | Not required |
| DELETE | `/catalog/medicines/{id}/alternatives/{alternativeId}?bidirectional=` | Unlink | `catalog.medicines.update` | N/A |
| GET | `/catalog/medicines/{id}/alternative-suggestions` | Equivalence suggestions | `catalog.medicines.read` | N/A |
| GET/POST | `/catalog/categories`, `/catalog/categories/tree` | List / tree / create | read: `catalog.medicines.read`; write: `catalog.reference-data.manage` | Not required |
| PUT/DELETE | `/catalog/categories/{id}` | Update (incl. move) / delete if unreferenced | `catalog.reference-data.manage` | N/A |
| POST | `/catalog/{refType}/{id}/deactivate`, `/catalog/{refType}/{id}/reactivate` | `refType` ∈ `categories`, `manufacturers`, `active-ingredients`, `dosage-forms` | `catalog.reference-data.manage` | Not required |
| GET/POST/PUT/DELETE | `/catalog/manufacturers[/{id}]` | Manufacturer CRUD | read: `catalog.medicines.read`; write: `catalog.reference-data.manage` | Not required |
| GET/POST/PUT/DELETE | `/catalog/active-ingredients[/{id}]` | Active ingredient CRUD | read: `catalog.medicines.read`; write: `catalog.reference-data.manage` | Not required |
| GET/POST/PUT/DELETE | `/catalog/dosage-forms[/{id}]` | Dosage form CRUD | read: `catalog.medicines.read`; write: `catalog.reference-data.manage` | Not required |
| GET | `/catalog/tax-categories` | List tax categories | `catalog.medicines.read` | N/A |
| POST/PUT | `/catalog/tax-categories[/{id}]` | Create / update (incl. rate) | `settings.organization.manage` | Not required |
| POST | `/catalog/tax-categories/{id}/deactivate` | Deactivate | `settings.organization.manage` | Not required |
| POST | `/catalog/tax-categories/{id}/set-default` | Set `DefaultTaxCategoryId` | `settings.organization.manage` | Not required |
| GET | `/catalog/imports/template?format=csv\|xlsx` | Template download | `catalog.medicines.import` | N/A |
| POST | `/catalog/imports` (multipart: file, dryRun, matchBy, mode, createMissingReferenceData, confirmLargePriceChanges) | Start dry run or commit → 202 + job | `catalog.medicines.import` | **Required when `dryRun = false`** |
| GET | `/catalog/imports/{jobId}` | Job status and totals | `catalog.medicines.import` | N/A |
| GET | `/catalog/imports/{jobId}/report?format=csv\|xlsx` | Validation/outcome report | `catalog.medicines.import` | N/A |
| GET | `/catalog/medicines/export?format=csv\|xlsx&<filters>` | Export (direct ≤ 5,000 rows, else 202 + job) | `catalog.medicines.export` | N/A |
| GET | `/catalog/exports/{jobId}` | Export job status and pre-signed link | `catalog.medicines.export` | N/A |
| POST | `/branches/{branchId}/catalog/shelf-labels` | Shelf-label PDF (P2) | `catalog.medicines.read` + branch access | N/A |

Catalog-specific idempotency: import commit is added to the `Idempotency-Key` required list; same key + same request hash replays the original 202 response and job id; same key + different hash → 422 `COMMON.IDEMPOTENCY_KEY_REUSED`.

## 11. Authorization Requirements

1. Every endpoint requires an authenticated user (NFR-G-07) and the permission listed in §10.
2. All queries are filtered by the token's `OrganizationId` (EF Core global filter + RLS, ADR-002). Any id belonging to another organization yields 404 with the same body as a non-existent id (CS-08), including ids supplied inside request bodies (category, manufacturer, alternative target), which yield `CATALOG.REFERENCE_DATA_NOT_FOUND` / `CATALOG.MEDICINE_NOT_FOUND`.
3. Branch-scoped endpoints validate `branchId` against the user's assignments or organization-wide scope → 403 `COMMON.FORBIDDEN` otherwise (CS-07). `branchId` query parameters on organization-level endpoints (search, alternatives) follow the same rule.
4. Changing the organization default price requires `catalog.prices.update` **and** organization-wide scope (Owner by default); branch-scoped users with `catalog.prices.update` may only manage overrides for assigned branches.
5. Price history and detail responses include branch overrides only for branches the user can access.
6. `LastPurchaseCost` is returned only to holders of `catalog.costs.read` (BR-03-021).
7. Classification: BR-03-012.
8. `PLATFORM_ADMIN` has no catalog access without an active support grant (SPEC-02).

## 12. Error Handling

All errors use RFC 9457 Problem Details with `code`, `traceId`, localized `message` (ar/en), and `errors` for field failures.

| HTTP | Code | When |
|---|---|---|
| 400 | `COMMON.VALIDATION_FAILED` | One or more field rules in §9 failed |
| 400 | `COMMON.IDEMPOTENCY_KEY_REQUIRED` | Import commit without `Idempotency-Key` |
| 400 | `CATALOG.IMPORT_FILE_INVALID` | Unreadable file, wrong type/encoding, missing required or unknown columns |
| 403 | `COMMON.FORBIDDEN` | Missing permission or branch outside assignments |
| 403 | `CATALOG.CLASSIFY_PERMISSION_REQUIRED` | Non-`PrescriptionOnly` class at create without `catalog.medicines.classify` |
| 404 | `CATALOG.MEDICINE_NOT_FOUND` | Unknown or other-organization medicine |
| 404 | `CATALOG.BARCODE_NOT_FOUND` | Barcode lookup without match |
| 404 | `CATALOG.REFERENCE_DATA_NOT_FOUND` | Unknown or other-organization reference item (path) |
| 404 | `CATALOG.IMPORT_JOB_NOT_FOUND` | Unknown/other-organization job or expired report |
| 409 | `CATALOG.BARCODE_DUPLICATE`, `CATALOG.CODE_DUPLICATE`, `CATALOG.NAME_DUPLICATE` | Uniqueness violations |
| 409 | `CATALOG.POSSIBLE_DUPLICATE` | FR-03-012 without `confirmDuplicate` |
| 409 | `CATALOG.PACK_SIZE_CHANGE_BLOCKED` | BR-03-006 |
| 409 | `CATALOG.MEDICINE_HAS_STOCK` | Deactivation without `acknowledgeStock` while stock exists |
| 409 | `CATALOG.MEDICINE_IN_USE` | Hard delete of referenced medicine |
| 409 | `CATALOG.REFERENCE_DATA_IN_USE` | Delete of referenced reference data |
| 409 | `CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN` | Deactivating a category with active children |
| 409 | `CATALOG.TAX_CATEGORY_IS_DEFAULT` | Deactivating the default tax category |
| 409 | `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED` | Override while setting OFF |
| 409 | `CATALOG.ALTERNATIVE_DUPLICATE` | Link already exists |
| 409 | `CATALOG.IMPORT_IN_PROGRESS` | Another import job `Queued`/`Running` |
| 409 | `CATALOG.BARCODE_SEQUENCE_EXHAUSTED` | Internal sequence reached 9,999,999,999 |
| 412 | `COMMON.CONCURRENCY_CONFLICT` | `If-Match` mismatch |
| 413 | `CATALOG.IMPORT_FILE_TOO_LARGE` | File > 10 MB |
| 422 | `CATALOG.REFERENCE_DATA_INACTIVE`, `CATALOG.CATEGORY_DEPTH_EXCEEDED`, `CATALOG.CATEGORY_CYCLE`, `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED`, `CATALOG.USE_CLASSIFICATION_ENDPOINT`, `CATALOG.MEDICINE_INACTIVE`, `CATALOG.ALTERNATIVE_SELF_REFERENCE`, `CATALOG.ALTERNATIVE_LIMIT_EXCEEDED`, `CATALOG.IMPORT_TOO_MANY_ROWS`, `CATALOG.IMPORT_HAS_ERRORS`, `CATALOG.LABEL_LIMIT_EXCEEDED`, `CATALOG.SEARCH_QUERY_TOO_SHORT`, `COMMON.IDEMPOTENCY_KEY_REUSED` | Business-rule violations |
| 428 | `COMMON.PRECONDITION_REQUIRED` | Update without `If-Match` |

`CATALOG.IMPORT_HAS_ERRORS` is recorded as the job's failure reason (status `Failed`) for an `AllOrNothing` commit with ≥ 1 row error; it is returned by `GET /catalog/imports/{jobId}`.

## 13. Edge Cases

### 13.1 Normalization (search text, name uniqueness, import matching)
1. Remove Arabic tashkeel U+064B–U+065F and U+0670; remove tatweel U+0640.
2. Fold `أ` `إ` `آ` `ٱ` → `ا`; `ى` → `ي`; `ة` → `ه`; `ؤ` → `و`; `ئ` → `ي`.
3. Fold Arabic-Indic `٠–٩` and Extended Arabic-Indic `۰–۹` digits → `0–9`.
4. Latin: Unicode case folding to lower case; strip diacritics (NFKD then remove combining marks).
5. Replace punctuation other than `%`, `/`, `.` with a space; collapse runs of whitespace; trim.

### 13.2 Search ranking tiers
1. Exact normalized barcode or code match. 2. Exact normalized trade name (en or ar). 3. Trade name starts with query, then any trade-name word starts with query. 4. Generic name or ingredient name (en/ar) prefix. 5. Trigram similarity ≥ 0.30 on trade/generic names (queries ≥ 3 normalized characters). Medicines appear once, at their highest tier.

### 13.3 Other edge cases
- A 12-digit UPC-A and its 13-digit EAN form (leading `0`) are the same barcode (BR-03-004).
- A 13-digit numeric legacy code with an invalid check digit must be entered as `Internal` (`INT:` prefix in import).
- Two users add the same barcode to different medicines concurrently: the unique index guarantees exactly one succeeds; the other receives 409 `CATALOG.BARCODE_DUPLICATE`.
- Removing the only barcode leaves the medicine without barcodes; it remains sellable via search.
- `AllowSplitPack` changed from true to false: any explicit `BaseUnitPrice` on organization and branch prices is cleared and recorded in price history with reason "Split pack disabled".
- `PackSize` change while stock is 0 in all branches: allowed; derived base-unit prices recalculate; explicit `BaseUnitPrice` values are kept.
- Branch override equal to the organization default is allowed (it pins the branch price against future organization changes).
- Hard delete of an unreferenced medicine removes its catalog-owned rows (barcodes, ingredients, prices, price history, alternative links in both directions) in one transaction; the audit log entry (with a JSON snapshot of the deleted medicine) is the only remaining record.
- Deactivating a medicine linked as an alternative: links remain but inactive alternatives are excluded from POS alternative lists.
- Category move that would make a grandchild level 4: rejected with `CATALOG.CATEGORY_DEPTH_EXCEEDED`.
- Import file with BOM, CRLF, or `;` delimiter: BOM and CRLF accepted; delimiter must be `,` (otherwise `CATALOG.IMPORT_FILE_INVALID`).
- Import of a row that matches an `Inactive` medicine with `status` empty: the medicine is updated and stays `Inactive`.
- Tax category rate changed during an open POS cart: the cart re-prices at completion (SPEC-06 re-reads effective data at completion).
- `GoodsReceiptPosted` events arriving out of order: older events do not overwrite a newer `LastPurchaseCost` (FR-03-042).

## 14. Acceptance Criteria

| ID | Spec-level acceptance criterion |
|---|---|
| SAC-03-01 | A medicine can be created with bilingual names, composition, pack data, classification, tax category, storage data, barcodes, and price, and is immediately findable by search and barcode. |
| SAC-03-02 | No two medicines in one organization share a barcode (including UPC-A/EAN-13 equivalents), and invalid GTIN check digits are rejected. |
| SAC-03-03 | Arabic queries match regardless of alef/yaa/taa-marbuta/hamza variants and diacritics; search meets NFR-03-001 at 50,000 medicines. |
| SAC-03-04 | Every price change is attributable (user, time, reason) in an append-only history and audit log, and never alters completed sales. |
| SAC-03-05 | Branch overrides affect only their branch; the effective price API returns the override when present. |
| SAC-03-06 | Only holders of `catalog.medicines.classify` can create non-`PrescriptionOnly` medicines or change classification; every change is audited. |
| SAC-03-07 | Referenced medicines can only be deactivated; inactive medicines are excluded from default search and flagged to POS. |
| SAC-03-08 | Import dry run reports every invalid row without changing data; a committed import re-run with the same file changes nothing. |
| SAC-03-09 | Cost data is invisible to users without `catalog.costs.read` across detail, export, and import report. |
| SAC-03-10 | Every catalog endpoint returns 404 for other-organization resources and 403 for unassigned branches. |

## 15. Dependencies

| Depends on | For |
|---|---|
| SPEC-01 Identity & Access | Authentication, permissions, role seeding of the two new permissions |
| SPEC-02 Organization & Branches | Organization/branch existence, `OrganizationSettings`, `DocumentSequence`, branch time zone |
| SPEC-04 Batch & Inventory | `IMedicineStockProbe` implementation (stock checks for PackSize lock and deactivation); consumes catalog facade and `DefaultMinStock` |
| SPEC-05 Procurement | `GoodsReceiptPosted` event (LastPurchaseCost); consumes catalog facade |
| SPEC-06 Sales & POS | Consumes search, barcode lookup, effective sale info, alternatives; enforces BR-03-005 and classification (BR-G-21/22) |
| SPEC-08 Prescriptions | Consumes medicine lookup and classification |
| SPEC-09 Reporting | Consumes catalog dimensions (category, manufacturer) |
| SPEC-10 Notifications, Audit & Settings | `AuditLog`, `FileObject`, `BackgroundJobRun`, outbox, notification when a background import/export completes |

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-03-001 | Search (`/catalog/medicines/search`) p95 ≤ 300 ms and p99 ≤ 600 ms server time with 50,000 medicines, 100,000 barcodes, and 20 concurrent search requests per branch (NFR-G-01). |
| NFR-03-002 | Barcode lookup p95 ≤ 100 ms server time at 100,000 barcodes per organization. |
| NFR-03-003 | List, detail, price-history, and effective-info endpoints p95 ≤ 500 ms (NFR-G-03). |
| NFR-03-004 | Catalog writes are visible to search and lookup immediately after the write transaction commits (no asynchronous index; 0 s lag). |
| NFR-03-005 | Import dry run of 20,000 rows completes in ≤ 60 s and commit in ≤ 180 s; job progress is updated at least every 1,000 rows. |
| NFR-03-006 | Export of 50,000 medicines completes in ≤ 60 s. |
| NFR-03-007 | Shelf-label PDF of 2,000 labels is generated in ≤ 15 s; barcodes print at a module width that the target label template allows, verified by scanning 20 printed samples with a standard 1D scanner (100% read rate). |
| NFR-03-008 | All catalog UI screens available in Arabic (RTL) and English (LTR); every user-facing error code has `ar` and `en` messages (NFR-G-08 accessibility applies to the POS search component). |
| NFR-03-009 | Medicine search component is fully operable by keyboard (type, arrow keys, Enter) and accepts barcode-scanner keyboard-wedge input terminated by Enter. |

## 17. Security and Privacy Considerations

- Catalog contains no patient data. Cost data is commercially sensitive and gated by `catalog.costs.read`.
- Import files are uploaded to private object storage (ADR-006), scanned for size/type before parsing, parsed with formula evaluation disabled; XLSX external links and macros are ignored.
- Export neutralizes spreadsheet formula injection (FR-03-038).
- Pre-signed download links expire in 15 minutes and are issued only after authorization.
- Search queries are not logged in full at Information level (NFR-G-10); length and duration are.
- Barcode and name uniqueness errors reveal the conflicting medicine only within the same organization.

## 18. Testing Considerations

- Unit: GTIN check-digit and normalization; Arabic normalization table; base-unit price rounding; category depth/cycle; import row parser.
- Integration: every endpoint for 401/403/404 (CS-07, CS-08) and validation codes; concurrent duplicate-barcode insertion; price change atomicity (price + history + audit + outbox all-or-nothing); import idempotency (same file twice, same `Idempotency-Key` twice).
- Performance: seeded dataset of 50,000 medicines (40% with Arabic names) and 100,000 barcodes for NFR-03-001/002; 20,000-row import for NFR-03-005.
- Contract: facade and integration-event schemas consumed by SPEC-04/05/06/08.
- Story-level scenarios: `TS-03-001` … in EPIC-03 story files.

## 19. Open Decisions

| ID | Decision needed | Default until decided |
|---|---|---|
| OD-03-01 | Is the Arabic trade name mandatory? | Optional; UI falls back to English |
| OD-03-02 | Should the catalog store a regulated public price and block selling above it (REG-08)? | Not stored; no ceiling enforced |
| OD-03-03 | External catalog source for initial load/updates and its licensing (REG-09) | None; manual entry and organization-owned files only |
| OD-03-04 | Model non-medicine items (cosmetics, devices, supplements) as `Medicine` with an item-kind flag, or as a separate entity | Same `Medicine` entity; ingredients and generic name optional |
| OD-03-05 | Scheduled (future-dated) price changes | Not supported; changes effective on commit |
| OD-03-06 | Whether `Controlled` needs sub-schedules and whether classification may vary by branch (REG-01, REG-02) | Single org-level class, three values |
| OD-03-07 | Seed tax categories and default rate (REG-06) | One `DEFAULT` 0.00% category flagged `RequiresReview` |
| OD-03-08 | Parse GS1 DataMatrix/GS1-128 (GTIN + batch + expiry + serial) at receiving and POS (REG-03) | GTIN-only lookup |
| OD-03-09 | Intermediate sellable units (strip/blister) between pack and base unit | Pack and base unit only |
| OD-03-10 | Default for alternative links: bidirectional or one-way | Bidirectional |

## 20. Regulatory Review Items

REG-01, REG-02, REG-03, REG-06, REG-08, REG-09.
