# Cloudflare Worker Preview — Synergica / WP Manager QA

Branch: `staging/synergica-wpmanager-20261026`  
Base: `main` (must remain unmodified)  
Git source: `karanzing1992/andaz-vibe-stay`  
Worker: `andaz-vibe-stay`  
QA route: `/_qa/synergica/` **on preview URL only**

## Workers Builds settings

Production branch: `main`.  
Build command: `bash scripts/build-cloudflare-pages.sh`.  
Preview command: `npx wrangler preview`.  
Working directory: repository root.

Do **not** use `npx wrangler deploy` as the preview command; it targets production.

## Security/QA

- QA-only HTML is included in preview build's `dist/_qa/synergica/index.html` and is `noindex`.
- The original Andaz website public files are byte-identical.
- No database, credentials, private WordPress files, PMS routes, OAuth tokens or secrets belong in build output.
- Do not attach `synergica.in`, `synergistica.in` or a production custom domain to the Preview.
- WP Manager OAuth and WordPress pairing remain on dedicated isolated staging services. This page is just a staging landing page.
- No merge into `main` until reviewed.

## Live checks (to be performed after a successful Cloudflare preview build)

1. Cloudflare PR build must succeed; capture the generated **actual** Preview URL from Cloudflare.
2. Confirm that Preview `/_qa/synergica/` is HTTP 200 and `X-Robots-Tag`/page metadata blocks indexing.
3. Confirm Preview root still renders the reviewed Andaz site.
4. Confirm production Worker and `https://synergica.in/` both stay HTTP 200 with no changes.
5. Do not infer or fabricate a Preview URL if none is returned.

This commit only refreshes the staging branch after Cloudflare Git integration was enabled; the build copies neither this Markdown file nor any source outside its fixed public allowlist.
