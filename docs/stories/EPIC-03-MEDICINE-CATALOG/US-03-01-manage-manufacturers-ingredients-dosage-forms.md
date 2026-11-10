# US-03-01: Manage manufacturers, active ingredients, and dosage forms

| Field | Value |
|---|---|
| Story ID | US-03-01 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |
| Related Business Rules | BR-03-014, BR-03-024, BR-G-17 |
| Dependencies | EPIC-01 (authentication, permissions), EPIC-02 (organization creation hook for seeding) |

## User Story
As a Branch Manager or Pharmacist, I want to maintain the organization's manufacturers, active ingredients, and dosage forms so that medicines are described with consistent, reusable reference data.

## Business Value
Consistent reference data enables reliable search by ingredient, equivalence suggestions, filtering, and reporting by manufacturer; it prevents duplicate spellings of the same manufacturer or ingredient.

## Preconditions
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

## Acceptance Criteria
### US-03-01-AC1: Create manufacturer
- **Given** a user with `catalog.reference-data.manage`
- **When** they POST `/api/v1/catalog/manufacturers` with `nameEn = "Pharco"`, `nameAr = "فاركو"`, `countryCode = "EG"`
- **Then** the response is 201 with the created manufacturer, `isActive = true`, and an `ETag` header.

### US-03-01-AC2: Duplicate name after normalization is rejected
- **Given** an active ingredient `Paracetamol` exists in the organization
- **When** the user creates an active ingredient with `nameEn = "  PARACETAMOL "`
- **Then** the response is 409 `CATALOG.NAME_DUPLICATE` and no row is created.

### US-03-01-AC3: Dosage forms are seeded per organization
- **Given** a newly created organization
- **When** a user with `catalog.medicines.read` GETs `/api/v1/catalog/dosage-forms`
- **Then** the 19 seeded dosage forms of SPEC-03 §8.4 are returned with `isSeeded = true`, `isActive = true`, and both `nameEn` and `nameAr` populated.

### US-03-01-AC4: Inactive reference data cannot be newly assigned
- **Given** manufacturer M is deactivated and medicine X already references M
- **When** a user creates a new medicine with `manufacturerId = M`
- **Then** the response is 400 with field error `CATALOG.REFERENCE_DATA_INACTIVE` on `manufacturerId`, and medicine X still returns `manufacturerId = M` on GET.

### US-03-01-AC5: Delete only when unreferenced
- **Given** active ingredient I is used by one medicine and active ingredient J is used by none
- **When** the user DELETEs I and then J
- **Then** deleting I returns 409 `CATALOG.REFERENCE_DATA_IN_USE` and deleting J returns 204.

### US-03-01-AC6: Permission denied
- **Given** a Cashier without `catalog.reference-data.manage`
- **When** they POST `/api/v1/catalog/manufacturers`
- **Then** the response is 403 `COMMON.FORBIDDEN` and no row is created.

### US-03-01-AC7: Cross-organization access
- **Given** manufacturer M belongs to organization B
- **When** a user of organization A with `catalog.reference-data.manage` PUTs `/api/v1/catalog/manufacturers/{M}`
- **Then** the response is 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`, identical to the response for a random non-existent id (CS-08).

## Validation Rules
VR-03-020 (manufacturer), VR-03-021 (active ingredient), VR-03-022 (dosage form), VR-03-004 (assignment to medicine).

## Authorization Rules
Read: `catalog.medicines.read`. Create/update/deactivate/reactivate/delete: `catalog.reference-data.manage`. Organization isolation per FR-03-045.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing `nameEn` | 400 `COMMON.VALIDATION_FAILED` (`COMMON.REQUIRED`) |
| Invalid country code `EGY` | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.COUNTRY_CODE_INVALID`) |
| Duplicate normalized name | 409 `CATALOG.NAME_DUPLICATE` |
| Dosage form code `tab` lowercase with digits `TAB1` | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.CODE_INVALID`) |
| Delete referenced item | 409 `CATALOG.REFERENCE_DATA_IN_USE` |
| Update with stale `If-Match` | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization's id | 404 `CATALOG.REFERENCE_DATA_NOT_FOUND` |

## Edge Cases
- Arabic name variants `بنادول` vs `بنادوْل` normalize identically and collide (SPEC-03 §13.1).
- Seeded dosage forms may be renamed or deactivated but not deleted while referenced.
- Reactivating an item whose normalized name now collides with another active item returns 409 `CATALOG.NAME_DUPLICATE`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-001 | Integration | Create manufacturer with valid data returns 201 + ETag | US-03-01-AC1 |
| TS-03-002 | Unit | Normalized-name collision for Latin case/whitespace and Arabic variants | US-03-01-AC2 |
| TS-03-003 | Integration | New organization has 19 seeded dosage forms with ar/en names | US-03-01-AC3 |
| TS-03-004 | Integration | Assigning deactivated manufacturer to new medicine rejected; existing reference retained | US-03-01-AC4 |
| TS-03-005 | Integration | Delete referenced vs unreferenced ingredient | US-03-01-AC5 |
| TS-03-006 | Integration | Cashier write attempts on all three resources return 403 | US-03-01-AC6 |
| TS-03-007 | Integration | Cross-organization GET/PUT/DELETE return 404 with body identical to non-existent id (CS-08) | US-03-01-AC7 |
