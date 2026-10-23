# Dev Matrix Andaz Stage A — Code and QA Receipt

**Date:** 2026-10-23. **Scope:** Source branch only, not installed on WordPress.

## Current delivery
- Original static `index.html` on `main` preserved. Candidate WP theme added under `wordpress/andaz-theme/`:
  - `front-page.php`: preserves original Andaz illustrations, layout, canonical brand and contacts, check-in/out. Adds WordPress hooks and accessible enquiry form.
  - `style.css`: GPL theme manifest; `functions.php`: WordPress front-end script loader, no DB writes; `index.php`: safe fallback.
  - `assets/booking.js`: local-calendar-safe arrival and departure validation and WhatsApp availability enquiry. No live room availability, prices, account/token storage, PMS call or misleading confirmation.
- Removed unverified hard-coded Google star/review aggregate, food-positive review quote and original fragile timezone-dependent enquiry script. Added independent FAQ on staff confirmation and separate wellness partner, keyboard focus visibility and reduced-motion handling.
- Source tests `tests/test_wordpress_theme.py` and behavior tests `tests/booking.test.cjs`.
- Source-of-truth marketing contract `docs/DEVMATRIX_AND_AZ_BUILD_CONTRACT_20261023.md`. Booking integration acceptance and safety in `docs/STAYCORE_BOOKING_INTEGRATION_GATE.md`.

## Dell real local smoke (nonproduction)
- Worker: Dell Generic SSH development lane, receipt `b15b627f-7979-46ce-932f-1e3d8bda44da`.
- Verified read-only clone of branch `feat/wp-static-hybrid-booking-20261023` into `~/andaz-wp-static-review-20261023`.
- Python unittest: **12/12 PASS**, exit 0.
- Node built-in `node --test` booking behavior: **5/5 PASS**, zero external requests.
- PHP syntax check: **BLOCKED**, `php: not found` on Dell (terminal command exit 127 after tests). No PHP lint success claimed.
- WordPress server-side rendering/integration: **NOT TESTED**; paired StayCore stage does not expose approved PMS mutations for booking, and no reviewed theme deployment capability was confirmed.

## Remaining gates before full website
1. Install a PHP runtime in isolated test environment or use independent approved PHP lint service, verify all PHP files. Do not modify host root/software unexpectedly.
2. Genuine mobile browser visual QA on 360/390/768/1280px and keyboard/screen reader, FPS/Lighthouse where possible; record screenshots and issues.
3. Replace illustrated *staging art* with rights-cleared real property photos as approved; owner copy/branding approval.
4. Implement verified availability/reservation backend contract server-side against correct production-authoritative StayCore; isolated fixture tests, concurrency/overlap and booking identity/privacy gates.
5. Staging environment verification and backups; install theme to truly isolated WP preview; confirm phone, CTA, canonical and booking behavior; independent security review.
6. Final PR/owner QA approval, then separately approved deployment. **No public booking-confirmed assertion** until server-side integration has passed.

**Decision:** Candidate source QA passed; full booking/WP integration release gate is **NO-GO**. Preserve working static public site and PMS.
