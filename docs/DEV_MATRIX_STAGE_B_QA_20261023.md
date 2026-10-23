# Andaz Stage B — real browser, callback utility and PMS contract receipt

**Date:** 2026-10-23. **Source:** `feat/wp-static-hybrid-booking-20261023` / draft PR #2. **No production deployment.**

## Real Dell browser QA (passed)
- Worker: Dell development lane, terminal receipt `da86b625-3fa6-4b32-a6be-79c209e9e400`, exit **0**.
- Test: `node tests/browser_cdp_mobile.cjs`, uses installed Chrome 155 DevTools Protocol device-metric emulation, not a screenshot approximation. Isolated `file://` static preview strips PHP and external font import; tests front-end layout only.
- Verified actual viewport widths and `document.documentElement.scrollWidth`:
  - **360 CSS px:** width 360, scrollWidth 360, no overflow.
  - **390 CSS px:** width 390, scrollWidth 390, no overflow.
  - **768 CSS px:** width 768, scrollWidth 753, no overflow.
  - **1280 CSS px:** width 1280, scrollWidth 1265, no overflow.
- All four viewports passed: exact width, booking form visible, date JS initialized, status region, mobile CTA behavior and no overflowing elements detected.
- Earlier `tests/browser_responsive_smoke.py` used `--window-size` and Chrome enforced a **minimum 500 CSS-pixel viewport** for 360/390 requests; its green result **does not certify mobile widths** and is superseded by the CDP test above. This correction is material; do not cite the earlier result as 360px QA.
- Independent contract tests: `12/12` Python theme; `5/5` Node booking behavior; `12/12` Python callback utility tests, Dell terminal receipt `4f7045cb-5cc4-4799-bfd0-e2f2fdb3caa6`, exit **0**.
- Browser pixel screenshots, screen-reader interaction, PHP lint, WordPress-rendered preview and PMS booking remain unverified.

## Verified StayCore API source
Reviewed `karanzing1992/staycore-pms/includes/class-staycore-rest.php` (main, 2026-10-23), route registrations approximately lines 82–104. `GET /staycore/v1/units` is permissioned `can_view`; `GET /staycore/v1/reservations` is permissioned `can_view`; `POST /staycore/v1/reservations` is permissioned `can_reservations`. There is **no public availability API** in the registered routes. The public self-check-in/feedback routes do not provide booking search/checkout. Do not expose staff endpoints or build a browser-side PMS proxy. Current connected StayCore stage reports `mutations_enabled=false` and sample-only inventory.

## Event-driven completion callback utility (source-only)
- Added `tools/completion_event_bridge.py` and `tests/test_completion_event_bridge.py`.
- Utility accepts a **terminal worker receipt**, validates project, job ID, evidence hash, unpublished/unmerged status and review requirements; computes deterministic event ID, checks GitHub issue #16 for an existing marker, posts a comment using a pre-existing scoped `GITHUB_TOKEN` and atomically records an acknowledgment to avoid duplicate comments. Fail closed when no token or network error. **12/12 offline mock tests passed.**
- This is an **event-driven GitHub issue inbox**, not a ChatGPT push endpoint. It must be invoked by the trusted worker when it reaches terminal state; it is not yet wired into the Dell worker or authenticated for delivery. GitHub comments can be read by ChatGPT on the next connected session. ChatGPT does not expose a supported arbitrary webhook that injects a new message into this conversation.
- Do not claim the utility has sent any real completion message. A further hard gate is required before any `review_ready` event: all PHP, WP staging, real booking, privacy, rollback and independent QA receipts must be verified. The current helper only validates its receipt fields; worker attestation and trust boundary remain open.
- Existing hourly conditional watch is a separate product automation and **not replaced** by the unconfigured GitHub event bridge.

## Open blockers / next safe work
1. PHP CLI/lint unavailable on Dell; obtain a reviewed isolated PHP test runtime without changing host root or live WordPress.
2. Real booking needs approved, public-safe, date-specific StayCore availability API and transactional reservation write path; not present in verified source.
3. Isolated WP stage needs verified backups/DB separation and explicit deploy authorization; no theme activation yet.
4. Capture independent screenshot/a11y/security receipts and validate actual property imagery and any ratings/prices.
5. Hook event callback to a trusted terminal job transition with narrowly scoped GitHub token and independent attestation, or provide a supported ChatGPT inbound event transport if one becomes available.

**Release decision:** Source/front-end tests PASS; full booking and WP staging integration **NO-GO**. No merge, publish, permissions, spending, guest data, or certified v6 changes.
