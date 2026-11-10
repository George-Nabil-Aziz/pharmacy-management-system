# US-08-19: Prescription Refills

| Field | Value |
|---|---|
| Story ID | US-08-19 |
| Epic | EPIC-08 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-08-045 |
| Related Business Rules | BR-08-001, BR-G-15, BR-G-16 |
| Dependencies | US-08-12, US-08-01 |

## User Story
As a Pharmacist, I want to start an allowed refill on a fully dispensed prescription so that each fill has separately tracked remaining quantities.

## Business Value
Adds the SPEC-08 post-MVP capability without weakening pharmacist verification or patient-data safeguards.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-08-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

## Acceptance Criteria
### US-08-19-AC1: Successful result
- **Given** Refill limits and fill reset
- **When** AllowPrescriptionRefills=ON, Verified prescription expires 2026-12-09, RefillsAllowed=2, RefillsUsed=0, active item prescribed 30 base units and fully dispensed
- **Then** verifier starts refill: status Verified, RefillsUsed=1, CurrentFillNumber=1, remaining resets to 30; audit and history record action.

### US-08-19-AC2: Validation and negative case
- **Given** OFF, non-FullyDispensed, expired, or RefillsUsed=RefillsAllowed (2) is rejected and quantities unchanged
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-08-19-AC3: Permission denied
- **Given** prescriptions.prescriptions.verify lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-08-19-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-08 validation rules for FR-08-045; all dispensing quantities are integers in base units.
- OCR output is suggestion-only (BR-G-14); interaction information is decision support only and must come from a configured licensed source (REG-09).

## Authorization Rules
- Require prescriptions.prescriptions.verify.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` or the specific validation code listed in FR-08-045 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Any failed sale/dispensing validation rolls back the complete sale operation per BR-G-19.
- No patient clinical text is written to logs; provider test adapters use synthetic data only.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-107 | Integration | Reference behavior and exact values for FR-08-045 | US-08-19-AC1 |
| TS-08-108 | Integration | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | US-08-19-AC2 |
| TS-08-109 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-08-19-AC3 |
| TS-08-110 | Security | Cross-organization id returns 404 without data (CS-08) | US-08-19-AC4 |

