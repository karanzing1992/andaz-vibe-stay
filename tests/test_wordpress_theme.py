"""Andaz static-style WP site: factual claims, booking mode and integration contracts."""
import json
from pathlib import Path
import re
import unittest

BASE=Path(__file__).resolve().parents[1]
THEME=BASE/"wordpress"/"andaz-theme"
LANDING=THEME/"front-page.php"
class ThemeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=LANDING.read_text(encoding="utf-8")
        cls.js=(THEME/"assets"/"booking.js").read_text(encoding="utf-8")
    def test_complete_theme_manifest(self):
        for path in ("style.css","functions.php","index.php","front-page.php","assets/booking.js"):
            self.assertTrue((THEME/path).is_file(),path)
        self.assertIn("Theme Name: Andaz Vibe Stay", (THEME/"style.css").read_text())
    def test_wp_hooks(self):
        for text in ("<?php wp_head(); ?>", "<?php wp_body_open(); ?>", "<?php wp_footer(); ?>"):
            self.assertIn(text,self.html)
    def test_correct_brand_and_business_facts(self):
        for text in ("Andaz Vibe Stay - Arambol, Goa","Moksha","Temple Road","+91 89995 41081"):
            self.assertIn(text,self.html)
    def test_booking_fields_accessible(self):
        for field in ("checkin","checkout","guests","stayType"):
            self.assertIn('id="'+field+'"',self.html)
            self.assertIn('for="'+field+'"',self.html)
        self.assertIn('role="status"',self.html)
        self.assertIn('aria-live="polite"',self.html)
    def test_enquiry_never_claims_a_confirmed_booking(self):
        self.assertIn("availability enquiry, not a confirmed booking",self.html)
        self.assertIn("not confirmed until our team replies",self.js)
        self.assertNotIn("reservationId",self.js)
        self.assertNotIn("fetch(",self.js)
        self.assertNotIn("XMLHttpRequest",self.js)
    def test_dates_and_minimum_nights(self):
        self.assertIn("parseLocalDate",self.js)
        self.assertIn("departure <= arrival",self.js)
        self.assertIn("new Date(y, m - 1, d, 12)",self.js)
    def test_no_false_review_structured_data(self):
        self.assertNotIn("aggregateRating",self.html)
        self.assertNotIn("555 Google reviews",self.html)
        self.assertNotIn("the food is great",self.html)
        self.assertNotIn("ratingValue",self.html)
    def test_booking_and_guest_privacy(self):
        self.assertNotIn("staycore/v1/reservations",self.js)
        self.assertNotIn("localStorage",self.js)
        self.assertNotIn("sessionStorage",self.js)
        self.assertIn("wa.me/918999541081",self.js)
    def test_no_new_wp_db_write(self):
        fun=(THEME/"functions.php").read_text()
        for marker in ("wp_insert_post","wpdb->insert","register_rest_route"):
            self.assertNotIn(marker,fun)
    def test_reduced_motion_and_keyboard(self):
        self.assertIn("prefers-reduced-motion:reduce",self.html)
        self.assertIn("focus-visible",self.html)
    def test_business_name_in_structured_data(self):
        match=re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>',self.html)
        self.assertIsNotNone(match)
        data=json.loads(match.group(1))
        self.assertEqual(data["name"],"Andaz Vibe Stay - Arambol, Goa")
        self.assertNotIn("aggregateRating",data)
    def test_old_booking_script_removed(self):
        self.assertNotIn("const today=new Date(),tomorrow",self.html)
if __name__=="__main__":
    unittest.main()
