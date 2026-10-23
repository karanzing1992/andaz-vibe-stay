#!/usr/bin/env python3
"""Dependency-free static regression checks for Andaz V2."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "rooms.html", "experiences.html", "explore.html", "contact.html"]
ERRORS = []
CHECKS = 0

def check(condition, message):
    global CHECKS
    CHECKS += 1
    if not condition:
        ERRORS.append(message)

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = {}
        self.ids = set()
        self.hrefs = []
        self.labels = set()
        self.headings = []
        self.meta = {}
        self.current = []
        self.scripts = []
        self._script_type = None
        self._script_data = ""
        self.form = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags[tag] = self.tags.get(tag, 0) + 1
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "href" in a:
            self.hrefs.append((a["href"], a))
            if a.get("aria-current") == "page":
                self.current.append(a["href"])
        if tag == "label" and "for" in a:
            self.labels.add(a["for"])
        if tag == "meta" and "name" in a:
            self.meta[a["name"]] = a.get("content", "")
        if tag == "script":
            self._script_type = a.get("type", "")
            self._script_data = ""
        if tag == "form" and a.get("id") == "booking-form":
            self.form = True
    def handle_endtag(self, tag):
        if tag == "script" and self._script_type == "application/ld+json":
            self.scripts.append(self._script_data)
        if tag == "script":
            self._script_type = None
    def handle_data(self, data):
        if self._script_type == "application/ld+json":
            self._script_data += data

pages = {}
for name in PAGES:
    path = ROOT / name
    check(path.is_file(), f"{name}: missing")
    if not path.is_file():
        continue
    raw = path.read_text(encoding="utf-8")
    parsed = Page()
    parsed.feed(raw)
    pages[name] = parsed
    check(raw.lower().startswith("<!doctype html>"), f"{name}: missing doctype")
    for tag in ("html", "head", "body", "header", "main", "footer", "h1", "nav"):
        check(parsed.tags.get(tag, 0) == 1, f"{name}: expected one {tag}")
    check(bool(parsed.meta.get("description")), f"{name}: missing meta description")
    check(len(parsed.current) == 1 and parsed.current[0] == name, f"{name}: active navigation wrong")
    check("site-v2" not in raw, f"{name}: unintended development path")
    check("AggregateRating" not in raw and "₹" not in raw, f"{name}: unverified rating or rate")
    check("rooftop" not in raw.lower(), f"{name}: incorrect facility location")
    check("assets/site.css" in raw and "assets/site.js" in raw, f"{name}: assets missing")
    check(bool(parsed.scripts), f"{name}: JSON-LD missing")
    for script in parsed.scripts:
        try:
            data = json.loads(script)
            check(data.get("name") == "Andaz Vibe Stay - Arambol, Goa", f"{name}: schema brand")
            check(data.get("@type") == "Hostel", f"{name}: schema business type")
        except json.JSONDecodeError:
            check(False, f"{name}: JSON-LD invalid")
    for href, attrs in parsed.hrefs:
        url = urlsplit(href)
        if url.scheme or href.startswith("//"):
            if href.startswith("http"):
                check(attrs.get("target") != "_blank" or "noopener" in attrs.get("rel", ""), f"{name}: unsafe external target {href}")
            continue
        target = unquote(url.path) or name
        target_path = ROOT / target
        check(target_path.is_file(), f"{name}: broken local link {href}")
        if url.fragment and target in PAGES and target in pages:
            check(url.fragment in pages[target].ids, f"{name}: broken anchor {href}")

check((ROOT / "assets/site.css").is_file(), "CSS absent")
check((ROOT / "assets/site.js").is_file(), "JS absent")
css = (ROOT / "assets/site.css").read_text(encoding="utf-8")
js = (ROOT / "assets/site.js").read_text(encoding="utf-8")
check("@media(max-width:720px)" in css, "mobile breakpoint absent")
check("prefers-reduced-motion" in css, "reduced motion absent")
check(":focus-visible" in css, "keyboard focus absent")
check("aria-expanded" in js, "mobile nav state absent")
check("co<=ci" in js and "ci<today" in js, "date validation absent")
check("encodeURIComponent(msg)" in js, "WhatsApp message encoding absent")
check("roomOptions" in js, "room prefill absent")
check("booking-form" in pages["contact.html"].ids, "booking form absent")
for field in ("guest-name", "room-type", "checkin", "checkout", "guests"):
    check(field in pages["contact.html"].ids, f"contact: {field} absent")
    check(field in pages["contact.html"].labels, f"contact: {field} lacks label")
check("Andaz Vibe Stay - Arambol, Goa" in (ROOT / "index.html").read_text(), "canonical brand absent")
for name, parsed in pages.items():
    for href, _ in parsed.hrefs:
        url = urlsplit(href)
        if not url.scheme and url.fragment and (url.path or name) in pages:
            check(url.fragment in pages[url.path or name].ids, f"{name}: broken fragment {href}")

print(f"Andaz V2 static QA: {CHECKS - len(ERRORS)}/{CHECKS} checks passed")
for error in ERRORS:
    print("FAIL:", error)
sys.exit(1 if ERRORS else 0)
