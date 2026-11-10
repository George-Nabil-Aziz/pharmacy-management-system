# US-06-28: Loyalty Points Accrual (P3, subject to OD-06-08)

| Field | Value |
|---|---|
| Story ID | US-06-28 |
| Epic | EPIC-06 |
| Priority | P3 |
| Complexity | M |
| Related Requirements | FR-06-063 |
| Related Business Rules | BR-G-18, BR-G-25 |
| Dependencies | US-06-12, US-06-25, US-06-20, US-06-21 |

## User Story
As an owner, I want linked patients to earn loyalty points on purchases so that repeat customers are rewarded — once we decide the loyalty model (OD-06-08).

## Business Value
Decision support for a future retention feature; the story fixes the minimum ledger semantics so that a later decision does not require reworking sales.

## Preconditions
- OD-06-08 decided; `LoyaltyEnabled` = true, `LoyaltyEarnRate` = 1 point per 10.00 EGP net sales (illustrative); user holds `sales.loyalty.manage` for configuration.

## Acceptance Criteria
### US-06-28-AC1: Accrual on completion
- **Given** a sale with linked patient P and net sales (excluding tax) 247.63
- **When** the sale completes
- **Then** an append-only loyalty ledger entry of +24 points (floor(247.63 ÷ 10.00)) is written in the sale transaction

### US-06-28-AC2: Reversal on return and void
- **Given** the sale above
- **When** half of its net value is returned, and in another case the sale is voided
- **Then** a −12 points entry is written with the return; a −24 points entry is written with the void

### US-06-28-AC3: No patient or disabled program
- **Given** a sale without a linked patient, or `LoyaltyEnabled` = false
- **When** the sale completes
- **Then** no loyalty entry is written

### US-06-28-AC4: Configuration permission
- **Given** a manager without `sales.loyalty.manage`
- **When** the manager changes `LoyaltyEarnRate`
- **Then** the response is 403 `COMMON.FORBIDDEN`

## Validation Rules
- Earn rate 0.01–1,000.00 EGP per point; points are integers.

## Authorization Rules
- `sales.loyalty.manage` for configuration and manual adjustments (with reason, audited).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Configuration without permission | 403 `COMMON.FORBIDDEN` |
| Invalid earn rate | 400 `COMMON.VALIDATION_FAILED` |
| Patient of other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Liability accounting of outstanding points is out of scope until OD-06-08 (SPEC-09 impact).
- Points expiry rules pending OD-06-08.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-166 | Integration | Accrual on completion in same transaction | US-06-28-AC1 |
| TS-06-167 | Integration | Proportional reversal on return; full on void | US-06-28-AC2 |
| TS-06-168 | Integration | No accrual without patient / disabled | US-06-28-AC3 |
| TS-06-169 | Security | 403 on configuration without permission | US-06-28-AC4 |
