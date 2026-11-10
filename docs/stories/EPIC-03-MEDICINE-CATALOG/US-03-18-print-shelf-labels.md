# US-03-18: Print shelf labels

| Field | Value |
|---|---|
| Story ID | US-03-18 |
| Epic | EPIC-03 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-03-040, FR-03-045 |
| Related Business Rules | BR-03-010, BR-03-024, BR-G-23 |
| Dependencies | US-03-06, US-03-08, US-03-12, EPIC-01 Branch authorization |

## User Story
As a Branch Manager, I want to generate printable labels for selected medicines so that shelves show the current product details and effective Branch price.

## Business Value
Accurate labels connect physical shelf stock with the catalog barcode, names, pack information, and current Branch pricing.

## Preconditions
- The caller has `catalog.medicines.read` and access to the requested Branch.
- Selected medicines are Active and have catalog details.

## Acceptance Criteria
### US-03-18-AC1: Generate requested label PDF
- **Given** 1–500 distinct Active medicines with 1–100 copies each and no more than 2,000 labels total
- **When** the caller requests either supported template size
- **Then** a PDF is generated with English/Arabic trade names, strength, dosage form, effective Branch pack price, primary barcode, and print date in the Branch time zone.

### US-03-18-AC2: Choose barcode rendering and effective price
- **Given** a 13-digit numeric primary barcode or another valid barcode and a Branch override
- **When** labels are rendered
- **Then** EAN-13 symbology is used only for 13-digit numeric codes, Code 128 otherwise, and the effective price uses the override when present.

### US-03-18-AC3: Reject invalid scope and excessive labels
- **Given** an out-of-assignment Branch, inactive medicine, or a request exceeding 500 medicines or 2,000 labels
- **When** labels are requested
- **Then** Branch access returns 403 `COMMON.FORBIDDEN`; inactive items or limits return their specified 422 errors and no PDF is issued.

### US-03-18-AC4: Conceal another Organization's Branch or medicine
- **Given** a Branch or medicine id from another Organization
- **When** the caller requests labels
- **Then** the response is 404 with no names, prices, or barcode data disclosed.

## Validation Rules
- Request includes 1–500 distinct Active medicines, 1–100 copies per medicine, and at most 2,000 total labels (VR-03-028).
- Template is 38×25 mm or 50×30 mm.

## Authorization Rules
- Requires `catalog.medicines.read` and Branch assignment or organization-wide scope.
- Cross-branch access returns 403; cross-Organization ids return 404. RLS is enabled and forced from MVP; label generation is Future.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Other Branch or missing read permission | 403 `COMMON.FORBIDDEN` |
| Inactive medicine | 422 `CATALOG.MEDICINE_INACTIVE` |
| Request exceeds limits | 422 `CATALOG.LABEL_LIMIT_EXCEEDED` |
| Other-Organization Branch or medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Print date is calculated using the Branch's configured time zone.
- Effective price follows branch override first and organization default otherwise.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-094 | Integration | Both label sizes include required names, strength, form, price, barcode, and local print date | US-03-18-AC1 |
| TS-03-095 | Integration | EAN-13 vs Code 128 selection and branch effective price | US-03-18-AC2 |
| TS-03-096 | Integration | Other Branch 403, inactive medicine and label count limits | US-03-18-AC3 |
| TS-03-097 | Integration | Foreign Organization identifiers return concealed 404 (CS-08) | US-03-18-AC4 |
