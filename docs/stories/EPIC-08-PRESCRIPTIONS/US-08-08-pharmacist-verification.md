# US-08-08: Pharmacist Verification

| Field | Value |
|---|---|
| Story ID | US-08-08 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |
| Related Business Rules | BR-08-005, BR-08-006, BR-08-014, BR-G-14, BR-G-16 |
| Dependencies | US-08-05, US-08-07 |

## User Story
As a Pharmacist, I want to review a pending prescription against its image, resolve free-text items, acknowledge each item, and mark it verified so that it can be dispensed.

## Business Value
Enforces that a licensed pharmacist checks every item before dispensing (BR-G-14) with individual accountability (BRQ-01).

## Preconditions
- Prescription in `PendingVerification`.

## Acceptance Criteria
### US-08-08-AC1: Verify with full checklist
- **Given** a PendingVerification prescription with 2 catalog items and 1 Clean attachment
- **When** a user with `prescriptions.prescriptions.verify` posts `checklistVersion = 1`, all checklist flags `true`, and `verified = true` for both items, with `If-Match`
- **Then** the response is 200 with `status = "Verified"`, `verifiedBy` = caller, `verifiedAt` set, each item has `itemVerifiedBy`/`itemVerifiedAt`, history `PendingVerification → Verified`, and an audit entry.

### US-08-08-AC2: Incomplete checklist rejected
- **Given** a PendingVerification prescription with 2 items
- **When** the pharmacist submits `patientIdentityMatches = false` or acknowledges only 1 of 2 items
- **Then** the response is 422 `PRESCRIPTIONS.CHECKLIST_INCOMPLETE` listing the missing entries and the status remains `PendingVerification`.

### US-08-08-AC3: Free-text item must be resolved
- **Given** a PendingVerification prescription with a free-text item "Augmentin 1g"
- **When** the pharmacist verifies without resolving
- **Then** the response is 422 `PRESCRIPTIONS.ITEM_UNRESOLVED`.

### US-08-08-AC4: Resolve free-text item
- **Given** the same free-text item and active catalog medicine A (`PackSize = 14`)
- **When** the pharmacist calls `POST .../items/{itemId}/resolve` with `{ "medicineId": "A" }`
- **Then** the item has `medicineId = A`, `freeTextMedicineName = "Augmentin 1g"` retained, `resolvedBy`/`resolvedAt` set, `prescribedQuantityBaseUnits` computed, and an audit entry exists.

### US-08-08-AC5: Attachment required
- **Given** a PendingVerification prescription with a controlled item and no Clean attachment (or `RequireAttachmentForVerification = ON` with no Clean attachment)
- **When** the pharmacist verifies it
- **Then** the response is 422 `PRESCRIPTIONS.ATTACHMENT_REQUIRED`.

### US-08-08-AC6: Patient re-checked after resolution
- **Given** a PendingVerification prescription without patient whose free-text item was resolved to a controlled medicine
- **When** the pharmacist verifies it
- **Then** the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

### US-08-08-AC7: Permission denied
- **Given** a Cashier with `prescriptions.prescriptions.create` but without `prescriptions.prescriptions.verify`
- **When** the Cashier calls `POST .../verify` or `POST .../items/{itemId}/resolve`
- **Then** both responses are 403 `COMMON.FORBIDDEN` and the prescription is unchanged.

## Validation Rules
- VR-08-012, VR-08-023, VR-08-024, VR-08-025, VR-08-026, VR-08-014 (resolution target).

## Authorization Rules
- `prescriptions.prescriptions.verify` + branch assignment. Same user may register and verify in v1 (OD-08-03).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Checklist or item acknowledgement missing | 422 `PRESCRIPTIONS.CHECKLIST_INCOMPLETE` |
| Unresolved free-text item | 422 `PRESCRIPTIONS.ITEM_UNRESOLVED` |
| Missing clean attachment when required | 422 `PRESCRIPTIONS.ATTACHMENT_REQUIRED` |
| Patient missing when required | 422 `PRESCRIPTIONS.PATIENT_REQUIRED` |
| Not in PendingVerification | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |
| Resolve to inactive medicine | 422 `PRESCRIPTIONS.MEDICINE_INVALID` |
| Stale ETag (concurrent edit) | 412 `PRESCRIPTIONS.VERSION_MISMATCH` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Prescription passes `ExpiresOn` while pending → verify returns 422 `PRESCRIPTIONS.EXPIRED`.
- Checklist entry `attachmentMatchesItems` is required only when ≥ 1 active attachment exists.
- When allergy/interaction features are enabled (US-08-17, US-08-22), open alerts must be acknowledged before verify (`PRESCRIPTIONS.ALERT_OVERRIDE_REQUIRED`).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-039 | Integration | Full verification records verifier, item acks, history, audit | US-08-08-AC1 |
| TS-08-040 | Unit | Checklist matrix: each flag false, missing item ack | US-08-08-AC2 |
| TS-08-041 | Integration | Verify with unresolved free text → 422 | US-08-08-AC3 |
| TS-08-042 | Integration | Resolve free text; original text retained; base units computed | US-08-08-AC4 |
| TS-08-043 | Integration | Controlled item without Clean attachment → 422; setting ON → 422 | US-08-08-AC5 |
| TS-08-044 | Integration | Resolved-to-controlled without patient → 422 | US-08-08-AC6 |
| TS-08-045 | Security | Cashier verify/resolve → 403 | US-08-08-AC7 |
