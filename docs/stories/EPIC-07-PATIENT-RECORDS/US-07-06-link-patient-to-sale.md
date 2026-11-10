# US-07-06: Link a Patient to a Sale at the POS

| Field | Value |
|---|---|
| Story ID | US-07-06 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |
| Related Business Rules | BR-07-001, BR-07-013, BR-G-11 |
| Dependencies | US-07-01, US-07-02; external: SPEC-06 sale completion |

## User Story
As a cashier, I want to find or quickly create a patient at the POS and attach them to the sale so that the patient's purchases and medication history are recorded.

## Business Value
Linking sales to patients feeds medication history and enables allergy checks without slowing the counter.

## Preconditions
- Cashier has an open cash session (SPEC-06) in branch B.

## Acceptance Criteria
### US-07-06-AC1: Find and link by phone
- **Given** an `Active` patient P with phone "+201012345678"
- **When** the cashier searches "01012345678" at the POS, selects P, and completes the sale
- **Then** the completed sale stores `PatientId` = P and P's purchase history includes the sale

### US-07-06-AC2: Quick-create from POS
- **Given** no patient matches the phone and the cashier has `patients.profiles.manage`
- **When** they POST `/api/v1/patients` with only `fullName` and `mobilePhone`
- **Then** the response is 201 with `id` and `patientCode`, and the POS cart shows the patient as linked without leaving the POS screen

### US-07-06-AC3: Inactive patient cannot be linked
- **Given** patient P is `Inactive`
- **When** a sale referencing P is completed
- **Then** the facade rejects it, the sale fails with 422 `PATIENTS.PATIENT_INACTIVE`, and no sale is persisted

### US-07-06-AC4: Merged patient redirected
- **Given** patient S was merged into T
- **When** a sale referencing S is completed
- **Then** the response is 422 `PATIENTS.PATIENT_MERGED` with `survivingPatientId` = T

### US-07-06-AC5: Quick-create permission denied
- **Given** a cashier whose role lacks `patients.profiles.manage`
- **When** they attempt quick-create
- **Then** the response is 403 `COMMON.FORBIDDEN` and the cashier can still complete the sale without a patient

### US-07-06-AC6: Foreign patient id at sale (CS-08)
- **Given** patient P belongs to organization A
- **When** a cashier of organization B completes a sale with `patientId` = P
- **Then** the response is 404 `PATIENTS.NOT_FOUND` and no sale is persisted

## Validation Rules
VR-07-001, VR-07-002, VR-07-023.

## Authorization Rules
- Search: `patients.profiles.read`; quick-create: `patients.profiles.manage`; linking happens inside SPEC-06 sale completion (`sales.pos.sell`).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Patient `Inactive` | 422 `PATIENTS.PATIENT_INACTIVE` |
| Patient `Merged` | 422 `PATIENTS.PATIENT_MERGED` (+ `survivingPatientId`) |
| Patient `Anonymized` | 422 `PATIENTS.PATIENT_ANONYMIZED` |
| Quick-create invalid phone | 400 `PATIENTS.INVALID_PHONE` |
| Other organization's patient | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Linking is optional; a sale without a patient is valid.
- A completed sale's patient link cannot be changed afterwards (BR-G-11).
- Quick-create retried with the same `Idempotency-Key` returns the same patient.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-040 | E2E | POS search by phone, link, complete sale; purchase history shows sale | US-07-06-AC1 |
| TS-07-041 | E2E | Quick-create with name + phone links patient within POS | US-07-06-AC2 |
| TS-07-042 | Integration | Facade rejects Inactive/Anonymized; sale rolled back (no sale row, no stock movement) | US-07-06-AC3 |
| TS-07-043 | Integration | Merged patient → 422 with surviving id | US-07-06-AC4 |
| TS-07-044 | Security | Quick-create 403; sale without patient still completes | US-07-06-AC5 |
| TS-07-045 | Security | CS-08 foreign patient id → 404, no sale | US-07-06-AC6 |
