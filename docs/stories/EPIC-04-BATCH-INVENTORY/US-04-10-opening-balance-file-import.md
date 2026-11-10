# US-04-10: Opening balance file import

| Field | Value |
|---|---|
| Story ID | US-04-10 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-034 |
| Related Business Rules | BR-04-003, BR-04-004, BR-04-016 |
| Dependencies | US-04-09 |

## User Story
As a pharmacy owner, I want to import my opening stock from a spreadsheet so that I can load thousands of batches without manual entry.

## Business Value
Branches typically hold 1,000–5,000 batch lines; import shortens go-live from days to hours.

## Preconditions
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

## Acceptance Criteria
### US-04-10-AC1: Valid file creates a draft
- **Given** an XLSX with 2,000 valid rows (columns: medicineCode or barcode, batchNumber, expiry, unitCost, quantity, unit `base`/`pack`, supplierCode optional, sellingPriceOverride optional)
- **When** the owner uploads it to `POST /api/v1/branches/A/inventory/opening-balances/import`
- **Then** the response is 201 with a `Draft` opening balance document of 2,000 lines and a summary (rows read 2,000, lines created 2,000, merged 0)

### US-04-10-AC2: Row errors reject the whole file
- **Given** a CSV with 3 invalid rows (unknown barcode at row 15, expiry `2027-02-30` at row 40, quantity `-5` at row 88)
- **When** it is uploaded
- **Then** the response is 422 `INVENTORY.IMPORT_VALIDATION_FAILED` with `rowErrors` [{row 15, column medicineCode, code `COMMON.NOT_FOUND`}, {row 40, column expiry, code `INVENTORY.EXPIRY_DATE_INVALID`}, {row 88, column quantity, code `INVENTORY.INVALID_QUANTITY`}] and no draft is created

### US-04-10-AC3: File-level rejection
- **Given** a 6 MB file, a PDF renamed to .csv, a file with 5,001 data rows, or a file missing the `batchNumber` header
- **When** it is uploaded
- **Then** the response is 400 `INVENTORY.IMPORT_FILE_INVALID` with the reason

### US-04-10-AC4: Duplicate rows merged
- **Given** rows 10 and 11 share medicine, batch number, expiry, cost, and supplier with quantities 20 and 30
- **When** the file is imported
- **Then** one draft line with quantity 50 is created and the summary reports merged 1

### US-04-10-AC5: Month/year expiry and formula safety
- **Given** a row with expiry `03/2027` and a cell containing `=HYPERLINK(...)` in batchNumber
- **When** imported
- **Then** expiry is stored as 2027-03-31 and the batch number cell fails `INVENTORY.BATCH_NUMBER_INVALID` (formulas are never evaluated)

### US-04-10-AC6: Authorization and lock
- **Given** a manager without `inventory.opening-balances.manage`, a branch with opening balances locked, and a branch of another organization
- **When** an import is attempted
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 409 `INVENTORY.OPENING_BALANCE_LOCKED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-020 file rules; each row VR-04-001..007; error list capped at 1,000 entries plus `totalErrorCount`.

## Authorization Rules
- `inventory.opening-balances.manage` + branch assignment; rate limit 10 imports per user per hour (429 `COMMON.RATE_LIMITED`).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Wrong type, size, row count, headers | 400 `INVENTORY.IMPORT_FILE_INVALID` |
| Any row invalid | 422 `INVENTORY.IMPORT_VALIDATION_FAILED` |
| Opening balances locked | 409 `INVENTORY.OPENING_BALANCE_LOCKED` |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |

## Edge Cases
- Arabic-Indic digits in numeric cells are normalized to Latin digits.
- Decimal separators: `.` only; `12,50` is rejected as invalid cost to avoid locale ambiguity.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-068 | Integration | 2,000-row XLSX creates draft with summary | US-04-10-AC1 |
| TS-04-069 | Integration | Row-level errors listed with row/column/code; no draft created | US-04-10-AC2 |
| TS-04-070 | API | Oversize, wrong type, too many rows, missing header → 400 | US-04-10-AC3 |
| TS-04-071 | Unit | Duplicate rows merged by receipt key | US-04-10-AC4 |
| TS-04-072 | Security | Month/year expiry parsing; formula cells not evaluated and rejected | US-04-10-AC5 |
| TS-04-073 | API | 403 permission, 409 locked, 404 other org (CS-08), 403 unassigned branch (CS-07) | US-04-10-AC6 |
| TS-04-074 | Performance | NFR-04-003: 5,000-row validation p95 ≤ 10 s | US-04-10-AC1 |
