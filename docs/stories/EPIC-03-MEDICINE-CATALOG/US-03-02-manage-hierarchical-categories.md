# US-03-02: Manage hierarchical medicine categories

| Field | Value |
|---|---|
| Story ID | US-03-02 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |
| Related Business Rules | BR-03-013, BR-03-014, BR-03-024 |
| Dependencies | EPIC-01, EPIC-02 |

## User Story
As a Branch Manager, I want to organize medicines in a category tree of up to three levels so that staff can browse, filter, and report on the catalog by category.

## Business Value
A bounded hierarchy (e.g., "Pain relief > Analgesics > Paracetamol combinations") supports navigation and category-level sales and stock reports without unbounded tree complexity.

## Preconditions
- The user is authenticated with `catalog.reference-data.manage`.

## Acceptance Criteria
### US-03-02-AC1: Create a three-level path
- **Given** no categories exist
- **When** the user creates `Pain relief` (no parent), then `Analgesics` under it, then `Combinations` under `Analgesics`
- **Then** each returns 201 with `level` 1, 2, and 3 respectively, and GET `/api/v1/catalog/categories/tree` returns the nested structure.

### US-03-02-AC2: Fourth level rejected
- **Given** the level-3 category `Combinations`
- **When** the user creates a category with `parentId = Combinations`
- **Then** the response is 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` and no row is created.

### US-03-02-AC3: Move creating a cycle or excessive depth rejected
- **Given** `Pain relief` (L1) > `Analgesics` (L2), and a separate L1 `Cold & Flu` with child `Decongestants` (L2)
- **When** the user moves `Pain relief` under `Analgesics`, and separately moves `Cold & Flu` under `Analgesics`
- **Then** the first returns 422 `CATALOG.CATEGORY_CYCLE` and the second returns 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` (its child would become level 4).

### US-03-02-AC4: Sibling name uniqueness
- **Given** `Analgesics` exists under `Pain relief`
- **When** the user creates `ANALGESICS` under `Pain relief`, and `Analgesics` under `Cold & Flu`
- **Then** the first returns 409 `CATALOG.NAME_DUPLICATE` and the second returns 201.

### US-03-02-AC5: Deactivation blocked by active children
- **Given** `Pain relief` has the active child `Analgesics`
- **When** the user POSTs `/api/v1/catalog/categories/{PainRelief}/deactivate`
- **Then** the response is 409 `CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN`; after deactivating `Analgesics` and its children first, the same call returns 200.

### US-03-02-AC6: Filter includes descendants
- **Given** medicine A in `Pain relief`, B in `Analgesics`, C in `Combinations`, D in `Cold & Flu`
- **When** a user GETs `/api/v1/catalog/medicines?categoryId={PainRelief}`
- **Then** exactly A, B, and C are returned.

### US-03-02-AC7: Permission denied and cross-organization
- **Given** a Cashier without `catalog.reference-data.manage`, and a category K of another organization
- **When** the Cashier creates a category, and an authorized user of this organization GETs `/api/v1/catalog/categories/{K}`
- **Then** the first returns 403 `COMMON.FORBIDDEN` and the second returns 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`.

## Validation Rules
VR-03-019.

## Authorization Rules
Read/tree: `catalog.medicines.read`. Write: `catalog.reference-data.manage`. FR-03-045 isolation.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Name missing | 400 `COMMON.VALIDATION_FAILED` (`COMMON.REQUIRED`) |
| Parent from another organization | 400 `COMMON.VALIDATION_FAILED` (`CATALOG.REFERENCE_DATA_NOT_FOUND` on `parentId`) |
| Level 4 | 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` |
| Cycle | 422 `CATALOG.CATEGORY_CYCLE` |
| Duplicate sibling name | 409 `CATALOG.NAME_DUPLICATE` |
| Deactivate with active children | 409 `CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN` |
| Delete category used by a medicine | 409 `CATALOG.REFERENCE_DATA_IN_USE` |

## Edge Cases
- Moving a subtree recalculates `Level` for all descendants in the same transaction.
- A deactivated parent with already-inactive children may be reactivated without reactivating children.
- Filter by an inactive category still returns medicines assigned to it.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-008 | Integration | Create L1/L2/L3 and read tree | US-03-02-AC1 |
| TS-03-009 | Unit | Depth validation on create and on subtree move | US-03-02-AC2, US-03-02-AC3 |
| TS-03-010 | Unit | Cycle detection on move (self, child, grandchild as new parent) | US-03-02-AC3 |
| TS-03-011 | Integration | Sibling uniqueness vs same name under different parent | US-03-02-AC4 |
| TS-03-012 | Integration | Deactivation blocked by active child, then allowed | US-03-02-AC5 |
| TS-03-013 | Integration | Category filter returns descendants only | US-03-02-AC6 |
| TS-03-014 | Integration | 403 for Cashier write; 404 cross-organization (CS-08) | US-03-02-AC7 |
