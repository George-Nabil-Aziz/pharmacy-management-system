# US-03-12: List, filter, and view medicine details

| Field | Value |
|---|---|
| Story ID | US-03-12 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-030, FR-03-031, FR-03-045 |
| Related Business Rules | BR-03-001, BR-03-021, BR-03-024 |
| Dependencies | US-03-01, US-03-02, US-03-03, US-03-04, US-03-05, US-03-06, US-03-07 |

## User Story
As a catalog user, I want to page, filter, sort, and view medicine details so that I can find the right catalog record and see only information authorized for my role.

## Business Value
Consistent list and detail models support administration and downstream modules without exposing cost or another Organization's data.

## Preconditions
- The caller is authenticated and holds `catalog.medicines.read`.
- Catalog data and organization default prices exist.

## Acceptance Criteria
### US-03-12-AC1: Filter and sort a paginated list
- **Given** medicines with different statuses and reference-data values
- **When** the caller filters by status, category including descendants, manufacturer, dosage form, class, ingredient, storage, tax category, or barcode presence
- **Then** the response honors the filters, accepted sort fields, and page/pageSize/totalCount contract.

### US-03-12-AC2: View complete authorized medicine details
- **Given** a medicine with composition, barcodes, prices, alternatives, and storage data
- **When** the caller requests its detail
- **Then** the response contains these fields and branch overrides only for branches the caller can access.

### US-03-12-AC3: Omit restricted cost fields
- **Given** one caller with `catalog.costs.read` and another without it
- **When** each reads the same medicine detail
- **Then** `LastPurchaseCost` and `LastPurchaseCostAt` are included only for the authorized caller and are omitted, not set to null, for the other.

### US-03-12-AC4: Deny and isolate catalog reads
- **Given** a caller without `catalog.medicines.read` and a medicine id from another Organization
- **When** they list or view catalog data
- **Then** missing permission returns 403 `COMMON.FORBIDDEN` and the foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`.

## Validation Rules
- List filters and sort fields must be supported by SPEC-03; paging defaults to page 1 and pageSize 25 with maximum 100.
- Identifier values must be valid UUIDs.

## Authorization Rules
- List and detail require `catalog.medicines.read`; cost fields additionally require `catalog.costs.read`.
- Branch override data is included only for accessible Branches. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing medicine read permission | 403 `COMMON.FORBIDDEN` |
| Invalid pagination or filter | 400 `COMMON.VALIDATION_FAILED` |
| Other-Organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- A filter by a parent category includes medicines in all descendant categories.
- Restricted cost fields are omitted consistently in both list and detail read models.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-070 | Integration | List filters, descendant categories, sorting, and pagination totals | US-03-12-AC1 |
| TS-03-071 | Integration | Details include composition, barcode, price, alternatives, and storage | US-03-12-AC2 |
| TS-03-072 | Integration | Cost fields appear only with `catalog.costs.read` | US-03-12-AC3 |
| TS-03-073 | Integration | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | US-03-12-AC4 |
