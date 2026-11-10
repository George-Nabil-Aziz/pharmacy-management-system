# US-03-13: Manage alternative medicines and suggestions

| Field | Value |
|---|---|
| Story ID | US-03-13 |
| Epic | EPIC-03 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-03-032, FR-03-033, FR-03-045 |
| Related Business Rules | BR-03-017, BR-03-024, BR-G-17 |
| Dependencies | US-03-04, US-03-05, US-03-12 |

## User Story
As a Pharmacist, I want to link alternative medicines and receive composition-based suggestions so that I can review possible options without the system asserting therapeutic equivalence.

## Business Value
Curated links and transparent suggestions help navigation while preserving pharmacist judgment and avoiding unsupported clinical claims.

## Preconditions
- Source and target medicines are in the same Organization.
- The actor holds `catalog.medicines.update` to change links or `catalog.medicines.read` to view suggestions.

## Acceptance Criteria
### US-03-13-AC1: Link and unlink an active alternative
- **Given** two distinct Active medicines in the same Organization
- **When** a user with `catalog.medicines.update` links them with `bidirectional = true` or unlinks the relationship
- **Then** the reverse link is created or removed as requested, and duplicate links are not created.

### US-03-13-AC2: Enforce alternative constraints
- **Given** a self-target, inactive target, existing link, or a medicine already linked to 20 alternatives
- **When** an authorized user attempts to add another link
- **Then** the request is rejected with the relevant 422 or 409 code and no partial link is persisted.

### US-03-13-AC3: Suggest matching composition
- **Given** Active medicines with the same dosage form and identical ingredient/strength/unit sets
- **When** the caller requests suggestions
- **Then** at most 20 unlinked medicines excluding the source are returned and labelled for pharmacist review.

### US-03-13-AC4: Deny unauthorized and foreign-Organization links
- **Given** a caller without update permission or a target medicine owned by another Organization
- **When** they attempt to link the target
- **Then** missing permission returns 403 `COMMON.FORBIDDEN`, the foreign target returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no foreign data is disclosed.

## Validation Rules
- Target must differ from source, be Active, be unlinked, and keep the total at or below 20 (VR-03-025).
- External catalog sources require licensing approval under REG-09; no official national drug database is assumed or integrated.

## Authorization Rules
- Link/unlink requires `catalog.medicines.update`; reading alternatives/suggestions requires `catalog.medicines.read`.
- Cross-Organization targets return 404. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Self-reference | 422 `CATALOG.ALTERNATIVE_SELF_REFERENCE` |
| Inactive target | 422 `CATALOG.MEDICINE_INACTIVE` |
| Duplicate link | 409 `CATALOG.ALTERNATIVE_DUPLICATE` |
| Alternative limit exceeded | 422 `CATALOG.ALTERNATIVE_LIMIT_EXCEEDED` |
| Missing update permission | 403 `COMMON.FORBIDDEN` |
| Foreign Organization target | 404 `CATALOG.MEDICINE_NOT_FOUND` |

## Edge Cases
- Suggested matches are decision support only and do not claim therapeutic equivalence or interchangeability.
- Composition equality compares the complete set of ingredient, strength value, and strength unit rows.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-074 | Integration | Bidirectional link and unlink of active medicines | US-03-13-AC1 |
| TS-03-075 | Integration | Self, inactive, duplicate, and 20-link boundary failures | US-03-13-AC2 |
| TS-03-076 | Integration | Suggestions match dosage form and full ingredient composition | US-03-13-AC3 |
| TS-03-077 | Integration | Missing permission returns 403 and foreign target returns 404 (CS-08) | US-03-13-AC4 |
