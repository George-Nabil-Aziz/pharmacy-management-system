# US-04-05: FEFO override with permission

| Field | Value |
|---|---|
| Story ID | US-04-05 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-04-024 |
| Related Business Rules | BR-G-06, BR-G-07, BR-G-16, BR-04-011 |
| Dependencies | US-04-04 |

## User Story
As a pharmacist, I want to sell a specific eligible batch that differs from the FEFO choice so that the system records the pack actually handed to the patient.

## Business Value
Keeps the ledger aligned with physical stock when the pack taken from the shelf is not the FEFO batch, while preventing misuse through permission and audit.

## Preconditions
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

## Acceptance Criteria
### US-04-05-AC1: Override with permission
- **Given** FEFO first choice for M is batch Z and the pharmacist holds `inventory.batches.override-fefo`
- **When** a `Sale` allocation is requested with `explicitBatchId` = Y (eligible, sellable 10) for 4 units
- **Then** Y = 4 is allocated with `isFefoOverride` true and an audit entry (actor, medicine, FEFO batch Z, chosen batch Y, quantity) is written in the same transaction

### US-04-05-AC2: Override without permission rejected
- **Given** a cashier without `inventory.batches.override-fefo`
- **When** the same request with `explicitBatchId` = Y is made
- **Then** the contract returns 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` and nothing is allocated

### US-04-05-AC3: Explicit batch equal to FEFO choice is not an override
- **Given** the cashier lacks the override permission
- **When** `explicitBatchId` = Z (the FEFO first choice) is requested
- **Then** the allocation succeeds with `isFefoOverride` false and no override audit entry

### US-04-05-AC4: Ineligible batch never selectable (CS-02)
- **Given** batch E is expired and batch Q is quarantined
- **When** a user with the override permission requests E or Q explicitly for a `Sale`
- **Then** the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Expired` or `Quarantined`

### US-04-05-AC5: Explicit batch must cover the whole line
- **Given** Y has sellable 3
- **When** 4 units are requested explicitly from Y
- **Then** the contract returns 409 `INVENTORY.INSUFFICIENT_STOCK` with sellable 3 (no FEFO top-up)

### US-04-05-AC6: Batch of another branch or medicine
- **Given** batch K belongs to branch B or to medicine N
- **When** it is requested explicitly for medicine M in branch A
- **Then** the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `WrongBranch` or `WrongMedicine`; a batch id of another organization returns 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-021: explicit batch belongs to the line's branch and medicine and is eligible for the purpose.

## Authorization Rules
- `inventory.batches.override-fefo` checked inside the contract against the actor's permissions in the target branch.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Override without permission | 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` |
| Expired / window / quarantined batch | 422 `INVENTORY.BATCH_NOT_SELLABLE` |
| Explicit batch short | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Batch of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- If the FEFO first choice becomes unavailable during locking, the comparison uses the first choice computed after the lock.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-033 | Integration | Override with permission allocates explicit batch, flags override, writes audit in same tx | US-04-05-AC1 |
| TS-04-034 | Integration | Override without permission → 403 FEFO_OVERRIDE_NOT_PERMITTED | US-04-05-AC2 |
| TS-04-035 | Unit | Explicit = FEFO first choice → no permission needed, not flagged | US-04-05-AC3 |
| TS-04-036 | Integration | CS-02: explicit expired / do-not-sell / quarantined batch rejected even with permission | US-04-05-AC4 |
| TS-04-037 | Integration | Explicit batch insufficient → INSUFFICIENT_STOCK without top-up | US-04-05-AC5 |
| TS-04-038 | Integration | Wrong branch/medicine → 422; other-org batch → 404 (CS-08) | US-04-05-AC6 |
