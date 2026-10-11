# Andaz Vibe Stay — Shared Technology Governance

This repository follows the **MOKSHA MASTER** shared technology stack standard. Maintain independent Andaz business operations and access.

## Canonical identity
- Project/workspace alias: **Andaz Lifestyle Stay**; operational owner: **ANDAZ — MASTER**.
- Customer-facing brand: **Andaz Vibe Stay - Arambol, Goa**; short: **Andaz Vibe Stay**. Do not publish “Andaz Lifestyle Stay” as a new guest-facing brand.
- **Moksha Wellness** is a separate wellness partner. Never merge guest, booking, payment, customer, ownership or legal records with Moksha.

## Verified implementation (11 Oct 2026)
- Mobile-first static site; GitHub Pages deployment workflow on main. Vercel configuration exists; independently verify the actual live production host before changing deployment.
- StayCore PMS is in the separate `karanzing1992/staycore-pms` repository. Do not embed it in the public website build.
- Source-controlled repo and deploy workflow are not proof of the live deployed version.

## Mandatory stack-update protocol
1. Before work and whenever upstream packages, runtimes, CMS, browser APIs, services or advisories change, inspect installed and repo versions, official stable releases, compatibility, cost and security notices.
2. Record material deltas in the Moksha Master technology register and this repository's relevant docs, including checked date, sources, owner, target release, tested compatibility and rollback.
3. Make upgrades as reviewable minimal PRs; run focused tests. Do not silently ship dependency, deployment, booking, payment, identity or schema changes.
4. Preserve separate brand configuration and per-site credentials; shared code must be productized and reusable.
5. Avoid automatic expensive GitHub Actions runs; preserve deployment safety and approval.

Master: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit
Andaz control: https://docs.google.com/spreadsheets/d/1bFreuhRYBFUQUf-RQ8U8pHkfDB8LN-j8ncnpIAUYqeA/edit

## Cross-project master-stack event reporting — LIVE PROTOCOL (11 October 2026)
This repository participates in the shared MOKSHA MASTER technology registry. At completion of **material** features, fixes, integrations, security changes, runtime/dependency upgrades and verified deployments, use the **tested two-route synchronization method**. Treat this reporting duty as part of definition-of-done, not permission to deploy or change customer data.

**Route A — this GitHub repository (default):** Include `STACK CHANGE:` at the **start of the final commit subject** describing a real, material capability/technology change; detail verification, source vs live deployment, impacted components, versions, compatibility and rollback in the commit body. The independent Google Apps Script checks nine allowlisted repositories hourly and adds source-linked `[MASTER-GITHUB-CHANGE:repo:SHA]` entries to the master Google Doc. The script consumes **GitHub commits, not PR descriptions or ChatGPT messages**. If squash-merging, preserve the tag in the final commit message. Eligible conventional commits like `feat:` and `fix:` with changed code can also be detected. Do not label routine churn or generated output a stack change. Copilot-instruction-only changes are intentionally ignored by the collector.

**Route B — change outside GitHub:** If new verified behavior/configuration happens exclusively in WordPress, Google, Supabase or another connected service without a GitHub commit, authorized ChatGPT Projects may submit an idempotent, evidence-linked event via connected Supabase `public.submit_master_stack_change` (project `saczglesalubroyaucqe`). A **separate verified hourly Master Inbox Sync** publishes those events. Do not mistake Google Apps Script for the Supabase inbox publisher.

**Project separation & safety:** Do not include credentials, customer/guest data, private conversations or passwords. Code committed is NOT proof of production deployment; always label source-only vs verified live. Check releases/security, cost, compatibility, rollback, staging and backups before upgrades. StayCore PMS bookings require independent offsite backup and audited admin-only restore. Andaz Lifestyle Stay is an internal label; public brand is Andaz Vibe Stay - Arambol, Goa; keep tenant data separate.

**Canonical protocol:** https://github.com/karanzing1992/engagement-core/blob/main/docs/MASTER_STACK_UPDATE_PROTOCOL.md
**Worker details:** https://github.com/karanzing1992/engagement-core/blob/main/services/master-stack-worker/apps-script/README.md
**Master Doc:** https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit

**ChatGPT Project distinction:** These repository instructions guide agents working in this codebase. They are not automatically installed into separate ChatGPT Projects. Add the reusable project-level paragraph in the canonical protocol to those Projects' persistent Instructions when you need chat-native compliance.
