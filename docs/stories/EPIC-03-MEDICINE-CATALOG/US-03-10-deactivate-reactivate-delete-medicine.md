# US-03-10: Deactivate, reactivate, and delete a medicine

| Field | Value |
|---|---|
| Story ID | US-03-10 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-03-026, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-003, BR-03-005, BR-03-023, BR-03-024, BR-G-33 |
| Dependencies | US-03-04, EPIC-01 permission catalog, EPIC-04 stock probe |

## User Story
As an authorized catalog manager, I want to deactivate or reactivate a medicine and delete it only when unreferenced so that obsolete products cannot enter new transactions while historical records remain intact.

## Business Value
Soft deactivation preserves stock and transaction history and blocks accidental use of discontinued medicines.

## Preconditions
- The actor has `catalog.medicines.deactivate`.
- `IMedicineStockProbe` can report on-hand quantity across all Branches.

## Acceptance Criteria
### US-03-10-AC1: Deactivate and retain stock visibility
- **Given** an Active medicine with zero stock
- **When** an authorized user deactivates it with a 3–200 character reason
- **Then** status becomes Inactive, metadata and audit are committed atomically, and the medicine cannot be added to new sales, purchase orders, receipts, or dispensing.

### US-03-10-AC2: Require explicit acknowledgement when stock exists
- **Given** a medicine with positive on-hand stock in any Branch
- **When** the user deactivates it without `acknowledgeStock = true`, then retries with acknowledgement
- **Then** the first request returns 409 `CATALOG.MEDICINE_HAS_STOCK`; the second succeeds and existing stock remains visible for allowed inventory actions.

### US-03-10-AC3: Reactivate or hard-delete safely
- **Given** an Inactive medicine and an unreferenced medicine
- **When** an authorized user reactivates the first or hard-deletes the second
- **Then** reactivation returns it to Active with audit; hard deletion succeeds only if no batch, document line, prescription item, or dispensing record references it.

### US-03-10-AC4: Deny missing permission and hide another Organization
- **Given** a caller without `catalog.medicines.deactivate` or a medicine owned by another Organization
- **When** they attempt a lifecycle operation
- **Then** the first request returns 403 `COMMON.FORBIDDEN`, the second returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no data changes.

## Validation Rules
- Deactivation reason is required and 3–200 characters (VR-03-018).
- The stock acknowledgement is required only when stock exists.

## Authorization Rules
- Deactivate/reactivate/hard-delete requires `catalog.medicines.deactivate`.
- Cross-Organization resource ids return 404; RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Stock exists without acknowledgement | 409 `CATALOG.MEDICINE_HAS_STOCK` |
| Referenced medicine hard delete | 409 `CATALOG.MEDICINE_IN_USE` |
| Invalid reason | 400 `COMMON.VALIDATION_FAILED` |
| Other-Organization medicine | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Deactivation never removes stock, barcodes, or transaction references.
- An inactive medicine's historical lookup remains available to permitted users; new transactions remain blocked.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-062 | Integration | Deactivation records reason and audit, then blocks new transaction use | US-03-10-AC1 |
| TS-03-063 | Integration | Positive on-hand requires acknowledgement and stock remains visible | US-03-10-AC2 |
| TS-03-064 | Integration | Reactivate and hard-delete referenced/unreferenced medicines | US-03-10-AC3 |
| TS-03-065 | Integration | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | US-03-10-AC4 |
