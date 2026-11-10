# US-08-10: Cancel a Prescription

| Field | Value |
|---|---|
| Story ID | US-08-10 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-08-026, FR-08-024 |
| Related Business Rules | BR-08-016, BR-08-022, BR-G-16 |
| Dependencies | US-08-03 |

## User Story
As a Pharmacist or Branch Manager, I want to cancel a prescription with a reason so that it can no longer be dispensed (for example, a registration error or the doctor withdrew it).

## Business Value
Stops further dispensing while preserving the full record and dispensing history (BR-G-34).

## Preconditions
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

## Acceptance Criteria
### US-08-10-AC1: Cancel partially dispensed prescription
- **Given** a `PartiallyDispensed` prescription with 2 dispensing records
- **When** a user with `prescriptions.prescriptions.cancel` posts `{ "reason": "Doctor changed therapy" }` to `.../cancel` with `If-Match`
- **Then** the response is 200 with `status = "Cancelled"`, `cancelledBy`, `cancelledAt`, the 2 dispensing records unchanged, history `PartiallyDispensed → Cancelled` with the reason, and an audit entry.

### US-08-10-AC2: No dispensing after cancel
- **Given** the cancelled prescription
- **When** a sale with a line linked to one of its items is completed
- **Then** the sale is rejected with 422 `PRESCRIPTIONS.NOT_DISPENSABLE` and nothing is persisted.

### US-08-10-AC3: Reason required and terminal statuses
- **Given** a Verified prescription, and a `FullyDispensed` prescription
- **When** the user cancels the first with `reason = "x"`, and cancels the second with a valid reason
- **Then** the responses are 422 `PRESCRIPTIONS.CANCEL_REASON_REQUIRED` and 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION`.

### US-08-10-AC4: Permission denied
- **Given** a Cashier without `prescriptions.prescriptions.cancel`
- **When** the Cashier calls `.../cancel`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-08-027 (reason 5–500 chars), VR-08-012.

## Authorization Rules
- `prescriptions.prescriptions.cancel` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Reason missing/short | 422 `PRESCRIPTIONS.CANCEL_REASON_REQUIRED` |
| Status FullyDispensed/Cancelled/Expired | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other org | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Cancel racing with a sale on the same prescription: the item row lock (FR-08-032) and the prescription `RowVersion` serialize them; either the sale commits first (cancel then succeeds with updated history) or the cancel commits first (sale rejected).
- Voiding a sale of a cancelled prescription later reverses quantities but keeps `Cancelled` (US-08-14).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-053 | Integration | Cancel PartiallyDispensed; records retained; history + audit | US-08-10-AC1 |
| TS-08-054 | Integration | Sale against cancelled prescription → 422, no sale/stock change | US-08-10-AC2 |
| TS-08-055 | Unit | Reason length boundaries; FullyDispensed cancel → 409 | US-08-10-AC3 |
| TS-08-056 | Security | Cashier cancel → 403 | US-08-10-AC4 |
| TS-08-057 | Concurrency | Cancel and sale in parallel: exactly one consistent outcome | US-08-10-AC1, US-08-10-AC2 |
