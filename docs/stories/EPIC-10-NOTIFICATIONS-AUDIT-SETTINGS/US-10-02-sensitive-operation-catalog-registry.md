# US-10-02: Sensitive-Operation Catalog Registry and Conformance

| Field | Value |
|---|---|
| Story ID | US-10-02 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-10-006, FR-10-007, FR-10-008 |
| Related Business Rules | BR-G-16, BR-G-29, BR-10-001, BR-10-005 |
| Dependencies | US-10-01 |

## User Story
As an Owner, I want a single registered catalog of sensitive operations that the system enforces automatically so that no module can skip or invent audit events and every patient medical data read and support access is recorded.

## Business Value
Turns the sensitive-operation catalog (SPEC-10 §8.3) into an enforced contract across all modules, closing gaps that would otherwise surface only during an incident investigation.

## Preconditions
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

## Acceptance Criteria
### US-10-02-AC1: Catalog exposed with localized names
- **Given** an Owner with `audit.logs.read` and `Accept-Language: ar`
- **When** they call `GET /api/v1/audit/event-types`
- **Then** the response contains every registered event code with category, owner spec, retention class, and an Arabic display name, and the count equals the registry count

### US-10-02-AC2: Unregistered event code rejected
- **Given** application code attempts to write an audit entry with event code `INVENTORY.SOMETHING_NEW` not in the registry
- **When** the transaction executes
- **Then** the write fails with `AUDIT.UNKNOWN_EVENT_CODE`, the business transaction rolls back, and the API returns 500

### US-10-02-AC3: Conformance gate in the build
- **Given** a registered event code with no integration test asserting its emission
- **When** the CI conformance check runs
- **Then** the build fails and lists the uncovered event code

### US-10-02-AC4: Patient medical data read is audited
- **Given** a pharmacist with `patients.medical.read` in branch `CAI01`
- **When** they open a patient's allergies and conditions
- **Then** a `PATIENTS.MEDICAL_DATA_READ` entry with patient id and sections `["allergies","conditions"]` is committed before the response is returned

### US-10-02-AC5: Medical read fails closed (negative)
- **Given** the audit store is unavailable (fault injection)
- **When** a pharmacist requests a patient's medical data
- **Then** the API returns 503 `AUDIT.ACCESS_LOG_UNAVAILABLE` and the response body contains no medical data

### US-10-02-AC6: Support access usage audited
- **Given** an active support access grant for platform administrator P on organization O
- **When** P calls `GET /api/v1/branches/{branchId}/settings` under the grant
- **Then** an `ORG.SUPPORT_ACCESS_USED` entry with actor type `SupportGrant`, grant id, method `GET`, route template, and status 200 is written to organization O's chain

### US-10-02-AC7: Permission denied
- **Given** a Cashier without `audit.logs.read`
- **When** they call `GET /api/v1/audit/event-types`
- **Then** the API returns 403 `COMMON.FORBIDDEN`

## Validation Rules
- Event code format `MODULE.EVENT_NAME` (uppercase, underscores); module prefix must match a registered module.
- Each registry entry must have category, owner spec, retention class, and both `ar`/`en` names (CI check).

## Authorization Rules
- `GET /api/v1/audit/event-types` requires `audit.logs.read`.
- Support-grant requests are audited regardless of outcome (including 403/404 responses).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unknown event code written | 500 `AUDIT.UNKNOWN_EVENT_CODE`, rollback |
| Medical read cannot be audited | 503 `AUDIT.ACCESS_LOG_UNAVAILABLE` |
| Caller lacks `audit.logs.read` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- A list endpoint returning medical data for many patients writes one entry per patient returned.
- Medical data embedded in a prescription detail response counts as a medical read (BR-G-29).
- Support-grant request that is itself denied (403) is still audited with status 403.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-008 | API | Event types returned with Arabic names; count equals registry | US-10-02-AC1 |
| TS-10-009 | Integration | Unregistered code write rolls back and returns 500 | US-10-02-AC2 |
| TS-10-010 | CI | Conformance check fails for uncovered event code | US-10-02-AC3 |
| TS-10-011 | Integration | Medical read writes `PATIENTS.MEDICAL_DATA_READ`; audit outage returns 503 without data | US-10-02-AC4, US-10-02-AC5 |
| TS-10-012 | Integration | Support grant request audited with grant id and status | US-10-02-AC6 |
| TS-10-013 | API | Cashier receives 403 on event types | US-10-02-AC7 |
