#!/usr/bin/env python3
"""Event-driven, one-shot completion signal to the Dev Matrix GitHub issue inbox.

Run this at the worker's terminal transition, NOT on a timer. It cannot inject a
message into an existing ChatGPT conversation; GitHub issue comments are a
durable inbox ChatGPT can read on its next connected session. Requires an
existing narrowly scoped GITHUB_TOKEN for delivery. No token = no delivery.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import urllib.error
import urllib.request

TARGET_REPO="aarondash5-star/business-house-matrix"
TARGET_ISSUE=16
ENDPOINT=f"https://api.github.com/repos/{TARGET_REPO}/issues/{TARGET_ISSUE}/comments"
TERMINAL={"review_ready","blocked"}
SHA256=re.compile(r"^[0-9a-f]{64}$")
JOB_ID=re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.:-]{4,95}$")

def validate(receipt):
    if not isinstance(receipt,dict):
        raise ValueError("receipt must be an object")
    if receipt.get("project")!="andaz-vibe-stay":
        raise ValueError("unexpected project")
    if receipt.get("status") not in TERMINAL:
        raise ValueError("nonterminal status; no callback")
    if not JOB_ID.fullmatch(str(receipt.get("job_id",""))):
        raise ValueError("invalid job_id")
    if not SHA256.fullmatch(str(receipt.get("evidence_sha256",""))):
        raise ValueError("evidence_sha256 must be a lowercase sha256")
    if receipt.get("published") is not False or receipt.get("merged") is not False:
        raise ValueError("callback only supports unmerged, unpublished review artifacts")
    if receipt["status"]=="review_ready":
        if receipt.get("tests_passed") is not True or receipt.get("owner_review_required") is not True:
            raise ValueError("review_ready requires passing tests and owner review")
        if receipt.get("booking_mode") not in {"enquiry_only","pms_verified"}:
            raise ValueError("booking mode missing")
        if receipt["booking_mode"]=="pms_verified" and receipt.get("pms_certified") is not True:
            raise ValueError("cannot claim verified booking without PMS certification")
    else:
        if not str(receipt.get("blocker","")).strip():
            raise ValueError("blocked requires blocker")
    return receipt

def event_id(receipt):
    stable={k:receipt[k] for k in ("project","job_id","status","evidence_sha256")}
    return hashlib.sha256(json.dumps(stable,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def comment_text(receipt):
    event=event_id(receipt)
    status=receipt["status"]
    lines=[
        f"<!-- matrix-completion-event:{event} -->",
        f"**Andaz Dev Matrix completion event — {status}**",
        "",
        f"- Job: \`{receipt['job_id']}\`",
        f"- Evidence SHA-256: \`{receipt['evidence_sha256']}\`",
        f"- Booking mode: \`{receipt.get('booking_mode','unverified')}\`",
        "- Production: unchanged; owner review required.",
    ]
    if status=="blocked":
        lines.append("- Blocker: "+str(receipt["blocker"]).strip()[:500].replace("\n"," "))
    else:
        lines.append("- QA: declared passing in signed-off worker receipt; independent source review still required.")
    lines.append("- Source: https://github.com/karanzing1992/andaz-vibe-stay/pull/2")
    return "\n".join(lines)

def api(method,token,payload=None):
    data=None if payload is None else json.dumps(payload).encode()
    request=urllib.request.Request(
        ENDPOINT, data=data, method=method,
        headers={
            "Authorization":"Bearer "+token,
            "Accept":"application/vnd.github+json",
            "X-GitHub-Api-Version":"2022-11-28",
            "User-Agent":"andaz-completion-event-bridge/0.1",
            **({"Content-Type":"application/json"} if data is not None else {}),
        }
    )
    with urllib.request.urlopen(request,timeout=15) as response:
        return json.load(response)

def send(receipt,token,transport=api):
    event=event_id(receipt)
    # GET recent comments first: recovers crash after a successful POST.
    # Local receipt ledger is the stronger duplicate guard for older comments.
    existing=transport("GET",token)
    if not isinstance(existing,list):
        raise RuntimeError("unexpected GitHub response")
    marker=f"<!-- matrix-completion-event:{event} -->"
    if any(marker in str(c.get("body","")) for c in existing):
        return {"state":"already_delivered","event_id":event}
    response=transport("POST",token,{"body":comment_text(receipt)})
    if not isinstance(response,dict) or not isinstance(response.get("id"),int):
        raise RuntimeError("GitHub delivery not acknowledged")
    return {"state":"delivered","event_id":event,"comment_id":response["id"]}

def deliver(receipt,ledger_dir,token,transport=api):
    validate(receipt)
    event=event_id(receipt)
    ledger_dir=Path(ledger_dir)
    ledger_dir.mkdir(mode=0o700,parents=True,exist_ok=True)
    if ledger_dir.is_symlink():
        raise ValueError("symlink ledger denied")
    ack=ledger_dir/(event+".json")
    if ack.exists():
        return {"state":"already_delivered","event_id":event}
    if not token:
        return {"state":"not_configured","event_id":event,"reason":"GITHUB_TOKEN missing"}
    result=send(receipt,token,transport)
    # Atomic acknowledgement; if process crashes after POST, GET marker dedupes.
    with tempfile.NamedTemporaryFile(mode="w",dir=ledger_dir,delete=False,prefix=".pending-",encoding="utf-8") as f:
        json.dump(result,f,sort_keys=True)
        pending=Path(f.name)
    os.chmod(pending,0o600)
    os.replace(pending,ack)
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt",type=Path,required=True)
    parser.add_argument("--ledger",type=Path,default=Path.home()/".local/share/andaz-completion-ledger")
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    receipt=validate(json.loads(args.receipt.read_text(encoding="utf-8")))
    if args.dry_run:
        print(json.dumps({"state":"dry_run","event_id":event_id(receipt),
                          "comment":comment_text(receipt)},indent=2))
        return
    result=deliver(receipt,args.ledger,os.getenv("GITHUB_TOKEN",""))
    print(json.dumps(result,sort_keys=True))
    if result["state"]=="not_configured":
        raise SystemExit(3)
if __name__=="__main__":
    try:
        main()
    except (ValueError,RuntimeError,urllib.error.URLError) as exc:
        print(json.dumps({"state":"failed","error":type(exc).__name__}),file=sys.stderr)
        raise SystemExit(2)
