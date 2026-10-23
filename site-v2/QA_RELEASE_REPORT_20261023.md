# Andaz V2 — Dell Release QA Report

Date: **2026-10-23** (Asia/Kolkata)  
Release state: **Private/local staging passed; production NOT released**

## Deliverable

Five-page, mobile-first website candidate at `site-v2/` on branch `feat/task1-dell-research-fivepage-20261023`.

- Home, Rooms, The Vibe, Explore, Contact
- Responsive design system, accessible menu, enquiry flow
- Room choices and separate Moksha partner positioning
- No rates, payment collection, PMS changes or invented photos
- No production merge, hosting or DNS change

## Research gate

- **Dell local SearXNG**: PASS, receipt `4f7cb28b-f175-4064-9c21-7a0f24615acd`, exit 0.
- Mac research connection **deprecated for Task 1 routing only**, not globally removed or reconfigured.
- Exact authenticated competitor extraction remains blocked by prior security/reviewer gates. No bypass.
- No uncertified OTA rates or competitor claims appear on the site.

## Static/logic QA

- `python3 site-v2/tests/smoke.py`: **229/229 checks passed**.
- `node --check site-v2/assets/site.js`: **PASS**.
- Browser smoke source: `site-v2/tests/browser-smoke.cjs`.
- Static suite terminal receipt: `9dee8e63-6600-4350-b5f5-d26cc043bef9`. The suite itself passed, but the combined command initially exited 128 because a single-branch clone did not yet have `origin/main`; this was a test-setup issue, not a website defect. The main ref was fetched without changing the site.

## Real-browser QA

Dell existing Chrome 155 + already-installed Playwright, launched in an isolated headless context. No authenticated user profile was used.

**22/22 browser assertions passed**, receipt `737dd086-55cc-4892-814d-92424abc00e9`, exit 0:

- All five pages at **390px, 768px and 1440px**: proper page structure, active navigation, computed style, no horizontal overflow.
- Mobile menu opens, navigates and closes.
- Room detail link preselects the right booking option.
- Empty booking request rejected.
- Same-day checkout rejected.
- Valid synthetic request builds a correctly encoded WhatsApp enquiry.
- Outgoing WhatsApp navigation was intercepted: **no real message sent**.
- Mobile home/contact and desktop home screenshots saved **locally on Dell only** in `site-v2/.qa-artifacts/` (uncommitted).

Final Dell regression receipt: `52d98129-7fc9-46cf-9a75-97b09dab57b0`, exit **0**. Repeat static QA 229/229, JS syntax checks, and `git diff --exit-code origin/main HEAD -- index.html wordpress` all passed. The only untracked local directory was `.qa-artifacts/` (three generated browser screenshots); no source drift.

## Regression and security boundary

- Existing repository-root `index.html` and `wordpress/staycore-pms` were not modified by this feature branch.
- No environment/credential files or guest data were committed.
- No autonomous Dev Brain or Mac controller reactivated.
- No publish, deployment, spend, live booking/payment, root, permission or DNS changes.

## Pending before production

1. Owner visual/content review, especially real Andaz property photographs and final facility details.
2. Verify public contact details and check-in/out against current operations.
3. Decide the production hosting/deployment destination, back up live files, and document rollback.
4. Obtain explicit production-release approval and perform live URL/mobile QA afterwards.

**Release decision:** PASS for isolated functional prototype; NOT approved or certified for production publication.
