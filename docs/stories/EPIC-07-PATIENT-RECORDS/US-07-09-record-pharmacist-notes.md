# US-07-09: Record Restricted Pharmacist Notes

| Field | Value |
|---|---|
| Story ID | US-07-09 |
| Epic | EPIC-07 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-07-011, FR-07-017, FR-07-028 |
| Related Business Rules | BR-G-29, BR-G-25, BR-07-005, BR-07-014 |
| Dependencies | US-07-03, US-07-05 |

## User Story
As a pharmacist, I want to add short, restricted notes to a patient's record and amend them without erasing the original so that colleagues have relevant counselling context with a trustworthy history.

## Business Value
Preserves professional context (for example, "prefers sugar-free syrups") while keeping an immutable trail.

## Preconditions
- Patient `Active`; consent granted when required.

## Acceptance Criteria
### US-07-09-AC1: Add note
- **Given** a pharmacist with `patients.medical.manage` in branch B
- **When** they POST `/api/v1/patients/{P}/notes` with `text` of 300 characters
- **Then** the response is 201 with author, branch B, and timestamp; the audit entry excludes the text

### US-07-09-AC2: Amend note
- **Given** note N exists
- **When** the pharmacist posts a note with `amendsNoteId` = N
- **Then** a new note is stored referencing N, N is unchanged, and the list shows N marked "amended" with the amendment beneath it

### US-07-09-AC3: Notes are immutable
- **Given** note N exists
- **When** any user sends PUT, PATCH, or DELETE to `/notes/{N}`
- **Then** the response is 405 and N is unchanged

### US-07-09-AC4: Length validation
- **Given** a pharmacist with `patients.medical.manage`
- **When** they post a note of 2,001 characters, or an amendment referencing another patient's note
- **Then** the response is 400 `PATIENTS.INVALID_NOTE`

### US-07-09-AC5: Restricted read, logged
- **Given** a cashier without `patients.medical.read`
- **When** they GET `/notes`
- **Then** the response is 403 `COMMON.FORBIDDEN`; a pharmacist's successful GET writes one access-log row with category "Notes"

### US-07-09-AC6: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a pharmacist of organization B posts or reads notes for P
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
VR-07-017, VR-07-020, VR-07-023.

## Authorization Rules
- Read: `patients.medical.read` (logged). Write: `patients.medical.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Text empty or > 2,000 characters | 400 `PATIENTS.INVALID_NOTE` |
| No consent | 422 `PATIENTS.CONSENT_REQUIRED` |
| Edit/delete attempt | 405 |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Amendment of an amendment is allowed; the chain is displayed in order.
- Notes are cleared of text on anonymization (US-07-17) but rows remain.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-064 | Integration | Add note; audit excludes text | US-07-09-AC1 |
| TS-07-065 | Integration | Amendment chain, original unchanged | US-07-09-AC2 |
| TS-07-066 | Integration | PUT/PATCH/DELETE → 405 | US-07-09-AC3 |
| TS-07-067 | Unit | Length and same-patient amendment validation | US-07-09-AC4 |
| TS-07-068 | Security | 403 for cashier; logged read; CS-08 → 404 | US-07-09-AC5, US-07-09-AC6 |
