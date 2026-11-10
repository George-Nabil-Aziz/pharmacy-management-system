# US-05-03: Manage supplier contacts

| Field | Value |
|---|---|
| Story ID | US-05-03 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-05-007 |
| Related Business Rules | BR-05-001 |
| Dependencies | US-05-01 |

## User Story
As a Branch Manager, I want to record the people I deal with at each supplier (sales representative, accounts contact) so that staff in any branch can reach the right person to order, chase deliveries, or reconcile balances.

## Business Value
Egyptian distributors assign field sales representatives per area; keeping their mobile numbers on the supplier record removes dependency on personal phones and speeds re-ordering.

## Preconditions
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

## Acceptance Criteria

### US-05-03-AC1: Add contact
- **Given** a supplier with no contacts
- **When** a user with `procurement.suppliers.manage` POSTs `/api/v1/suppliers/{id}/contacts` with name "Mahmoud Adel", job title "Sales representative – Nasr City", mobile "01012345678", `isPrimary = true`
- **Then** the response is 201, the contact is returned in supplier detail as primary, and an audit entry is written

### US-05-03-AC2: Single primary contact
- **Given** a supplier whose primary contact is "Mahmoud Adel"
- **When** a user adds or edits contact "Sara Hassan" with `isPrimary = true`
- **Then** in the same transaction "Sara Hassan" becomes primary and "Mahmoud Adel" becomes non-primary; at no time does the supplier have two primary contacts

### US-05-03-AC3: Contact limit and field validation
- **Given** a supplier with 20 contacts
- **When** a user adds a 21st contact, or adds a contact with mobile "0101234" or email "sara@"
- **Then** the responses are 422 `PROCUREMENT.CONTACT_LIMIT_EXCEEDED`, and 400 `COMMON.VALIDATION_FAILED` with `PROCUREMENT.PHONE_INVALID` / `PROCUREMENT.EMAIL_INVALID`; no contact is added

### US-05-03-AC4: Edit and remove contact
- **Given** a supplier with contact "Mahmoud Adel"
- **When** the user PUTs a new mobile "01112345678" with a valid `If-Match`, then DELETEs the contact
- **Then** the edit returns 200, the delete returns 204, and both changes are audited with before values

### US-05-03-AC5: Permission denied and isolation
- **Given** a Pharmacist with only `procurement.suppliers.read`, and a contact belonging to a supplier of another organization
- **When** the Pharmacist POSTs a contact, and any user GETs or PUTs the other organization's contact id
- **Then** the Pharmacist receives 403 `COMMON.FORBIDDEN` and the other-organization requests return 404 `COMMON.NOT_FOUND`

## Validation Rules
VR-05-005, VR-05-006, VR-05-007; contact name 2–100 chars; job title ≤ 100 chars; notes ≤ 500 chars.

## Authorization Rules
- Write: `procurement.suppliers.manage`; read: `procurement.suppliers.read`.
- A `contactId` must belong to the `supplierId` in the route; otherwise 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| 21st contact | 422 `PROCUREMENT.CONTACT_LIMIT_EXCEEDED` |
| Invalid mobile / email | 400 `COMMON.VALIDATION_FAILED` (`PROCUREMENT.PHONE_INVALID` / `PROCUREMENT.EMAIL_INVALID`) |
| Stale If-Match | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Contact id of another supplier or organization | 404 `COMMON.NOT_FOUND` |
| Missing permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Phone numbers are stored normalized to `+20` E.164 form; "01012345678" and "+201012345678" are equal.
- Removing the primary contact leaves the supplier with no primary contact (allowed).
- Two concurrent requests both setting a different primary: the partial unique index guarantees one succeeds; the other returns 412 and can retry.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-011 | Integration | Add primary contact; verify detail and audit | US-05-03-AC1 |
| TS-05-012 | Integration | Switch primary contact; concurrent primary switch never yields two primaries | US-05-03-AC2 |
| TS-05-013 | Integration | 21st contact and invalid phone/email rejected | US-05-03-AC3 |
| TS-05-014 | Integration | Edit with If-Match then delete; audit before values | US-05-03-AC4 |
| TS-05-015 | Security | Read-only user 403; cross-organization contact id 404 (CS-08) | US-05-03-AC5 |
