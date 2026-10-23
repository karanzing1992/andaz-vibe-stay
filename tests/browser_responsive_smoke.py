#!/usr/bin/env python3
"""Run isolated, real-Chrome responsive DOM/layout smoke tests without WordPress or network.
This tests only the rendered marketing HTML and booking JS. It does NOT certify PHP,
WordPress integration, live availability, reservations, payments, or visual design.
"""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
FRONT=ROOT/"wordpress"/"andaz-theme"/"front-page.php"
BOOKING=ROOT/"wordpress"/"andaz-theme"/"assets"/"booking.js"
CHROME=shutil.which("google-chrome") or shutil.which("chromium")
WIDTHS=(360,390,768,1280)
PROBE=r"""
<script>
(() => {
  const form=document.querySelector('#bookingForm');
  const booking=document.querySelector('#booking');
  const mobile=document.querySelector('.mobilebook');
  const info={
    width:window.innerWidth,
    scrollWidth:document.documentElement.scrollWidth,
    viewportMeta:!!document.querySelector('meta[name="viewport"]'),
    formPresent:!!form,
    formVisible:!!form && form.getBoundingClientRect().width>0,
    bookingSectionPresent:!!booking,
    mobileBookVisible:!!mobile && getComputedStyle(mobile).display!=='none',
    hasDateMin:!!document.querySelector('#checkin')?.min,
    statusRole:document.querySelector('#bookingStatus')?.getAttribute('role'),
    hasH1:!!document.querySelector('h1'),
    hasTitle:!!document.title
  };
  const out=document.createElement('pre');
  out.id='andaz-qa-result';
  out.textContent=JSON.stringify(info);
  document.body.appendChild(out);
})();
</script>
"""
def make_preview():
    html=FRONT.read_text(encoding="utf-8")
    # Strip PHP only for static browser preview. Never substitute for PHP lint.
    html=re.sub(r"<\?php[\s\S]*?\?>","",html)
    assert "<?php" not in html
    booking=BOOKING.read_text(encoding="utf-8")
    html=html.replace("</body>", "<script>"+booking+"</script>"+PROBE+"</body>")
    return html
def main():
    if not CHROME:
        raise SystemExit("BLOCKED: Chrome unavailable; browser QA not certified")
    rows=[]
    with tempfile.TemporaryDirectory(prefix="andaz-qa-") as tmp:
        html=Path(tmp)/"index.html"
        html.write_text(make_preview(),encoding="utf-8")
        for width in WIDTHS:
            profile=Path(tmp)/("profile-"+str(width))
            args=[CHROME,"--headless=new","--no-sandbox","--disable-gpu",
                  "--disable-dev-shm-usage","--disable-background-networking",
                  "--no-first-run","--disable-extensions",
                  "--user-data-dir="+str(profile),"--window-size="+str(width)+",900",
                  "--virtual-time-budget=2000","--dump-dom",html.as_uri()]
            p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                             text=True,timeout=35,env={**os.environ,"NO_PROXY":"*"})
            if p.returncode:
                raise RuntimeError("Chrome exited "+str(p.returncode)+": "+p.stderr[-500:])
            m=re.search(r'<pre id="andaz-qa-result">([^<]+)</pre>',p.stdout)
            if not m:
                raise AssertionError("QA DOM probe absent at viewport "+str(width))
            data=json.loads(m.group(1).replace("&quot;",'"').replace("&amp;","&"))
            data["requested_width"]=width
            checks=[
              ("horizontal_overflow",data["scrollWidth"]<=data["width"]+1),
              ("viewport_meta",data["viewportMeta"]),
              ("booking_form",data["formPresent"] and data["formVisible"]),
              ("booking_section",data["bookingSectionPresent"]),
              ("date_validation_attached",data["hasDateMin"]),
              ("live_status",data["statusRole"]=="status"),
              ("heading_and_title",data["hasH1"] and data["hasTitle"]),
              ("mobile_cta",data["mobileBookVisible"]==(width<=900)),
            ]
            data["checks"]={k:bool(v) for k,v in checks}
            data["pass"]=all(v for _,v in checks)
            rows.append(data)
            print(json.dumps(data,sort_keys=True),flush=True)
    if not all(x["pass"] for x in rows):
        raise SystemExit("FAIL: responsive browser smoke checks")
    print("PASS: real Chrome isolated responsive DOM checks for "+",".join(map(str,WIDTHS)))
if __name__=="__main__":
    main()
