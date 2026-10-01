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
const el = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateOnly = v => String(v || '').slice(0,10);
const prettyDate = v => {
  if(!v) return '';
  const d = new Date(String(v).replace(' ','T'));
  return isNaN(d) ? String(v).slice(0,16) : d.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
};
const digits = v => String(v || '').replace(/\D/g,'');
const state = {tab:'rooms', units:[], roomFilter:'all', roomSearch:''};

const statusAction = async (id,status) => {
  await api('reservations/'+id+'/status',{method:'POST',body:JSON.stringify({status})});
  await kpis();
  await render();
};

const kpis = async () => {
  const d = await api('dashboard');
  el('#sc-kpis').innerHTML = [
    ['Arrivals',d.arrivals],['Departures',d.departures],['In house',d.inhouse],['Units',d.available],['Open tasks',d.open_tasks]
  ].map(([l,v])=>'<article class="sc-kpi"><strong>'+v+'</strong><span>'+l+'</span></article>').join('');
};

const quickActions = r => {
  let out = '';
  if(r.status==='confirmed') out += '<button class="button sc-status" data-id="'+r.id+'" data-status="checked_in">Check in</button>';
  if(r.status==='checked_in') out += '<button class="button button-primary sc-status" data-id="'+r.id+'" data-status="checked_out">Check out</button>';
  if(r.phone) {
    const tel=digits(r.phone);
    out += '<a class="button" href="tel:'+esc(r.phone)+'">Call</a>';
    if(tel) out += '<a class="button" target="_blank" rel="noopener" href="https://wa.me/'+tel+'">WhatsApp</a>';
  }
  return out;
};

const guestLine = r => {
  const guests = Number(r.adults||0)+Number(r.children||0);
  return '<div class="sc-guest">'+
    '<div class="sc-row"><div><div class="sc-title">'+esc((r.guest_name||'Guest').trim())+'</div><div class="sc-meta">'+esc(r.phone||'No phone')+(r.email?' · '+esc(r.email):'')+'</div></div><span class="sc-badge '+esc(r.status)+'">'+esc(String(r.status||'').replace('_',' '))+'</span></div>'+
    '<div class="sc-meta sc-stay-meta">'+esc(r.source||'direct')+' · '+prettyDate(r.check_in)+' → '+prettyDate(r.check_out)+' · '+guests+' guest'+(guests===1?'':'s')+'</div>'+
    '<div class="sc-actions">'+quickActions(r)+'</div>'+
  '</div>';
};

const reservationCard = r => '<article class="sc-card">'+
  '<div class="sc-row"><div><div class="sc-title">'+esc((r.guest_name||'Guest').trim())+'</div><div class="sc-meta">'+esc(r.unit_name||'Unassigned')+' · '+prettyDate(r.check_in)+' → '+prettyDate(r.check_out)+'</div></div><span class="sc-badge">'+esc(String(r.status||'').replace('_',' '))+'</span></div>'+
  '<div class="sc-meta">'+esc(r.phone||'')+(r.source?' · '+esc(r.source):'')+'</div>'+
  '<div class="sc-actions">'+quickActions(r)+'</div></article>';

const roomNumber = u => {
  const m = String(u.name||u.room_group||'').match(/Room\s+(\d+)/i);
  return m ? Number(m[1]) : 9999;
};
const roomKey = u => u.type === 'room' ? u.name : ('Room '+roomNumber(u));
const roomType = units => {
  const first=units[0]||{};
  if(first.type==='room') return first.room_group || 'Private Room';
  const m=String(first.room_group||'').split('—');
  return (m[1]||first.room_group||'Dorm').trim();
};
const currentReservation = (unitId, rows) => rows.find(r => Number(r.unit_id)===Number(unitId) && ['confirmed','checked_in'].includes(r.status));
const groupRooms = (units, rows) => {
  const map={};
  units.forEach(u=>{
    const key=roomKey(u);
    if(!map[key]) map[key]={key,number:roomNumber(u),units:[]};
    map[key].units.push(u);
  });
  return Object.values(map).sort((a,b)=>a.number-b.number).map(g=>{
    g.units.sort((a,b)=>String(a.name).localeCompare(String(b.name),undefined,{numeric:true}));
    g.reservations=g.units.map(u=>currentReservation(u.id,rows)).filter(Boolean);
    g.type=roomType(g.units);
    g.isPrivate=g.units.length===1 && g.units[0].type==='room';
    g.totalCapacity=g.isPrivate ? Number(g.units[0].capacity||1) : g.units.length;
    g.occupied=g.isPrivate ? (g.reservations[0] ? Number(g.reservations[0].adults||0)+Number(g.reservations[0].children||0) : 0) : g.reservations.length;
    return g;
  });
};

const filterRoom = (g, today) => {
  const rows=g.reservations;
  if(state.roomFilter==='available') return g.occupied < g.totalCapacity;
  if(state.roomFilter==='arrivals') return rows.some(r=>dateOnly(r.check_in)===today && r.status==='confirmed');
  if(state.roomFilter==='inhouse') return rows.some(r=>r.status==='checked_in');
  if(state.roomFilter==='departures') return rows.some(r=>dateOnly(r.check_out)===today && ['confirmed','checked_in'].includes(r.status));
  return true;
};

const roomCard = g => {
  const free=Math.max(0,g.totalCapacity-g.occupied);
  let body='';
  if(g.isPrivate){
    const r=g.reservations[0];
    body = r ? guestLine(r) : '<div class="sc-unit-row sc-free"><span>Private room</span><strong>Available · max '+g.totalCapacity+'</strong></div>';
  } else {
    const unitRows=g.units.map(u=>{
      const r=currentReservation(u.id,g.reservations);
      const bed=String(u.name).split('·').pop().trim();
      return '<div class="sc-unit-row '+(r?'occupied':'sc-free')+'"><div class="sc-bed-label">'+esc(bed)+'</div><div class="sc-unit-main">'+(r?guestLine(r):'<div><strong>Available</strong><div class="sc-meta">1 guest max</div></div>')+'</div></div>';
    }).join('');
    body = '<details class="sc-beds" '+(g.occupied? 'open':'')+'><summary>Show '+g.units.length+' beds</summary>'+unitRows+'</details>';
  }

  const searchHay=(g.key+' '+g.type+' '+g.reservations.map(r=>(r.guest_name||'')+' '+(r.phone||'')).join(' ')).toLowerCase();
  return '<article class="sc-room-card" data-search="'+esc(searchHay)+'">'+
    '<header class="sc-room-head"><div><div class="sc-room-no">'+esc(g.key)+'</div><div class="sc-meta">'+esc(g.type)+'</div></div><div class="sc-occupancy"><strong>'+g.occupied+' / '+g.totalCapacity+'</strong><span>'+free+' free</span></div></header>'+
    body+
  '</article>';
};

const renderRooms = async () => {
  const today=StayCorePMS.today;
  const [units,rows]=await Promise.all([api('units'),api('reservations?from='+today+'&to='+today)]);
  state.units=units;
  const groups=groupRooms(units,rows).filter(g=>filterRoom(g,today));
  const q=state.roomSearch.trim().toLowerCase();
  const visible=q?groups.filter(g=>(g.key+' '+g.type+' '+g.reservations.map(r=>(r.guest_name||'')+' '+(r.phone||'')).join(' ')).toLowerCase().includes(q)):groups;

  const filters=[['all','All'],['arrivals','Arrivals'],['inhouse','In-house'],['departures','Departures'],['available','Available']];
  el('#sc-view').innerHTML =
    '<section class="sc-room-tools"><input id="sc-room-search" type="search" placeholder="Search guest, phone, room or bed" value="'+esc(state.roomSearch)+'"><div class="sc-filter-row">'+filters.map(([v,l])=>'<button class="'+(state.roomFilter===v?'active':'')+'" data-filter="'+v+'">'+l+'</button>').join('')+'</div></section>'+
    '<section class="sc-room-list">'+(visible.length?visible.map(roomCard).join(''):'<div class="sc-card sc-empty">No rooms match this view.</div>')+'</section>';

  const search=el('#sc-room-search');
  search.oninput=e=>{state.roomSearch=e.target.value; document.querySelectorAll('.sc-room-card').forEach(card=>{card.style.display=card.dataset.search.includes(state.roomSearch.toLowerCase())?'':'none';});};
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=async()=>{state.roomFilter=b.dataset.filter;await renderRooms();bindStatus();});
};

const renderToday = async () => {
  const day=StayCorePMS.today;
  const rows=await api('reservations?from='+day+'&to='+day);
  el('#sc-view').innerHTML='<section class="sc-list">'+(rows.length?rows.map(reservationCard).join(''):'<div class="sc-card sc-empty">No stays touching today yet.</div>')+'</section>';
};

const renderStays = async () => {
  const day=StayCorePMS.today;
  const rows=await api('reservations?from='+day);
  el('#sc-view').innerHTML='<section class="sc-list">'+(rows.length?rows.map(reservationCard).join(''):'<div class="sc-card sc-empty">No upcoming stays.</div>')+'</section>';
};

const renderInventory = async () => {
  state.units=await api('units');
  el('#sc-view').innerHTML='<div class="sc-actions"><button class="button button-primary" id="sc-add-unit">+ Room / Bed</button></div><section class="sc-list grid">'+(state.units.length?state.units.map(u=>'<article class="sc-card"><div class="sc-row"><div><div class="sc-title">'+esc(u.name)+'</div><div class="sc-meta">'+esc(u.room_group||u.type)+' · capacity '+esc(u.capacity)+'</div></div><span class="sc-badge">'+esc(u.status)+'</span></div><div class="sc-meta">₹'+Number(u.base_rate||0).toLocaleString('en-IN')+' base rate</div></article>').join(''):'<div class="sc-card sc-empty">Add your rooms and dorm beds.</div>')+'</section>';
  const b=el('#sc-add-unit');if(b)b.onclick=openUnit;
};

const renderIntegrations = async () => {
  const rows=await api('integrations');
  const cards=Object.entries(rows).map(([key,v])=>'<article class="sc-card"><div class="sc-row"><div><div class="sc-title">'+esc(v.label)+'</div><div class="sc-meta">'+esc((v.capabilities||[]).join(' · '))+'</div></div><span class="sc-badge">'+esc(v.status)+'</span></div></article>');
  cards.push('<article class="sc-card"><div class="sc-title">Open Integration API</div><div class="sc-meta">Adapters can connect OTAs, payments, WhatsApp, accounting, locks and other WordPress plugins without modifying PMS core.</div></article>');
  el('#sc-view').innerHTML='<section class="sc-list grid">'+cards.join('')+'</section>';
};

const bindStatus = () => document.querySelectorAll('.sc-status').forEach(b=>b.onclick=()=>statusAction(b.dataset.id,b.dataset.status).catch(e=>alert(e.message)));
const render = async () => {
  if(state.tab==='rooms') await renderRooms();
  if(state.tab==='today') await renderToday();
  if(state.tab==='stays') await renderStays();
  if(state.tab==='inventory') await renderInventory();
  if(state.tab==='integrations') await renderIntegrations();
  bindStatus();
};

const openBooking = async () => {
  state.units=await api('units');
  const d=el('#sc-dialog');
  d.innerHTML='<form class="sc-form" id="sc-book-form"><h2>New booking</h2><label>Guest first name<input name="first_name" required></label><label>Phone<input name="phone" inputmode="tel"></label><label>Email<input name="email" type="email"></label><label>Room / bed<select name="unit_id" required><option value="">Select</option>'+state.units.map(u=>'<option value="'+u.id+'" data-capacity="'+u.capacity+'">'+esc(u.name)+(u.room_group?' — '+esc(u.room_group):'')+'</option>').join('')+'</select></label><div class="two"><label>Adults<input type="number" name="adults" min="1" value="1" required></label><label>Children<input type="number" name="children" min="0" value="0"></label></div><div class="two"><label>Check in<input type="datetime-local" name="check_in" required></label><label>Check out<input type="datetime-local" name="check_out" required></label></div><div class="two"><label>Total ₹<input type="number" step="0.01" name="total"></label><label>Source<select name="source"><option>direct</option><option>walkin</option><option>airbnb</option><option>booking</option><option>agoda</option><option>gommt</option><option>other</option></select></label></div><label>Notes<textarea name="notes"></textarea></label><div id="sc-capacity-note" class="sc-meta"></div><div class="sc-actions"><button class="button button-primary">Save booking</button><button type="button" class="button sc-close">Cancel</button></div></form>';
  d.showModal();
  d.querySelector('.sc-close').onclick=()=>d.close();
  const unitSel=d.querySelector('[name="unit_id"]');
  const note=d.querySelector('#sc-capacity-note');
  unitSel.onchange=()=>{const opt=unitSel.options[unitSel.selectedIndex];note.textContent=opt&&opt.dataset.capacity?'Maximum '+opt.dataset.capacity+' guest'+(opt.dataset.capacity==='1'?'':'s')+' for this unit.':'';};
  d.querySelector('form').onsubmit=async e=>{
    e.preventDefault();
    const payload=Object.fromEntries(new FormData(e.target).entries());
    try{await api('reservations',{method:'POST',body:JSON.stringify(payload)});d.close();await kpis();await render();}catch(err){alert(err.message)}
  };
};

const openUnit = () => {
  const d=el('#sc-dialog');
  d.innerHTML='<form class="sc-form"><h2>Add room / bed</h2><label>Name<input name="name" placeholder="Room 8 · Bed A" required></label><label>Room group<input name="room_group" placeholder="Room 8 — Non-AC Dorm"></label><div class="two"><label>Type<select name="type"><option value="bed">Bed</option><option value="room">Private room</option></select></label><label>Capacity<input name="capacity" type="number" min="1" value="1"></label></div><label>Base rate ₹<input name="base_rate" type="number" step="0.01"></label><div class="sc-actions"><button class="button button-primary">Add inventory</button><button type="button" class="button sc-close">Cancel</button></div></form>';
  d.showModal();d.querySelector('.sc-close').onclick=()=>d.close();
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();try{await api('units',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target).entries()))});d.close();await kpis();await render();}catch(err){alert(err.message)}};
};

document.addEventListener('DOMContentLoaded', async () => {
  el('#sc-new-booking').onclick=()=>openBooking().catch(e=>alert(e.message));
  document.querySelectorAll('.staycore-tabs button').forEach(b=>b.onclick=async()=>{document.querySelectorAll('.staycore-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.tab=b.dataset.tab;await render();});
  try{await kpis();await render();}catch(e){el('#sc-view').innerHTML='<div class="sc-card">PMS could not load: '+esc(e.message)+'</div>'}
});
})();
