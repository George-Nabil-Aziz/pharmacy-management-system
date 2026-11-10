# US-06-29: Loyalty Points Redemption as Payment (P3, subject to OD-06-08)

| Field | Value |
|---|---|
| Story ID | US-06-29 |
| Epic | EPIC-06 |
| Priority | P3 |
| Complexity | M |
| Related Requirements | FR-06-064 |
| Related Business Rules | BR-G-35, BR-06-011 |
| Dependencies | US-06-28, US-06-13 |

## User Story
As a cashier, I want a linked patient to pay part of a sale with loyalty points so that rewards are usable at the counter.

## Business Value
Completes the loyalty loop; documented now to keep the payment model extensible (`LoyaltyPoints` as a non-cash method).

## Preconditions
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

## Acceptance Criteria
### US-06-29-AC1: Redeem within balance and cap
- **Given** patient P has 500 points and a sale total of 261.59
- **When** the cashier applies 400 points (40.00 EGP) and pays the rest in cash
- **Then** payments are LoyaltyPoints 40.00 and Cash 221.59; a −400 points ledger entry is written in the sale transaction

### US-06-29-AC2: Insufficient points or above cap
- **Given** P has 100 points, or the redemption exceeds 50% of the total
- **When** the sale is submitted
- **Then** the response is 422 `SALES.LOYALTY_INSUFFICIENT_POINTS` and nothing is persisted

### US-06-29-AC3: Concurrent redemption
- **Given** P has 500 points and two sales each redeeming 400 points are submitted concurrently
- **When** both execute
- **Then** exactly one succeeds (loyalty account row locked); the other returns 422 `SALES.LOYALTY_INSUFFICIENT_POINTS`

### US-06-29-AC4: Refund of redeemed points
- **Given** a sale paid partly by points is fully returned
- **When** the refund is allocated
- **Then** the points portion is refunded as points (+400) and the remainder by the original methods

### US-06-29-AC5: Patient of another organization
- **Given** a sale referencing a patient of another organization for redemption
- **When** submitted
- **Then** the response is 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- Points integer > 0; redeemed value counts as non-cash (≤ total, VR-06-018).

## Authorization Rules
- `sales.pos.sell`; patient linked with `patients.profiles.read` (403 without it).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Insufficient points / above cap | 422 `SALES.LOYALTY_INSUFFICIENT_POINTS` |
| No patient linked | 400 `COMMON.VALIDATION_FAILED` |
| Other organization patient | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Program disabled after points earned → redemption blocked until re-enabled (OD-06-08).
- Points redeemed are excluded from cash expected (non-cash).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-170 | Integration | Redemption payment and ledger entry | US-06-29-AC1 |
| TS-06-171 | Integration | Insufficient / above cap rejected | US-06-29-AC2 |
| TS-06-172 | Concurrency | Concurrent redemption → one success | US-06-29-AC3 |
| TS-06-173 | Integration | Points refunded on return | US-06-29-AC4 |
| TS-06-174 | Security | CS-08 other-organization patient 404 | US-06-29-AC5 |
