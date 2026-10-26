# WP Manager one-click QA — design and deployment evidence

**Release:** 2026-10-27 IST · isolated staging, no `main` merge.

The **production-worthy QA visual refresh** of https://staging.andazgoa.com/_qa/wp-manager/ has been committed in this Git staging branch and deployed only to Cloudflare Worker `andaz-vibe-stay-staging`.

## Linked QA surfaces

- Private landing: https://staging.andazgoa.com/_qa/wp-manager/
- Responsive WordPress PIN login: https://wpqa.staging.andazgoa.com/wp-login.php
- Authenticated WordPress Tools → WP Manager: visually branded **Authorize & sync** and **Disconnect & revoke** actions. This is dynamically rendered by the WP bridge PHP plugin from the DeluluTech repository, not served as a static Cloudflare asset.
- OAuth consent: https://delulutech-wpmanager-oauth-stage.vercel.app/oauth/consent

Visual theme: forest-green and stone neutral, accessible text/contrast/focus, distinctive wordmark, responsive layouts, no external font dependencies, noindex private QA surfaces.

## Verification

- Chrome/Playwright checked landing, login and OAuth at 375 / 768 / 1440 px: **9/9 HTTP 200, no horizontal overflow, no JS page errors**.
- Staging Cloudflare Worker released from the Git-generated static bundle; only the public allowlisted 12 assets were deployed, no WordPress/PMS internals.
- Isolated WordPress backend and Supabase Ed25519 admin signature path passed connect → live read-only verification → revoke/Vault delete → reconnect QA acceptance.
- Authenticated ChatGPT WP Manager reported **one active verified WordPress QA site**. Production `andazgoa.com`, `synergica.in`, and public WP Manager plugin are unchanged.

## Source of truth

The backend, OAuth, WordPress bridge/admin UI code and full receipts live at:
https://github.com/aarondash5-star/delulutech/blob/feat/wp-manager-auth-mcp-dev-20261025/create-projects/wp-manager/delivery/WP_MANAGER_ONE_CLICK_QA_PREMIUM_UI_20261027.md

**Remaining before public production:** end-user browser UX sign-off, real second-account tenant tests, PIN rotation/security review, and Git-to-Worker automatic deployment certification.

This document **supersedes** the earlier `qa/wp-manager/DEPLOYMENT_20261026.md` blocked admin login and pairing status. Do not re-enable the obsolete Synergica routing assumption from old filenames.
