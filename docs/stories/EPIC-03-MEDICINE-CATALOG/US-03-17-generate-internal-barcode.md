# US-03-17: Generate an internal barcode

| Field | Value |
|---|---|
| Story ID | US-03-17 |
| Epic | EPIC-03 |
| Priority | P2 |
| Complexity | S |
| Related Requirements | FR-03-039, FR-03-045 |
| Related Business Rules | BR-03-004, BR-03-020, BR-03-024 |
| Dependencies | US-03-06, EPIC-01 permission catalog, organization barcode settings |

## User Story
As a catalog administrator, I want to generate a unique internal EAN-13 code for a medicine so that products without a supplier barcode can be identified within my Organization.

## Business Value
An organization-scoped sequence supplies consistent internal identifiers without confusing them with externally assigned GTIN values.

## Preconditions
- The medicine has fewer than 10 barcodes.
- `InternalBarcodePrefix` is configured as a two-digit prefix from 20 through 29.
- The caller holds `catalog.medicines.update`.

## Acceptance Criteria
### US-03-17-AC1: Generate and store internal EAN-13
- **Given** an eligible medicine and configured prefix
- **When** the caller requests barcode generation
- **Then** the service allocates the next 10-digit organization sequence, appends the mod-10 check digit, and stores the barcode with `Format = Internal` and `Source = Generated`.

### US-03-17-AC2: Preserve uniqueness under concurrent generation
- **Given** two authorized requests generate barcodes concurrently
- **When** both are committed
- **Then** each receives a distinct code unique within the Organization.

### US-03-17-AC3: Reject exhausted sequence or invalid setup
- **Given** the sequence has reached 9,999,999,999, an invalid prefix, or the medicine already has 10 barcodes
- **When** the caller requests another barcode
- **Then** the request fails without partial persistence.

### US-03-17-AC4: Deny missing permission and foreign medicine access
- **Given** a caller without `catalog.medicines.update` or a medicine from another Organization
- **When** they request generation
- **Then** missing permission returns 403 `COMMON.FORBIDDEN`, foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no code is allocated.

## Validation Rules
- Prefix is exactly two digits from 20 to 29; sequence has exactly 10 digits; check digit uses mod-10 (VR-03-029).
- Maximum is 10 barcodes per medicine (VR-03-014).

## Authorization Rules
- Generation requires `catalog.medicines.update`; code allocation is scoped to the token Organization.
- RLS is enabled and forced from MVP; generation itself is a Future capability.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Sequence exhausted | 409 `CATALOG.BARCODE_SEQUENCE_EXHAUSTED` |
| Invalid prefix | 400 `COMMON.VALIDATION_FAILED` |
| Barcode limit reached | 422 `CATALOG.BARCODE_LIMIT_EXCEEDED` |
| Other-Organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Generated internal codes are stored as `Internal`, never as `Gtin`.
- The sequence is organization-scoped and allocation is serialized to prevent duplicates.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-090 | Integration | Prefix, sequence, check digit, Format, and Source are correct | US-03-17-AC1 |
| TS-03-091 | Concurrency | Parallel generation creates distinct organization-unique codes | US-03-17-AC2 |
| TS-03-092 | Integration | Sequence exhaustion, invalid prefix, and barcode limit are rejected | US-03-17-AC3 |
| TS-03-093 | Integration | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | US-03-17-AC4 |
