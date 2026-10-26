# Dedicated staging at staging.andazgoa.com

## Goal and production boundaries

Deploy a **separate Worker** called `andaz-vibe-stay-staging` to Cloudflare account `3409ce0fa4794fb024c570d141ef0521` with the custom hostname `staging.andazgoa.com`.

- Live `andazgoa.com` / `www.andazgoa.com` untouched.
- Existing `andaz-vibe-stay` production Worker, Git `main`, and `synergica.in` untouched.
- This is the **static QA frontend**. WP Manager OAuth remains on its isolated backend; WordPress pairing to Synergica is not yet completed.
- The QA landing route is `/_qa/synergica/`.
- Both website and QA routes carry `X-Robots-Tag: noindex` and no credentials, customer data or private WordPress source.

## Git setup

Repository: `karanzing1992/andaz-vibe-stay`

Branch: `staging/synergica-wpmanager-20261026` (do not merge PR #3).

Wrangler config for the **new staging Worker only**: `wrangler.staging.jsonc`, not the production `wrangler.jsonc`.

```json
{
  "name": "andaz-vibe-stay-staging",
  "compatibility_date": "2026-10-24",
  "workers_dev": true,
  "assets": { "directory": "./dist" },
  "routes": [
    { "pattern": "staging.andazgoa.com", "custom_domain": true }
  ]
}
```

## Cloudflare activation (publisher dashboard, one time)

1. Open Cloudflare account `3409ce0fa4794fb024c570d141ef0521` → **Workers & Pages → Create application → Import Git repository**. Select `karanzing1992/andaz-vibe-stay`. If creating through the same repo is restricted, create a **new empty Worker** named `andaz-vibe-stay-staging` and attach its Builds Git connection. **Never choose the existing live `andaz-vibe-stay` Worker**.
2. Worker name: **`andaz-vibe-stay-staging`**. Production branch **for this Worker only**: `staging/synergica-wpmanager-20261026`; repo root `/`.
3. Build command: `bash scripts/build-cloudflare-pages.sh`; Deploy command: **`npx wrangler deploy --config wrangler.staging.jsonc`**. Do not use the default root Wrangler config and do not use `npx wrangler preview` for this distinct Worker.
4. Deploy branch. Cloudflare's `custom_domain:true` configuration should create the `staging.andazgoa.com` DNS record and certificate. If Cloudflare reports a record conflict, **stop** and inspect the existing DNS record rather than replace it.
5. Check `https://staging.andazgoa.com/` and `https://staging.andazgoa.com/_qa/synergica/`, both HTTP 200 and `X-Robots-Tag: noindex`. Independently check `https://andazgoa.com/`, `https://andaz-vibe-stay.karanbizweb360.workers.dev/`, `https://synergica.in/` unchanged.
6. Restrict future staging access with Cloudflare Access for actual login/pairing operations. `noindex` is **not** an authentication control.

## Source/build gates

- Build script copies exactly twelve public files from the allowlist; no `wordpress/`, secrets or unrelated repository files.
- All staged paths can be re-built and tested on Dell without Cloudflare credentials.
- GitHub PR #3 is draft/unmerged.
- DNS checked 2026-10-26 IST: `andazgoa.com` resolves through Cloudflare; `staging.andazgoa.com` has no public DNS record.
- Cloudflare Wrangler on Dell has no authenticated session. **Git configuration preparation is not equivalent to live Worker creation**.

See Cloudflare docs: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
