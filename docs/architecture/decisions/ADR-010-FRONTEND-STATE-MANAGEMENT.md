# ADR-010: Frontend State Management — TanStack Query for Server State, Zustand for Client State

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Frontend lead, solution architect |
| Related BRQs | BRQ-07, BRQ-13 |
| Related NFR | NFR-G-02, NFR-G-09 |
| Related ADRs | ADR-005, ADR-009 |
| Supersedes | Resolves "Zustand or Redux Toolkit (final decision pending)" in `docs/2. Master SDD.md` §3 |

## 1. Context

The React SPA has two distinct kinds of state:

- **Server state** — medicines, batches, stock, sales, reports — fetched from the API, cached, invalidated, and refreshed (also hinted by SignalR events). TanStack Query is already chosen for this.
- **Client state** — the **POS cart** (lines, quantities, selected batch overrides, discounts, payments in progress, the sale's `Idempotency-Key`), held/parked carts, the **auth session** (in-memory access token, current user, selected branch), and **UI preferences** (language, direction, theme, sidebar state).

The owner left "Zustand or Redux Toolkit" open. The cart must survive accidental tab refresh (sales have no server-side draft, conventions §6.1), must be fast with frequent barcode scans, and must be testable.

## 2. Decision Drivers

1. **Minimal client state** — most state is server state handled by TanStack Query; the client-state tool should be small.
2. **Performance** — selective subscriptions so scanning an item does not re-render the whole POS.
3. **Persistence** — the POS cart and its idempotency key persist to `sessionStorage`/`localStorage` per branch and user; the access token must **never** be persisted (ADR-005).
4. **Developer ergonomics and boilerplate**.
5. **Testability** — stores testable without rendering.
6. **Bundle size** (NFR-G-09).

## 3. Considered Options

### Option A — Zustand (chosen)
- **Pros:** ~1 kB; hook-based with selector subscriptions (fine-grained re-renders); `persist` middleware with partialization (persist cart, exclude token); `devtools` middleware; minimal boilerplate; stores usable outside React (e.g., in the API client to read the access token); easy unit testing.
- **Cons:** Less prescriptive — conventions must be documented (store per concern, actions inside store); fewer built-in patterns for very large global state; no built-in data fetching (not needed — TanStack Query).

### Option B — Redux Toolkit (RTK)
- **Pros:** Strong conventions; excellent devtools/time travel; RTK Query alternative for server state; large ecosystem.
- **Cons:** More boilerplate (slices, store setup, typed hooks) for a small client state; RTK Query overlaps with TanStack Query (two server-state tools would be confusing); larger bundle.

### Option C — React Context + `useReducer` only
- **Pros:** No dependency.
- **Cons:** Context value changes re-render all consumers — problematic for a high-frequency POS cart; persistence and devtools must be hand-built; scaling to several stores leads to provider nesting.

## 4. Decision

Adopt **Option A**: **TanStack Query** for all server state and **Zustand** for client state.

1. **Stores** (one per concern, in `src/stores`):
   - `useAuthStore` — access token (memory only), current user, organization, permissions snapshot, selected branch. Not persisted except selected branch id.
   - `usePosCartStore` — per-branch cart(s): lines (`medicineId`, pack/base-unit quantity, optional FEFO override batch), discounts, payments draft, `idempotencyKey` (UUID generated when the cart moves to payment and reused for retries, CS-11), held carts. Persisted with key `pos-cart:{organizationId}:{branchId}:{userId}`; cleared on successful completion and on logout.
   - `useUiPrefsStore` — language, direction, theme (`light`/`dark`/`system`), layout preferences; persisted locally and synced to `UserPreference`.
2. **Rule:** server data is never copied into Zustand; components read it via TanStack Query hooks. Mutations invalidate query keys; SignalR events trigger invalidation, not direct cache writes of authoritative stock.
3. **Forms:** React Hook Form + Zod hold form state locally; not in Zustand.
4. **Cart validity:** persisted carts are revalidated against the server (prices, stock hints) when restored; the server remains authoritative at completion (BR-G-20 snapshot at completion time).
5. Stores expose actions and selectors; components subscribe with selectors; stores are unit-tested with Vitest.

## 5. Consequences

**Positive**
- Small, focused client state with fine-grained re-renders for POS performance.
- Clear separation: server state (TanStack Query) vs client state (Zustand) vs form state (RHF).
- Cart survives refresh; idempotent retries are natural.

**Negative**
- Fewer guard rails than Redux; conventions above must be enforced in review.
- Persisted carts may contain stale prices — mitigated by revalidation on restore.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Developers duplicate server data in stores | Lint/review rule; architecture note in frontend guidelines |
| Persisted cart leaks across users on shared POS terminals | Storage key includes user id; cleared on logout/user switch |
| Access token accidentally persisted | `partialize` excludes token; unit test asserts storage content |
| Cart completed twice after refresh | Idempotency key persisted with the cart; server replay (CS-11) |

## 7. Revisit Triggers

- Client state grows to require complex cross-store orchestration or time-travel debugging.
- Offline POS mode (if ever approved) requiring a durable local queue — would need IndexedDB and a sync design, beyond Zustand.

## 8. Related Documents

- [ADR-005](ADR-005-AUTHENTICATION.md), [ADR-009](ADR-009-LOCALIZATION.md)
- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §7 (Frontend state, Idempotency)
- SPEC-06 Sales & POS in [specs/](../../specs/)
