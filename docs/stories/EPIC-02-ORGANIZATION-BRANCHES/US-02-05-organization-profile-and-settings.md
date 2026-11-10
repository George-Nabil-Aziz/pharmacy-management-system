# US-02-05: View and Update Organization Profile and Settings

| Field | Value |
|---|---|
| Story ID | US-02-05 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-02-011, FR-02-012 |
| Related Business Rules | BR-02-018, BR-02-019 |
| Dependencies | US-02-04 |

## User Story
As an Owner, I want to maintain my organization's legal and contact details and organization-wide settings so that documents and defaults reflect my business.

## Business Value
Legal name, tax registration number, and contact data feed printed documents (SPEC-06) and future e-invoicing (REG-07).

## Preconditions
- Organization is `Active`; caller is an organization user.

## Acceptance Criteria

### US-02-05-AC1: View profile with unverified flags
- **Given** a user with `org.organization.read`
- **When** they call `GET /api/v1/organization`
- **Then** the response is 200 with profile fields, an `ETag`, and `taxRegistrationNumber`/`commercialRegistrationNumber` each accompanied by `verificationStatus: "Unverified"`.

### US-02-05-AC2: Update profile with concurrency
- **Given** an Owner holding the current `ETag`
- **When** they `PUT /api/v1/organization` with `If-Match` and a new `legalName`
- **Then** the response is 200 with a new `ETag`, and an audit entry `org.organization.updated` records old and new values.

### US-02-05-AC3: Stale ETag rejected
- **Given** the profile was changed by another user after the caller read it
- **When** the caller submits `PUT` with the old `ETag`
- **Then** the response is 412 `COMMON.PRECONDITION_FAILED` and nothing changes.

### US-02-05-AC4: Invalid tax registration number
- **Given** an Owner
- **When** they submit `taxRegistrationNumber` = `12345AB`
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.TAX_REGISTRATION_NUMBER_INVALID`.

### US-02-05-AC5: Update organization settings
- **Given** a user with `settings.organization.manage`
- **When** they `PUT /api/v1/organization/settings` with `defaultLanguage = "en"` and `If-Match`
- **Then** the response is 200, the audit entry records old `ar` and new `en`, and `currencyCode` remains `EGP` even if a different value is submitted (422 `ORG.SETTING_OUT_OF_RANGE` for any value other than `EGP`).

### US-02-05-AC6: Permission denied
- **Given** a Pharmacist (no `org.organization.update`, no `settings.organization.manage`)
- **When** they call `PUT /api/v1/organization` or `PUT /api/v1/organization/settings`
- **Then** both return 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-02-001..006, VR-02-014 (for settings), `If-Match` required (428 `COMMON.PRECONDITION_REQUIRED` when absent).

## Authorization Rules
- Read: `org.organization.read`. Profile update: `org.organization.update`. Settings update: `settings.organization.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid field | 422 `COMMON.VALIDATION_FAILED` (field codes) |
| Missing `If-Match` | 428 `COMMON.PRECONDITION_REQUIRED` |
| Stale `If-Match` | 412 `COMMON.PRECONDITION_FAILED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Organization suspended | 403 `ORG.ORGANIZATION_SUSPENDED` |

## Edge Cases
- Changing legal name does not alter previously issued sales invoices (snapshot, BR-02-018).
- Clearing optional regulatory fields sets them to null.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-025 | API | Profile read with `Unverified` flags and ETag | US-02-05-AC1 |
| TS-02-026 | Integration | Update with audit old/new values; stale ETag 412 | US-02-05-AC2, US-02-05-AC3 |
| TS-02-027 | API | Tax registration number format rejection | US-02-05-AC4 |
| TS-02-028 | Integration | Organization settings update and `Currency` lock | US-02-05-AC5 |
| TS-02-029 | API | Pharmacist → 403 on both updates | US-02-05-AC6 |
