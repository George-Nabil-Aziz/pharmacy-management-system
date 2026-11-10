# US-07-14: Detect Duplicate Patients

| Field | Value |
|---|---|
| Story ID | US-07-14 |
| Epic | EPIC-07 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-07-035 |
| Related Business Rules | BR-07-002 |
| Dependencies | US-07-01, US-07-02 |

## User Story
As a pharmacist, I want to be warned when a new patient looks like an existing one, and as an owner I want a list of likely duplicates, so that each patient's allergies and history live in one record.

## Business Value
Split records hide allergies from the allergy check; detection reduces that risk.

## Preconditions
- Normalized phone and name keys exist (US-07-01, US-07-02).

## Acceptance Criteria
### US-07-14-AC1: Same phone warning
- **Given** patient P with phone "+201012345678"
- **When** a user creates another patient with phone "01012345678" without `confirmNotDuplicate`
- **Then** the response is 409 `PATIENTS.POSSIBLE_DUPLICATE` with `candidates` containing P's id, code, name, masked phone, and age only, and no patient is created

### US-07-14-AC2: Confirm not duplicate
- **Given** the warning in AC1 (e.g., a family member sharing the phone)
- **When** the user resubmits with `confirmNotDuplicate = true`
- **Then** the response is 201 and the audit entry records that the duplicate warning was overridden

### US-07-14-AC3: Same normalized name and birth year
- **Given** patient "فاطمة السيد", birth year 1975, phone A
- **When** "فاطمه السيد", birth year 1975, phone B is created
- **Then** the response is 409 `PATIENTS.POSSIBLE_DUPLICATE`

### US-07-14-AC4: Organization-wide candidate list
- **Given** an owner with `patients.profiles.merge`
- **When** they GET `/api/v1/patients/duplicate-candidates?page=1`
- **Then** candidate pairs are returned with match reason (`SamePhone`, `SameNameAndBirthYear`) and masked fields only, excluding `Merged` and `Anonymized` patients

### US-07-14-AC5: Permission denied
- **Given** a pharmacist without `patients.profiles.merge`
- **When** they GET the candidate list
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-14-AC6: Organization isolation (CS-08)
- **Given** organization B has a patient with the same phone
- **When** a user in organization A creates a patient with that phone
- **Then** no warning references the organization B patient and the patient is created (201) if no organization A candidate exists

## Validation Rules
`confirmNotDuplicate` boolean; candidate list `pageSize` ≤ 100.

## Authorization Rules
- Warning on create: `patients.profiles.manage`. Candidate list: `patients.profiles.merge`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Candidates found | 409 `PATIENTS.POSSIBLE_DUPLICATE` |
| Missing permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Patients with `YearOnly` and `Exact` birth dates compare by year.
- Patients without birth data are compared by phone only.
- Candidate pair (P, Q) listed once, not as (Q, P).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-091 | Integration | Same phone → 409 with masked candidates; no row created | US-07-14-AC1 |
| TS-07-092 | Integration | Confirm override → 201, audit flag | US-07-14-AC2 |
| TS-07-093 | Integration | Normalized name + birth year match | US-07-14-AC3 |
| TS-07-094 | Integration | Candidate list reasons, exclusions, de-duplicated pairs | US-07-14-AC4 |
| TS-07-095 | Security | 403 without merge permission; CS-08 no foreign candidates | US-07-14-AC5, US-07-14-AC6 |
