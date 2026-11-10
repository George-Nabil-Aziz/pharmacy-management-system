# US-03-11: Search medicines in Arabic and English

| Field | Value |
|---|---|
| Story ID | US-03-11 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-03-017, FR-03-027, FR-03-028, FR-03-029, FR-03-045 |
| Related Business Rules | BR-03-001, BR-03-024, BR-G-17 |
| Dependencies | US-03-04, US-03-05, US-03-06, US-03-07 |

## User Story
As a Cashier or Pharmacist, I want ranked medicine search to normalize Arabic and English terms and match codes, ingredients, or barcodes so that I can find the intended product quickly.

## Business Value
Normalized, ranked search reduces missed results caused by Arabic spelling variants and keeps POS catalog lookup responsive at the specified scale.

## Preconditions
- Medicines have normalized searchable text generated from names, ingredients, codes, and barcodes.
- The caller holds `catalog.medicines.read`.

## Acceptance Criteria
### US-03-11-AC1: Search all supported fields
- **Given** medicines searchable by English/Arabic trade name, generic name, ingredient, code, or barcode
- **When** the caller submits a valid query
- **Then** results match the supported fields, return no more than `limit` (default 20, maximum 50), and exclude inactive medicines unless `includeInactive = true`.

### US-03-11-AC2: Normalize Arabic and rank deterministically
- **Given** searchable Arabic forms that differ by alef/yaa/taa-marbuta/hamza, tashkeel, tatweel, Arabic-Indic digits, Latin case, or whitespace
- **When** equivalent normalized queries are submitted
- **Then** normalization is identical for stored text and query; exact barcode/code outranks exact name, followed by prefix and trigram tiers with deterministic ties.

### US-03-11-AC3: Meet measurable search and branch targets
- **Given** 50,000 medicines in an Organization
- **When** representative normalized search queries run with an accessible Branch filter
- **Then** server-side p95 latency is at most 300 ms and returned prices reflect the effective Branch price.

### US-03-11-AC4: Deny unauthorized scope and isolate Organizations
- **Given** a caller without read permission, a user assigned to Branch A searching with Branch B, and a caller using a Branch id from another Organization
- **When** they issue search requests
- **Then** missing permission and Branch B return 403 `COMMON.FORBIDDEN` (CS-07), the foreign Branch returns 404, and no foreign data is exposed.

## Validation Rules
- `q` is 1–100 characters; non-exact normalized queries require at least 2 characters; exact code/barcode searches may use one character (VR-03-024).
- `limit` is 1–50; `branchId` must be within caller scope.

## Authorization Rules
- Search requires `catalog.medicines.read`; a supplied branch filter requires access to that Branch.
- Organization is derived from the token; PostgreSQL RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Search query too short | 422 `CATALOG.SEARCH_QUERY_TOO_SHORT` |
| Invalid limit | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission or other Branch | 403 `COMMON.FORBIDDEN` |
| Barcode lookup has no match | 404 `CATALOG.BARCODE_NOT_FOUND` |
| Foreign Organization Branch | 404 `ORG.BRANCH_NOT_FOUND` |

## Edge Cases
- Exact code/barcode lookup can use a one-character query; partial text cannot.
- Ties are ordered by similarity descending, `TradeNameEn` ascending, then `Id`.
- Branch-filtered search does not reveal other Branch prices.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-066 | Integration | Search names, ingredients, codes, barcodes and active/inactive filter | US-03-11-AC1 |
| TS-03-067 | Unit | Arabic, Arabic-Indic digit, Latin case and whitespace normalization plus ranking tiers | US-03-11-AC2 |
| TS-03-068 | Performance | p95 ≤ 300 ms at 50,000 medicines and effective Branch price | US-03-11-AC3 |
| TS-03-069 | Integration | Missing permission and other-Branch query return 403; tenant result set is isolated (CS-07, CS-08) | US-03-11-AC4 |
