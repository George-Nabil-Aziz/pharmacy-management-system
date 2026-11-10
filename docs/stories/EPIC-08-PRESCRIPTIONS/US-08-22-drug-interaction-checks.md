# US-08-22: Drug Interaction Checks and Overrides

| Field | Value |
|---|---|
| Story ID | US-08-22 |
| Epic | EPIC-08 |
| Priority | P3 |
| Complexity | L |
| Related Requirements | FR-08-048, FR-08-049, FR-08-050 |
| Related Business Rules | BR-G-16, BR-G-29 |
| Dependencies | US-08-08, US-08-12, US-08-01, REG-09 |

## User Story
As a Pharmacist, I want configured, licensed-source drug-interaction decision support so that I can review alerts and record a reasoned override when authorized.

## Business Value
Adds the SPEC-08 post-MVP capability without weakening pharmacist verification or patient-data safeguards.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-08-048, FR-08-049, FR-08-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

## Acceptance Criteria
### US-08-22-AC1: Successful result
- **Given** Licensed-source contract, alerts and override
- **When** No interaction dataset ships by default. In test only, configured licensed provider returns source name/version and one Major interaction for two active ingredient IDs; provider response within 2 s
- **Then** disabled/unconfigured setting does not call provider; enabled check shows severity/source/version and decision-support disclaimer; Major/Contraindicated blocks verification/dispensing until permissioned 10–500 char reason is audited.

### US-08-22-AC2: Validation and negative case
- **Given** provider timeout >2 s displays Interaction check unavailable and does not block; enabling without provider returns PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED; no invented interaction facts or data
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-08-22-AC3: Permission denied
- **Given** prescriptions.interactions.override lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-08-22-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-08 validation rules for FR-08-048, FR-08-049, FR-08-050; all dispensing quantities are integers in base units.
- OCR output is suggestion-only (BR-G-14); interaction information is decision support only and must come from a configured licensed source (REG-09).

## Authorization Rules
- Require prescriptions.interactions.override.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` or the specific validation code listed in FR-08-048, FR-08-049, FR-08-050 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Any failed sale/dispensing validation rolls back the complete sale operation per BR-G-19.
- No patient clinical text is written to logs; provider test adapters use synthetic data only.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-119 | Integration | Reference behavior and exact values for FR-08-048, FR-08-049, FR-08-050 | US-08-22-AC1 |
| TS-08-120 | Integration | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | US-08-22-AC2 |
| TS-08-121 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-08-22-AC3 |
| TS-08-122 | Security | Cross-organization id returns 404 without data (CS-08) | US-08-22-AC4 |

