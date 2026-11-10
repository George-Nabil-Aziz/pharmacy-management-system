# US-08-06: View Prescription Attachments via Pre-signed URL

| Field | Value |
|---|---|
| Story ID | US-08-06 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-08-013 |
| Related Business Rules | BR-08-018, BR-08-020, BR-G-29 |
| Dependencies | US-08-05, SPEC-07 `PatientAccessLog` |

## User Story
As a Pharmacist, I want to open a prescription image securely so that I can compare it with the registered items without the image being publicly reachable.

## Business Value
Enables verification against the original while keeping patient health data private and access-logged.

## Preconditions
- Attachment exists with a scan verdict.

## Acceptance Criteria
### US-08-06-AC1: URL issued for clean attachment
- **Given** an attachment with `scanStatus = Clean` on a prescription with a patient
- **When** a user with `prescriptions.prescriptions.read` assigned to the branch calls `POST .../attachments/{attachmentId}/access-url`
- **Then** the response is 200 with `{ "url": "...", "expiresAt": "<now + 300 s>" }`, the URL returns the object with `Content-Disposition: inline` and `Cache-Control: no-store`, and one `AuditLog` entry and one `PatientAccessLog` entry are written.

### US-08-06-AC2: URL expires
- **Given** a URL issued at T
- **When** the URL is requested at T + 301 s
- **Then** the storage service rejects the request (HTTP 403 from storage) and no content is returned.

### US-08-06-AC3: Not available while pending or infected
- **Given** attachments with `scanStatus` `Pending`, `Infected`, and `ScanFailed`
- **When** the user requests an access URL for each
- **Then** each response is 409 `PRESCRIPTIONS.ATTACHMENT_NOT_AVAILABLE` and no URL is generated.

### US-08-06-AC4: Permission and branch denied
- **Given** a Cashier without `prescriptions.prescriptions.read`, and a Pharmacist assigned only to branch A
- **When** the Cashier requests a URL in branch A, and the Pharmacist requests a URL for an attachment in branch B
- **Then** both responses are 403 `COMMON.FORBIDDEN` (CS-07) and no access log is written.

### US-08-06-AC5: Cross-organization
- **Given** an attachment id of another organization
- **When** a user requests an access URL
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND` (CS-08).

## Validation Rules
- Attachment belongs to the prescription in the route, and the prescription to the route branch.

## Authorization Rules
- `prescriptions.prescriptions.read` + branch assignment; `PLATFORM_ADMIN` denied even with a support grant (SPEC-08 §11).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Scan not Clean | 409 `PRESCRIPTIONS.ATTACHMENT_NOT_AVAILABLE` |
| Removed attachment (`isRemoved = true`) | 404 `PRESCRIPTIONS.NOT_FOUND` for users without `audit.logs.read` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- `NotScanned` attachments are viewable only in non-Production environments.
- Prescription without patient: only `AuditLog` is written.
- PDF attachments open in the browser's PDF viewer; HEIC preview depends on browser support (OD-08-04).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-029 | Integration | Issue URL; headers; audit + access log rows | US-08-06-AC1 |
| TS-08-030 | Integration | MinIO URL rejected after 300 s | US-08-06-AC2 |
| TS-08-031 | Integration | Pending/Infected/ScanFailed → 409 | US-08-06-AC3 |
| TS-08-032 | Security | Cashier → 403; unassigned branch → 403 (CS-07) | US-08-06-AC4 |
| TS-08-033 | Security | Other org attachment → 404 (CS-08) | US-08-06-AC5 |
