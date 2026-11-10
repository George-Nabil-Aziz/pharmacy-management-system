# US-03-04: Create and update a medicine

| Field | Value |
|---|---|
| Story ID | US-03-04 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |
| Related Business Rules | BR-03-001, BR-03-002, BR-03-006, BR-03-012, BR-03-014, BR-03-023, BR-G-33 |
| Dependencies | US-03-01, US-03-02, US-03-03 |

## User Story
As a Pharmacist or Inventory Staff member, I want to create and edit a medicine with its names, category, manufacturer, dosage form, pack information, storage data, minimum stock, classification, tax category, and initial selling price so that it can be stocked and sold.

## Business Value
The medicine record is the anchor for every batch, sale, purchase, and prescription line; complete pack data (`PackSize`, `AllowSplitPack`) is required for correct base-unit stock and pricing.

## Preconditions
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

## Acceptance Criteria
### US-03-04-AC1: Create medicine with generated code
- **Given** a Pharmacist with `catalog.medicines.create` and no medicines in the organization
- **When** they POST `/api/v1/catalog/medicines` with `tradeNameEn = "Panadol Extra"`, valid category/dosage form, `packSize = 24`, `baseUnitNameEn = "tablet"`, `price.packPrice = 72.00`, no `code`, no `prescriptionClass`, no `taxCategoryId`
- **Then** the response is 201 with `Location`, `ETag`, `code = "MED-000001"`, `status = "Active"`, `prescriptionClass = "PrescriptionOnly"`, `taxCategoryId` = organization `DefaultTaxCategoryId`; a `MedicinePrice` row (72.0000), a `MedicinePriceHistory` row with `changeType = "Initial"`, and a `MedicineCreated` audit entry exist in the same transaction.

### US-03-04-AC2: Duplicate code rejected
- **Given** medicine `MED-000001` exists
- **When** the user creates a medicine with `code = "med-000001"`
- **Then** the response is 409 `CATALOG.CODE_DUPLICATE`.

### US-03-04-AC3: Optimistic concurrency on update
- **Given** medicine X with ETag `E1`
- **When** user A PUTs an update with `If-Match: E1` and then user B PUTs with `If-Match: E1`, and user C PUTs with no `If-Match`
- **Then** A receives 200 with a new ETag, B receives 412 `COMMON.CONCURRENCY_CONFLICT`, and C receives 428 `COMMON.PRECONDITION_REQUIRED`.

### US-03-04-AC4: PackSize change blocked while stock exists
- **Given** medicine X with `packSize = 24` and the stock probe reports `OnHand = 10` in branch CAI01
- **When** the user PUTs X with `packSize = 20`
- **Then** the response is 409 `CATALOG.PACK_SIZE_CHANGE_BLOCKED`; when the probe reports zero on-hand and zero reserved in all branches, the same request returns 200 and a `PackSizeChanged` audit entry records 24 → 20.

### US-03-04-AC5: Storage condition exposed
- **Given** a medicine created with `storageCondition = "Refrigerated2To8C"` and `protectFromLight = true`
- **When** a user GETs it
- **Then** the response contains `isRefrigerated = true` and `protectFromLight = true`.

### US-03-04-AC6: Field validation
- **Given** a create request with `packSize = 0`, `defaultMinStock = -1`, and `tradeNameEn` of 201 characters
- **When** it is submitted
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `COMMON.OUT_OF_RANGE` on `packSize` and `defaultMinStock` and `COMMON.MAX_LENGTH` on `tradeNameEn`, and nothing is persisted.

### US-03-04-AC7: Possible duplicate warning
- **Given** an active medicine "Panadol Extra", dosage form `TABLET`, strength text "500 mg / 65 mg"
- **When** the user creates "PANADOL  extra" with the same dosage form and strength text, first without and then with `confirmDuplicate = true`
- **Then** the first returns 409 `CATALOG.POSSIBLE_DUPLICATE` listing the existing medicine's id, code, and name; the second returns 201.

### US-03-04-AC8: Classification requires classify permission
- **Given** an Inventory Staff user with `catalog.medicines.create` but without `catalog.medicines.classify`
- **When** they create a medicine with `prescriptionClass = "OTC"`
- **Then** the response is 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED` and nothing is persisted; the same request with `prescriptionClass` omitted returns 201 with `PrescriptionOnly`.

### US-03-04-AC9: Permission denied
- **Given** a Cashier with only `catalog.medicines.read`
- **When** they POST `/api/v1/catalog/medicines` or PUT `/api/v1/catalog/medicines/{id}`
- **Then** each returns 403 `COMMON.FORBIDDEN`.

### US-03-04-AC10: Cross-organization
- **Given** medicine Y belongs to another organization
- **When** a Pharmacist GETs or PUTs `/api/v1/catalog/medicines/{Y}`, or creates a medicine with `categoryId` of the other organization
- **Then** GET/PUT return 404 `CATALOG.MEDICINE_NOT_FOUND`, and the create returns 400 with `CATALOG.REFERENCE_DATA_NOT_FOUND` on `categoryId` (CS-08).

## Validation Rules
VR-03-001 … VR-03-009, VR-03-016 (initial price). Inactive reference data → `CATALOG.REFERENCE_DATA_INACTIVE` (BR-03-014).

## Authorization Rules
Create: `catalog.medicines.create` (+ `catalog.medicines.classify` for `OTC`/`Controlled`). Update: `catalog.medicines.update`. Initial price is set with `catalog.medicines.create`; later price changes need `catalog.prices.update` (US-03-07). A changed `prescriptionClass` in PUT returns 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT` (US-03-09).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing required field | 400 `COMMON.VALIDATION_FAILED` (`COMMON.REQUIRED`) |
| Invalid code characters `MED 1` | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.CODE_INVALID`) |
| Duplicate code | 409 `CATALOG.CODE_DUPLICATE` |
| Inactive category | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.REFERENCE_DATA_INACTIVE`) |
| PackSize change with stock | 409 `CATALOG.PACK_SIZE_CHANGE_BLOCKED` |
| Possible duplicate | 409 `CATALOG.POSSIBLE_DUPLICATE` |
| Class ≠ PrescriptionOnly without classify | 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED` |
| Class changed via PUT | 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT` |
| Stale / missing `If-Match` | 412 `COMMON.CONCURRENCY_CONFLICT` / 428 `COMMON.PRECONDITION_REQUIRED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- `PackSize` change with `OnHand = 0` but `Reserved > 0` is blocked.
- Two concurrent creates without code receive distinct sequential codes (sequence allocated inside the transaction).
- `AllowSplitPack` toggled false clears explicit base-unit prices (SPEC-03 §13.3).
- `defaultMinStock = null` means "no default threshold"; 0 is a valid explicit threshold.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-021 | Integration | Create with defaults: code, class, tax category, price, history `Initial`, audit — all in one transaction | US-03-04-AC1 |
| TS-03-022 | Integration | Duplicate code case-insensitive | US-03-04-AC2 |
| TS-03-023 | Integration | ETag flow: 200 / 412 / 428 | US-03-04-AC3 |
| TS-03-024 | Integration | PackSize lock with stub probe returning on-hand, reserved, and zero | US-03-04-AC4 |
| TS-03-025 | Integration | Storage fields and derived `isRefrigerated` | US-03-04-AC5 |
| TS-03-026 | Unit | Field validation boundaries (packSize 1/10,000/10,001; minStock -1/0/1,000,000) | US-03-04-AC6 |
| TS-03-027 | Integration | Possible-duplicate detection with normalization and `confirmDuplicate` | US-03-04-AC7 |
| TS-03-028 | Integration | Classification at create with/without classify permission | US-03-04-AC8 |
| TS-03-029 | Integration | Cashier create/update 403 | US-03-04-AC9 |
| TS-03-030 | Integration | Cross-organization medicine and body reference ids (CS-08) | US-03-04-AC10 |
| TS-03-031 | Concurrency | 20 parallel creates without code produce 20 unique sequential codes | US-03-04-AC1 |
