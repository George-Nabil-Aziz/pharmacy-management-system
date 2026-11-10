# US-03-05: Define active-ingredient composition and strength

| Field | Value |
|---|---|
| Story ID | US-03-05 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-03-013, FR-03-045 |
| Related Business Rules | BR-03-014, BR-03-017, BR-03-024 |
| Dependencies | US-03-01, US-03-04 |

## User Story
As a Pharmacist, I want to record each active ingredient of a medicine with its strength and unit so that staff can search by ingredient and identify equivalent medicines.

## Business Value
Structured composition (ingredient + value + unit) is the basis for ingredient search (US-03-11) and equivalence suggestions (US-03-13); free-text strength alone cannot be compared reliably.

## Preconditions
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

## Acceptance Criteria
### US-03-05-AC1: Replace composition and compose strength text
- **Given** medicine X with empty `strengthText` and ETag `E1`
- **When** the Pharmacist PUTs `/api/v1/catalog/medicines/{X}/ingredients` with `If-Match: E1` and rows `[Paracetamol 500 mg (sortOrder 1), Caffeine 65 mg (sortOrder 2)]`
- **Then** the response is 200 with a new ETag, GET X returns the two rows in sort order, and `strengthText = "500 mg / 65 mg"`.

### US-03-05-AC2: Explicit strength text is preserved
- **Given** medicine X with `strengthText = "500/65 mg"`
- **When** the composition is replaced
- **Then** `strengthText` remains `"500/65 mg"`.

### US-03-05-AC3: Duplicate ingredient rejected
- **Given** medicine X
- **When** the request contains `Paracetamol 500 mg` and `Paracetamol 250 mg`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.INGREDIENT_DUPLICATE` and the previous composition is unchanged.

### US-03-05-AC4: Row limits and value validation
- **Given** medicine X
- **When** the request contains 11 rows, or a row with `strengthValue = 0`, or `strengthUnit = "grams"`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.INGREDIENT_LIMIT_EXCEEDED`, `COMMON.OUT_OF_RANGE`, or `COMMON.INVALID_ENUM` respectively.

### US-03-05-AC5: Inactive ingredient rejected
- **Given** active ingredient `Phenylephrine` is deactivated
- **When** it is included in a new composition for X
- **Then** the response is 400 with `CATALOG.REFERENCE_DATA_INACTIVE`; medicines already containing `Phenylephrine` keep it when their other fields are updated.

### US-03-05-AC6: Empty composition allowed
- **Given** medicine X (a non-medicine item, OD-03-04) with two rows
- **When** the user PUTs an empty array
- **Then** the response is 200 and X has zero ingredient rows.

### US-03-05-AC7: Permission denied
- **Given** a Cashier without `catalog.medicines.update`
- **When** they PUT `/api/v1/catalog/medicines/{X}/ingredients`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-03-05-AC8: Cross-organization
- **Given** medicine Y and active ingredient Z of another organization
- **When** the Pharmacist PUTs ingredients for Y, or PUTs ingredients for X containing Z
- **Then** the first returns 404 `CATALOG.MEDICINE_NOT_FOUND`, the second 400 with `CATALOG.REFERENCE_DATA_NOT_FOUND`.

## Validation Rules
VR-03-010, VR-03-011, VR-03-004 (ingredient ids). The create endpoint (US-03-04) accepts the same `ingredients` array with the same rules.

## Authorization Rules
`catalog.medicines.update`; `If-Match` required.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Duplicate ingredient | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.INGREDIENT_DUPLICATE`) |
| More than 10 rows | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.INGREDIENT_LIMIT_EXCEEDED`) |
| Strength ≤ 0 or > 4 decimals | 400 `COMMON.VALIDATION_FAILED` (`COMMON.OUT_OF_RANGE`) |
| Unknown unit | 400 `COMMON.VALIDATION_FAILED` (`COMMON.INVALID_ENUM`) |
| Inactive ingredient | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.REFERENCE_DATA_INACTIVE`) |
| Stale ETag | 412 `COMMON.CONCURRENCY_CONFLICT` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Strength text composition uses the invariant decimal format without trailing zeros (`2.5 mg`, not `2.5000 mg`).
- Composition changes update the medicine's `SearchText` in the same transaction (ingredient search reflects the change immediately, NFR-03-004).
- Changing composition does not alter existing alternative links; suggestions (US-03-13) are recomputed on request.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-032 | Integration | Replace composition, ordered rows, composed strength text | US-03-05-AC1 |
| TS-03-033 | Unit | Strength-text composition keeps explicit text; decimal formatting | US-03-05-AC2 |
| TS-03-034 | Integration | Duplicate ingredient rejected atomically | US-03-05-AC3 |
| TS-03-035 | Unit | Row limit, strength range, unit enum | US-03-05-AC4 |
| TS-03-036 | Integration | Inactive ingredient rejected for new composition, retained on unrelated update | US-03-05-AC5 |
| TS-03-037 | Integration | Empty composition accepted | US-03-05-AC6 |
| TS-03-038 | Integration | 403 without update permission | US-03-05-AC7 |
| TS-03-039 | Integration | Cross-organization medicine and ingredient ids (CS-08) | US-03-05-AC8 |
