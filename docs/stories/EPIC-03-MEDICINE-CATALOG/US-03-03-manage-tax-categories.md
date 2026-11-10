# US-03-03: Manage tax categories

| Field | Value |
|---|---|
| Story ID | US-03-03 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-03-006, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-008, BR-03-015, BR-03-023, BR-G-20 |
| Dependencies | EPIC-01, EPIC-02 (OrganizationSettings) |

## User Story
As an Owner, I want to define tax categories with rates and choose the default category so that each medicine is taxed according to the configuration my tax advisor confirms (REG-06).

## Business Value
POS tax calculation (SPEC-06) depends on a per-medicine tax rate. Keeping rates as organization configuration avoids hard-coding tax treatment that is pending professional review.

## Preconditions
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

## Acceptance Criteria
### US-03-03-AC1: Create tax category
- **Given** an Owner with `settings.organization.manage`
- **When** they POST `/api/v1/catalog/tax-categories` with `code = "STD14"`, `nameEn = "Standard 14%"`, `nameAr = "قياسي 14%"`, `ratePercent = 14.00`
- **Then** the response is 201, the category is active, and an audit entry `TaxCategoryCreated` is written in the same transaction.

### US-03-03-AC2: Rate change is prospective and audited
- **Given** tax category `STD14` at 14.00%
- **When** the Owner changes `STD14.ratePercent` to 10.00 with a valid `If-Match`
- **Then** the response is 200 with a new `ETag`, GET returns 10.00, an audit entry records old 14.00 and new 10.00 in the same transaction, and no existing row outside `catalog.tax_categories` and the audit log is modified (completed-sale tax snapshots are untouched, BR-G-20; end-to-end check in EPIC-06).

### US-03-03-AC3: Default category cannot be deactivated
- **Given** `DEFAULT` is the organization's `DefaultTaxCategoryId`
- **When** the Owner POSTs `/api/v1/catalog/tax-categories/{DEFAULT}/deactivate`
- **Then** the response is 409 `CATALOG.TAX_CATEGORY_IS_DEFAULT` and the category remains active.

### US-03-03-AC4: Rate out of range rejected
- **Given** an Owner
- **When** they create a tax category with `ratePercent = 100.01` or `ratePercent = 5.555`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `COMMON.OUT_OF_RANGE` on `ratePercent`.

### US-03-03-AC5: Set the default tax category
- **Given** active category `STD14` and inactive category `OLD5`
- **When** the Owner POSTs `/api/v1/catalog/tax-categories/{STD14}/set-default`, then POSTs the same for `OLD5`
- **Then** the first returns 200, `OrganizationSettings.DefaultTaxCategoryId = STD14`, and an audit entry is written; the second returns 422 `CATALOG.REFERENCE_DATA_INACTIVE` and the default remains `STD14`.

### US-03-03-AC6: Permission denied
- **Given** a Branch Manager without `settings.organization.manage`
- **When** they PUT `/api/v1/catalog/tax-categories/{STD14}`
- **Then** the response is 403 `COMMON.FORBIDDEN` and the rate is unchanged; GET `/api/v1/catalog/tax-categories` by the same user returns 200.

### US-03-03-AC7: Cross-organization
- **Given** tax category T of another organization
- **When** the Owner GETs or PUTs `/api/v1/catalog/tax-categories/{T}`
- **Then** the response is 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`.

## Validation Rules
VR-03-023. Rate changes carry no reason field; the audit entry records user, time, and old/new values.

## Authorization Rules
Read: `catalog.medicines.read`. Create/update/deactivate and setting `DefaultTaxCategoryId`: `settings.organization.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Duplicate code | 409 `CATALOG.CODE_DUPLICATE` |
| Invalid code `std 14` | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.CODE_INVALID`) |
| Rate > 100 or > 2 decimals | 400 `COMMON.VALIDATION_FAILED` (`COMMON.OUT_OF_RANGE`) |
| Deactivate default | 409 `CATALOG.TAX_CATEGORY_IS_DEFAULT` |
| Stale `If-Match` | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `CATALOG.REFERENCE_DATA_NOT_FOUND` |

## Edge Cases
- Setting `requiresReview = false` on `DEFAULT` is an explicit Owner action and is audited; the UI shows a banner while any active category has `requiresReview = true`.
- A deactivated tax category stays on existing medicines; new assignments are rejected with `CATALOG.REFERENCE_DATA_INACTIVE`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-015 | Integration | Create category + audit row in same transaction | US-03-03-AC1 |
| TS-03-016 | Integration | Rate change returns new ETag and value; audit old/new; no other tables touched | US-03-03-AC2 |
| TS-03-017 | Integration | Deactivating default category returns 409 | US-03-03-AC3 |
| TS-03-018 | Unit | Rate boundaries 0.00, 100.00 accepted; 100.01, -0.01, 5.555 rejected | US-03-03-AC4 |
| TS-03-019 | Integration | Set default to active category succeeds with audit; inactive category rejected | US-03-03-AC5 |
| TS-03-020 | Integration | Manager write 403, read 200; cross-organization 404 | US-03-03-AC6, US-03-03-AC7 |
