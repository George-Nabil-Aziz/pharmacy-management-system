# US-08-01: Prescription Settings

| Field | Value |
|---|---|
| Story ID | US-08-01 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-08-001, FR-08-002, FR-08-003 |
| Related Business Rules | BR-08-003, BR-08-021, BR-G-16 |
| Dependencies | SPEC-10 settings framework, SPEC-02 `OrganizationSettings` |

## User Story
As an Owner, I want to configure prescription validity, attachment limits, and prescription feature toggles so that the prescription workflow matches my organization's policy pending regulatory confirmation.

## Business Value
Validity, attachment rules, and optional features (substitution, refills, OCR, interactions) depend on regulatory outcomes (REG-01, REG-08, REG-09, REG-10). Settings with conservative defaults let the organization adapt without code changes.

## Preconditions
- Organization exists with `OrganizationSettings`.
- Caller is authenticated.

## Acceptance Criteria
### US-08-01-AC1: Defaults are applied
- **Given** a newly created organization
- **When** a user with `prescriptions.prescriptions.read` calls `GET /api/v1/settings/prescriptions`
- **Then** the response is 200 with `prescriptionValidityDays = 30`, `prescriptionAttachmentMaxSizeMb = 10`, `prescriptionAttachmentMaxCount = 10`, `requireAttachmentForVerification = false`, `allowGenericSubstitution = false`, `requireConsentForSubstitution = true`, `allowPrescriptionRefills = false`, `ocrEnabled = false`, `ocrLowConfidenceThreshold = 0.80`, `drugInteractionChecksEnabled = false`, and an `ETag` header.

### US-08-01-AC2: Owner updates settings and change is audited
- **Given** an Owner holding `settings.organization.manage` and the current `ETag`
- **When** the Owner sets `prescriptionValidityDays = 14` via `PUT /api/v1/settings/prescriptions` with `If-Match`
- **Then** the response is 200, new prescriptions get `ValidityDays = 14`, prescriptions created earlier keep their snapshotted value, and an `AuditLog` entry records old value 30 and new value 14.

### US-08-01-AC3: Out-of-range values rejected
- **Given** an Owner
- **When** the Owner submits `prescriptionValidityDays = 0`, `prescriptionAttachmentMaxSizeMb = 25`, or `ocrLowConfidenceThreshold = 0.30`
- **Then** the response is 422 `PRESCRIPTIONS.SETTING_OUT_OF_RANGE` with the offending field in `errors`, and no setting changes.

### US-08-01-AC4: Provider-dependent toggles blocked without provider
- **Given** the deployment has no OCR provider and no drug interaction source configured
- **When** the Owner sets `ocrEnabled = true` or `drugInteractionChecksEnabled = true`
- **Then** the response is 422 `PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED` and the toggle remains `false`.

### US-08-01-AC5: Permission denied
- **Given** a Pharmacist without `settings.organization.manage`
- **When** the Pharmacist calls `PUT /api/v1/settings/prescriptions`
- **Then** the response is 403 `COMMON.FORBIDDEN` and no audit entry for a change is written.

## Validation Rules
- VR-08-001, VR-08-002, VR-08-003, VR-08-004, VR-08-012 (`If-Match`).

## Authorization Rules
- Read: `prescriptions.prescriptions.read`; update: `settings.organization.manage`. Organization taken from the token.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Value out of range | 422 `PRESCRIPTIONS.SETTING_OUT_OF_RANGE` |
| Enable OCR/interactions without provider | 422 `PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED` |
| Stale `If-Match` | 412 `PRESCRIPTIONS.VERSION_MISMATCH` |
| Missing permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Reducing `PrescriptionAttachmentMaxCount` below the count on an existing prescription does not remove attachments; it blocks further uploads to that prescription.
- Disabling `AllowPrescriptionRefills` blocks new refill starts; refills already started remain dispensable.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-001 | Integration | Fresh organization returns all default values and ETag | US-08-01-AC1 |
| TS-08-002 | Integration | Update validity to 14; new prescription snapshots 14, old keeps 30; audit old/new values | US-08-01-AC2 |
| TS-08-003 | Unit | Boundary values 0/1/365/366, size 0/1/20/21, threshold 0.49/0.50/0.99/1.00 | US-08-01-AC3 |
| TS-08-004 | Integration | Enable OCR/interactions without provider → 422; Pharmacist PUT → 403 | US-08-01-AC4, US-08-01-AC5 |
