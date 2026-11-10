# US-08-15: Controlled Medicine Register

| Field | Value |
|---|---|
| Story ID | US-08-15 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-08-039, FR-08-040 |
| Related Business Rules | BR-08-014, BR-08-016, BR-08-017, BR-G-22, BR-G-25 |
| Dependencies | US-08-13, US-08-14, SPEC-02 `DocumentSequence` |

## User Story
As a Pharmacist in charge, I want every controlled-medicine dispensing to be written automatically to a branch register that I can view and export so that controlled stock movements to patients are fully traceable.

## Business Value
Provides the controlled-medicine record required by BR-G-22; register format and reporting duties are pending REG-02.

## Preconditions
- Controlled dispensing occurs via US-08-13.

## Acceptance Criteria
### US-08-15-AC1: Entry created with dispensing
- **Given** branch `CAI01` with 40 base units of controlled medicine C on hand across batches
- **When** a Pharmacist completes a sale dispensing 10 base units of C from batch B7 against prescription `CAI01-RX-2026-000045`
- **Then** in the same transaction one `ControlledMedicineRegisterEntry` is created with `entryNumber` `CAI01-CMR-2026-<next gapless seq>`, `entryType = Dispensing`, medicine name and strength snapshot, batch number, quantity 10, `balanceAfterBaseUnits = 30`, patient name and id, prescriber name and license as entered, prescription and sale numbers, and pharmacist.

### US-08-15-AC2: Gapless numbering under failure
- **Given** the last entry number is `CAI01-CMR-2026-000017`
- **When** a controlled sale fails and rolls back, then another succeeds
- **Then** the successful entry is `CAI01-CMR-2026-000018`.

### US-08-15-AC3: Reversal entry on void
- **Given** the entry from AC1
- **When** the sale is voided
- **Then** an entry with `entryType = Reversal`, quantity −10, `reversesEntryId` set, and `balanceAfterBaseUnits = 40` is appended; the original entry is unchanged.

### US-08-15-AC4: View and export
- **Given** a user with `prescriptions.controlled-register.read` in branch `CAI01`
- **When** the user calls `GET /api/v1/branches/{CAI01}/controlled-register?from=2026-11-01&to=2026-11-30` and then `POST .../controlled-register/exports` with `{ "format": "csv", "from": "2026-11-01", "to": "2026-11-30" }`
- **Then** entries are returned in entry-number order with cursor pagination, the export file contains the same entries, and an `AuditLog` entry records the export (user, range, format, row count).

### US-08-15-AC5: Range limit
- **Given** the same user
- **When** the user requests `from=2025-01-01&to=2026-11-30`
- **Then** the response is 422 `PRESCRIPTIONS.REGISTER_RANGE_TOO_LARGE`.

### US-08-15-AC6: Permission and branch denied
- **Given** a Cashier without `prescriptions.controlled-register.read`, and a Pharmacist with the permission assigned only to branch A
- **When** the Cashier reads branch A's register, and the Pharmacist reads branch B's register
- **Then** both responses are 403 `COMMON.FORBIDDEN`.

### US-08-15-AC7: Append-only
- **Given** any register entry
- **When** any user attempts to update or delete it via API
- **Then** no such endpoint exists (405) and a database-level attempt by the application role to update/delete is rejected.

## Validation Rules
- VR-08-040.
- Export formats: `csv`, `pdf`.

## Authorization Rules
- `prescriptions.controlled-register.read` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Range > 366 days or from > to | 422 `PRESCRIPTIONS.REGISTER_RANGE_TOO_LARGE` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 (branch not found per SPEC-02) |

## Edge Cases
- `balanceAfterBaseUnits` is the branch total on-hand of the medicine across all batches after the movement, read inside the same transaction after balance update.
- Exports of > 50,000 entries run as background export (SPEC-09 `ReportExport`).
- The PDF export shows the disclaimer "Format pending regulatory review (REG-02)".

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-086 | Integration | Entry fields and running balance on dispensing | US-08-15-AC1 |
| TS-08-087 | Integration | Gapless numbering after rollback | US-08-15-AC2 |
| TS-08-088 | Integration | Reversal entry on void | US-08-15-AC3 |
| TS-08-089 | Integration | View with cursor pagination; CSV/PDF export; audit row | US-08-15-AC4 |
| TS-08-090 | Unit | Range boundaries 366/367 days and from > to | US-08-15-AC5 |
| TS-08-091 | Security | Cashier → 403; unassigned branch → 403 | US-08-15-AC6 |
| TS-08-092 | Security | No update/delete endpoint; DB role denies UPDATE/DELETE | US-08-15-AC7 |
