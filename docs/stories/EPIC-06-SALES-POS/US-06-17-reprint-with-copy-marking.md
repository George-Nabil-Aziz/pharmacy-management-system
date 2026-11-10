# US-06-17: Reprint Sales Invoice with COPY Marking

| Field | Value |
|---|---|
| Story ID | US-06-17 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-06-040 |
| Related Business Rules | BR-G-16, BR-06-030 |
| Dependencies | US-06-16 |

## User Story
As a cashier, I want to reprint an invoice that is clearly marked as a copy so that customers can get a replacement without a duplicate original existing.

## Business Value
Prevents duplicate originals being used for fraudulent returns or claims, and logs every reprint.

## Preconditions
- The original print (copy 0) exists for the sale.

## Acceptance Criteria
### US-06-17-AC1: COPY marking with sequence
- **Given** a sale with an original print record
- **When** the user prints it twice more
- **Then** the documents show "COPY 1" / "نسخة 1" and "COPY 2" / "نسخة 2", and print records with CopyNumber 1 and 2 are stored with user, time, format, and language

### US-06-17-AC2: Reprint audited
- **Given** a reprint
- **When** it is recorded
- **Then** an audit entry `SaleReceiptReprinted` with sale id, copy number, and user is written in the same transaction

### US-06-17-AC3: Idempotent print request
- **Given** a reprint request with Idempotency-Key K was processed
- **When** the same request with K is retried
- **Then** the same copy number is returned and no additional print record is created

### US-06-17-AC4: Permission denied and isolation
- **Given** a user without `sales.sales.read`, and a user of another organization
- **When** they request a reprint
- **Then** the first receives 403 `COMMON.FORBIDDEN`; the second 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- As US-06-16.

## Authorization Rules
- `sales.sales.read` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No permission | 403 `COMMON.FORBIDDEN` |
| Other branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |

## Edge Cases
- Concurrent reprints by two users → copy numbers unique and sequential (sale row lock or unique (SaleId, CopyNumber)).
- Return receipts follow the same COPY rule.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-100 | Integration | Sequential COPY numbering and print records | US-06-17-AC1 |
| TS-06-101 | Integration | Reprint audit entry | US-06-17-AC2 |
| TS-06-102 | Concurrency | Idempotent retry and concurrent reprints keep unique copy numbers | US-06-17-AC3 |
| TS-06-103 | Security | 403 without permission; CS-08 other org 404 | US-06-17-AC4 |
