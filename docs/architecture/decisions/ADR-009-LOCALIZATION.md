# ADR-009: Localization — i18next (Frontend), Resource Files with Stable Error Codes (Backend), Arabic/English with RTL/LTR

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, frontend lead, UX lead |
| Related BRQs | BRQ-13 |
| Related NFR | NFR-G-08, NFR-G-09 |
| Related ADRs | ADR-010 |
| Supersedes | — |

## 1. Context

The product targets Egyptian pharmacies where staff use Arabic and English interchangeably; many medicine trade names are in Latin script while UI and receipts are often Arabic. The UI must support Arabic (RTL) and English (LTR), locale-aware dates, numbers, and currency (EGP), and light/dark/system themes (BRQ-13). Validation messages must be translated, and API errors must be machine-readable so the UI can localize them. Medicine data may carry both Arabic and English names.

## 2. Decision Drivers

1. **Runtime language switching** without reload, persisted per user (`UserPreference`).
2. **RTL correctness** — mirrored layouts, bidirectional text (Latin medicine names inside Arabic sentences).
3. **Pluralization and interpolation** — Arabic has six plural categories (zero, one, two, few, many, other).
4. **Ecosystem fit** — React, React Hook Form + Zod validation messages, TypeScript key safety.
5. **Translator workflow** — JSON resources, namespaces per module, missing-key detection in CI.
6. **Bundle size** — lazy loading per namespace (NFR-G-09).

## 3. Considered Options

### Option A — i18next + react-i18next (chosen)
- **Pros:** Mature, very widely adopted; namespaces and lazy loading via backends; ICU-style plurals via `Intl.PluralRules` (full Arabic plural support); language detection; TypeScript key typing; integrations for Zod error maps; simple JSON resources; matches the owner's stack list.
- **Cons:** Less strict message-format validation than ICU-native libraries unless the ICU plugin is used; risk of untyped keys if typing is not configured.

### Option B — react-intl (FormatJS)
- **Pros:** ICU MessageFormat standard; strong date/number formatting; message extraction tooling.
- **Cons:** Heavier API with components/hooks; namespace lazy loading less ergonomic; team and owner already standardized on i18next.

### Option C — Lingui
- **Pros:** Compile-time message extraction and catalogs; small runtime; ICU syntax; good TypeScript support.
- **Cons:** Requires build-step macros (Babel/SWC plugin) in the Vite pipeline; smaller ecosystem; less familiar to the team.

## 4. Decision

Adopt **Option A** on the frontend and resource-based localization on the backend:

**Frontend**
1. `i18next` + `react-i18next`; languages `ar` and `en`; namespaces per module (`common`, `pos`, `inventory`, …) lazy-loaded.
2. Language is persisted in `UserPreference` (server) and mirrored in the Zustand UI store (ADR-010); on change, set `<html lang>` and `<html dir="rtl|ltr">`.
3. **RTL layout** via `dir` attribute and Tailwind **logical properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`); directional icons mirrored explicitly. Mixed-direction strings (medicine names, barcodes, batch numbers) wrapped in `<bdi>`/`dir="auto"`.
4. **Formatting** with `Intl.DateTimeFormat` / `Intl.NumberFormat` using locale and the branch time zone; currency per organization setting (default EGP). Numeral system (Arabic-Indic vs Western digits) for Arabic is a user preference, default Western digits for barcodes/batch numbers/quantities at POS.
5. Zod schemas emit message **keys**; a shared error map translates them.
6. CI checks: missing/unused keys, key parity between `ar` and `en`.

**Backend**
7. API errors return RFC 9457 Problem Details with stable `code` (e.g., `INVENTORY.INSUFFICIENT_STOCK`) and a localized `message` resolved from `.resx` resources using `Accept-Language` (`ar`, `en`; default per organization setting). Clients must branch on `code`, never on `message`.
8. Server-generated documents (sales invoice print, exports, notifications) use the requesting user's or organization's language.

**Data**
9. Bilingual fields where business-relevant (e.g., `Medicine.NameEn`, `Medicine.NameAr` optional; category names), defined in SPEC-03. Search normalizes Arabic text (alef/ya/ta-marbuta variants, diacritics removal) — detailed in SPEC-03.

## 5. Consequences

**Positive**
- Consistent bilingual UX with correct Arabic pluralization and RTL.
- Stable error codes decouple UI logic from message text.
- Lazy namespaces keep initial bundle small.

**Negative**
- Every UI string and error code needs two translations; translation becomes part of Definition of Done.
- RTL visual testing adds QA effort (snapshot tests in both directions).

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Hard-coded strings or physical CSS (`ml-*`) break RTL | ESLint rule for literal strings in JSX; Tailwind lint rule disallowing physical direction classes |
| Mistranslation of pharmacy terms | Glossary with Arabic equivalents ([GLOSSARY.md](../../GLOSSARY.md)); pharmacist review of `ar` resources |
| Bidi rendering bugs on receipts | Print templates tested with mixed Arabic/Latin content |
| Translation drift between `ar` and `en` | CI parity check |

## 7. Revisit Triggers

- Adding a third language or a right-to-left language other than Arabic.
- Requirement for translator-facing tooling with ICU validation (consider FormatJS/Lingui extraction or i18next ICU plugin).
- Bundle-size budget breached by localization resources.

## 8. Related Documents

- [ADR-010](ADR-010-FRONTEND-STATE-MANAGEMENT.md)
- [GLOSSARY.md](../../GLOSSARY.md)
- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §7
- SPEC-10 Notifications, Audit & Settings; SPEC-03 Medicine Catalog in [specs/](../../specs/)
