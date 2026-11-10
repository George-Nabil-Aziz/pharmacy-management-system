# US-07-16: Export a Patient's Data (Data Subject Request)

| Field | Value |
|---|---|
| Story ID | US-07-16 |
| Epic | EPIC-07 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-07-017, FR-07-038 |
| Related Business Rules | BR-G-29, BR-G-16, BR-07-014 |
| Dependencies | US-07-03, US-07-04, US-07-08, US-07-09, US-07-10, US-07-11; external: SPEC-10 background jobs and `FileObject` |

## User Story
As an owner, I want to produce a complete, machine-readable copy of a patient's data when the patient asks for it so that the pharmacy can respond to data subject requests (obligations pending REG-04).

## Business Value
Enables a documented, repeatable response to patient access requests without manual database queries.

## Preconditions
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

## Acceptance Criteria
### US-07-16-AC1: Request export
- **Given** an owner with `patients.data.export`
- **When** they POST `/api/v1/patients/{P}/exports` with an `Idempotency-Key`
- **Then** the response is 202 with `exportId` and `status` "Queued", and an audit entry is written

### US-07-16-AC2: Export content and timing
- **Given** P has ≤ 5,000 history entries
- **When** the job runs
- **Then** within 60 s the export is `Ready`; the UTF-8 JSON contains `demographics`, `consents`, `allergies`, `conditions`, `notes`, `medicationHistory`, `prescriptionLinks`, `allergyAcknowledgements`, `generatedAt`, and `schemaVersion`; it excludes other patients' data, internal user emails, and prescription images; one access-log row with `accessType` "Export" and category "FullExport" is written

### US-07-16-AC3: Download link
- **Given** the export is `Ready`
- **When** the owner GETs `/exports/{exportId}`
- **Then** the response contains a pre-signed URL valid 15 minutes; after expiry the URL returns 403 from storage and a new GET issues a fresh URL

### US-07-16-AC4: Not ready and expired
- **Given** an export in `Queued` status, and another generated 8 days ago
- **When** the owner requests their download URLs
- **Then** the first returns 409 `PATIENTS.EXPORT_NOT_READY` and the second 410 `PATIENTS.EXPORT_EXPIRED` (file deleted after 7 days)

### US-07-16-AC5: Idempotent request (CS-11)
- **Given** an export request with key K succeeded
- **When** it is retried with K
- **Then** the same `exportId` is returned and only one job runs

### US-07-16-AC6: Permission denied
- **Given** a pharmacist without `patients.data.export`
- **When** they request an export
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-16-AC7: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** an owner of organization B requests an export or an export id of A
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
`Idempotency-Key` required on POST.

## Authorization Rules
- `patients.data.export`; downloads require the same permission; URLs issued only after authorization (ADR-006).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Export not ready | 409 `PATIENTS.EXPORT_NOT_READY` |
| Export expired | 410 `PATIENTS.EXPORT_EXPIRED` |
| Job failure | Export `Failed`; GET returns status `Failed`; owner notified (SPEC-10) |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Anonymized patient export contains only retained coded data.
- National ID included only when `CollectNationalId` is ON.
- Export of a target patient includes records of patients merged into it.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-103 | Integration | Request → 202 Queued, audit entry | US-07-16-AC1 |
| TS-07-104 | Integration | Export JSON schema, exclusions, access log `Export`; ≤ 60 s for 5,000 entries (NFR-07-005) | US-07-16-AC2 |
| TS-07-105 | Integration | Pre-signed URL 15-minute validity and re-issue | US-07-16-AC3 |
| TS-07-106 | Integration | Not ready → 409; 7-day cleanup job → 410 | US-07-16-AC4 |
| TS-07-107 | Integration | CS-11 idempotent export request | US-07-16-AC5 |
| TS-07-108 | Security | 403 without permission; CS-08 → 404 | US-07-16-AC6, US-07-16-AC7 |
