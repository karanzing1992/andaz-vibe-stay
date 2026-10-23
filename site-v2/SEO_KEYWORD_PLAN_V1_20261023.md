# Andaz V1 — Search Intent and Keyword Plan
Date: 23 October 2026 (Asia/Kolkata)
Status: staged V1 copy plan; **Andaz GSC not yet connected**. Related Arambol query evidence is available from a separate Moksha property and must not be represented as Andaz performance.

## Owner decision and scope
- Owner accepted the V1 visual direction on 23 October 2026. Frozen design branch: `release/andaz-v1-design-approved-20261023`.
- V1 improvement branch: `feat/andaz-v1-around-us-search-seo-20261023`.
- Preserve existing visual system, real property facts, contact flow and the production/PMS boundary.
- V1 Around Us is a static, searchable local guide; it does **not** claim Andaz operates sightseeing trips.

## Search intent by page
| Page | Primary search intent | Supporting phrases | On-page answer |
| --- | --- | --- | --- |
| Home | hostel in Arambol, Goa | social hostel Arambol; hostel with pool North Goa | What Andaz is, for whom, and what types of stay it offers |
| Rooms | dorms and private rooms in Arambol | AC dorm Arambol; non-AC dorm; private AC room Arambol | Actual room categories and an honest availability enquiry |
| Experiences | hostel with pool in Arambol | karaoke hostel Goa; social hostel Arambol | Pool, karaoke, party room, bar; Moksha as separate partner |
| Explore | things to do in Arambol; places to visit near Arambol | Arambol Beach; Sweet Water Lake; Keri Beach; Mandrem Beach; North Goa beaches; Chapora Fort; Candolim | Searchable local guide, descriptions, maps, answers to visitor questions |
| Contact | hostel booking enquiry Arambol | Andaz Vibe Stay contact; hostel on Temple Road Arambol | Direct contact details, room enquiry, address and booking process |

These are **hypotheses based on page intent and geography**, not keywords validated by impressions, rankings, traffic or search volume.

## Around Us usability specification
- 12 crawlable HTML cards from Keri / Tiracol through Arambol to Candolim.
- Instant local text search across place names, descriptions and common alternate spellings.
- Interest filters: beaches, nature, local life, forts / views.
- Area selector: Arambol, northbound, southbound.
- Live result count, clear/reset, useful no-results message, labels and pressed-state semantics.
- Shareable search/filter URL parameters; JavaScript-free card and map-link fallback.
- External Google Maps links; no third-party map embed, paid geocoding, account or tracking dependency.
- No unsupported travel times, distances, ticket fees, bookings or safety guarantees.

## Editorial quality and accuracy
- Keep useful, natural language; avoid keyword stuffing or claiming that every attraction is walking distance.
- Source-check place existence and general descriptions against Government of Goa / Goa Tourism Development Corporation.
- Do not imply Andaz owns, operates or includes nearby places.
- Present beaches and routes as independent suggestions. Conditions, access and transport can change.
- Use real Andaz photographs and accurate alt text before production where approved.

## First-party WordPress GSC verification — 23 October 2026
- **Use the in-house WP Manager / Engagement Core read-only GSC integration**, not paid GSC Wizard, for ongoing measurement. The owner-authorized route was tested live.
- WP Manager lists two paired sites: **Moksha Wellness Goa** (`https://mokshagoa.com`) and **Andaz StayCore PMS — Staging** (`https://staycore-stage.mokshagoa.com`). The latter is a PMS staging site, **not a verified public Andaz marketing-site GSC property**.
- `gsc_status` for Moksha: `connected=true`, property `https://mokshagoa.com/`, read-only `webmasters.readonly` scope, last sync 23 Oct 2026 14:58:22 UTC. Its most recent snapshot reports 159 clicks and 2,615 impressions.
- `gsc_status` for the paired Andaz StayCore staging site returned `wp_control_action_not_allowed` (HTTP 400); its listed capabilities do not include SEO. This is an **authorization / property-configuration boundary**. Do not bypass it or misattribute Moksha metrics to Andaz.
- Direct `gsc_search` (not GSC Wizard) successfully returned query and page rows for Moksha, **22 September–20 October 2026**. Small, geographically relevant signals: query “places to visit near arambol beach” = 1 click / 1 impression; “arambol things to do” = 0 clicks / 2 impressions. Moksha's `/things-to-do-in-arambol/` page = 1 click / 16 impressions. These are **cross-site directional signals only**, not validated Andaz search demand or rankings. Sample sizes are too small for numerical targeting.
- The V1 Explore page's primary phrase “things to do in Arambol” and supporting phrase “places to visit near Arambol Beach” remain reasonable test hypotheses. Keep useful natural wording, not repetition or keyword stuffing.
- Previous GSC Wizard attempt returned `payment_required / subscription_required`; it is not required for this workflow. No subscription or spend is authorized.

## Andaz GSC activation and post-launch measurement
1. Confirm the approved **public Andaz website domain** and deploy/pair the marketing site separately from StayCore PMS. Do not point marketing GSC actions at the PMS site or Moksha.
2. Verify the exact public domain/URL-prefix property in the first-party read-only GSC integration under the owner account, and ensure the correct site has an authorized SEO scope. Any permission or pairing change requires the owner's explicit approval.
3. When authorized, collect 28-day query/page/device/country rows, sitemap status and URL Inspection diagnostics from native `gsc_search`, `gsc_sitemaps` and `gsc_inspect`. Do not use URL Inspection to claim an indexing request.
4. After launch, map **Andaz-only** impressions, clicks, CTR and average position to each page; identify content gaps and revise copy from settled data. Treat low-volume or newly indexed pages cautiously.
5. Preserve this prelaunch keyword plan as a baseline. Do not claim Andaz GSC keyword rankings, traffic or CTR until the correct property is connected and measured.

## Production SEO gate
1. Confirm final public domain and owner-approved canonical URLs; avoid duplicate preview URLs in the index.
2. Verify live title, description, H1, semantic headings, useful internal links and structured data.
3. Confirm all property facts and location contact details; add approved real photos and alt text.
4. Test mobile usability, indexability, sitemap, robots rules, redirects and no accidental `noindex`.
5. Record a Search Console baseline when available, then monitor after release.
6. Obtain explicit production publish approval. Nothing in this branch modifies live hosting, PMS or DNS.

## Official references
- Google Search Central — SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Government of Goa — beaches: https://www.goa.gov.in/what_to_see/beaches/
- GTDC — North Goa beaches: https://goa-tourism.com/siteseeing/beaches-of-north-goa/
