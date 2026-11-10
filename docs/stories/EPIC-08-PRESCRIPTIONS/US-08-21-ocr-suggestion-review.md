# US-08-21: Review and Decide OCR Suggestions

| Field | Value |
|---|---|
| Story ID | US-08-21 |
| Epic | EPIC-08 |
| Priority | P3 |
| Complexity | M |
| Related Requirements | FR-08-047 |
| Related Business Rules | BR-G-14, BR-G-16 |
| Dependencies | US-08-20, US-08-04, US-08-08 |

## User Story
As a pharmacy staff member, I want to review OCR suggestions field by field so that only values I explicitly accept or edit are copied into a prescription.

## Business Value
Adds the SPEC-08 post-MVP capability without weakening pharmacist verification or patient-data safeguards.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-08-047 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

## Acceptance Criteria
### US-08-21-AC1: Successful result
- **Given** Explicit OCR field decisions
- **When** Extraction suggests patient name and a free-text medicine; threshold=0.80; one field confidence 0.72, another 0.94
- **Then** low confidence 0.72 highlighted; accepting or editing records per-field decision and copies only chosen value; free-text medicine remains unresolved until pharmacist resolves it; status remains Draft/PendingVerification.

### US-08-21-AC2: Validation and negative case
- **Given** No decision leaves prescription unchanged; OCR cannot set Verified, verify item, or create DispensingRecord (BR-G-14); second decision returns 409 PRESCRIPTIONS.OCR_FIELD_ALREADY_DECIDED
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-08-21-AC3: Permission denied
- **Given** prescriptions.prescriptions.create lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-08-21-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-08 validation rules for FR-08-047; all dispensing quantities are integers in base units.
- OCR output is suggestion-only (BR-G-14); interaction information is decision support only and must come from a configured licensed source (REG-09).

## Authorization Rules
- Require prescriptions.prescriptions.create.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` or the specific validation code listed in FR-08-047 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Any failed sale/dispensing validation rolls back the complete sale operation per BR-G-19.
- No patient clinical text is written to logs; provider test adapters use synthetic data only.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-115 | Integration | Reference behavior and exact values for FR-08-047 | US-08-21-AC1 |
| TS-08-116 | Integration | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | US-08-21-AC2 |
| TS-08-117 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-08-21-AC3 |
| TS-08-118 | Security | Cross-organization id returns 404 without data (CS-08) | US-08-21-AC4 |

