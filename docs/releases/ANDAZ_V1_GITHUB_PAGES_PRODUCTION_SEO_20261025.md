# Andaz Website V1.0 — GitHub Pages Production Release and SEO Runbook

**Date:** 25 October 2026 (Asia/Kolkata)  
**Public property name:** Andaz Vibe Stay - Arambol, Goa  
**Status:** **GITHUB PAGES LIVE AND VERIFIED**, custom domain not configured.  
**Supersedes:** The earlier `ANDAZ_WEBSITE_V1_0_0_FREEZE_AND_GPT_SITES_20261025.md` *hosting target only*. The earlier Git source-freeze rules remain binding. User chose GitHub Pages rather than ChatGPT Sites for current production hosting.

## Source, rollout and rollback

- **Canonical source repository:** `karanzing1992/andaz-vibe-stay`.
- **Frozen baseline website SHA:** `6dfd36832bee80c3dd34122ec01f402c45fc592e` at `site-v2/`.
- **Frozen release branch:** `release/andaz-site-v1.0.0-frozen-20261025`. Site files unchanged there; documentation-only updates allowed.
- **Deployment commit on `main`:** `741bd4abe7fa770900a60d6d509a6e33e0e05539`. This copies the approved five-page V1 to the repository root, where the **preexisting** GitHub Pages deployment workflow publishes it. It makes narrowly scoped hosting/SEO additions (self-referential canonical, og:url, site name, Twitter card, sitemap, robots, .nojekyll, release manifest).
- **Deployment staging branch:** `deploy/andaz-v1-github-pages-seo-20261025`. Preserve as rollback/diff reference; do not mutate the V1 snapshot.
- **Prior GitHub Pages `main` SHA:** `21de8351238f9292e270a7635cbac7a08dd55c63`.
- **Rollback:** revert deployment commit on `main` through normal reviewed Git history and verify GitHub Pages workflow and live URL. Avoid destructive force pushes; maintain StayCore/PMS data and WordPress files. Previous isolated Vercel review URL remains an optional independent fallback, not public canonical.
- **Dev/Test:** Dell Dev Tool Yard. **Source-of-truth:** Git. **Production:** GitHub Pages from `main` using preexisting `.github/workflows/deploy-pages.yml`. Do not create an alternate deployer, edit root/sudo/credentials, or trigger paid infrastructure.

## Verified production URLs

- Home: https://karanzing1992.github.io/andaz-vibe-stay/
- Rooms: https://karanzing1992.github.io/andaz-vibe-stay/rooms.html
- Experiences: https://karanzing1992.github.io/andaz-vibe-stay/experiences.html
- Explore / Around Us: https://karanzing1992.github.io/andaz-vibe-stay/explore.html
- Contact: https://karanzing1992.github.io/andaz-vibe-stay/contact.html
- XML sitemap: https://karanzing1992.github.io/andaz-vibe-stay/sitemap.xml
- Robots file: https://karanzing1992.github.io/andaz-vibe-stay/robots.txt

**CI receipts:** Deploy Andaz Website https://github.com/karanzing1992/andaz-vibe-stay/actions/runs/40180899294 and Pages Build/Deployment https://github.com/karanzing1992/andaz-vibe-stay/actions/runs/40180898328 both **completed: success**, source commit `741bd4a`.

**Live technical verification:** Dell authenticated development-lane terminal receipt `f0280ff9-55f5-483a-9440-24b15ab7ad03` completed exit 0: HTTP 200 on all five public pages plus sitemap, robots, CSS and JavaScript. Sitemap contains five <loc> URLs. Headless Chrome on Dell at 390 and 1440 px, receipt `bad375bc-4eac-4db6-959d-74227af17040`, exit 0: all five page loads, valid canonical, stylesheet applied, no horizontal overflow, homepage-to-rooms navigation passes. Staging validation receipt `29556346-08cd-4247-a497-5b546001e938`, exit 0: titles, descriptions, canonical, OpenGraph, JSON-LD JSON syntax, all local links, XML sitemap, assets. Commit diff includes no `wordpress/` or `.github/` changes.

## SEO deployment baseline

1. Unique page title and meta-description for each of the five crawlable HTML pages.
2. Absolute HTTPS **self-canonical** and matching `og:url`, with current GitHub Pages project path `/andaz-vibe-stay/`.
3. Existing `schema.org` Hostel structured-data JSON validated for parseability (not a guarantee of Google rich-result eligibility).
4. Crawlable HTML Around Us destinations (12 places), internal navigation, page headings and mobile layout.
5. `sitemap.xml` lists exactly those five canonical URLs. `robots.txt` at project path carries an Allow and sitemap pointer; **for a GitHub project site, Google interprets crawler robots directives from the host root `https://karanzing1992.github.io/robots.txt`, not the project subpath.** The project copy will become root-scoped only after a custom hostname is connected and project path disappears. Do not claim a project-subpath robots file is a host-level robots policy.
6. No custom domain, Google Search Console property verification, sitemap submission, indexing, ranking or search performance has been claimed. GitHub Pages publication is not automatic Google indexing.

## Future custom-domain cutover — separate owner-authorized release

1. Choose and verify ownership of the intended Andaz domain; add the domain through **Repository Settings → Pages → Custom domain** and follow GitHub-provided DNS instructions (A/AAAA/CNAME depending on apex/subdomain). Do not invent host records before seeing GitHub's exact requirements.
2. Wait for DNS and HTTPS checks before switching canonical authority. Preserve the GitHub Pages deployment and tested rollback path.
3. Update every `<link rel=canonical>`, `og:url`, XML sitemap <loc> and sitemap reference to the **actual verified custom-domain origin** (and new base path, usually `/`). If using CNAME file, align it with Pages settings and check repo exposure. Use a reviewed Git commit, not an untracked manual edit.
4. Confirm all five pages, CSS/JS, internal links, Around Us search, mobile layout, WhatsApp enquiry dry-run, security/SSL and 404 behavior on the custom hostname. Check GitHub Pages forwarding behavior from old `github.io` URL and canonical consistency.
5. Verify ownership in Google Search Console, submit new sitemap, check indexing, Core Web Vitals and search performance *after actual data is available*. Update Google Business Profile and OTA links only after domain verification/approval.
6. Close the release gate and report to Moksha Master Stack Registry with source SHA, deployed URLs, QA receipts, rollback and verified state.

## Boundaries

Static site uses direct enquiry (not a transactional PMS booking engine). No booking data is migrated or created by this deployment. Existing Andaz WordPress/PMS sources remain untouched. Moksha Wellness is the separate wellness partner, not the primary property name. Public photos and facility/copy claims remain subject to owner review. Do not retire other candidates or alter DNS without owner approval.
