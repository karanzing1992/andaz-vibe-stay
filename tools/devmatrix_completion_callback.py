#!/usr/bin/env python3
"""Dev Matrix completion callback (GitHub-native, event driven).

A final-submission manifest triggers verification via GitHub Actions. Only after
independent CI tests and evidence validation does this utility post a single
sanitized PR comment to the owner's existing GitHub thread. It cannot send an
unsolicited message into a ChatGPT conversation.

No worker commands, production writes, retries of uncertain actions, secrets
in artifacts, or release/merge/publish authority.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.error
import urllib.request

REPOSITORY = "karanzing1992/andaz-vibe-stay"
PR_NUMBER = 2
JOB_ID = "andaz-static-wp-staycore-20261023"
REQUIRED_GATES = frozenset({
    "source_review",
    "php_lint",
    "python_unit",
    "javascript_unit",
    "wp_staging_preview",
    "mobile_visual",
    "real_property_photos",
    "pms_booking_real",
    "booking_security",
    "seo_performance",
    "rollback",
})
MAX_EVIDENCE_BYTES = 512 * 1024
MAX_MANIFEST_BYTES = 64 * 1024
API_ROOT = f"https://api.github.com/repos/{REPOSITORY}/issues/{PR_NUMBER}"

class CompletionDenied(ValueError):
    pass

def require(condition: bool, reason: str) -> None:
    if not condition:
        raise CompletionDenied(reason)

def validate_evidence_path(root: Path, raw: str) -> Path:
    require(isinstance(raw, str) and 5 <= len(raw) <= 180, "invalid_evidence_path")
    path = Path(raw)
    require(not path.is_absolute() and ".." not in path.parts and "\\" not in raw, "unsafe_evidence_path")
    require(path.parts[0] == "docs" and not any(p.startswith(".") for p in path.parts), "evidence_must_be_docs")
    candidate = root.joinpath(*path.parts)
    require(candidate.resolve().is_relative_to(root.resolve()), "evidence_outside_repo")
    require(candidate.is_file() and not candidate.is_symlink(), "missing_or_symlink_evidence")
    size = candidate.stat().st_size
    require(40 <= size <= MAX_EVIDENCE_BYTES, "evidence_size_invalid")
    return candidate

def load_verified_manifest(path: Path, root: Path, expected_head: str | None = None) -> dict:
    require(path.is_file() and not path.is_symlink(), "manifest_missing_or_symlink")
    require(path.stat().st_size <= MAX_MANIFEST_BYTES, "manifest_too_large")
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except (UnicodeError, ValueError) as exc:
        raise CompletionDenied("manifest_not_json") from exc
    require(isinstance(manifest, dict) and set(manifest) == {
        "schema_version", "job_id", "repository", "pull_request", "event",
        "source_sha", "handover", "gates"
    }, "manifest_schema")
    require(manifest["schema_version"] == 1, "manifest_version")
    require(manifest["job_id"] == JOB_ID, "unknown_job")
    require(manifest["repository"] == REPOSITORY and manifest["pull_request"] == PR_NUMBER,
            "foreign_destination")
    require(manifest["event"] == "final_submission_ready_for_owner_review", "not_completion_event")
    sha = manifest["source_sha"]
    require(isinstance(sha, str) and bool(re.fullmatch(r"[0-9a-f]{40}", sha)), "source_sha_invalid")
    handover = validate_evidence_path(root, manifest["handover"])
    require(handover.suffix.lower() == ".md", "handover_must_be_markdown")
    gates = manifest["gates"]
    require(isinstance(gates, dict) and set(gates) == REQUIRED_GATES, "missing_or_extra_completion_gates")
    for key, item in gates.items():
        require(isinstance(item, dict) and set(item) == {"result", "evidence_path", "sha256"},
                "gate_schema_" + key)
        require(item["result"] == "passed", "gate_not_passed_" + key)
        evidence = validate_evidence_path(root, item["evidence_path"])
        actual = hashlib.sha256(evidence.read_bytes()).hexdigest()
        require(item["sha256"] == actual, "gate_evidence_hash_mismatch_" + key)
    if expected_head:
        require(bool(re.fullmatch(r"[0-9a-f]{40}", expected_head)), "head_sha_invalid")
        ancestor = subprocess.run(["git", "-C", str(root), "merge-base", "--is-ancestor", sha,
                                   expected_head], check=False, capture_output=True, timeout=10)
        require(ancestor.returncode == 0, "unrelated_source_sha")
        result = subprocess.run(["git", "-C", str(root), "diff", "--name-only",
                                 sha, expected_head], check=True, capture_output=True,
                                text=True, timeout=10)
        changes = set(line.strip() for line in result.stdout.splitlines() if line.strip())
        require(changes.issubset({".devmatrix/final-submission.json"}), "code_changed_after_review")
    return manifest

def marker(manifest: dict) -> str:
    digest = hashlib.sha256((manifest["job_id"] + ":" + manifest["source_sha"]).encode()).hexdigest()[:24]
    return "<!-- bhm-completion:" + digest + " -->"

def safe_message(manifest: dict) -> str:
    # All data is validated or fixed. Do not include arbitrary gate log content.
    comment = (
        marker(manifest) +
        "\n### Andaz Dev Matrix — owner review package ready\n\n"
        "The final-submission manifest passed the independent completion workflow, "
        "including source tests, PHP lint, JavaScript booking tests and evidence-integrity gates. "
        "**This is a request for owner review, not approval to merge, publish or deploy.**\n\n"
        f"- Source reviewed: \`{manifest['source_sha']}\`\n"
        f"- Final handover: [review the deliverables](https://github.com/{REPOSITORY}/blob/"
        f"feat/wp-static-hybrid-booking-20261023/{manifest['handover']})\n"
        f"- Evidence: {len(REQUIRED_GATES)}/{len(REQUIRED_GATES)} required gate receipts verified\n"
        f"- Draft PR: https://github.com/{REPOSITORY}/pull/{PR_NUMBER}\n"
        "- Review with ChatGPT: **Continue the Andaz Dev Matrix final submission from PR #2; "
        "inspect the final handover and independent QA evidence.**\n\n"
        "@karanzing1992 — final review package is available. Production remains unchanged.\n"
    )
    require(len(comment) < 3500, "comment_too_long")
    return comment

def _api(path: str, token: str, payload: dict | None = None) -> object:
    require(len(token) >= 15, "github_token_unavailable")
    url = API_ROOT + path
    require(url.startswith("https://api.github.com/repos/" + REPOSITORY + "/issues/" +
                           str(PR_NUMBER)), "unapproved_api_host")
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"Accept": "application/vnd.github+json",
               "Authorization": "Bearer " + token,
               "X-GitHub-Api-Version": "2022-11-28",
               "User-Agent": "bhm-completion-callback-v1"}
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if payload is not None else "GET")
    # No alternate redirect host or credentials in any logs.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, request, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect())
    try:
        with opener.open(req, timeout=20) as response:
            require(response.status in (200, 201), "api_http_error")
            body = response.read(300_000)
            require(len(body) < 300_000, "api_response_limit")
            return json.loads(body)
    except (urllib.error.URLError, json.JSONDecodeError) as exc:
        raise CompletionDenied("notification_delivery_unconfirmed") from exc

def notify(manifest: dict, token: str) -> dict:
    # Fail closed for ambiguous delivery and never post duplicates on ordinary retries.
    signature = marker(manifest)
    pages = 0
    while pages < 10:
        pages += 1
        replies = _api(f"/comments?per_page=100&page={pages}", token)
        require(isinstance(replies, list), "untrusted_github_response")
        if any(isinstance(x, dict) and signature in x.get("body", "")
               for x in replies):
            return {"status": "already_notified", "messageback": "github_pr_comment",
                    "direct_chatgpt_delivery": False, "pages_checked": pages}
        if len(replies) < 100:
            break
    else:
        raise CompletionDenied("too_many_comments_for_safe_dedupe")
    created = _api("/comments", token, {"body": safe_message(manifest)})
    require(isinstance(created, dict) and isinstance(created.get("id"), int),
            "notification_delivery_unconfirmed")
    return {"status": "notified", "messageback": "github_pr_comment",
            "direct_chatgpt_delivery": False, "comment_id": created["id"]}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("verify", "notify"))
    parser.add_argument("--manifest", default=".devmatrix/final-submission.json")
    parser.add_argument("--root", default=".")
    parser.add_argument("--head", default="")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    try:
        manifest = load_verified_manifest(root / args.manifest, root, args.head or None)
        if args.action == "verify":
            result = {"status": "ready_for_owner_review", "gate_count": len(REQUIRED_GATES),
                      "job_id": manifest["job_id"], "source_sha": manifest["source_sha"],
                      "direct_chatgpt_delivery": False}
        else:
            require(os.environ.get("GITHUB_REPOSITORY") == REPOSITORY, "github_repo_mismatch")
            result = notify(manifest, os.environ.get("GITHUB_TOKEN", ""))
        print(json.dumps(result, sort_keys=True))
        return 0
    except (CompletionDenied, OSError, subprocess.SubprocessError) as exc:
        print(json.dumps({"status": "blocked", "reason": str(exc)[:100],
                          "notification_sent": False}))
        return 2

if __name__ == "__main__":
    sys.exit(main())
