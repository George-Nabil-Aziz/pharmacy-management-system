# US-03-06: Manage medicine barcodes and barcode lookup

| Field | Value |
|---|---|
| Story ID | US-03-06 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-004, BR-03-023, BR-03-024 |
| Dependencies | US-03-04 |

## User Story
As an Inventory Staff member, I want to attach one or more validated barcodes to a medicine and look up a medicine by scanning so that receiving and POS identify the correct medicine on the first scan.

## Business Value
Many Egyptian packs carry an EAN-13 barcode, some medicines have several pack variants or legacy codes, and duplicates across medicines cause wrong-item sales. Check-digit validation catches keying errors before they reach the POS.

## Preconditions
- Medicine X exists and is visible to the user's organization.

## Acceptance Criteria
### US-03-06-AC1: Add a valid GTIN as first (primary) barcode
- **Given** medicine X has no barcodes
- **When** the user POSTs `/api/v1/catalog/medicines/{X}/barcodes` with `code = "5901234123457"`, `format = "Gtin"`
- **Then** the response is 201, the barcode has `isPrimary = true`, `source = "Manual"`, `normalizedCode = "05901234123457"`, and a `BarcodeAdded` audit entry is written.

### US-03-06-AC2: Invalid check digit rejected
- **Given** medicine X
- **When** the user adds `code = "5901234123458"`, `format = "Gtin"`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.BARCODE_INVALID_CHECKSUM`; adding `"59012341234"` (11 digits) as `Gtin` returns `CATALOG.BARCODE_INVALID_FORMAT`.

### US-03-06-AC3: Internal barcode format
- **Given** medicine X
- **When** the user adds `code = "PH-0012"`, `format = "Internal"`, and separately `code = "PH 0012"`
- **Then** the first returns 201 and the second returns 400 with `CATALOG.BARCODE_INVALID_FORMAT`.

### US-03-06-AC4: Uniqueness across medicines including UPC/EAN equivalence and inactive medicines
- **Given** inactive medicine Y has GTIN `036000291452` (UPC-A)
- **When** the user adds `0036000291452` (EAN-13 form) to medicine X
- **Then** the response is 409 `CATALOG.BARCODE_DUPLICATE` with `conflictingMedicineId = Y` and `conflictingMedicineCode`.

### US-03-06-AC5: Concurrent duplicate insert
- **Given** medicines X and Z
- **When** two requests add the same GTIN to X and to Z concurrently
- **Then** exactly one returns 201 and the other returns 409 `CATALOG.BARCODE_DUPLICATE`.

### US-03-06-AC6: Primary management and removal
- **Given** X has barcodes B1 (primary, oldest) and B2, B3
- **When** the user PUTs `/barcodes/{B3}/primary`, then DELETEs B3
- **Then** after the PUT only B3 is primary; after the DELETE (204) B1 (oldest remaining) is primary; both changes write audit entries.

### US-03-06-AC7: Limit of 10 barcodes
- **Given** X has 10 barcodes
- **When** the user adds an 11th
- **Then** the response is 422 `CATALOG.BARCODE_LIMIT_EXCEEDED`.

### US-03-06-AC8: Barcode lookup
- **Given** X has GTIN `5901234123457` and Y (inactive) has internal `PH-0099`
- **When** a Cashier GETs `/api/v1/catalog/medicines/by-barcode/05901234123457`, then `/by-barcode/ph-0099`, then `/by-barcode/1111111111116`
- **Then** the first returns X with `status = "Active"`, the second returns Y with `status = "Inactive"`, and the third returns 404 `CATALOG.BARCODE_NOT_FOUND`.

### US-03-06-AC9: Permission denied
- **Given** a Cashier without `catalog.medicines.update`
- **When** they POST a barcode to X
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-03-06-AC10: Cross-organization
- **Given** medicine W of another organization has barcode `4006381333931`
- **When** a user of this organization looks up `4006381333931`, or adds that same code to X
- **Then** the lookup returns 404 `CATALOG.BARCODE_NOT_FOUND` and the add returns 201 (uniqueness is per organization), with no data of W revealed.

## Validation Rules
VR-03-012 … VR-03-015. The create endpoint (US-03-04) accepts a `barcodes` array with the same rules; the first item becomes primary.

## Authorization Rules
Add/remove/set primary: `catalog.medicines.update`. Lookup: `catalog.medicines.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Wrong GTIN length or non-digits | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.BARCODE_INVALID_FORMAT`) |
| Wrong check digit | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.BARCODE_INVALID_CHECKSUM`) |
| Internal code with invalid characters or > 32 chars | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.BARCODE_INVALID_FORMAT`) |
| Duplicate in organization | 409 `CATALOG.BARCODE_DUPLICATE` |
| More than 10 | 422 `CATALOG.BARCODE_LIMIT_EXCEEDED` |
| Lookup miss | 404 `CATALOG.BARCODE_NOT_FOUND` |
| Barcode id not on this medicine | 404 `CATALOG.BARCODE_NOT_FOUND` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Internal barcodes are compared case-insensitively (normalized upper-case).
- A digits-only `Internal` code of length 8, 12, 13, or 14 is normalized to 14 digits exactly like a GTIN, so it collides with an equal GTIN (409 `CATALOG.BARCODE_DUPLICATE`) and a scan resolves to a single medicine.
- Removing the only barcode is allowed; the medicine has no primary barcode.
- Lookup input with surrounding whitespace or Arabic-Indic digits is normalized before matching.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-040 | Integration | First barcode becomes primary with normalized code and audit | US-03-06-AC1 |
| TS-03-041 | Unit | GS1 mod-10 check digit for GTIN-8/12/13/14 (valid and invalid vectors) | US-03-06-AC2 |
| TS-03-042 | Unit | Internal format character set and length 1/32/33 | US-03-06-AC3 |
| TS-03-043 | Integration | UPC-A vs EAN-13 equivalence, conflict with inactive medicine | US-03-06-AC4 |
| TS-03-044 | Concurrency | Parallel insert of same code: one 201, one 409 | US-03-06-AC5 |
| TS-03-045 | Integration | Set primary, delete primary, oldest promoted, audits | US-03-06-AC6 |
| TS-03-046 | Integration | 11th barcode rejected | US-03-06-AC7 |
| TS-03-047 | Integration | Lookup active, inactive (case-insensitive internal), miss | US-03-06-AC8 |
| TS-03-048 | Integration | 403 for add without update permission | US-03-06-AC9 |
| TS-03-049 | Integration | Cross-organization lookup 404 and per-organization uniqueness (CS-08) | US-03-06-AC10 |
