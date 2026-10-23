/* Andaz enquiries only. This script cannot confirm inventory, rates or reservations. */
(() => {
  'use strict';
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  const guests = document.getElementById('guests');
  const stay = document.getElementById('stayType');
  const status = document.getElementById('bookingStatus');
  const prefix = 'https://wa.me/918999541081?text=';
  const pad = n => String(n).padStart(2, '0');
  const toLocalISO = d => [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  const todayISO = () => toLocalISO(new Date());

  function parseLocalDate(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    if (y < 2026 || y > 2100) return null;
    const date = new Date(y, m - 1, d, 12);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function syncDates() {
    const base = todayISO();
    checkin.min = base;
    const parsed = parseLocalDate(checkin.value);
    const next = parsed || new Date();
    const earliest = new Date(next.getFullYear(), next.getMonth(), next.getDate() + 1, 12);
    checkout.min = toLocalISO(earliest);
    if (checkout.value && checkout.value < checkout.min) checkout.value = '';
  }

  function reportError(message) {
    if (status) status.textContent = message;
  }

  checkin.addEventListener('change', syncDates);
  syncDates();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const arrival = parseLocalDate(checkin.value);
    const departure = parseLocalDate(checkout.value);
    if (!arrival || !departure || checkin.value < todayISO() || departure <= arrival) {
      reportError('Choose a valid check-in date and a later check-out date before sending your enquiry.');
      if (!arrival) checkin.focus(); else checkout.focus();
      return;
    }
    const guestsLabel = guests.options[guests.selectedIndex]?.textContent || 'Guests not specified';
    const stayLabel = stay.options[stay.selectedIndex]?.textContent || 'Any';
    const msg = [
      'Hi Andaz Vibe Stay - Arambol, Goa, I would like to enquire about a stay.',
      '',
      'Check-in: ' + checkin.value,
      'Check-out: ' + checkout.value,
      'Guests: ' + guestsLabel,
      'Stay type: ' + stayLabel,
      '',
      'Please confirm availability, the current rate and how to complete the booking.'
    ].join('\n');
    reportError('Opening WhatsApp for your availability enquiry. Your booking is not confirmed until our team replies.');
    window.location.assign(prefix + encodeURIComponent(msg));
  });
})();
