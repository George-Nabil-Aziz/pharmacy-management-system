# End-to-End Test Plan

**Version:** 1.0 (2026-11-10) · **Parent:** [MASTER-TEST-STRATEGY.md](MASTER-TEST-STRATEGY.md)
**Tool:** Playwright (TypeScript) against the full Docker Compose stack seeded with the demo dataset ([TEST-DATA-STRATEGY §4](TEST-DATA-STRATEGY.md)).

## 1. Scope and principles

- E2E tests cover **critical user journeys** across modules through the real UI. Rules and edge cases belong in the integration and component tests. E2E proves the pieces work together for a real role, in Arabic and English.
- Each journey runs in **two locales**:
  - `ar`: RTL, Arabic UI, Latin digits by default;
  - `en`: LTR.
  The core POS journey also runs in dark theme.
- Browsers: Chromium for every nightly run. WebKit and Firefox run on the release candidate.
- Selectors use `data-testid` or accessible roles and names, never CSS structure, so that RTL mirroring does not break tests.
- Each journey asserts UI state **and** verifies backend effects through read APIs: stock, documents, audit entries.
- Barcode scanning is simulated as keyboard-wedge input (characters plus Enter) per the SPEC-06 assumption.

## 2. Journeys

### 2.1 MVP journeys (release gate G8)

| ID | Journey | Role(s) | Stories | CS |
|---|---|---|---|---|
| E2E-01 | Login, refresh across idle period, logout; locked account message | Cashier | US-01-02, US-01-03, US-01-04, US-01-07 | — |
| E2E-02 | Owner configures branch settings (near-expiry 60 days), invites a cashier, assigns branch, cashier accepts invitation and logs in | Owner, Cashier | US-02-07, US-01-11, US-01-14 | — |
| E2E-03 | Create medicine with two barcodes, pack size 20, split-pack allowed, Rx-only; set price; search it in Arabic with normalized spelling | Pharmacist | US-03-04, US-03-06, US-03-07, US-03-09, US-03-11 | — |
| E2E-04 | Direct goods receipt: two batches with different expiries; post; stock card shows two `Receipt` movements | Inventory staff | US-05-04, US-05-05, US-05-06, US-04-08 | — |
| E2E-05 | **Core POS sale**: open cash session → scan barcode → add pack and units → line discount within limit → cash + card split → print 80 mm receipt; stock deducted FEFO from the earliest batch | Cashier | US-06-08, US-06-02, US-06-03, US-06-06, US-06-12, US-06-13, US-06-16, US-04-04 | — |
| E2E-06 | Discount above limit requires manager override at the POS | Cashier, Manager | US-06-07, US-01-17 | — |
| E2E-07 | Expired batch not offered; only stock is expired → POS shows insufficient sellable stock | Cashier | US-06-12, US-04-15 | CS-02 |
| E2E-08 | Card payment not confirmed / cashier cancels payment dialog → no sale, stock unchanged | Cashier | US-06-13 | CS-09 |
| E2E-09 | Partial return of a sale, then return of the remainder; third attempt blocked; refund in cash; pharmacist inspects and restocks one line, discards another | Cashier, Pharmacist | US-06-21, US-06-23, US-06-24 | CS-05 |
| E2E-10 | Void the last sale in the same session; stock restored | Manager | US-06-20 | — |
| E2E-11 | **Prescription flow**: register Rx with image for patient with allergy; pharmacist verifies; POS dispenses 30 of 60 tablets with allergy alert acknowledged; next day dispenses remaining 30; status FullyDispensed | Pharmacist | US-08-03, US-08-05, US-08-08, US-08-12, US-06-25, US-06-27, US-07-07 | CS-04 |
| E2E-12 | Rx-only medicine without prescription blocked at POS; controlled medicine by cashier blocked | Cashier | US-06-26, US-08-13 | CS-13 |
| E2E-13 | Stock adjustment above threshold requires approval by a different user; approval posts movement | Inventory staff, Manager | US-04-11, US-04-12 | — |
| E2E-14 | Close cash session with blind count; variance above tolerance requires note; Z-report printed | Cashier | US-06-10, US-09-07 | — |
| E2E-15 | Reports: daily sales, gross profit, stock valuation, near-expiry; CSV export; numbers match seeded golden totals | Owner, Accountant | US-09-03, US-09-05, US-09-08, US-09-10, US-09-18 | — |
| E2E-16 | Notifications: near-expiry and low-stock appear in notification center after nightly job | Manager | US-10-09, US-10-13 | — |
| E2E-17 | Language and theme switch persists across sessions; RTL layout of POS and invoice | Any | US-10-20, US-10-21, US-10-23 | — |
| E2E-18 | Branch isolation in UI: cashier of branch A cannot open branch B pages (deep link shows 403 page); other organization's sale URL shows 404 page | Cashier | US-02-10, US-01-10 | CS-07, CS-08 |
| E2E-19 | Audit search shows the void, the override, and the adjustment from previous journeys | Owner | US-10-04 | — |

### 2.2 V1 journeys

| ID | Journey | Stories | CS |
|---|---|---|---|
| E2E-20 | Purchase order → approval → partial receipt (60/100) → remaining receipt → supplier invoice match | US-05-09, US-05-10, US-05-12, US-05-13, US-05-14 | CS-03 |
| E2E-21 | Transfer A1 → A2: request, approve (reservation), dispatch, short receipt, in-transit view | US-04-19 … US-04-22 | CS-06 |
| E2E-22 | Stocktake with blind count during live sales; variance approval | US-04-23 … US-04-25 | — |
| E2E-23 | Supplier return from a specific supplier's batch and payment allocation | US-05-16 … US-05-19 | — |
| E2E-24 | Real-time notification arrives without refresh; reconnect catch-up | US-10-12 | — |
| E2E-25 | MFA enrollment and login for Owner | US-01-18, US-01-19 | — |

### 2.3 Concurrency journey (UI level, release candidate)

| ID | Journey | CS |
|---|---|---|
| E2E-C1 | Two browser contexts (two cashiers) add the last unit and press Pay at the same time (synchronized by a test barrier): one receipt printed, the other sees an "insufficient stock" message with refreshed availability | CS-01 |
| E2E-C2 | Double-click / network retry on Pay (request intercepted and replayed) produces one sale and one invoice number | CS-11 |

## 3. Data and environment

- Nightly re-seed of the demo dataset. Each journey creates its own medicines and batches through API helpers, with a unique run suffix, so journeys can run in parallel without collisions.
- The clock is controlled through a test-only time-travel endpoint, enabled only in E2E builds. It is used for the next-day dispensing in E2E-11 and the nightly jobs in E2E-16.
- Printing is captured by intercepting the print preview HTML, and assertions are made on content: Arabic text, totals, invoice number, the "COPY" marking.

## 4. Reporting and gates

- Playwright HTML report, plus trace and video on failure, published as CI artifacts.
- **G8:** 100% of §2.1 journeys pass in both `ar` and `en` on the release candidate. A flaky journey blocks release until fixed.
- E2E-C1 and E2E-C2 must pass 20 consecutive runs on the release candidate.

## 5. Manual exploratory and UAT sessions

Before each release, a pharmacist SME runs 2-hour exploratory sessions in Arabic covering the following, with findings logged as defects:
- dispensing;
- returns;
- controlled medicines;
- receipt readability on an 80 mm thermal printer;
- keyboard-only POS use with a real USB barcode scanner.
