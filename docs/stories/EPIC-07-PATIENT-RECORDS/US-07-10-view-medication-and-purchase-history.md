# US-07-10: View Medication and Purchase History

| Field | Value |
|---|---|
| Story ID | US-07-10 |
| Epic | EPIC-07 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-07-017, FR-07-029, FR-07-030 |
| Related Business Rules | BR-G-29, BR-G-11, BR-07-003, BR-07-012 |
| Dependencies | US-07-05, US-07-06; external: SPEC-06 sales/returns query facade, SPEC-08 dispensing records |

## User Story
As a pharmacist, I want to see which medicines a patient has received across the organization, and their purchase history, so that I can counsel on repeat and chronic medication.

## Business Value
Read-only, derived history avoids duplicate data entry and keeps sales documents the single source of truth.

## Preconditions
- Sales have been linked to the patient (US-07-06).

## Acceptance Criteria
### US-07-10-AC1: Medication history derived from sales and dispensing
- **Given** P has 3 linked completed sales across branches A and B, one line partially returned
- **When** a pharmacist with `patients.medical.read` GETs `/api/v1/patients/{P}/medication-history`
- **Then** each line shows medicine, quantity in base units, returned quantity, date, branch, sale number, and prescription id when dispensed against a prescription, newest first; one access-log row with category "MedicationHistory" is written

### US-07-10-AC2: Voided sales excluded by default
- **Given** one of P's sales is `Voided`
- **When** history is requested without `includeVoided`
- **Then** the voided sale's lines are absent; with `includeVoided=true` they appear flagged "Voided"

### US-07-10-AC3: Read-only
- **Given** the medication history endpoint
- **When** a POST, PUT, or DELETE is sent to it
- **Then** the response is 405

### US-07-10-AC4: Purchase history without line items, branch-limited
- **Given** a manager assigned to branch A only, with `patients.profiles.read` and `sales.sales.read`, and P has sales in branches A and B
- **When** they GET `/purchase-history`
- **Then** only branch A sales are returned with sale number, date, branch, total, and status, without medicine lines, and no access-log row is written

### US-07-10-AC5: Permission denied
- **Given** a user with `patients.profiles.read` but not `patients.medical.read`
- **When** they GET `/medication-history`
- **Then** the response is 403 `COMMON.FORBIDDEN`; and a user lacking `sales.sales.read` gets 403 on `/purchase-history`

### US-07-10-AC6: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B requests either history
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
Date range filter `from`/`to` ≤ 5 years; pagination `pageSize` ≤ 100.

## Authorization Rules
- Medication history: `patients.medical.read` (org-wide, OD-07-04), logged.
- Purchase history: `patients.profiles.read` + `sales.sales.read`, limited to assigned branches unless organization-wide scope.
- Opening a sale from history uses SPEC-06 authorization (403 for unassigned branch, CS-07).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Range > 5 years | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Access-log failure | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Medicine later deactivated: history still shows its name snapshot from the sale line.
- Returned quantity equals sold quantity: line shown with net 0, not hidden.
- Merged patient: includes sales of patients merged into P (US-07-15).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-069 | Integration | Medication history across 2 branches with partial return and prescription link; logged | US-07-10-AC1 |
| TS-07-070 | Integration | Voided filter behaviour | US-07-10-AC2 |
| TS-07-071 | Integration | Write verbs → 405 | US-07-10-AC3 |
| TS-07-072 | Integration | Purchase history branch-limited, no lines, no access log | US-07-10-AC4 |
| TS-07-073 | Security | 403 for missing medical/sales permissions | US-07-10-AC5 |
| TS-07-074 | Security | CS-08 → 404; CS-07 opening sale of unassigned branch → 403 | US-07-10-AC6 |
