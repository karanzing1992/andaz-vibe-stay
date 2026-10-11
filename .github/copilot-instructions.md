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


## Cross-project master-stack event reporting (active 11 October 2026)
Every material capability, integration, security fix, breaking API/dependency change or verified deployment must be reported to **MOKSHA MASTER**. Documentation only; it does not authorize any production change.

Preferred in an authorized ChatGPT Project: call the connected Supabase `public.submit_master_stack_change` function in project `saczglesalubroyaucqe` with a stable event key, repository/project, source HTTPS URL, change type, title, concise evidence-backed summary, source kind and version. No service credentials in Git. The private event inbox is synchronized into the Google master registry after source verification.

If using GitHub Copilot without the Supabase connector: add a `STACK CHANGE` block to the commit or PR description with type, scope, source version, deployed version only if verified, summary, evidence and rollback. A separate daily monitor checks the approved repositories for newly committed material changes.

Protocol: https://github.com/karanzing1992/engagement-core/blob/main/docs/MASTER_STACK_UPDATE_PROTOCOL.md
Master: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit

Never include customer records, account data, credentials, private chat excerpts or security keys. Do not claim newly written Git code is live. Review and approve deployment separately.
