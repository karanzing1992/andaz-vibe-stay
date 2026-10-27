# MCP CONNECTION CAUTION — mandatory before new connections

> **STOP / CHECK FIRST:** Do not register, reconnect, migrate, publish or change OAuth/MCP settings until the canonical caution and registration SOP have been read. A new connection must never silently reuse another project's WordPress login, OAuth client, owner grant, device pairing or access token.

## Single source of truth (do not fork)

- **[Universal MCP Caution README](https://github.com/karanzing1992/engagement-core/blob/main/MCP_CONNECTION_CAUTION_README.md)** — primary security warning and stop conditions.
- **[MCP OAuth Registration & Isolation SOP](https://github.com/karanzing1992/engagement-core/blob/main/docs/MCP_OAUTH_REGISTRATION_SOP.md)** — full procedure and 27 October 2026 repair evidence.
- **[MCP Connection Registration Checklist](https://github.com/karanzing1992/engagement-core/blob/main/docs/templates/MCP_CONNECTION_REGISTRATION_CHECKLIST.md)** — required acceptance evidence per connection/environment.
- **[Master Registry Protocol](https://github.com/karanzing1992/engagement-core/blob/main/docs/MASTER_STACK_UPDATE_PROTOCOL.md)** — version and change reporting.

## andaz-vibe-stay: extra project-specific caution

Andaz website and booking integration: protect tenant/guest data, keep staging and production roles distinct, and do not confuse website auth with PMS/MCP permissions.

## Preflight — all checks mandatory

1. Inventory the *existing* MCP plugin ID, owner/tenant, authorization server/issuer, real registered client ID, resource server/endpoint, callback and host/site pairings; do not build duplicate plugins to bypass failures.
2. Verify correct branded consent **using authenticated authorization details**, PKCE S256, state/callback allowlisting and concurrent-tab protection. Appearance alone is **not** isolation.
3. Verify token signature, issuer, audience/resource, expiration, **allowed client ID**, and owner/site/host/action grants at every MCP gateway. Reject tokens from unrelated projects, even if issued to the same person.
4. No secrets in tickets, source, URLs or logs; no broad shell, site-admin or booking access; no issuer migration without verified identity/pairing mapping and rollback.
5. Run the canonical checklist including legitimate read-only MCP call and cross-plugin *negative* tests. A heartbeat or `/health` 200 is **not** end-to-end authorization QA.
6. Record source commit, deployed version, plugin release (if modified), rollback, Master Registry marker and consuming project's acknowledgement. If any security test is missing mark **PENDING_AUTH_QA**; never claim **LIVE_CERTIFIED**.

## Scope and adoption

This is a **source-level caution document**. It does not modify runtime connectors or automatically update ChatGPT Project Instructions or plugins. For any new MCP onboarding in this repository, include the above canonical links in the development issue/PR and follow the complete shared SOP. For failures or the legacy WordPress/Linux/Manbir OAuth overlap, see [repair issue #81](https://github.com/karanzing1992/engagement-core/issues/81).
