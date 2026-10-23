# Andaz Website — Marketing Matrix → Dev Matrix delivery contract

**Owner assignment:** 23 October 2026. **Implementation branch:** `feat/wp-static-hybrid-booking-20261023`. **Dev Matrix tracking:** https://github.com/aarondash5-star/business-house-matrix/issues/16. **No production deployment authorized by this branch.**

## Business and marketing brief
Andaz Vibe Stay - Arambol, Goa | Temple Road, Arambol 403524 | mobile-first social coliving hostel. Check-in 13:00, check-out 11:00. Guest number +91 89995 41081. Visitor journey: **STAY → CONNECT → PLAY → RESET**. Market the confirmed rooms and dorms, shared spaces, pool, karaoke, bar/social experience; **Moksha Wellness is a separate wellness partner**. Open with social discovery, authentic story and mobile booking action, not a huge search widget or generic palm/tree graphics. Avoid generic hostel templates; reuse and improve the actual existing `index.html` art/design. Do not imply cuisine/kitchen is operating. Show real, rights-cleared property photos only once verified; private staging may use clearly labelled placeholders. Facts, ratings, reviews, prices and OTA availability require dated source evidence before marketing.

## Technical truth checked live on 2026-10-23
- Existing public repo `karanzing1992/andaz-vibe-stay` contains a 26 KB single-page HTML/CSS design with WhatsApp-only enquiry. **It does not write a reservation or verify inventory.** Its hard-coded rating and food-positive quote must be reviewed/removed until sourced.
- Connected WordPress staging `https://staycore-stage.mokshagoa.com`, StayCore v0.8.6, routes under `/staycore/v1/` for units, guests, reservations and integrations. Staging API reports `mutations_enabled=false`; inventory is **two sample beds in room 9**, not public availability, not a production checkout.
- Site overview reports WordPress environment `production` though host naming contains `stage`; do not assume it is isolated enough for arbitrary writes. Requires backup/mutation and environment confirmation before deployment. Existing Moksha WordPress must not have its active theme replaced.
- Original site is also a GitHub Pages/static build. Maintain this public source unchanged; this feature branch is for an eventual WordPress-compatible theme package. No auto-publish of GitHub Pages, Vercel or WP.

## Architecture to implement
1. **Fast static-style WordPress theme:** cacheable marketing HTML, CSS and JS, minimal dependencies; WordPress for content/media/site admin; protect guest paths from page caching.
2. **Booking gateway truth:** public-facing date/guest/room inquiry validation and WhatsApp fallback now. When approved and implemented later, authoritative *server-side* StayCore adapter with public read-only availability response (no staff token), atomic authenticated booking write + overlap protection, date-based price and cancellation rules, sanitized errors. **Do not create fake browser-only reservation numbers or expose `/staycore/v1/reservations` publicly**.
3. **Accessibility, conversion, SEO:** 360/390/768/1280 viewport checks, focus/labels/date error states, no horizontal overflow, secure external links, canonical domain once approved, sitemap/structured data only when factual, performance budgets (Core Web Vitals), no stale price, consent-aware analytics.
4. **QA and handoff:** offline build and automated tests, independent code review + booking negative fixtures (sold-out, overlap, invalid dates, DST/timezones, guests, WhatsApp blocked), screenshot comparisons, no regression to existing staff PMS. Check images and brand truth. If complete checkout cannot be certified, final submission must say **ENQUIRY-ONLY** and explain precisely what adapter/API authorization is missing.

## Work order
Research & verified contract → design system/mob wireframes → WP theme & static port → booking UX and server adapter contract → independent QA/security/mobile tests → rollback/readme → final evidence package and owner review. Run isolated tasks as capabilities allow; autonomously diagnose and make code/test fixes **only within the scoped work branch/workcell**. Never bypass denied security tools, root restrictions or QA gates. Full Dev Matrix Gate E still NO-GO; do not report autonomous production readiness without real receipts.

## Release/acceptance
Commit code to review branch only, or provide independently tested candidate artifacts. No merge, live WP theme activation, PMS schema/guest data modification, API key access, spending or public publish. Owner will inspect complete staged submission, logs and blockers. This task remains **in progress** until browser QA and integration truth are verified.
