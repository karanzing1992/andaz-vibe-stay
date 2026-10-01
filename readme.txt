=== StayCore PMS — Andaz Edition ===
Contributors: andaz
Tags: pms, hotel, hostel, booking, front desk, woocommerce
Requires at least: 6.4
Requires PHP: 8.0
Stable tag: 0.1.0

Mobile-first WordPress property management system with an open integration architecture.

== V0.1 ==
* Rooms and dorm-bed inventory
* Guest records
* Reservations with overlap protection
* Check-in / check-out status
* Mobile-first front desk dashboard
* Integration registry and event hooks
* WooCommerce detection
* REST API for future public booking, OTA, CRM and automation adapters

== Integration contract ==
Listen to `staycore_pms_event` or event-specific hooks such as:
* `staycore_pms_event_reservation_created`
* `staycore_pms_event_reservation_status_changed`
* `staycore_pms_event_unit_created`

Register integrations with `StayCore_Integrations::register()`.
