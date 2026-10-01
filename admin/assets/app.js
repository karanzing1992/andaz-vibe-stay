(() => {
const api = async (path, options={}) => {
  const res = await fetch(StayCorePMS.root + path, {
    ...options,
    headers: {'Content-Type':'application/json','X-WP-Nonce':StayCorePMS.nonce,...(options.headers||{})}
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};
const el = (s) => document.querySelector(s);
const state = {tab:'today', units:[]};

const statusAction = async (id,status) => {
  await api('reservations/'+id+'/status',{method:'POST',body:JSON.stringify({status})});
  await render();
};

const kpis = async () => {
  const d = await api('dashboard');
  el('#sc-kpis').innerHTML = [
    ['Arrivals',d.arrivals],['Departures',d.departures],['In house',d.inhouse],['Available',d.available],['Open tasks',d.open_tasks]
  ].map(([l,v])=>'<article class="sc-kpi"><strong>'+v+'</strong><span>'+l+'</span></article>').join('');
};

const reservationCard = r => {
  let actions='';
  if(r.status==='confirmed') actions='<button class="button sc-status" data-id="'+r.id+'" data-status="checked_in">Check in</button>';
  if(r.status==='checked_in') actions='<button class="button button-primary sc-status" data-id="'+r.id+'" data-status="checked_out">Check out</button>';
  return '<article class="sc-card"><div class="sc-row"><div><div class="sc-title">'+(r.guest_name||'Guest')+'</div><div class="sc-meta">'+(r.unit_name||'Unassigned')+' · '+r.check_in.slice(0,16)+' → '+r.check_out.slice(0,16)+'</div></div><span class="sc-badge">'+r.status.replace('_',' ')+'</span></div><div class="sc-meta">'+(r.phone||'')+(r.source?' · '+r.source:'')+'</div><div class="sc-actions">'+actions+'</div></article>';
};

const renderToday = async () => {
  const day = new Date().toISOString().slice(0,10);
  const rows = await api('reservations?from='+day+'&to='+day);
  el('#sc-view').innerHTML = '<section class="sc-list">'+(rows.length?rows.map(reservationCard).join(''):'<div class="sc-card sc-empty">No stays touching today yet.</div>')+'</section>';
};

const renderStays = async () => {
  const day = new Date().toISOString().slice(0,10);
  const rows = await api('reservations?from='+day);
  el('#sc-view').innerHTML = '<section class="sc-list">'+(rows.length?rows.map(reservationCard).join(''):'<div class="sc-card sc-empty">No upcoming stays.</div>')+'</section>';
};

const renderInventory = async () => {
  state.units = await api('units');
  el('#sc-view').innerHTML = '<div class="sc-actions"><button class="button button-primary" id="sc-add-unit">+ Room / Bed</button></div><section class="sc-list grid">'+(state.units.length?state.units.map(u=>'<article class="sc-card"><div class="sc-row"><div><div class="sc-title">'+u.name+'</div><div class="sc-meta">'+(u.room_group||u.type)+' · capacity '+u.capacity+'</div></div><span class="sc-badge">'+u.status+'</span></div><div class="sc-meta">₹'+Number(u.base_rate||0).toLocaleString('en-IN')+' base rate</div></article>').join(''):'<div class="sc-card sc-empty">Add your rooms and dorm beds.</div>')+'</section>';
  const b=el('#sc-add-unit'); if(b)b.onclick=openUnit;
};

const renderIntegrations = async () => {
  const rows = await api('integrations');
  const cards = Object.entries(rows).map(([key,v])=>'<article class="sc-card"><div class="sc-row"><div><div class="sc-title">'+v.label+'</div><div class="sc-meta">'+(v.capabilities||[]).join(' · ')+'</div></div><span class="sc-badge">'+v.status+'</span></div></article>');
  cards.push('<article class="sc-card"><div class="sc-title">Open Integration API</div><div class="sc-meta">Adapters can subscribe to StayCore events and connect OTAs, payments, WhatsApp, accounting, locks and other WordPress plugins without modifying PMS core.</div></article>');
  el('#sc-view').innerHTML='<section class="sc-list grid">'+cards.join('')+'</section>';
};

const bindStatus = () => document.querySelectorAll('.sc-status').forEach(b=>b.onclick=()=>statusAction(b.dataset.id,b.dataset.status).catch(alert));
const render = async () => {
  if(state.tab==='today') await renderToday();
  if(state.tab==='stays') await renderStays();
  if(state.tab==='inventory') await renderInventory();
  if(state.tab==='integrations') await renderIntegrations();
  bindStatus();
};

const openBooking = async () => {
  state.units = await api('units');
  const d=el('#sc-dialog');
  d.innerHTML='<form class="sc-form" id="sc-book-form"><h2>New booking</h2><label>Guest first name<input name="first_name" required></label><label>Phone<input name="phone" inputmode="tel"></label><label>Room / bed<select name="unit_id" required><option value="">Select</option>'+state.units.map(u=>'<option value="'+u.id+'">'+u.name+(u.room_group?' — '+u.room_group:'')+'</option>').join('')+'</select></label><div class="two"><label>Check in<input type="datetime-local" name="check_in" required></label><label>Check out<input type="datetime-local" name="check_out" required></label></div><div class="two"><label>Total ₹<input type="number" step="0.01" name="total"></label><label>Source<select name="source"><option>direct</option><option>walkin</option><option>airbnb</option><option>booking</option><option>agoda</option><option>gommt</option><option>other</option></select></label></div><label>Notes<textarea name="notes"></textarea></label><div class="sc-actions"><button class="button button-primary">Save booking</button><button type="button" class="button sc-close">Cancel</button></div></form>';
  d.showModal();
  d.querySelector('.sc-close').onclick=()=>d.close();
  d.querySelector('form').onsubmit=async e=>{
    e.preventDefault();
    const payload=Object.fromEntries(new FormData(e.target).entries());
    try{await api('reservations',{method:'POST',body:JSON.stringify(payload)});d.close();await kpis();await render();}catch(err){alert(err.message)}
  };
};

const openUnit = () => {
  const d=el('#sc-dialog');
  d.innerHTML='<form class="sc-form"><h2>Add room / bed</h2><label>Name<input name="name" placeholder="Dorm 1 · Bed A" required></label><label>Room group<input name="room_group" placeholder="AC Dorm"></label><div class="two"><label>Type<select name="type"><option value="bed">Bed</option><option value="room">Private room</option></select></label><label>Base rate ₹<input name="base_rate" type="number" step="0.01"></label></div><div class="sc-actions"><button class="button button-primary">Add inventory</button><button type="button" class="button sc-close">Cancel</button></div></form>';
  d.showModal(); d.querySelector('.sc-close').onclick=()=>d.close();
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();try{await api('units',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target).entries()))});d.close();await kpis();await render();}catch(err){alert(err.message)}};
};

document.addEventListener('DOMContentLoaded', async () => {
  el('#sc-new-booking').onclick=()=>openBooking().catch(alert);
  document.querySelectorAll('.staycore-tabs button').forEach(b=>b.onclick=async()=>{document.querySelectorAll('.staycore-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.tab=b.dataset.tab;await render()});
  try{await kpis();await render()}catch(e){el('#sc-view').innerHTML='<div class="sc-card">PMS could not load: '+e.message+'</div>'}
});
})();
