# US-08-05: Upload Prescription Attachments with Malware Scanning

| Field | Value |
|---|---|
| Story ID | US-08-05 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-08-011, FR-08-012, FR-08-014 |
| Related Business Rules | BR-08-016, BR-08-018, BR-G-16 |
| Dependencies | US-08-03, SPEC-10 `FileObject` + object storage (ADR-006), ADR-007 |

## User Story
As a Pharmacist, I want to attach photos or scans of the paper prescription so that the original can be checked at verification and on later visits.

## Business Value
The image is the primary evidence for verification and for controlled-medicine dispensing; storing it privately protects patient data.

## Preconditions
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

## Acceptance Criteria
### US-08-05-AC1: Upload accepted and queued for scan
- **Given** a Draft prescription with 0 attachments and `PrescriptionAttachmentMaxSizeMb = 10`
- **When** a user with `prescriptions.prescriptions.create` uploads a 3 MiB JPEG as `multipart/form-data` to `.../prescriptions/{id}/attachments`
- **Then** the response is 201 with `attachmentId`, `contentType = "image/jpeg"`, `sizeBytes`, `sha256`, `scanStatus = "Pending"`; the object is in a private bucket under a random key; a `FileObject` row and an `AuditLog` entry exist.

### US-08-05-AC2: Scan verdict Clean
- **Given** an attachment with `scanStatus = Pending`
- **When** the scanner returns "clean"
- **Then** `scanStatus = Clean` and `scanCompletedAt` is set within 60 s p95 of upload.

### US-08-05-AC3: Infected file quarantined
- **Given** an uploaded file that the scanner reports as infected (EICAR test file)
- **When** the verdict is received
- **Then** `scanStatus = Infected`, the object is removed from the bucket within 60 s, metadata is kept, the uploader receives a notification, and no access URL can be issued for it.

### US-08-05-AC4: Type detected by signature
- **Given** a file named `rx.jpg` whose content is an executable, and a valid HEIC file named `rx.heic`
- **When** each is uploaded
- **Then** the executable is rejected with 415 `PRESCRIPTIONS.ATTACHMENT_TYPE_NOT_ALLOWED` and the HEIC is accepted with `contentType = "image/heic"`.

### US-08-05-AC5: Size and count limits
- **Given** `PrescriptionAttachmentMaxSizeMb = 10` and `PrescriptionAttachmentMaxCount = 10` with 10 active attachments
- **When** the user uploads an 11 MiB PDF, or an 11th valid file
- **Then** the responses are 413 `PRESCRIPTIONS.ATTACHMENT_TOO_LARGE` and 422 `PRESCRIPTIONS.ATTACHMENT_LIMIT_REACHED`; nothing is stored.

### US-08-05-AC6: Unlink before verification only
- **Given** a PendingVerification prescription with an attachment, and a Verified prescription with an attachment
- **When** the user calls `DELETE .../attachments/{attachmentId}` on each
- **Then** the first returns 204 with `isRemoved = true` and `FileObject` retained; the second returns 409 `PRESCRIPTIONS.ATTACHMENT_LOCKED`.

### US-08-05-AC7: Permission denied and closed statuses
- **Given** a user without `prescriptions.prescriptions.create`, and a `Cancelled` prescription
- **When** the user uploads, and an authorized user uploads to the cancelled prescription
- **Then** the responses are 403 `COMMON.FORBIDDEN` and 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION`.

## Validation Rules
- VR-08-019, VR-08-020, VR-08-021.

## Authorization Rules
- `prescriptions.prescriptions.create` + branch assignment; cross-org prescription id → 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Disallowed type | 415 `PRESCRIPTIONS.ATTACHMENT_TYPE_NOT_ALLOWED` |
| Over size | 413 `PRESCRIPTIONS.ATTACHMENT_TOO_LARGE` |
| Empty (0-byte) file | 415 `PRESCRIPTIONS.ATTACHMENT_TYPE_NOT_ALLOWED` |
| Count limit | 422 `PRESCRIPTIONS.ATTACHMENT_LIMIT_REACHED` |
| Unlink after verification | 409 `PRESCRIPTIONS.ATTACHMENT_LOCKED` |
| Storage unavailable | 503 `PRESCRIPTIONS.PROVIDER_UNAVAILABLE`, no `FileObject` row |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization's prescription | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Scanner gives no verdict within 10 minutes → `ScanFailed` via timeout job; user may re-upload.
- Production deployment without a scanner configured fails the startup health check rather than storing `NotScanned` files.
- Identical file uploaded twice (same SHA-256) is accepted as a separate attachment and shows a duplicate hint.
- Upload to a Verified prescription is allowed (adds evidence) and does not revert verification.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-022 | Integration | Upload JPEG → 201, private key, FileObject, audit, Pending | US-08-05-AC1 |
| TS-08-023 | Integration | Fake scanner returns clean → Clean within SLA | US-08-05-AC2 |
| TS-08-024 | Integration | EICAR → Infected, object removed, notification, no URL | US-08-05-AC3 |
| TS-08-025 | Unit | Signature detection: renamed exe, PNG, PDF, HEIC, zero-byte | US-08-05-AC4 |
| TS-08-026 | Integration | 11 MiB → 413; 11th file → 422 | US-08-05-AC5 |
| TS-08-027 | Integration | Unlink before/after verification | US-08-05-AC6 |
| TS-08-028 | Security | No permission → 403; Cancelled → 409; other org → 404 | US-08-05-AC7 |
