# StayCore booking integration — approved architecture and unpassed gates

**Status:** Stage A front-end complete for WhatsApp **enquiries** only. Server-side real availability and reservation writes are **not implemented or certified**.

## Facts verified (2026-10-23)
- Paired staging: `https://staycore-stage.mokshagoa.com`. Version `StayCore 0.8.6`; routes expose `/staycore/v1/units`, `/staycore/v1/reservations`, `/staycore/v1/guests`, self check-in and payments under existing staff/guest permission model.
- Staging reported `mutations_enabled=false`; inventory holds two sample units from room 9. These are **not** production stock or public room availability. Do not read/write live guest records without separate controls.
- Existing static `index.html` currently sends an enquiry to WhatsApp, not a reservation. The new WP theme preserves that honest path and client-side date validation, and claims no availability, rate or payment confirmation.
- Existing WordPress stage `WP_ENVIRONMENT_TYPE` reported `production` despite its stage hostname, so verify isolated database, backups and permissions before installing/testing any plugin or theme.

## Mandatory live-booking contract before any publication claims
1. **Read-only availability:** Provide a reviewed, public-safe endpoint exposing only room type, requested local dates, number of guests, a verified bookable/not-bookable flag and dated rate info. No guest names, document images, staff/private rates, credentials or reservation IDs.
2. **Search validation:** Check arrival >= current property-local date; departure > arrival; room type ID allowlist; per-room occupancy; no disabled/housekeeping units; no unsourced prices. All availability decisions must be **100% consistent** with authoritative PMS under the tested fixtures, not an invented statistical tolerance.
3. **Authenticated reservation creation:** Internal server-side adapter ONLY, narrowly authorized after real user identity/consent and booking policies are verified. Database transaction must atomically validate overlap/remaining inventory and create a reservation exactly once using idempotency key. Prevent double booking and duplicate payment. Never send staff secrets to browsers.
4. **Checkout and payment:** Do not claim payment collection or a confirmed reservation until verified trusted checkout/reservation receipt. Enquiry-only fallback must remain visible for service or network failures.
5. **PII:** Names, guest IDs, passport/ID images, mobile numbers and staff PINs are protected. No PII in analytics/URLs/browser storage/application logs. Explicit consent and retention required for any document capture.
6. **Anti-abuse:** Authentication/rate limits, CSRF/nonce where applicable, anti-automation, request size validation, correlation IDs, server-side permission_callback, response cache isolation and a dated security audit. Avoid raw proxying of StayCore staff routes to public users.
7. **Acceptance suite:** Same-day invalid nights; missing required dates; sold-out room; stale cached availability; overlapping writes; two simultaneous requests; invalid occupancy; returning guest; midnight property-local timezone; failed WhatsApp; revoked auth; plugin/API outage; rollback integrity. Test with synthetic guests and a disposable staging DB; no live reservations.

## Recommended implementation approach
- Leave marketing pages statically cacheable within the current WordPress installation. Use stable theme source in this branch and WordPress media library for verified asset ownership.
- Implement a small independently reviewed server-side `andaz-public-booking` adapter plugin only after StayCore developers document exact permission-safe service calls. No new public write routes should be registered before tests and owner approval. If an approved API is unavailable, continue enquiry-only mode.
- E2E testing requires staging access for plugin/theme deployment, fully isolated test data and a PHP runtime for lint/integration. The connected stage management API currently does not support PMS mutations; that is a **hard integration gate**, not an instruction to bypass.

## Current QA and deferred items
- Tested on Dell: 12/12 Python contract checks, 5/5 Node booking behavior tests; node offline only.
- PHP CLI missing on Dell during smoke; `php -l` and real WP render integration **NOT VERIFIED**.
- Actual public inventory check, reservation write, payment flow, cross-browser device QA and PHP checks remain pending. These items block the label `FULL BOOKING FUNCTIONAL`.
- No merge/deploy/publication until owner reviews source, QA/security signoff and booking authority.

**Development task:** https://github.com/aarondash5-star/business-house-matrix/issues/16
