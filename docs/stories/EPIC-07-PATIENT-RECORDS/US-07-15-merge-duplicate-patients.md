# US-07-15: Merge Duplicate Patients

| Field | Value |
|---|---|
| Story ID | US-07-15 |
| Epic | EPIC-07 |
| Priority | P2 |
| Complexity | L |
| Related Requirements | FR-07-036, FR-07-037 |
| Related Business Rules | BR-G-16, BR-G-11, BR-07-005, BR-07-013, BR-07-016 |
| Dependencies | US-07-03, US-07-04, US-07-14 |

## User Story
As an owner, I want to merge a duplicate patient into the correct record so that allergies, consents, and history are seen together without altering completed sales.

## Business Value
A single record ensures allergy checks see every recorded allergy.

## Preconditions
- Source S and target T are in the same organization, each `Active` or `Inactive`.

## Acceptance Criteria
### US-07-15-AC1: Merge moves patient-owned records
- **Given** S has 2 allergies, 1 condition, 3 notes, 2 consent events, 1 acknowledgement
- **When** an owner with `patients.profiles.merge` POSTs `/api/v1/patients/{T}/merge` with `sourcePatientId` = S and an `Idempotency-Key`
- **Then** in one transaction those records are re-pointed to T, S gets status `Merged` with `MergedIntoPatientId` = T, T's `allergyStatus` is recomputed, and one audit entry lists moved record counts; sales and prescriptions of S are not modified

### US-07-15-AC2: Histories resolve merged patients
- **Given** the merge in AC1 and S had 2 linked sales
- **When** T's medication history, timeline, or allergy check is requested
- **Then** S's sales and dispensing appear in T's history, and the allergy check uses allergies from both

### US-07-15-AC3: Most restrictive consent
- **Given** T's effective `Notifications` = `Granted` and S's = `Withdrawn`
- **When** they are merged
- **Then** T's effective `Notifications` becomes `Withdrawn` (a system consent event "merge" is appended), and `MedicalDataStorage` is `Granted` only if both were `Granted`

### US-07-15-AC4: Invalid merges rejected
- **Given** S = T, or S is already `Merged`/`Anonymized`
- **When** the merge is requested
- **Then** the response is 400 `PATIENTS.MERGE_SAME_PATIENT` or 409 `PATIENTS.MERGE_NOT_ALLOWED` respectively and nothing changes

### US-07-15-AC5: Idempotent replay (CS-11)
- **Given** a merge completed with key K
- **When** the identical request is retried with K
- **Then** the stored response is replayed and no second audit entry or event is created; the same K with a different body returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`

### US-07-15-AC6: Permission denied
- **Given** a pharmacist without `patients.profiles.merge`
- **When** they request a merge
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-15-AC7: Cross-organization (CS-08)
- **Given** S belongs to organization B
- **When** an owner of organization A merges S into T
- **Then** the response is 404 `PATIENTS.NOT_FOUND` and nothing changes

## Validation Rules
VR-07-024; `Idempotency-Key` required; `reason` 5–500 characters.

## Authorization Rules
- `patients.profiles.merge`; both patients in the token organization.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Same patient | 400 `PATIENTS.MERGE_SAME_PATIENT` |
| Source/target `Merged` or `Anonymized` | 409 `PATIENTS.MERGE_NOT_ALLOWED` |
| Two `Active` allergies to the same ingredient after merge | Allowed; the source allergy is set `Inactive` with reason "Duplicate after merge" |
| Missing `Idempotency-Key` | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- T's demographics are kept; S's differing demographics are listed in the audit entry by field name only and can be edited afterwards on T.
- Unmerge is not supported (OD-07-07).
- Concurrent merges of the same source: one succeeds, the other gets 409 `PATIENTS.MERGE_NOT_ALLOWED` (row lock on both patients ordered by id).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-096 | Integration | Records re-pointed, status Merged, audit counts, no sale/prescription rows modified | US-07-15-AC1 |
| TS-07-097 | Integration | History, timeline, allergy check include source records | US-07-15-AC2 |
| TS-07-098 | Unit | Consent most-restrictive rule matrix (4 combinations × 2 purposes) | US-07-15-AC3 |
| TS-07-099 | Integration | Same/merged/anonymized rejections; duplicate allergy inactivation | US-07-15-AC4 |
| TS-07-100 | Integration | CS-11 replay and key reuse | US-07-15-AC5 |
| TS-07-101 | Concurrency | Two parallel merges of one source → exactly one succeeds | US-07-15-AC4 |
| TS-07-102 | Security | 403 without permission; CS-08 → 404 | US-07-15-AC6, US-07-15-AC7 |
