# US-08-03: Register a Draft Prescription

| Field | Value |
|---|---|
| Story ID | US-08-03 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |
| Related Business Rules | BR-08-001, BR-08-003, BR-08-011, BR-G-16, BR-G-23 |
| Dependencies | US-08-01, US-08-02, SPEC-07 patient lookup |

## User Story
As a Pharmacist, I want to register a prescription with its patient, prescriber, and date in my branch so that it can be verified and dispensed.

## Business Value
Creates the traceable record that every later verification and dispensing step references (BRQ-09).

## Preconditions
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

## Acceptance Criteria
### US-08-03-AC1: Create draft with number and expiry
- **Given** branch `CAI01` with business date 2026-11-09 and `PrescriptionValidityDays = 30`
- **When** a user with `prescriptions.prescriptions.create` posts `{ "patientId": null, "prescriberId": "<active>", "prescriptionDate": "2026-11-05" }` to `/api/v1/branches/{branchId}/prescriptions`
- **Then** the response is 201 with `status = "Draft"`, `number` matching `CAI01-RX-2026-\d{6}`, `validityDays = 30`, `expiresOn = "2026-12-05"`, an `ETag`, a status history row `null → Draft`, and an `AuditLog` entry.

### US-08-03-AC2: Inline prescriber
- **Given** no existing prescriber record for the doctor
- **When** the user posts the prescription with `"prescriber": { "fullName": "Dr. Mona Adel", "phone": "0223456789" }` instead of `prescriberId`
- **Then** a `Prescriber` is created in the same transaction and linked, and the prescription stores `prescriberNameSnapshot = "Dr. Mona Adel"`.

### US-08-03-AC3: Future or already-expired date rejected
- **Given** business date 2026-11-09 and validity 30 days
- **When** the user submits `prescriptionDate = "2026-11-10"` or `prescriptionDate = "2026-10-09"`
- **Then** the response is 422 with `PRESCRIPTIONS.DATE_IN_FUTURE` or `PRESCRIPTIONS.ALREADY_EXPIRED` respectively, and no prescription or number is created.

### US-08-03-AC4: Edit Verified prescription reverts to PendingVerification
- **Given** a `Verified` prescription with no dispensing records
- **When** the user patches `notes` with a valid `If-Match`
- **Then** the response is 200, `status = "PendingVerification"`, `verifiedBy`/`verifiedAt` are cleared, and history records `Verified → PendingVerification` with reason `Edited after verification`.

### US-08-03-AC5: Edit after dispensing rejected
- **Given** a `PartiallyDispensed` prescription
- **When** the user patches any header field
- **Then** the response is 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING` and nothing changes.

### US-08-03-AC6: Permission denied and cross-branch
- **Given** an Accountant without `prescriptions.prescriptions.create`, and a Pharmacist assigned only to branch A
- **When** the Accountant posts to branch A, and the Pharmacist posts to branch B
- **Then** both responses are 403 `COMMON.FORBIDDEN` (CS-07).

### US-08-03-AC7: Cross-organization patient
- **Given** a patient id belonging to another organization
- **When** the user creates a prescription with that `patientId`
- **Then** the response is 422 `PRESCRIPTIONS.PATIENT_INVALID` and the response does not reveal whether the patient exists elsewhere.

## Validation Rules
- VR-08-007, VR-08-008, VR-08-009, VR-08-010, VR-08-011, VR-08-012.

## Authorization Rules
- `prescriptions.prescriptions.create` and branch assignment; organization from token. Reading created prescription requires `prescriptions.prescriptions.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Future date | 422 `PRESCRIPTIONS.DATE_IN_FUTURE` |
| Date older than validity | 422 `PRESCRIPTIONS.ALREADY_EXPIRED` |
| Inactive/unknown prescriber | 422 `PRESCRIPTIONS.PRESCRIBER_INVALID` |
| Unknown/other-org patient | 422 `PRESCRIPTIONS.PATIENT_INVALID` |
| Edit after dispensing | 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING` |
| Edit in `Cancelled`/`Expired` | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |
| Stale ETag | 412 `PRESCRIPTIONS.VERSION_MISMATCH` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Prescription date equal to business date − validity days is accepted (valid through `ExpiresOn` inclusive, which equals the business date).
- Business date is computed in the branch time zone (default `Africa/Cairo`); a request at 23:59 local on 2026-11-09 uses 2026-11-09.
- Retry with the same `Idempotency-Key` returns the same prescription and does not consume a second number.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-010 | Integration | Create draft; number format, expiresOn, history, audit | US-08-03-AC1 |
| TS-08-011 | Integration | Inline prescriber created atomically; rollback if prescription invalid | US-08-03-AC2 |
| TS-08-012 | Unit | Date boundaries: business date +1, −30 (accepted), −31 (rejected) | US-08-03-AC3 |
| TS-08-013 | Integration | Edit Verified → PendingVerification; edit PartiallyDispensed → 409 | US-08-03-AC4, US-08-03-AC5 |
| TS-08-014 | Security | Accountant → 403; Pharmacist on unassigned branch → 403 (CS-07) | US-08-03-AC6 |
| TS-08-015 | Security | Other-org patient id → 422 without existence leak (CS-08) | US-08-03-AC7 |
