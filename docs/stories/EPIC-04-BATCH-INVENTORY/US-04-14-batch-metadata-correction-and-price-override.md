# US-04-14: Batch metadata correction and selling price override

| Field | Value |
|---|---|
| Story ID | US-04-14 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-04-038, FR-04-041, FR-04-042 |
| Related Business Rules | BR-G-16, BR-G-20, BR-G-25, BR-04-012, BR-04-017 |
| Dependencies | US-04-01, US-04-11 |

## User Story
As a branch manager, I want to correct a mistyped batch number or expiry and set a batch-specific selling price so that FEFO and pricing reflect the physical packs.

## Business Value
Go-live and receiving errors are common; safe correction protects FEFO and expiry control. Batch prices support older packs carrying an earlier printed price (subject to REG-08).

## Preconditions
- Batch exists in the user's branch.

## Acceptance Criteria
### US-04-14-AC1: Direct correction of an untouched batch
- **Given** batch B has exactly one movement (its `Receipt`), no destination batches, and no open transfer or stocktake reference
- **When** a manager with `inventory.batches.update-metadata` sends `PATCH …/batches/B/metadata` with expiry 2027-09-30, reason "Typo at receiving, pack shows 09/2027", and a valid `If-Match`
- **Then** ExpiryDate is updated, status is recomputed, and an audit entry stores old and new values and the reason

### US-04-14-AC2: Correction blocked once the batch has history
- **Given** batch B has a `Receipt` and a `Sale` movement
- **When** the same PATCH is sent
- **Then** the response is 409 `INVENTORY.BATCH_METADATA_LOCKED` with a hint to use a reclassification adjustment (FR-04-038)

### US-04-14-AC3: Set selling price override with both permissions
- **Given** a manager holding `inventory.batches.update-metadata` and `catalog.prices.update`
- **When** `PUT …/batches/B/selling-price-override` sets 95.0000 with a valid `If-Match`
- **Then** the override is stored, audited with old/new value, and subsequent FEFO allocations from B return `sellingPriceOverride` 95.0000; sending null clears it

### US-04-14-AC4: Override requires both permissions
- **Given** a user with `inventory.batches.update-metadata` but without `catalog.prices.update`
- **When** the user sets an override
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`

### US-04-14-AC5: Validation and concurrency
- **Given** a price of 0, an expiry `2026-02-30`, or a stale `If-Match`
- **When** submitted
- **Then** the responses are 422 `INVENTORY.SELLING_PRICE_INVALID`, 422 `INVENTORY.EXPIRY_DATE_INVALID`, and 412 `COMMON.CONCURRENCY_CONFLICT`

### US-04-14-AC6: Cross-branch and cross-organization
- **Given** a manager assigned to branch A only
- **When** the manager patches a batch of branch B, or of another organization
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-002, VR-04-003, VR-04-005, VR-04-006 (new number/expiry must not collide), VR-04-013 reason.

## Authorization Rules
- Metadata: `inventory.batches.update-metadata`; price override: plus `catalog.prices.update`; branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Batch has more than its originating movement | 409 `INVENTORY.BATCH_METADATA_LOCKED` |
| Missing If-Match | 428 `COMMON.PRECONDITION_REQUIRED` |
| Stale If-Match | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Invalid price / expiry | 422 `INVENTORY.SELLING_PRICE_INVALID` / `INVENTORY.EXPIRY_DATE_INVALID` |

## Edge Cases
- Correcting expiry to a past date makes the batch `Expired` immediately.
- Corrections are not propagated to destination batches (OD-04-07); price override changes do not affect existing destination batches (E-11).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-096 | Integration | Direct expiry correction on single-movement batch with audit old/new | US-04-14-AC1 |
| TS-04-097 | API | Batch with history → 409 BATCH_METADATA_LOCKED | US-04-14-AC2 |
| TS-04-098 | Integration | Override set/clear; FEFO returns override | US-04-14-AC3 |
| TS-04-099 | API | Missing catalog.prices.update → 403 | US-04-14-AC4 |
| TS-04-100 | API | Price/expiry validation; stale and missing If-Match | US-04-14-AC5 |
| TS-04-101 | API | CS-07 other branch → 403; CS-08 other org → 404 | US-04-14-AC6 |
