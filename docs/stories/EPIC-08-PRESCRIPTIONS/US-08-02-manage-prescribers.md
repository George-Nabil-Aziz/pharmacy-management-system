# US-08-02: Manage Prescribers

| Field | Value |
|---|---|
| Story ID | US-08-02 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-08-004 |
| Related Business Rules | BR-08-004, BR-G-33 |
| Dependencies | SPEC-01 permissions |

## User Story
As a Pharmacist, I want to search, create, and maintain doctor (prescriber) records so that prescriptions reference a consistent prescriber with contact details.

## Business Value
Reusing prescriber records avoids re-typing, enables contacting the clinic about unclear prescriptions, and supports the controlled register's prescriber data.

## Preconditions
- Caller is authenticated and belongs to the organization.

## Acceptance Criteria
### US-08-02-AC1: Create prescriber
- **Given** a user with `prescriptions.prescriptions.create`
- **When** the user posts `{ "fullName": "Dr. Ahmed Samir", "specialty": "Internal Medicine", "phone": "01001234567", "licenseNumber": "12345" }` to `/api/v1/prescribers`
- **Then** the response is 201 with the prescriber, `isActive = true`, and `licenseVerified = false`.

### US-08-02-AC2: Search prescribers
- **Given** 3 active prescribers whose names start with "Ahmed" and 1 deactivated one
- **When** the user calls `GET /api/v1/prescribers?q=ahmed`
- **Then** the response contains the 3 active prescribers (≤ 20 results, case- and Arabic/Latin-diacritic-insensitive match on name, phone or license prefix) and excludes the deactivated one unless `includeInactive=true`.

### US-08-02-AC3: Name required
- **Given** a user with `prescriptions.prescriptions.create`
- **When** the user posts a prescriber with `fullName = " "` 
- **Then** the response is 422 `PRESCRIPTIONS.PRESCRIBER_NAME_REQUIRED` and nothing is stored.

### US-08-02-AC4: Update and deactivate require manage permission
- **Given** a Cashier with `prescriptions.prescriptions.create` but without `prescriptions.prescribers.manage`
- **When** the Cashier calls `PATCH /api/v1/prescribers/{id}` or `POST /api/v1/prescribers/{id}/deactivate`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-08-02-AC5: Deactivated prescriber cannot be used on new prescriptions
- **Given** a deactivated prescriber referenced by existing prescriptions
- **When** a user creates a new prescription with that `prescriberId`
- **Then** the response is 422 `PRESCRIPTIONS.PRESCRIBER_INVALID`, and existing prescriptions still display the prescriber's snapshot name.

### US-08-02-AC6: Cross-organization isolation
- **Given** a prescriber belonging to organization B
- **When** a user of organization A calls `PATCH /api/v1/prescribers/{idOfB}`
- **Then** the response is 404 `PRESCRIPTIONS.NOT_FOUND`.

## Validation Rules
- VR-08-005, VR-08-006, VR-08-012.
- Duplicate warning (non-blocking): same normalized name and same phone returns `warnings: ["PRESCRIPTIONS.POSSIBLE_DUPLICATE_PRESCRIBER"]` with 201.

## Authorization Rules
- Search/read: `prescriptions.prescriptions.read`; create: `prescriptions.prescriptions.create`; update/deactivate: `prescriptions.prescribers.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Blank name | 422 `PRESCRIPTIONS.PRESCRIBER_NAME_REQUIRED` |
| Field too long | 422 `PRESCRIPTIONS.FIELD_TOO_LONG` |
| Update without manage permission | 403 `COMMON.FORBIDDEN` |
| Other organization's prescriber | 404 `PRESCRIPTIONS.NOT_FOUND` |
| Stale `If-Match` on update | 412 `PRESCRIPTIONS.VERSION_MISMATCH` |

## Edge Cases
- Prescribers are never hard-deleted (BR-G-33).
- Editing a prescriber does not alter `PrescriberNameSnapshot` on existing prescriptions.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-005 | Integration | Create prescriber; response has `licenseVerified=false` | US-08-02-AC1 |
| TS-08-006 | Integration | Search by name prefix, phone prefix, license prefix; inactive excluded; max 20 | US-08-02-AC2 |
| TS-08-007 | Unit | Blank/2/150/151-char names | US-08-02-AC3 |
| TS-08-008 | Integration | Cashier PATCH/deactivate → 403; cross-org PATCH → 404 | US-08-02-AC4, US-08-02-AC6 |
| TS-08-009 | Integration | New prescription with deactivated prescriber → 422; old prescription shows snapshot | US-08-02-AC5 |
