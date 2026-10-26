// DeluluTech staging-only Cloudflare Worker gateway.
// Source of truth: Git branch staging/synergica-wpmanager-20261026.
// Pins upstream to the stable preview alias of that Git branch.
// Never forward cookies, Authorization, request bodies or private data.
const BRANCH_PREVIEW = "https://staging-synergica-wpmanager-20261026-andaz-vibe-stay.karanbizweb360.workers.dev";
addEventListener("fetch", event => { event.respondWith(handle(event.request)); });
async function handle(request) {
  const url = new URL(request.url);
  const headers = {
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow, noarchive",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer"
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {status:405, headers:{...headers, allow:"GET, HEAD"}});
  }
  if (url.pathname === "/__staging_health") {
    return new Response(request.method === "HEAD" ? null : JSON.stringify({
      service:"andaz-vibe-stay-staging",
      environment:"staging",
      source:"andaz-vibe-stay/git-preview",
      secrets:false,
      wordpressConnected:false
    }), {status:200,headers:{"content-type":"application/json; charset=utf-8", ...headers}});
  }
  // The preview is public website content, never a credential-bearing backend.
  // Use a fixed upstream hostname: no user-controlled SSRF.
  const upstream = new URL(url.pathname + url.search, BRANCH_PREVIEW);
  try {
    const upstreamResponse = await fetch(upstream.toString(), {
      method:request.method,
      headers:{"accept":request.headers.get("accept") || "*/*"},
      redirect:"manual",
      cf:{cacheTtl:0,cacheEverything:false}
    });
    if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
      return new Response("Staging upstream redirected", {status:502,headers});
    }
    const h = new Headers(headers);
    for (const key of ["content-type","etag","last-modified","accept-ranges"]) {
      const v=upstreamResponse.headers.get(key);
      if(v) h.set(key,v);
    }
    h.set("x-staging-source","andaz-git-preview");
    return new Response(request.method==="HEAD" ? null : upstreamResponse.body, {status:upstreamResponse.status,headers:h});
  } catch {
    return new Response("Staging preview temporarily unavailable", {status:502,headers});
  }
}
