# US-08-20: OCR Extraction Suggestions

| Field | Value |
|---|---|
| Story ID | US-08-20 |
| Epic | EPIC-08 |
| Priority | P3 |
| Complexity | L |
| Related Requirements | FR-08-046 |
| Related Business Rules | BR-G-14, BR-G-16 |
| Dependencies | US-08-05, US-08-01, REG-04, REG-10 |

## User Story
As a pharmacy staff member, I want to request OCR extraction from a clean prescription attachment so that field suggestions can support manual data entry.

## Business Value
Adds the SPEC-08 post-MVP capability without weakening pharmacist verification or patient-data safeguards.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-08-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

## Acceptance Criteria
### US-08-20-AC1: Successful result
- **Given** OCR job lifecycle
- **When** OcrEnabled=ON with configured provider; prescription is editable and attachment ScanStatus=Clean; provider completes in 84 s with confidence 0.92
- **Then** request creates Queued OcrExtraction, background worker completes within timeout 120 s, stores provider/version and confidence 0.00–1.00; retry policy is 3 exponential-backoff retries.

### US-08-20-AC2: Validation and negative case
- **Given** OcrEnabled=OFF, attachment not Clean, non-editable prescription, or no provider (422 PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED) creates no extraction
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-08-20-AC3: Permission denied
- **Given** prescriptions.prescriptions.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-08-20-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-08 validation rules for FR-08-046; all dispensing quantities are integers in base units.
- OCR output is suggestion-only (BR-G-14); interaction information is decision support only and must come from a configured licensed source (REG-09).

## Authorization Rules
- Require prescriptions.prescriptions.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` or the specific validation code listed in FR-08-046 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Any failed sale/dispensing validation rolls back the complete sale operation per BR-G-19.
- No patient clinical text is written to logs; provider test adapters use synthetic data only.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-111 | Integration | Reference behavior and exact values for FR-08-046 | US-08-20-AC1 |
| TS-08-112 | Integration | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | US-08-20-AC2 |
| TS-08-113 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-08-20-AC3 |
| TS-08-114 | Security | Cross-organization id returns 404 without data (CS-08) | US-08-20-AC4 |

