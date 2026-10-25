# Andaz Vibe Stay — Website V1.0.0 Frozen Release and GPT Sites Hosting Handover

**Release date:** 25 October 2026 (IST)  
**Product:** Andaz Vibe Stay - Arambol, Goa  
**State:** SOURCE FROZEN / DELL+VERCEL QA VERIFIED / GPT SITES DEPLOYMENT PENDING  
**Approved design lineage:** `release/andaz-v1-design-approved-20261023` → `feat/andaz-v1-around-us-search-seo-20261023` → navigation fix.

## 1. Release identity — do not silently substitute a newer working branch

- Git remote (sole source of truth): `https://github.com/karanzing1992/andaz-vibe-stay`
- **Frozen, already QA-verified website code commit:** `6dfd36832bee80c3dd34122ec01f402c45fc592e`
- Freeze branch: `release/andaz-site-v1.0.0-frozen-20261025`, created directly from that commit. This branch receives only this release handover documentation; the `site-v2/` website code must stay byte-for-byte equivalent to the frozen code snapshot.
- Website source root: `site-v2/`; the repository root `index.html` is a *different, legacy* site and MUST NOT be used for this release.
- Pages: `site-v2/index.html`, `rooms.html`, `experiences.html`, `explore.html`, `contact.html`.
- Shared code: `site-v2/assets/site.css`, `site-v2/assets/site.js`; hosting compatibility: `site-v2/vercel.json` has `cleanUrls: false` so navigation links to `*.html` work on Vercel.
- The five-page version includes the interactive 12-place Around Us search, category and area filtering, deep-link restoration, location descriptions, SEO metadata, and direct WhatsApp *enquiry* flow. It does not itself create a paid reservation or post to the PMS.

**Freeze rule:** Treat the fixed commit SHA—not a mutable Git branch name, model-generated reconstruction, Vercel alias, or ChatGPT Sites workspace—as the canonical V1.0.0 source. No edits, merges, auto-sync or rebuilds that change that code without an explicitly approved V1.0.1+ release. Preserve V1 for rollback.

## 2. Three-system ownership — source / development / production

| System | Authority | Allowed actions | Prohibited assumptions |
| --- | --- | --- | --- |
| **Dell / Dev Tool Yard** | Development and QA only | Research, change on feature branch, static and browser tests, screenshots, release evidence | Its working tree is not production; do not publish automatically |
| **GitHub** `karanzing1992/andaz-vibe-stay` | **Canonical, version-controlled source** | Pull requests, release snapshots, review evidence, reproducible rollback | No untracked edits should exist only in a hosted editor |
| **ChatGPT Sites** | **Intended temporary production/hosting target** | Import compatible frozen project, save candidate version, run QA, deploy and manage access | Not live until its own Sites project ID, saved version, deploy receipt and production URL are verified |
| **Vercel** | Existing temporary verification / fallback preview | Review and independently validate five pages; retain prior builds | Vercel preview is not the desired ChatGPT Sites production link |
| **Moksha Master Stack Registry** | Central technical change ledger | Source-backed release event and deployments with verified receipts | Submission to the inbox does not prove Google Doc publication |

**Required direction:** Dell development/QA → Git reviewed release commit → ChatGPT Sites import from pinned Git snapshot → Sites *Save version* → protected owner QA → Sites *Deploy* → verify Site's production URL and sharing. Git remains source of truth; any fixes made inside Sites must be ported back to Git and retested before replacing a live version. There is **no verified automatic GitHub↔Sites synchronization**.

## 3. Verified test baseline

- Dell release QA report: `site-v2/V1_LAUNCH_CANDIDATE_QA_20261023.md`, source batch passed **241 static**, **47 Around Us browser** and **35 five-page browser** tests across 320/390/768/1024/1440 px.
- A subsequent Vercel deployment initially served only the top-level repo homepage. Repaired Vercel project root to `site-v2`, then repaired navigation mismatch by committing `site-v2/vercel.json` with `cleanUrls: false`.
- **Frozen candidate Vercel QA deployment:** `dpl_CgvMtDNyNoof3GvfgZYdEgPg2x38`; `https://andaz-verification-latest-ot9ytbedz-karanbizweb360-3479.vercel.app/`.
- Authenticated Vercel HTTP verification passed status 200 for `/`, `/rooms.html`, `/experiences.html`, `/explore.html`, `/contact.html`, `/assets/site.css`, `/assets/site.js`. Vercel status READY. Site protected with Vercel SSO. These facts verify the Vercel preview, **not** compatibility with or live publication on ChatGPT Sites.

## 4. ChatGPT Sites production handoff / acceptance gates

ChatGPT Sites is a distinct first-party product available through ChatGPT **Work on web/desktop** with a Sites editing/publishing experience. An MCP action for Sites must be discovered in the actual execution environment before any claims of automatic publication. In a Work/Sites session, use `@Sites` and import/reuse the **actual Git release source** rather than recreating its styling or content from a prompt.

1. Connect/import repository `karanzing1992/andaz-vibe-stay` at release branch `release/andaz-site-v1.0.0-frozen-20261025` and set source root to `site-v2/` (or use an archive extracted from this commit if Git import is unsupported).
2. Run compatibility inspection for static multi-page HTML with relative `*.html` routes and CSS/JS. If Sites does not preserve those routes, prepare an adapter in a NEW reviewed Git branch, test, and release V1.0.1; do not silently change the frozen V1.
3. Preserve the entire five-page layout, links, typography, sections, responsive design, branded wording, Around Us search/filter/shareable URL, and WhatsApp enquiry links. Do not swap in generated photographs for genuine property imagery or suggest bookings are confirmed.
4. **Save a version first** (a save is not publication). Verify mobile width 320/390 and desktop 1440; open all five pages and their navigation; confirm data, page titles/SEO and link behavior; dry-run enquiry without sending a message or creating a booking.
5. After QA, **Deploy** the selected saved version to the Sites-hosted URL; inspect real project ID, version ID, deployment receipt and production URL. Sites deployments are production deployments; do not use the word 'preview URL' for a published Sites URL.
6. Set the intended sharing audience; do not presume the website is public merely because deployed (new Sites are initially private). Confirm as an authorized visitor that homepage and all four secondary pages load.
7. Record the Git commit, Sites project/version/deployment identifiers, exact production link, publish audience, verification results and rollback. Only then mark `SITES_PRODUCTION_VERIFIED`. No DNS/custom-domain change without separate approval.

## 5. Rollback and future iteration policy

- **V1.0.0 rollback anchor:** source code SHA `6dfd36832bee80c3dd34122ec01f402c45fc592e` plus saved Sites version ID once provisioned.
- Dell continues development on nonrelease feature branches. Subsequent approved fixes start `V1.0.1` or `V1.1.0`, not V1.0.0. Run QA on Dell, review Git diff, save a new Sites version, test before production deploy.
- Previous Vercel previews and legacy candidates remain untouched pending separate archival decision; do not modify WordPress StayCore/PMS, live bookings, DNS, guest data or production WordPress hosting as part of this freeze.
- Known prepublic-content checks: owner confirmation of contact/facility copy, owner-approved actual Andaz photos/alt text, and domain/indexing/backup/rollback plan. Keep V1 release distinct from any later content/SEO work.

## 6. Open status / audit

- `V1_GIT_SOURCE_FREEZE`: **COMPLETE** upon verification of release branch and handover commit.
- `V1_VERCEL_QA`: **PASS** (previously verified as above).
- `V1_GPT_SITES_IMPORT`: **PENDING** — requires a Sites-enabled Work runtime/project linkage; no imported Sites ID or live URL was observed at time of this source document.
- `V1_GPT_SITES_PRODUCTION`: **NOT DEPLOYED / NOT VERIFIED**.
- `REGISTRY_SYNC`: report via established Master Stack route, then confirm unique marker by Google Doc readback. Do not claim FULLY_SYNCED on event acceptance alone.

**No new recurring automation, subscription, domain change or permissions expansion is authorized by this release document.**
