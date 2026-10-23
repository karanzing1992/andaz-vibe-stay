"""Offline completion event bridge contract tests; no GitHub API requests."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

FILE=Path(__file__).resolve().parents[1]/"tools"/"completion_event_bridge.py"
spec=importlib.util.spec_from_file_location("completion_event_bridge",FILE)
bridge=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

def fixture(**kwargs):
    x={"project":"andaz-vibe-stay","job_id":"andaz-review-v1","status":"review_ready",
       "evidence_sha256":"a"*64,"published":False,"merged":False,
       "tests_passed":True,"owner_review_required":True,"booking_mode":"enquiry_only"}
    x.update(kwargs)
    return x

class CompletionBridgeTests(unittest.TestCase):
    def test_only_terminal_statuses(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(status="running"))
    def test_deny_faked_pms_certification(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(booking_mode="pms_verified",pms_certified=False))
    def test_deny_unreviewed(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(owner_review_required=False))
    def test_deny_published(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(published=True))
    def test_deny_invalid_hash(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(evidence_sha256="x"*64))
    def test_blocker_requires_reason(self):
        with self.assertRaises(ValueError):
            bridge.validate(fixture(status="blocked",blocker=""))
        self.assertEqual(bridge.validate(fixture(status="blocked",blocker="PMS stage mutations disabled"))["status"],"blocked")
    def test_deterministic_event(self):
        self.assertEqual(bridge.event_id(fixture()),bridge.event_id(fixture()))
        self.assertNotEqual(bridge.event_id(fixture()),bridge.event_id(fixture(job_id="andaz-review-v2")))
    def test_missing_token_fails_closed(self):
        with tempfile.TemporaryDirectory() as d:
            result=bridge.deliver(fixture(),d,"")
            self.assertEqual(result["state"],"not_configured")
            self.assertEqual(list(Path(d).glob("*.json")),[])
    def test_post_once_and_ack_idempotently(self):
        calls=[]
        def mock(method,token,payload=None):
            calls.append((method,payload))
            return [] if method=="GET" else {"id":456}
        with tempfile.TemporaryDirectory() as d:
            a=bridge.deliver(fixture(),d,"fake-test-token",mock)
            b=bridge.deliver(fixture(),d,"fake-test-token",mock)
            self.assertEqual(a["state"],"delivered")
            self.assertEqual(b["state"],"already_delivered")
            self.assertEqual([x[0] for x in calls],["GET","POST"])
            self.assertEqual(len(list(Path(d).glob("*.json"))),1)
    def test_existing_comment_recovers_after_crash(self):
        receipt=fixture()
        marker="<!-- matrix-completion-event:"+bridge.event_id(receipt)+" -->"
        calls=[]
        def mock(method,token,payload=None):
            calls.append(method)
            return [{"body":marker}]
        with tempfile.TemporaryDirectory() as d:
            result=bridge.deliver(receipt,d,"fake-test-token",mock)
            self.assertEqual(result["state"],"already_delivered")
            self.assertEqual(calls,["GET"])
    def test_error_no_ack_or_false_success(self):
        def mock(method,token,payload=None):
            if method=="GET": return []
            raise RuntimeError("delivery refused")
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(RuntimeError):
                bridge.deliver(fixture(),d,"fake-test-token",mock)
            self.assertEqual(list(Path(d).glob("*.json")),[])
    def test_comment_contains_no_secret(self):
        body=bridge.comment_text(fixture())
        self.assertIn("owner review required",body)
        self.assertNotIn("GITHUB_TOKEN",body)
if __name__=="__main__":
    unittest.main()
