# US-08-09: Search, View, and Track Prescription History

| Field | Value |
|---|---|
| Story ID | US-08-09 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |
| Related Business Rules | BR-08-020, BR-G-29, BR-G-17 |
| Dependencies | US-08-03, SPEC-07 `PatientAccessLog` |

## User Story
As a Pharmacist, I want to find a patient's prescription and see what was prescribed, dispensed, and remains, with its full status history, so that I can continue dispensing on a later visit.

## Business Value
Supports multi-visit dispensing (CS-04) and prescription-to-sale traceability (BRQ-09).

## Preconditions
- Prescriptions exist in the branch.

## Acceptance Criteria
### US-08-09-AC1: Filtered list
- **Given** branch A with 60 prescriptions, 12 of them `PartiallyDispensed`
- **When** a user with `prescriptions.prescriptions.read` calls `GET /api/v1/branches/{A}/prescriptions?status=PartiallyDispensed&hasRemaining=true&page=1&pageSize=10`
- **Then** the response is 200 with `items` (10), `totalCount = 12`, each item containing only number, prescription date, status, patient display name, prescriber name, item count, and remaining item count (no clinical item text).

### US-08-09-AC2: Detail with dispensing records and access log
- **Given** a prescription with a patient, 2 items, and 3 dispensing records from 2 sales
- **When** the user calls `GET .../prescriptions/{id}`
- **Then** the response includes per item prescribed/dispensed/remaining base units, each dispensing record (sale number, batch number, expiry date, quantity, pharmacist name, dispensed at), attachment metadata, and one `PatientAccessLog` row is written.

### US-08-09-AC3: Status history
- **Given** a prescription that moved Draft → PendingVerification → Verified → PartiallyDispensed
- **When** the user calls `GET .../prescriptions/{id}/history`
- **Then** 4 rows are returned in chronological order with from, to, actor, timestamp (UTC, displayed in branch time zone), and reason; the rows cannot be modified through any endpoint.

### US-08-09-AC4: Patient history limited to assigned branches
- **Given** patient P with prescriptions in branches A and B, and a Pharmacist assigned only to A holding `prescriptions.prescriptions.read` and `patients.profiles.read`
- **When** the Pharmacist calls `GET /api/v1/patients/{P}/prescriptions`
- **Then** only branch A prescriptions are returned and `totalCount` excludes branch B.

### US-08-09-AC5: Cross-branch and permission denied
- **Given** a Pharmacist assigned only to branch A, and a Cashier without `prescriptions.prescriptions.read`
- **When** the Pharmacist calls `GET /api/v1/branches/{B}/prescriptions`, and the Cashier calls the list in A
- **Then** both responses are 403 `COMMON.FORBIDDEN` (CS-07).

### US-08-09-AC6: Wrong branch or organization id
- **Given** a prescription in branch B of the same organization, and one in another organization
- **When** a user assigned to A and B requests `GET /api/v1/branches/{A}/prescriptions/{idInB}`, and `GET /api/v1/branches/{A}/prescriptions/{idOtherOrg}`
- **Then** both responses are 404 `PRESCRIPTIONS.NOT_FOUND` (CS-08) with no data in the body.

## Validation Rules
- `pageSize` 1–100 (default 25); date ranges `from ≤ to`; `sort` ∈ {`prescriptionDate`, `-prescriptionDate`, `createdAt`, `-createdAt`, `number`}.

## Authorization Rules
- `prescriptions.prescriptions.read` + branch scope; patient history also needs `patients.profiles.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unassigned branch / no permission | 403 `COMMON.FORBIDDEN` |
| Prescription not in route branch / other org | 404 `PRESCRIPTIONS.NOT_FOUND` |
| `pageSize = 101` or `from > to` | 422 `PRESCRIPTIONS.QUERY_INVALID` with field error |

## Edge Cases
- Search by number is exact match; search by patient uses patient id selected via SPEC-07 lookup.
- List reads are not access-logged (no clinical data); detail reads are.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-046 | Integration | Filters, pagination, summary-only fields | US-08-09-AC1 |
| TS-08-047 | Integration | Detail content and one PatientAccessLog row | US-08-09-AC2 |
| TS-08-048 | Integration | History rows ordered; no mutation endpoint | US-08-09-AC3 |
| TS-08-049 | Security | Patient history excludes unassigned branch | US-08-09-AC4 |
| TS-08-050 | Security | Unassigned branch / no permission → 403 (CS-07) | US-08-09-AC5 |
| TS-08-051 | Security | Wrong-branch id and other-org id → 404 (CS-08) | US-08-09-AC6 |
| TS-08-052 | Performance | List p95 ≤ 500 ms at 1,000,000 prescriptions; detail p95 ≤ 500 ms | US-08-09-AC1, US-08-09-AC2 |
