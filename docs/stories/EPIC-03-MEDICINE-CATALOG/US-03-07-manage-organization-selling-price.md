# US-03-07: Manage organization selling price with history

| Field | Value |
|---|---|
| Story ID | US-03-07 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-018, FR-03-019, FR-03-020, FR-03-021, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-007, BR-03-008, BR-03-009, BR-03-010, BR-03-023, BR-03-024, BR-G-18, BR-G-20 |
| Dependencies | US-03-04, EPIC-01 pricing permissions |

## User Story
As an Owner, I want to change the organization's default selling price with a reason and immutable history so that branches without an override use the current authorized price.

## Business Value
One organization default gives every branch a predictable fallback while preserving the rationale and audit trail for price changes.

## Preconditions
- The medicine has an initial organization default pack price.
- The caller has organization-wide scope and `catalog.prices.update`.

## Acceptance Criteria
### US-03-07-AC1: Change organization default price
- **Given** a medicine with current pack price and `AllowSplitPack` settings
- **When** an authorized user submits a new pack price, optional valid base-unit price, reason, and current `If-Match`
- **Then** the current price is updated, immutable price history and audit are written in the same transaction, and a `MedicinePriceChanged` event is published through the outbox.

### US-03-07-AC2: Confirm large changes and preserve history
- **Given** an organization price change exceeds `PriceChangeConfirmThresholdPercent`
- **When** the request omits `confirmLargeChange` or supplies a stale ETag
- **Then** the former returns 422 `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED`, the latter returns 412, and neither changes price or history; a confirmed change succeeds and history is newest first.

### US-03-07-AC3: Deny missing scope and permission
- **Given** a caller with `catalog.prices.update` but no organization-wide scope, or a caller lacking that permission
- **When** either attempts to change the organization default
- **Then** each request returns 403 `COMMON.FORBIDDEN` and no price is changed.

### US-03-07-AC4: Conceal a medicine from another Organization
- **Given** a medicine owned by another Organization
- **When** the caller requests its price history or attempts a price update
- **Then** the response is 404 `CATALOG.MEDICINE_NOT_FOUND`, identical in shape to a missing medicine.

## Validation Rules
- `PackPrice` is greater than 0, at most 1,000,000.0000, and has at most four decimals; `BaseUnitPrice` is valid only when split packs are allowed (VR-03-016, VR-03-017).
- Reason is required and 3–200 characters (VR-03-018); updates require `If-Match`.

## Authorization Rules
- Price changes require `catalog.prices.update` and organization-wide scope.
- History read requires `catalog.medicines.read` and is limited to the caller's Organization and accessible branch scopes. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid price or reason | 400 `COMMON.VALIDATION_FAILED` |
| Large price change without confirmation | 422 `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED` |
| Missing price permission or organization-wide scope | 403 `COMMON.FORBIDDEN` |
| Stale or missing ETag | 412 `COMMON.CONCURRENCY_CONFLICT` / 428 `COMMON.PRECONDITION_REQUIRED` |
| Other-Organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Price history is append-only; corrections create another history row rather than updating an earlier row.
- An explicit base-unit price is permitted only for split-pack medicines and cannot exceed pack price.
- Completed transactions keep their existing price snapshots (BR-G-20).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-050 | Integration | Change price writes current price, append-only history, audit, and outbox atomically | US-03-07-AC1 |
| TS-03-051 | Integration | Large-change confirmation, ETag handling, and newest-first history | US-03-07-AC2 |
| TS-03-052 | Integration | Missing permission and non-wide scope both return 403 without mutation | US-03-07-AC3 |
| TS-03-053 | Integration | Other-Organization price history/update returns 404 (CS-08) | US-03-07-AC4 |
