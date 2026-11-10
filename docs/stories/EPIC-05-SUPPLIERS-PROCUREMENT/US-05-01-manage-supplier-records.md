# US-05-01: Manage supplier records

| Field | Value |
|---|---|
| Story ID | US-05-01 |
| Epic | EPIC-05 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |
| Related Business Rules | BR-05-001, BR-05-002, BR-05-003, BR-G-16, BR-G-17 |
| Dependencies | SPEC-01 (permissions), SPEC-02 (organization context), SPEC-10 (audit) |

## User Story
As a Branch Manager, I want to create, search, and update supplier records for my organization so that every branch receives and pays goods against one accurate supplier list.

## Business Value
A single, de-duplicated supplier list is the anchor for batch traceability (BR-G-31), payables, and supplier analytics. Without it, receiving in the MVP cannot record where stock came from.

## Preconditions
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

## Acceptance Criteria

### US-05-01-AC1: Create supplier with defaults
- **Given** a user with `procurement.suppliers.manage`
- **When** they POST `/api/v1/suppliers` with English name "Ibn Sina Pharma", no code, tax registration number "200-123-456", payment terms 30 days, and credit limit 250000.00
- **Then** the response is 201 with an auto-generated code in format `SUP-NNNNN`, tax registration number stored as "200123456", status Active, and the supplier is returned by list calls from every branch of the organization
- **And** one audit log entry records the creation with all field values

### US-05-01-AC2: Duplicate code or tax registration number rejected
- **Given** an Inactive supplier with code "IBNSINA" and tax registration number "200123456" exists in the organization
- **When** a user creates another supplier with code "ibnsina" or tax registration number "200 123 456"
- **Then** the response is 409 with `PROCUREMENT.SUPPLIER_CODE_DUPLICATE` or `PROCUREMENT.SUPPLIER_TAX_NUMBER_DUPLICATE` respectively and no supplier is created

### US-05-01-AC3: Update with optimistic concurrency and audit
- **Given** a supplier with ETag "v1"
- **When** user A PUTs a change of payment terms from 30 to 45 with `If-Match: v1`, and then user B PUTs another change with `If-Match: v1`
- **Then** user A receives 200 with a new ETag and an audit entry containing before value 30 and after value 45
- **And** user B receives 412 `COMMON.CONCURRENCY_CONFLICT` and the supplier keeps user A's values

### US-05-01-AC4: Search and filter
- **Given** 3,000 suppliers in the organization, of which 2 have Arabic names containing "المتحدة" and one is Inactive
- **When** a user with `procurement.suppliers.read` calls GET `/api/v1/suppliers?search=المتحدة&status=Active&page=1&pageSize=25`
- **Then** the response contains exactly the 1 Active matching supplier with `totalCount = 1`, and search also matches code, English name, tax registration number, and phone

### US-05-01-AC5: Permission denied and organization isolation
- **Given** a Cashier without `procurement.suppliers.manage`, and a supplier belonging to another organization
- **When** the Cashier POSTs `/api/v1/suppliers`, and a Manager of the first organization GETs `/api/v1/suppliers/{otherOrgSupplierId}`
- **Then** the Cashier receives 403 `COMMON.FORBIDDEN`, the Manager receives 404 `COMMON.NOT_FOUND`, and no data from the other organization is returned

### US-05-01-AC6: Field validation
- **Given** a user with `procurement.suppliers.manage`
- **When** they submit a supplier with neither Arabic nor English name, payment terms 400, and phone "12345"
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with field errors `PROCUREMENT.SUPPLIER_NAME_REQUIRED`, `PROCUREMENT.SUPPLIER_TERMS_INVALID`, and `PROCUREMENT.PHONE_INVALID`

## Validation Rules
VR-05-001, VR-05-002, VR-05-003, VR-05-004, VR-05-005, VR-05-006.

## Authorization Rules
- Create/update: `procurement.suppliers.manage`. List/detail: `procurement.suppliers.read`.
- Supplier endpoints are org-level; organization comes from the token. Other-organization ids return 404.
- Credit limit and outstanding balance fields are omitted from responses for users without `procurement.supplier-ledger.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Duplicate code | 409 `PROCUREMENT.SUPPLIER_CODE_DUPLICATE` |
| Duplicate tax registration number | 409 `PROCUREMENT.SUPPLIER_TAX_NUMBER_DUPLICATE` |
| Tax registration number not 9 digits | 400 `COMMON.VALIDATION_FAILED` / `PROCUREMENT.SUPPLIER_TAX_NUMBER_INVALID` |
| Stale If-Match | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Supplier of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Auto-generated codes are sequential per organization; a manually entered code like `SUP-00010` that collides with the next generated code causes the generator to skip to the next free value.
- Arabic search ignores diacritics (tashkeel) and normalizes alef forms (أ/إ/آ → ا) and taa marbuta/haa.
- Updating the tax registration number to a value used by another supplier returns 409.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-001 | Integration | Create supplier without code; verify generated code, normalized tax number, Active status, audit entry | US-05-01-AC1 |
| TS-05-002 | Integration | Duplicate code (case-insensitive) and duplicate normalized tax number against an Inactive supplier | US-05-01-AC2 |
| TS-05-003 | Integration | Two updates with the same If-Match; second gets 412; audit before/after values | US-05-01-AC3 |
| TS-05-004 | Integration / Performance | Search by Arabic partial name with status filter at 3,000 and 5,000 suppliers; p95 ≤ 300 ms | US-05-01-AC4 |
| TS-05-005 | Security | Cashier create → 403; cross-organization GET/PUT by id → 404 (CS-08); invalid fields → 400 codes | US-05-01-AC5, US-05-01-AC6 |
