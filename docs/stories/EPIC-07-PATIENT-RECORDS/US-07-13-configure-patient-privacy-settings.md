# US-07-13: Configure Patient Privacy Settings and Optional National ID

| Field | Value |
|---|---|
| Story ID | US-07-13 |
| Epic | EPIC-07 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-07-033, FR-07-034 |
| Related Business Rules | BR-G-16, BR-07-006, BR-07-009, BR-07-014, BR-07-015 |
| Dependencies | US-07-01, US-07-05; external: SPEC-10 `OrganizationSettings` |

## User Story
As an owner, I want to configure consent enforcement, allergy alert mode, and whether national IDs are collected so that the system matches my organization's policy once legal advice (REG-04) is obtained.

## Business Value
Keeps privacy-sensitive behaviour configurable with safe defaults: consent required ON, alert mode `Warn`, national ID collection OFF.

## Preconditions
- Settings seeded with defaults at organization creation.

## Acceptance Criteria
### US-07-13-AC1: View and change settings with audit
- **Given** an owner with `settings.organization.manage`
- **When** they PUT `/api/v1/settings/patients` changing `AllergyAlertMode` from `Warn` to `Block`
- **Then** the response is 200, subsequent sale completions apply `Block` behaviour, and an audit entry records old and new values

### US-07-13-AC2: Permission denied
- **Given** a pharmacist without `settings.organization.manage`
- **When** they PUT the settings
- **Then** the response is 403 `COMMON.FORBIDDEN` and settings are unchanged

### US-07-13-AC3: National ID accepted and masked when ON
- **Given** `CollectNationalId` is ON
- **When** a user with `patients.profiles.manage` saves `nationalId` "29001011234567" and another user with `patients.profiles.read` GETs the patient
- **Then** the value is stored encrypted, responses show `nationalIdMasked` "••••••••••4567", and the full value is not present in any GET response

### US-07-13-AC4: Reveal is explicit and logged
- **Given** `CollectNationalId` is ON and P has a national ID
- **When** a user with `patients.profiles.manage` POSTs `/api/v1/patients/{P}/national-id/reveal`
- **Then** the full value is returned with `Cache-Control: no-store` and one access-log row with `accessType` "Reveal" and category "NationalId" is written

### US-07-13-AC5: Invalid national ID
- **Given** `CollectNationalId` is ON
- **When** `nationalId` "2900101123" (10 digits) is saved
- **Then** the response is 400 `PATIENTS.INVALID_NATIONAL_ID`

### US-07-13-AC6: Switching OFF hides existing values
- **Given** P has a stored national ID and the owner sets `CollectNationalId` OFF
- **When** any user GETs P or calls reveal
- **Then** no national ID field (masked or full) is returned and reveal returns 400 `PATIENTS.NATIONAL_ID_DISABLED`; stored ciphertext is retained

### US-07-13-AC7: Cross-organization reveal (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B calls reveal for P
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
VR-07-007, VR-07-008; `AllergyAlertMode` ∈ {`Warn`, `Block`}; booleans for the other settings.

## Authorization Rules
- Settings: `settings.organization.manage`. Reveal: `patients.profiles.manage` (logged).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unknown alert mode | 400 `COMMON.VALIDATION_FAILED` |
| Invalid national ID | 400 `PATIENTS.INVALID_NATIONAL_ID` |
| Reveal while OFF | 400 `PATIENTS.NATIONAL_ID_DISABLED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Turning `RequireConsentForMedicalData` OFF does not alter existing consent events.
- National ID never appears in search, exports (unless ON — then masked plus full for export holder), audit entries, or logs.
- Changing alert mode does not alter acknowledgements already recorded.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-084 | Integration | Settings update audited with old/new; Block mode takes effect on next sale | US-07-13-AC1 |
| TS-07-085 | Security | 403 for non-owner | US-07-13-AC2 |
| TS-07-086 | Security | National ID encrypted at rest (DB dump scan), masked in responses (NFR-07-007) | US-07-13-AC3 |
| TS-07-087 | Integration | Reveal returns full value, no-store header, access-log `Reveal` | US-07-13-AC4 |
| TS-07-088 | Unit | 14-digit validation incl. Arabic-Indic digits | US-07-13-AC5 |
| TS-07-089 | Integration | OFF hides values; reveal → 400 | US-07-13-AC6 |
| TS-07-090 | Security | CS-08 reveal → 404 | US-07-13-AC7 |
