# US-07-02: Search Patients by Phone, Name, and Code

| Field | Value |
|---|---|
| Story ID | US-07-02 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |
| Related Business Rules | BR-07-001, BR-07-002, BR-07-003 |
| Dependencies | US-07-01 |

## User Story
As a cashier or pharmacist, I want to find a patient by phone, Arabic or English name, or patient code so that I can identify the right patient within seconds without seeing data I do not need.

## Business Value
Fast, privacy-preserving lookup reduces duplicate profiles and keeps medical data out of lists.

## Preconditions
- Patients exist in the organization (US-07-01).

## Acceptance Criteria
### US-07-02-AC1: Search by full phone in any accepted format
- **Given** patient P with phone "+201012345678"
- **When** a user with `patients.profiles.read` GETs `/api/v1/patients?phone=00201012345678`
- **Then** P is returned, together with every other patient sharing that number

### US-07-02-AC2: Search by phone suffix
- **Given** patients with phones ending "345678" and others not
- **When** the user searches `phone=345678`
- **Then** only patients whose phone ends with "345678" are returned

### US-07-02-AC3: Arabic name normalization
- **Given** patient "أحمد مُصطفى عليّ"
- **When** the user searches `q=احمد مصطفي` or `q=مصطفى أَحمد`
- **Then** the patient is returned in both cases

### US-07-02-AC4: Search by patient code
- **Given** patient code "PAT-000123"
- **When** the user searches `code=pat-000123`
- **Then** exactly that patient is returned

### US-07-02-AC5: List results are masked
- **Given** any successful search
- **When** results are returned
- **Then** each item contains only `id`, `patientCode`, `fullName`, `maskedPhone` (e.g., "•••••••5678"), `ageYears`, `status`; no email, address, date of birth, national ID, allergy status, or other medical data; and no `PatientAccessLog` entry is written

### US-07-02-AC6: Search term too short
- **Given** a user with `patients.profiles.read`
- **When** they search `q=أ` or `phone=1234`
- **Then** the response is 400 `PATIENTS.SEARCH_TERM_TOO_SHORT`

### US-07-02-AC7: Inactive, merged, anonymized handling
- **Given** an `Inactive` patient and a `Merged` patient matching the query
- **When** the user searches without `includeInactive`
- **Then** neither is returned; with `includeInactive=true` the `Inactive` patient is returned and `Merged`/`Anonymized` patients are never returned

### US-07-02-AC8: Permission denied
- **Given** an `ACCOUNTANT` user without `patients.profiles.read`
- **When** they call the search endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-02-AC9: Organization isolation (CS-08)
- **Given** organization B has a patient with phone "+201012345678"
- **When** a user of organization A searches that phone
- **Then** no organization B patient appears in results

## Validation Rules
VR-07-009; pagination `pageSize` ≤ 100 (default 25).

## Authorization Rules
- `patients.profiles.read`; results filtered by token organization. Rate limit 60 searches/minute/user.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No search parameter | 400 `PATIENTS.SEARCH_TERM_TOO_SHORT` |
| `pageSize` = 500 | 400 `COMMON.VALIDATION_FAILED` |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Query mixing Latin and Arabic tokens: each token matched independently.
- Taa marbuta and haa ("فاطمة" vs "فاطمه") match.
- Phone search value "+44 20 7946 0958" normalized as international number.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-009 | Integration | Phone exact match across 4 input formats returns all patients sharing the number | US-07-02-AC1 |
| TS-07-010 | Integration | Suffix search 6–10 digits returns only suffix matches | US-07-02-AC2 |
| TS-07-011 | Unit | Arabic normalization corpus (≥ 200 pairs, NFR-07-004) | US-07-02-AC3 |
| TS-07-012 | Integration | Code search case-insensitive exact | US-07-02-AC4 |
| TS-07-013 | Contract | Search response schema contains only allowed fields; no access-log row created | US-07-02-AC5 |
| TS-07-014 | Integration | Too-short terms → 400 | US-07-02-AC6 |
| TS-07-015 | Integration | Status filtering for Inactive/Merged/Anonymized | US-07-02-AC7 |
| TS-07-016 | Security | 403 without permission; CS-08 no foreign-org results | US-07-02-AC8, US-07-02-AC9 |
| TS-07-017 | Performance | p95 ≤ 300 ms at 500,000 patients (NFR-07-001) | US-07-02-AC1, US-07-02-AC3 |
