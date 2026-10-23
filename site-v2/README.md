# Andaz Vibe Stay — Website V2 (Task 1)

**Status:** Isolated feature-branch prototype. Not published, deployed, or merged.

The canonical guest-facing brand is **Andaz Vibe Stay - Arambol, Goa**.

## Structure

- `index.html`: positioning, stay choices, social experiences
- `rooms.html`: verified four room categories
- `experiences.html`: pool, karaoke, party room, bar, separate Moksha partnership
- `explore.html`: Arambol-area ideas without fabricated distances or itinerary promises
- `contact.html`: direct WhatsApp availability enquiry with client-side validation
- `assets/site.css`: dependency-free mobile-first design system
- `assets/site.js`: menu, local-date and room-selection handling, enquiry builder
- `tests/smoke.py`: reproducible static regression checks

## Local preview

Serve from this directory using any static HTTP server, e.g. `python3 -m http.server 8765 --bind 127.0.0.1`; browse `http://127.0.0.1:8765/`.

## Guardrails

- Original repository-root `index.html` and all `wordpress/staycore-pms` files stay untouched.
- No payments are taken by this site. Room prices and availability require team confirmation.
- Room/pool graphics are **illustrations**. Replace with approved real Andaz photos after asset review.
- Moksha Wellness is explicitly a **separate** partner; treatments are not included.
- Do not automatically merge, publish, change DNS, spend, or modify room/PMS inventory.
- No unverified review rating, fixed OTA price, café claim, travel time, or hotel amenity promise.
- No production deployment is authorized by this branch.

## Release path

1. Dell-local static/JS/browser/mobile QA, plus existing-site/PMS regression.
2. Owner visual/content approval, especially genuine property images and room details.
3. Approved deployment plan with backups and rollback.
4. Separate production approval.
