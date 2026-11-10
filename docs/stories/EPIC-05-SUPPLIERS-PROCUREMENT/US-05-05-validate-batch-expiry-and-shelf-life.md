# US-05-05: Validate batch expiry and shelf life on receipt

| Field | Value |
|---|---|
| Story ID | US-05-05 |
| Epic | EPIC-05 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-05-013, FR-05-014, FR-05-015 |
| Related Business Rules | BR-05-006, BR-05-007, BR-G-07, BR-G-23, BR-G-27 |
| Dependencies | US-05-04, SPEC-02 (branch business date, `MinRemainingShelfLifeDaysOnReceipt`) |

## User Story
As a Pharmacist receiving goods, I want the system to refuse expired stock and short-dated stock unless a manager explicitly accepts it so that the pharmacy does not pay for medicines it cannot sell before expiry.

## Business Value
Short-dated stock from distributors is a frequent source of write-off losses. A hard block on expired stock and a controlled override for short-dated stock protects margin and patient safety.

## Preconditions
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

## Acceptance Criteria

### US-05-05-AC1: Expired stock always rejected
- **Given** branch business date 2026-11-09 (Africa/Cairo) and a line with expiry 2026-11-09
- **When** any user, including an Owner holding `procurement.receipts.override-shelf-life`, validates or posts the receipt
- **Then** the response is 422 with `errors["lines[0].expiryDate"]` = `PROCUREMENT.BATCH_EXPIRED` and the receipt remains Draft

### US-05-05-AC2: Short-dated stock rejected without override
- **Given** `MinRemainingShelfLifeDaysOnReceipt = 180` and a line with expiry 2027-03-31 (142 days remaining)
- **When** an Inventory user without the override permission posts the receipt
- **Then** the response is 422 `PROCUREMENT.SHELF_LIFE_BELOW_MINIMUM` with remaining days 142 and minimum 180 in the error detail

### US-05-05-AC3: Override with permission and reason
- **Given** the same short-dated line carrying override reason "Supplier agreed to take back unsold units in March 2027"
- **When** a Branch Manager holding `procurement.receipts.override-shelf-life` and `procurement.receipts.post` posts the receipt
- **Then** the line is accepted, the line stores override user, reason, and remaining days 142, and an audit entry of type shelf-life override is written in the posting transaction

### US-05-05-AC4: Override attempted without permission
- **Given** a short-dated line with an override reason
- **When** an Inventory user without `procurement.receipts.override-shelf-life` posts it
- **Then** the response is 403 `PROCUREMENT.SHELF_LIFE_OVERRIDE_NOT_PERMITTED` and nothing is posted

### US-05-05-AC5: Revalidation at posting and batch/expiry consistency
- **Given** a Draft saved on 2026-11-09 with a line expiring 2026-11-10, a receipt containing batch "AB123" of the same medicine twice with expiries 2028-11-30 and 2028-12-31, and a separate receipt whose batch "XY9" exists in the branch with a different expiry
- **When** the first receipt is posted on business date 2026-11-10, the second is posted, and the third is posted without `confirmExpiryMismatch`
- **Then** the responses are 422 `PROCUREMENT.BATCH_EXPIRED`, 422 `PROCUREMENT.BATCH_EXPIRY_CONFLICT`, and 422 `PROCUREMENT.BATCH_EXPIRY_MISMATCH_CONFIRMATION_REQUIRED`; posting the third with `confirmExpiryMismatch = true` succeeds and creates a separate batch

## Validation Rules
VR-05-012, VR-05-013, VR-05-017, VR-05-018; override reason VR-05-008.

## Authorization Rules
- Override is evaluated against the **posting** user's permissions; a reason entered by a user who lacks the permission does not authorize posting.
- The validate endpoint (`POST .../validate`) returns shelf-life results as warnings for drafts so receivers see them before posting.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Expiry ≤ business date | 422 `PROCUREMENT.BATCH_EXPIRED` |
| Remaining shelf life < minimum, no valid override | 422 `PROCUREMENT.SHELF_LIFE_BELOW_MINIMUM` |
| Override reason present, user lacks permission | 403 `PROCUREMENT.SHELF_LIFE_OVERRIDE_NOT_PERMITTED` |
| Override reason < 10 chars | 400 `COMMON.VALIDATION_FAILED` / `PROCUREMENT.REASON_REQUIRED` |
| Same medicine + batch with different expiry in one receipt | 422 `PROCUREMENT.BATCH_EXPIRY_CONFLICT` |
| Existing batch with different expiry, not confirmed | 422 `PROCUREMENT.BATCH_EXPIRY_MISMATCH_CONFIRMATION_REQUIRED` |

## Edge Cases
- Setting value 0 disables the shelf-life check but never the expired check.
- Remaining days are calculated in whole calendar days in the branch time zone; the boundary (remaining = minimum) is accepted.
- Month/year expiry "03/2027" is evaluated as 2027-03-31.
- Changing the branch setting after a draft was saved affects the draft at posting time (posting-time value wins).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-021 | Integration | Expiry = business date and < business date rejected even for Owner | US-05-05-AC1 |
| TS-05-022 | Unit | Remaining-days boundary: 179 rejected, 180 accepted, setting 0 disables check; Cairo midnight boundary | US-05-05-AC2 |
| TS-05-023 | Integration | Manager override stored on line and audited in posting transaction | US-05-05-AC3 |
| TS-05-024 | Security | Override reason supplied by user without permission → 403 | US-05-05-AC4 |
| TS-05-025 | Integration | Revalidation after business-date rollover; in-receipt expiry conflict; existing-batch mismatch with/without confirmation | US-05-05-AC5 |
