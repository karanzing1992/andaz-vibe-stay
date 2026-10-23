# Andaz V1 — Launch Candidate QA and Owner Review
Date: 23 October 2026 (Asia/Kolkata)
Status: **V1 visual direction accepted; upgraded candidate staged and QA-passed; not published to production**

## Baseline and release candidates
- Frozen owner-accepted design: `release/andaz-v1-design-approved-20261023`.
- Working improvement branch: `feat/andaz-v1-around-us-search-seo-20261023`.
- Browser-verified updated preview: https://raw.githack.com/karanzing1992/andaz-vibe-stay/5481053c909aab1dabf2e1b678360e506a313a50/site-v2/explore.html
- Existing root site and WordPress/PMS files remain untouched.

## V1 improvements completed
- Around Us grew from three static cards to **12 crawlable places** across Keri / Tiracol, Arambol and the North Goa coast down to Candolim.
- Instant place search, interest chips, area selector, result count, no-results reset and shareable URL query.
- Map links for each place; no paid mapping API or third-party embedded map.
- Prominent “Find nearby places” jump from the page hero into the searchable guide, with sticky-header offset.
- Natural language location descriptions, visitor FAQs and SEO-oriented metadata across all five pages.
- No invented ticket prices, travel times, room tariffs, property photos or sightseeing inclusions.

## QA receipts (Dell development lane)
Final full-suite receipt: `158c3a54-8910-4949-94b7-b8507b5d3bcf`, terminal `completed`, exit code **0**.
- Static checks: **241/241 PASS**.
- New Around Us browser suite: **47/47 PASS**.
- Existing five-page browser suite: **35/35 PASS**.
- Browser widths: **320, 390, 768, 1024, 1440 px**.
- Search, clear/reset, category + area combinations, deep-link restoration, empty state, result counts, safe Maps links, mobile navigation and synthetic WhatsApp booking tests all passed.
- Browser screenshots generated locally on Dell only. No live WhatsApp message or booking sent.
- Cloud browser opened the updated preview, verified the hero jump to `#around-us` and the search/filter section visibly rendered.

Earlier pre-CTA suite: receipt `a885397e-f1b6-4790-9330-fcac6e45319e`, exit 0, 238 static / 47 Around Us / 35 full-site checks.

## SEO evidence boundary
- Keyword-to-page plan: `site-v2/SEO_KEYWORD_PLAN_V1_20261023.md`.
- Based on page intent, property facts, Google Search Central guidance and official Goa tourism information.
- The connected GSC Wizard returned `payment_required` (subscription expired); no live Search Console query/impression/CTR data was available.
- Do not claim validated rankings, search volume or traffic lift. Baseline actual Andaz Search Console data when a free read-only route/property is available.

## Remaining release gates
1. Owner confirmation of public contact details, room/facility details and final copy.
2. Replace illustrative placeholders with owner-approved real Andaz photos and accurate alt text.
3. Confirm canonical production domain, sitemap/indexing plan, backups and rollback.
4. Explicit production publishing instruction, then live URL/mobile SEO smoke after deployment.

No production publish, DNS change, financial spend, permissions/root change, Mac connection use or PMS mutation occurred.

## Production/PMS non-regression verification
Final bounded Git comparison on Dell: receipt `1b910284-df0e-41b6-9733-ca3edb70bf6b`, terminal `completed`, exit code **0**. `git diff --exit-code origin/main HEAD -- index.html wordpress` passed. The changed-path list contains only `site-v2/` content. A first comparison attempt (`59aa5492-c5df-449d-8b1a-caa141da6e1d`) failed with exit 128 because a single-branch clone lacked `origin/main`; the missing read-only ref was fetched explicitly and the corrected comparison passed. No production files were changed.
