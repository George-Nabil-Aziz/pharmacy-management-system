# US-06-01: POS Medicine Search

| Field | Value |
|---|---|
| Story ID | US-06-01 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-001, FR-06-002, FR-06-003 |
| Related Business Rules | BR-G-07, BR-06-004, BR-06-013 |
| Dependencies | US-03-11, US-03-19, US-04-07 |

## User Story
As a cashier, I want to search medicines by Arabic or English name, active ingredient, or barcode and see price and available stock so that I can add the right item to the cart within seconds.

## Business Value
Search is the entry point of every non-scanned sale; NFR-G-01 latency and accurate stock visibility reduce queue time and prevent promising unavailable items.

## Preconditions
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

## Acceptance Criteria
### US-06-01-AC1: Ranked search results
- **Given** active medicines "Panadol 500mg" (barcode 6221234567890) and "Panadol Extra" and an ingredient "Paracetamol" linked to both
- **When** the user calls `GET /branches/{branchId}/pos/medicines/search?q=pana`
- **Then** the response is 200 with ≤ 20 items, name-prefix matches ranked before ingredient-prefix and contains matches, and a search for `6221234567890` returns "Panadol 500mg" first as an exact barcode match

### US-06-01-AC2: Arabic normalization
- **Given** a medicine with Arabic trade name "أموكسيسيلين"
- **When** the user searches "اموكسي" (without hamza) or "أموكسي"
- **Then** both queries return the medicine

### US-06-01-AC3: Result fields and out-of-stock handling
- **Given** a medicine with resolved pack price 85.5000, PackSize 10, sellable 25 base units, nearest sellable expiry 2027-01-31, and another medicine with 0 sellable units
- **When** the user searches for them
- **Then** the first result shows price 85.50, sellable "2 packs + 5 units", expiry 2027-01-31, Rx-only and controlled flags; the second shows "Out of stock" and the POS add action is disabled

### US-06-01-AC4: Inactive medicines and short queries excluded
- **Given** an inactive medicine matching "zyrt"
- **When** the user searches "zyrt", and separately searches "z"
- **Then** the inactive medicine is not returned; the 1-character query returns 400 `COMMON.VALIDATION_FAILED`

### US-06-01-AC5: In-stock alternatives (P2)
- **Given** a medicine with 0 sellable units and two registered alternatives of which one has sellable stock
- **When** the user opens alternatives for it
- **Then** only the in-stock alternative is listed with price and sellable quantity

### US-06-01-AC6: Permission denied
- **Given** a user without `sales.pos.sell`
- **When** the user calls the search endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-06-01-AC7: Cross-branch and cross-organization isolation
- **Given** a user assigned only to branch A of organization X
- **When** the user searches with branch B's id, and separately searches a term matching only a medicine of organization Y
- **Then** the branch B call returns 403 `COMMON.FORBIDDEN` (CS-07) and the organization Y medicine is never returned (CS-08)

## Validation Rules
- VR-06-001 query length 2–100 after trim; `limit` 1–20 (default 20).

## Authorization Rules
- `sales.pos.sell` + branch assignment; organization from token; quantities shown only for the route branch.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Query shorter than 2 characters | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Unassigned branch | 403 `COMMON.FORBIDDEN` |
| Branch of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Medicine with stock only in expired/quarantined batches shows "Out of stock" (sellable = 0).
- Mixed Arabic/Latin query ("panadol بنادول") matches either language token.
- Reserved quantity (transfers) reduces displayed sellable quantity.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-001 | Integration | Ranking of barcode, name prefix, ingredient, contains; ≤ 20 results | US-06-01-AC1 |
| TS-06-002 | Unit | Arabic normalization variants (أ/إ/آ, ة, ى, diacritics) | US-06-01-AC2 |
| TS-06-003 | Integration | Result fields, sellable split into packs+units, out-of-stock flag; expired-only stock shows 0 | US-06-01-AC3 |
| TS-06-004 | Integration | Inactive excluded; short query 400 | US-06-01-AC4 |
| TS-06-005 | Integration | Alternatives filtered by sellable stock | US-06-01-AC5 |
| TS-06-006 | Security | 403 without permission; 403 other branch; other-org data absent / 404 | US-06-01-AC6, US-06-01-AC7 |
| TS-06-007 | Performance | p95 ≤ 300 ms at 50,000 medicines / 500,000 batches | US-06-01-AC1 |
