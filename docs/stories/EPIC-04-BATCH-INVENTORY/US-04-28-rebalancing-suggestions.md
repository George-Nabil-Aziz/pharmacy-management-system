# US-04-28: Multi-branch rebalancing suggestions

| Field | Value |
|---|---|
| Story ID | US-04-28 |
| Epic | EPIC-04 |
| Priority | P3 |
| Complexity | M |
| Related Requirements | FR-04-064 |
| Related Business Rules | BR-G-13, BR-04-025, BR-04-026 |
| Dependencies | US-04-16, US-04-19, US-04-27 |

## User Story
As an owner of a pharmacy chain, I want the system to suggest transfers from branches with excess or near-expiry stock to branches running low so that I reduce both stock-outs and expiry losses.

## Business Value
Optimizes inventory across branches without extra purchasing (advanced capability, P3).

## Preconditions
- Reorder settings exist; 30-day sales quantities available from the ledger (`Sale` minus `SalesReturn`/`SaleVoid` movements).

## Acceptance Criteria
### US-04-28-AC1: Suggestion generated
- **Given** branch C is `Low` for M (sellable 5, max 60) and branch A has sellable 150 for M with MaxQuantity 80
- **When** the nightly `inventory.rebalancing-suggestions` job runs
- **Then** a suggestion (source A, destination C, M, quantity 55, rationale `SourceAboveMax`) is stored, with quantity = min(destination max − sellable − inbound in-transit, source sellable − source max)

### US-04-28-AC2: Near-expiry surplus rationale
- **Given** A has 40 near-expiry units of M expiring in 45 days and 30-day sales of 10
- **When** the job runs and C is `Low`
- **Then** a suggestion with rationale `NearExpirySurplus` proposes at most 30 units (near-expiry quantity − 30-day sales), and no suggestion leaves the source below its MinQuantity

### US-04-28-AC3: Create a draft transfer from a suggestion
- **Given** a suggestion S and a user with `inventory.transfers.create` assigned to A or C
- **When** the user accepts S
- **Then** a `Draft` transfer (A → C, M, 55) is created through US-04-19 and S is marked `Converted`

### US-04-28-AC4: Authorization
- **Given** a user without `inventory.transfers.create`, and a suggestion id of another organization
- **When** each lists or accepts suggestions
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`; users see only suggestions involving their assigned branches unless they have organization-wide scope

## Validation Rules
- Suggestions expire at the next job run; accepting an expired suggestion returns 409 `INVENTORY.INVALID_STATE_TRANSITION`.

## Authorization Rules
- `inventory.transfers.create`; branch filtering by assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Accept expired or converted suggestion | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Other-organization suggestion | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Suggestions are advisory; no stock is reserved until transfer approval.
- Destinations without a ReorderSetting never receive suggestions.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-190 | Integration | SourceAboveMax suggestion quantity formula | US-04-28-AC1 |
| TS-04-191 | Integration | NearExpirySurplus suggestion bounded by sales and source minimum | US-04-28-AC2 |
| TS-04-192 | API | Accept suggestion creates draft transfer; expired suggestion → 409 | US-04-28-AC3 |
| TS-04-193 | API | 403 permission, CS-07 branch filtering, CS-08 other org → 404 | US-04-28-AC4 |
