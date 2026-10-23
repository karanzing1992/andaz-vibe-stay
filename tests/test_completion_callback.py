"""Offline completion callback contract tests; no network / no live GitHub changes."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("callback", ROOT/"tools"/"devmatrix_completion_callback.py")
callback=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(callback)

class CompletionCallbackTests(unittest.TestCase):
    def make_case(self):
        owner=tempfile.TemporaryDirectory()
        root=Path(owner.name)
        (root/"docs").mkdir()
        handover=root/"docs"/"final-handover.md"
        handover.write_text("# Verified submission\nSource and independent evidence are linked.")
        gates={}
        for name in callback.REQUIRED_GATES:
            path=f"docs/{name}.md"
            evidence=root/path
            evidence.write_text(f"# Independently reviewed {name}\nEvidence and test receipt included.")
            gates[name]={"result":"passed","evidence_path":path,
                         "sha256":hashlib.sha256(evidence.read_bytes()).hexdigest()}
        manifest={"schema_version":1,"job_id":callback.JOB_ID,
            "repository":callback.REPOSITORY,"pull_request":callback.PR_NUMBER,
            "event":"final_submission_ready_for_owner_review",
            "source_sha":"a"*40,"handover":"docs/final-handover.md","gates":gates}
        staging=root/".devmatrix"
        staging.mkdir()
        m=staging/"final-submission.json"
        m.write_text(json.dumps(manifest))
        return owner, root, m, manifest

    def test_all_11_evidence_gates_required(self):
        owner,root,m,_=self.make_case()
        with owner:
            result=callback.load_verified_manifest(m,root)
            self.assertEqual(set(result["gates"]),callback.REQUIRED_GATES)
    def test_missing_gate_fails_closed(self):
        owner,root,m,data=self.make_case()
        with owner:
            data["gates"].pop("pms_booking_real")
            m.write_text(json.dumps(data))
            with self.assertRaisesRegex(callback.CompletionDenied,"missing_or_extra"):
                callback.load_verified_manifest(m,root)
    def test_unverified_gate_never_notifies(self):
        owner,root,m,data=self.make_case()
        with owner:
            data["gates"]["pms_booking_real"]["result"]="blocked"
            m.write_text(json.dumps(data))
            with self.assertRaisesRegex(callback.CompletionDenied,"gate_not_passed"):
                callback.load_verified_manifest(m,root)
    def test_tampered_evidence_rejected(self):
        owner,root,m,data=self.make_case()
        with owner:
            (root/"docs"/"php_lint.md").write_text("Changed after signoff")
            with self.assertRaisesRegex(callback.CompletionDenied,"gate_evidence_hash_mismatch"):
                callback.load_verified_manifest(m,root)
    def test_path_traversal_fails_closed(self):
        owner,root,m,data=self.make_case()
        with owner:
            data["gates"]["php_lint"]["evidence_path"]="../etc/passwd"
            m.write_text(json.dumps(data))
            with self.assertRaises(callback.CompletionDenied):
                callback.load_verified_manifest(m,root)
    def test_symlink_evidence_rejected(self):
        owner,root,m,data=self.make_case()
        with owner:
            dest=root/"docs"/"php_lint.md"
            dest.unlink()
            dest.symlink_to(root/"docs"/"javascript_unit.md")
            with self.assertRaises(callback.CompletionDenied):
                callback.load_verified_manifest(m,root)
    def test_spoofed_job_rejected(self):
        owner,root,m,data=self.make_case()
        with owner:
            data["job_id"]="other-job"
            m.write_text(json.dumps(data))
            with self.assertRaisesRegex(callback.CompletionDenied,"unknown_job"):
                callback.load_verified_manifest(m,root)
    def test_dedupe_marker_is_stable(self):
        _,_,_,data=self.make_case()
        self.assertEqual(callback.marker(data), callback.marker(dict(data)))
        self.assertTrue(callback.marker(data).startswith("<!-- bhm-completion:"))
    def test_duplicate_notification_does_not_post(self):
        owner,root,m,_=self.make_case()
        with owner:
            manifest=callback.load_verified_manifest(m,root)
            with patch.object(callback,"_api",return_value=[{"body":callback.marker(manifest)}]) as api:
                result=callback.notify(manifest,"not-a-real-github-token-for-test")
                self.assertEqual(result["status"],"already_notified")
                self.assertEqual(api.call_count,1)
    def test_notifies_once_when_no_duplicate(self):
        owner,root,m,_=self.make_case()
        with owner:
            manifest=callback.load_verified_manifest(m,root)
            with patch.object(callback,"_api",side_effect=[[],{"id":123}]) as api:
                result=callback.notify(manifest,"not-a-real-github-token-for-test")
                self.assertEqual(result["status"],"notified")
                self.assertEqual(api.call_count,2)
                posted=api.call_args.kwargs["payload"]["body"] if "payload" in api.call_args.kwargs else api.call_args.args[2]["body"]
                self.assertIn("owner review",posted)
                self.assertIn("Production remains unchanged",posted)
    def test_api_cannot_redirect_or_post_without_token(self):
        with self.assertRaisesRegex(callback.CompletionDenied,"github_token_unavailable"):
            callback._api("/comments","")
    def test_payload_excludes_personal_data(self):
        owner,root,m,_=self.make_case()
        with owner:
            manifest=callback.load_verified_manifest(m,root)
            body=callback.safe_message(manifest)
            self.assertNotIn("password",body.lower())
            self.assertNotIn("guest id",body.lower())
            self.assertIn("/pull/2",body)
    def test_incomplete_manifest_is_not_ready(self):
        owner,root,m,data=self.make_case()
        with owner:
            m.write_text(json.dumps({"event":"final_submission_ready_for_owner_review"}))
            with self.assertRaisesRegex(callback.CompletionDenied,"manifest_schema"):
                callback.load_verified_manifest(m,root)

if __name__=="__main__":unittest.main()
