# WP Manager QA staging — deployed and verified

**Environment:** Private QA only, 2026-10-26 IST.  
**Deployment source:** this Git staging branch (not `main`).  
**Worker:** `andaz-vibe-stay-staging` in Cloudflare account `3409ce0fa4794fb024c570d141ef0521`.  
**WordPress:** isolated Podman WordPress + MariaDB on Dell; public REST through Cloudflare Tunnel.

## Live endpoints

| Purpose | Endpoint | Verified |
| --- | --- | --- |
| Staging frontend / public static assets | https://staging.andazgoa.com/ | HTTPS 200 |
| WP Manager read-only QA entry | https://staging.andazgoa.com/_qa/wp-manager/ | HTTPS 200, `noindex` |
| QA WordPress backend | https://wpqa.staging.andazgoa.com/wp-json/ | HTTPS 200, WordPress canonical URL matches |
| QA bridge anonymous status | https://wpqa.staging.andazgoa.com/?rest_route=%2Fdlt-wpmgr%2Fv1%2Fstatus | HTTP 401 correctly denied |
| WordPress admin login | https://wpqa.staging.andazgoa.com/wp-login.php | HTTP 403 intentional QA access gate |
| WP Manager authenticated MCP | Vercel isolated QA endpoint | separate from Cloudflare frontend |
| WP Manager pairing database | Supabase QA | 0 connected sites, no pairing grants |

## Cloudflare routing

- Existing `andazgoa.com` production Worker and DNS were not changed.
- QA frontend uses the independent `andaz-vibe-stay-staging` Worker on `staging.andazgoa.com`.
- QA WordPress tunnel `dlt-wpmgr-wordpress-qa-20261026` is healthy with a single public ingress for `wpqa.staging.andazgoa.com` → `http://127.0.0.1:18982` on Dell. It has a default 404 fallback.
- The older `wpqa.andazgoa.com` route collided with a Cloudflare wildcard Worker preview. Its broken QA CNAME and tunnel ingress were removed **after** the replacement host passed TLS/WordPress REST/bridge-denial tests. No unrelated DNS records or routes were touched.
- Cloudflare Access is **not yet enabled** on the account. The WordPress administrator login remains restricted and no live consent/pairing should be attempted before a verified access mechanism exists.

## Build and deployment source

- `qa/synergica/index.html`: historical asset path; current contents are the WP Manager QA landing page, **not** Synergica.
- Canonical route is `/_qa/wp-manager/`; the historical `/_qa/synergica/` alias is retained temporarily for backwards compatibility, both showing the same QA page.
- `scripts/build-cloudflare-pages.sh` generates an allowlisted **12-file** public `dist/`; private WordPress/PMS source is never published.
- `scripts/build-staging-worker.mjs` generates `staging-worker.generated.js` deterministically from the 12 public assets.
- Dedicated `wrangler.staging.jsonc` selects `andaz-vibe-stay-staging`; `main` is never the deployment target of this staging release.
- Cloudflare MCP deployed the **Git-generated, byte-verified** `staging-worker.generated.js` only to the separate staging Worker. Automatic Workers Builds/Git-to-Worker CI for this separate Worker is not yet certified; do not assume a Git push automatically updates the deployment.

## Quality and security receipts

- Git `staging-worker.generated.js` and Dell rebuilt output are byte-identical, SHA-256:
  `fb7f38cfd9c021e11dbbe6edb5fa1be0379ac1067c89d4d747387742f5ebfe1a`.
- Live QA page HTTP 200 with `X-Robots-Tag: noindex, nofollow, noarchive`.
- WordPress REST HTTP 200, with `url=https://wpqa.staging.andazgoa.com`.
- QA bridge unauthenticated returns 401. WordPress login 403 due to a separate QA login gate; no attempt to bypass.
- `andazgoa.com` and `synergica.in` remain HTTP 200 and unchanged.
- No passwords, bridge codes, token values or DB connection strings are stored in this repository.

## Remaining gates

1. Enable/review authorized WordPress administrator access (Cloudflare Access cannot be configured until enabled in the account, or use another approved authenticated gate); do not weaken the current restriction.
2. Conduct real explicit administrator approval and one-use pairing proof redemption.
3. Enable pairing permission only for a specifically approved QA owner/client, with revocation and two-account isolation tests.
4. Certify automated Git deployment to the isolated Worker; then separately review any production release. No merging PR #3 into `main` without approval.
