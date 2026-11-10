# US-07-07: Allergy Alert and Acknowledgement at POS and Dispensing

| Field | Value |
|---|---|
| Story ID | US-07-07 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |
| Related Business Rules | BR-G-29, BR-G-32, BR-07-007, BR-07-008, BR-07-009, BR-07-010, BR-07-011 |
| Dependencies | US-07-04, US-07-05, US-07-06; external: SPEC-03 `MedicineIngredient`, SPEC-06 sale completion, SPEC-01 POS override re-authentication |

## User Story
As a pharmacist, I want the POS and dispensing screens to alert me when a medicine contains an active ingredient the linked patient is recorded as allergic to, and to record my acknowledgement and reason, so that I make an informed decision before supplying it.

## Business Value
Decision support that reduces the risk of supplying a medicine containing a recorded allergen, with an auditable record of the pharmacist's judgement. It does not replace professional judgement and does not check cross-reactivity.

## Preconditions
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

## Acceptance Criteria
### US-07-07-AC1: Exact ingredient match returned
- **Given** patient P has an `Active` allergy to ingredient "Amoxicillin" and medicine M contains "Amoxicillin" and "Clavulanic acid"
- **When** a user with `sales.pos.sell` in branch B POSTs `/api/v1/branches/{B}/patients/{P}/allergy-checks` with `[M]`
- **Then** one match (M, allergy) is returned with the decision-support disclaimer, and one `PatientAccessLog` row with `accessType` "AllergyCheck" is written

### US-07-07-AC2: No cross-reactivity inference
- **Given** P's only allergy is to "Amoxicillin" and medicine N contains only "Ampicillin"
- **When** the check runs for `[N]`
- **Then** no match is returned (only exact ingredient ids match)

### US-07-07-AC3: Free-text allergies flagged for manual review
- **Given** P additionally has an `Active` free-text allergy "Penicillin family"
- **When** the check runs for any medicines
- **Then** `unmatchedFreeTextAllergyCount` = 1 and no automatic match is produced from the free text

### US-07-07-AC4: Detail minimized for users without medical read
- **Given** a cashier without `patients.medical.read`
- **When** the check returns a match
- **Then** the match includes medicine and ingredient name, `severity` and `reaction` are null, and `detailRestricted` = true; a pharmacist with `patients.medical.read` receives severity and reaction

### US-07-07-AC5: Completion blocked until acknowledged (Warn mode)
- **Given** `AllergyAlertMode` = `Warn` and the cart contains M matched to P's allergy
- **When** the sale is completed without an acknowledgement for (M, allergy)
- **Then** the response is 422 `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` listing the unacknowledged matches, and no sale, stock movement, or payment is persisted

### US-07-07-AC6: Acknowledged sale persists acknowledgement atomically
- **Given** the cashier lacks `patients.allergy-alerts.acknowledge` and a pharmacist re-authenticates via the POS override and selects reason "PrescriberConfirmed"
- **When** the sale is completed with the acknowledgement and override token
- **Then** the sale completes and one `AllergyAlertAcknowledgement` row (sale, sale line, allergy, ingredient, reason, pharmacist as acknowledging user) is committed in the same transaction; if the sale fails, no acknowledgement row exists

### US-07-07-AC7: Reason text required for "Other"
- **Given** an acknowledgement with `reasonCode` "Other" and empty `reasonText`
- **When** the sale is completed
- **Then** the response is 400 `PATIENTS.ALLERGY_ACK_REASON_REQUIRED`

### US-07-07-AC8: Block mode
- **Given** `AllergyAlertMode` = `Block`
- **When** a sale or dispensing containing a matched medicine is completed, with or without acknowledgement
- **Then** the response is 422 `PATIENTS.ALLERGY_BLOCKED` and nothing is persisted; removing the matched line allows completion

### US-07-07-AC9: Server re-check catches allergy added after client check
- **Given** the POS checked the cart with no matches, then a pharmacist recorded a new matching allergy for P
- **When** the sale is completed
- **Then** the server re-check returns 422 `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` with the new match

### US-07-07-AC10: Branch not assigned (CS-07)
- **Given** a cashier assigned only to branch A
- **When** they POST an allergy check on `/api/v1/branches/{B}/...`
- **Then** the response is 403 `COMMON.FORBIDDEN` and no access-log row is written

### US-07-07-AC11: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B runs an allergy check for P in their own branch
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

### US-07-07-AC12: Acknowledgement by unauthorized user rejected
- **Given** neither the session user nor the override token holder has `patients.allergy-alerts.acknowledge`
- **When** the sale is completed with an acknowledgement
- **Then** the response is 403 `COMMON.FORBIDDEN` and nothing is persisted

## Validation Rules
VR-07-021, VR-07-022, VR-07-023.

## Authorization Rules
- Check: `sales.pos.sell` or `prescriptions.dispense` in the route branch.
- Acknowledge: `patients.allergy-alerts.acknowledge` held by the session user or proven by the override token (BR-07-011); acknowledging user id never taken from the payload.
- Severity/reaction visible only with `patients.medical.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| > 100 medicine ids or unknown medicine | 400 `PATIENTS.INVALID_ALLERGY_CHECK` |
| Unacknowledged match (Warn) | 422 `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` |
| Match in Block mode | 422 `PATIENTS.ALLERGY_BLOCKED` |
| `Other` without text | 400 `PATIENTS.ALLERGY_ACK_REASON_REQUIRED` |
| Access-log write failure | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` (sale with linked patient cannot complete) |
| Branch not assigned | 403 `COMMON.FORBIDDEN` |
| Foreign patient | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Sale without linked patient: no check, no alert.
- Medicine without ingredient data: no match; UI shows "no ingredient data for this medicine".
- One medicine matching two allergies requires two acknowledgements.
- Allergies with status `Inactive`/`EnteredInError` never match.
- Consent withdrawn: existing `Active` allergies still checked (BR-07-007).
- Dispensing (SPEC-08) is always via a sale, so the same completion re-check applies; `PrescriptionItemId` is stored on the acknowledgement when present.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-046 | Integration | Exact ingredient match on multi-ingredient medicine; access log `AllergyCheck` | US-07-07-AC1 |
| TS-07-047 | Unit | Matching ignores related-but-different ingredients (fixture data only) | US-07-07-AC2 |
| TS-07-048 | Integration | Free-text allergy counted, not matched | US-07-07-AC3 |
| TS-07-049 | Contract | Response minimization by permission | US-07-07-AC4 |
| TS-07-050 | Integration | Completion without ack → 422; no sale/stock/payment rows | US-07-07-AC5 |
| TS-07-051 | Integration | Override ack committed with sale; injected sale failure leaves no ack row | US-07-07-AC6 |
| TS-07-052 | Integration | `Other` without text → 400 | US-07-07-AC7 |
| TS-07-053 | Integration | Block mode rejects with/without ack; succeeds after removing line | US-07-07-AC8 |
| TS-07-054 | Integration | Allergy added between check and completion caught by server re-check | US-07-07-AC9 |
| TS-07-055 | Security | CS-07 unassigned branch → 403; CS-08 foreign patient → 404 | US-07-07-AC10, US-07-07-AC11 |
| TS-07-056 | Security | Ack without permission (session or override) → 403; payload user id ignored | US-07-07-AC12 |
| TS-07-057 | Performance | Check of 50 medicines p95 ≤ 200 ms (NFR-07-002) | US-07-07-AC1 |
