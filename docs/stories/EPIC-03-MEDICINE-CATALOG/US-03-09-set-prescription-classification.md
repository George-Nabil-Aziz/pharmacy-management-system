# US-03-09: Set and change prescription classification

| Field | Value |
|---|---|
| Story ID | US-03-09 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-03-024, FR-03-025, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-008, BR-03-011, BR-03-012, BR-03-023, BR-03-024, BR-G-20, BR-G-21, BR-G-22 |
| Dependencies | US-03-04, US-03-12, EPIC-01 permission catalog |

## User Story
As an authorized Pharmacist, I want to assign and change a medicine's prescription class with a reason so that downstream dispensing workflows receive the configured classification.

## Business Value
Explicit classification supports downstream policy decisions without implying regulatory approval or therapeutic advice.

## Preconditions
- The medicine exists and is visible in the caller's Organization.
- The actor holds `catalog.medicines.classify` to set a class other than the default `PrescriptionOnly`.

## Acceptance Criteria
### US-03-09-AC1: Use default classification at creation
- **Given** a creator with `catalog.medicines.create` but without `catalog.medicines.classify`
- **When** they create a medicine without a class
- **Then** it is stored as `PrescriptionOnly`; explicitly requesting `OTC` or `Controlled` returns 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED`.

### US-03-09-AC2: Change classification through dedicated operation
- **Given** a user with `catalog.medicines.classify` and a valid reason
- **When** they update classification using the dedicated endpoint
- **Then** the response returns the new class and ETag, with old/new audit values and a `MedicineClassificationChanged` outbox event in the same transaction.

### US-03-09-AC3: Reject generic-update classification changes
- **Given** a medicine with an existing class
- **When** a user changes `PrescriptionClass` through the general medicine update endpoint
- **Then** the response is 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT` and the class remains unchanged.

### US-03-09-AC4: Deny unauthorized and foreign-resource classification
- **Given** a caller without classify permission or a medicine from another Organization
- **When** they request a classification change
- **Then** the first request returns 403 `COMMON.FORBIDDEN`, the foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no change is made.

## Validation Rules
- `PrescriptionClass` is `OTC`, `PrescriptionOnly`, or `Controlled` (VR-03-007).
- Reason is required and 3–200 characters (VR-03-018); updates require `If-Match`.

## Authorization Rules
- Changes require `catalog.medicines.classify`; creation with non-default classification requires both create and classify permissions.
- Organization context is token-derived; cross-Organization resources return 404. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid classification enum | 400 `COMMON.VALIDATION_FAILED` |
| Create non-default class without permission | 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED` |
| Change via general update endpoint | 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT` |
| Missing classification permission | 403 `COMMON.FORBIDDEN` |
| Other-Organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |
| Missing or stale ETag | 428 `COMMON.PRECONDITION_REQUIRED` / 412 `COMMON.CONCURRENCY_CONFLICT` |

## Edge Cases
- Class changes apply to future transactions; existing sale and dispensing snapshots are unchanged.
- Classification records the configured class only; clinical and legal interpretation remains subject to REG-01 and REG-02.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-058 | Integration | Default and non-default classification creation permissions | US-03-09-AC1 |
| TS-03-059 | Integration | Dedicated change writes audit and outbox atomically | US-03-09-AC2 |
| TS-03-060 | Integration | General update rejects class change with 422 | US-03-09-AC3 |
| TS-03-061 | Integration | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | US-03-09-AC4 |
