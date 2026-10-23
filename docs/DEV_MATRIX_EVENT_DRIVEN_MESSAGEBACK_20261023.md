# Event-driven Dev Matrix → owner/ChatGPT handover

**Implemented:** 23 October 2026, Andaz PR #2 (draft). **Status:** Candidate implementation unit-tested, **not yet verified by an actual terminal event**. GitHub Actions completion message has not fired; the website is unfinished.

## Why this is not a direct ChatGPT message
The standard external GitHub/SSH/MCP integrations do **not** expose an authenticated API to inject a new message into an existing ChatGPT conversation. The event-driven handover writes a comment into the connected GitHub project, which ChatGPT can read in the next conversation. GitHub can notify the repository owner according to GitHub notification settings. The callback **must not** claim the existing ChatGPT chat received a message.

## No hourly timer
The earlier `Andaz Website Build` hourly condition-watch was explicitly **disabled** on 2026-10-23. This pipeline is event-driven, not cron or an Automations reminder.

## Verified-completion path (automatic)
1. The Dev Matrix finishes development on the Andaz draft branch and records independent QA/security/WP/PMS/photo/rollback evidence as **individual committed `docs/…` files**.
2. A final reviewer prepares `.devmatrix/final-submission.json` with exact job ID, source SHA, final handover path, 11 `passed` gates and each receipt's SHA-256. **Commit this manifest in a separate final commit**, after all code/evidence is frozen. A plan or worker self-declaration alone cannot create a genuine PASS receipt.
3. GitHub receives **push** to `feat/wp-static-hybrid-booking-20261023` which changes exactly `.devmatrix/final-submission.json`. The exact-scope workflow `.github/workflows/devmatrix-completion-callback.yml` starts automatically on that event; no polling.
4. Workflow checks out commit, reruns Python source/contracts (including callback unit tests), Node booking behavior and PHP lint; rejects failed or missing tests. The verifier rejects missing/gate-failed/tampered, symlinked or wrong-repo evidence; rejects updates to code after reviewed source SHA.
5. Once all checks pass, `tools/devmatrix_completion_callback.py notify` posts a single, deduplicated owner-mention handover to [Andaz PR #2](https://github.com/karanzing1992/andaz-vibe-stay/pull/2), using the GitHub Actions short-lived `GITHUB_TOKEN` with scoped issue-comment write permission. A stable marker prevents repeat notifications. The comment links final logs/evidence and tells the owner how to ask ChatGPT to inspect them.
6. Failed QA or missing proof means **no completion notification**; workflow leaves failure receipts in GitHub Actions. Do not auto-publish or merge.

Required gate IDs: `source_review`, `php_lint`, `python_unit`, `javascript_unit`, `wp_staging_preview`, `mobile_visual`, `real_property_photos`, `pms_booking_real`, `booking_security`, `seo_performance`, `rollback`.

**Full reservation mode cannot be accepted** until `pms_booking_real` has independent source/test evidence. The current theme remains WhatsApp enquiry-only, and the review manifest is **not present**.

## Alternate direct terminal-state issue bridge
`tools/completion_event_bridge.py` was concurrently authored on this branch and reviewed. It is a separate **worker-terminal event → Business House Matrix [Issue #16](https://github.com/aarondash5-star/business-house-matrix/issues/16)** path supporting explicit `review_ready` or `blocked` receipts. It uses a user-provisioned narrowly scoped GitHub token (not shipped or retrieved in source), checks event fields, deduplicates comments, and stores a local acknowledgment. It is **not automatically enrolled on the Dell worker**, and it does not replace the verified GitHub Actions final-completion workflow. Avoid sending both for the same event unless the owner explicitly needs both destinations.

## Test evidence
- Dell completion callback unit suite: **13/13 PASS**, including missing gate rejection, hash mismatch rejection, duplicate detection, spoofed job, path/symlink, no token, no false completion.
- Dell alternate terminal-bridge unit suite: **12/12 PASS**, including deduplication, blocked gate, PMS certification check, missing token.
- Dell existing static WordPress theme suite: **12/12 PASS**.
- Dell booking JavaScript behavior suite: **5/5 PASS**.
- Explicit incomplete-final submission test: `status=blocked`, `reason=manifest_missing_or_symlink`, exit **2**, **no completion comment sent** (the expected current state). Terminal receipt: `3f3059ae-66ba-4a8e-951a-a8efca169107`.
- The GitHub workflow has **not yet been triggered by a genuine passing final manifest**. It is not certified end-to-end until actual terminal GitHub workflow and comment readback are verified.

## No change policy
Original public Andaz site, StayCore PMS, guest bookings, PHP/WP deployment, certified v6, SSH/root policies, payment, and publication remain untouched. GitHub Actions only has permissions to read source and comment on the draft PR. Owner signoff is separate from callback notification.
