# US-07-12: Patient Interaction Timeline

| Field | Value |
|---|---|
| Story ID | US-07-12 |
| Epic | EPIC-07 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-07-017, FR-07-032 |
| Related Business Rules | BR-G-29, BR-07-003 |
| Dependencies | US-07-03, US-07-04, US-07-08, US-07-09, US-07-10, US-07-11 |

## User Story
As a pharmacist, I want a single chronological timeline of a patient's interactions with the pharmacy so that I can understand recent events at a glance.

## Business Value
Reduces navigation across tabs while respecting the demographic/medical permission split.

## Preconditions
- Patient has events from at least two sources.

## Acceptance Criteria
### US-07-12-AC1: Merged chronological timeline
- **Given** P has a profile update, a consent grant, an allergy recorded, a sale, and a dispensing event
- **When** a pharmacist with `patients.profiles.read` and `patients.medical.read` GETs `/api/v1/patients/{P}/timeline?limit=20`
- **Then** all events are returned newest first with type, timestamp, branch, user, and a link target, with a `nextCursor` when more exist, and one access-log row with category "Timeline" is written

### US-07-12-AC2: Medical events omitted without medical permission
- **Given** a cashier with `patients.profiles.read` only
- **When** they request the timeline
- **Then** only `ProfileCreated`, `ProfileUpdated`, `ConsentChanged`, and `Sale` events are returned (sale events without lines) and no access-log row is written

### US-07-12-AC3: Type filter
- **Given** the pharmacist requests `types=AllergyRecorded,AllergyAlertAcknowledged`
- **When** the timeline is returned
- **Then** only those event types appear

### US-07-12-AC4: Invalid type rejected
- **Given** any user with access
- **When** they request `types=Diagnosis`
- **Then** the response is 400 `COMMON.VALIDATION_FAILED`

### US-07-12-AC5: Permission denied
- **Given** a user without `patients.profiles.read`
- **When** they request the timeline
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-12-AC6: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B requests P's timeline
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
`limit` 1–100 (default 20); `types` from: `ProfileCreated`, `ProfileUpdated`, `ConsentChanged`, `AllergyRecorded`, `AllergyStatusChanged`, `ConditionRecorded`, `ConditionStatusChanged`, `NoteAdded`, `Sale`, `PrescriptionRegistered`, `Dispensing`, `AllergyAlertAcknowledged`, `PatientMerged`.

## Authorization Rules
- `patients.profiles.read`; medical event types additionally require `patients.medical.read` and are logged. `Sale` events limited to assigned branches as in FR-07-030.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unknown type | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Access-log failure (medical events requested) | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Events with identical timestamps ordered by event id for stable cursors.
- Events from a merged source patient appear with a "merged from PAT-xxxxxx" label.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-079 | Integration | Timeline merge order, cursor stability, logged | US-07-12-AC1 |
| TS-07-080 | Security | Profiles-only user sees non-medical events only; no log row | US-07-12-AC2 |
| TS-07-081 | Integration | Type filter | US-07-12-AC3 |
| TS-07-082 | Integration | Invalid type → 400 | US-07-12-AC4 |
| TS-07-083 | Security | 403 without permission; CS-08 → 404 | US-07-12-AC5, US-07-12-AC6 |
