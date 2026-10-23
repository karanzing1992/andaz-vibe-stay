// Node's built-in test runner: deterministic browser API stand-ins, no network or packages.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.resolve(__dirname,'../wordpress/andaz-theme/assets/booking.js'),'utf8');
function setup(){
  const handlers={};
  let redirected=null;
  let focused=null;
  const make=(id)=>({
    value:'',min:'',options:[{textContent:'Any'}],selectedIndex:0,
    focus(){focused=id},
    addEventListener(type,callback){handlers[id+':'+type]=callback}
  });
  const fields={bookingForm:make('bookingForm'),checkin:make('checkin'),
    checkout:make('checkout'),guests:make('guests'),
    stayType:make('stayType'),bookingStatus:make('bookingStatus')};
  fields.guests.options=[{textContent:'2 guests'}];
  fields.stayType.options=[{textContent:'Dorm Bed'}];
  vm.runInNewContext(src,{document:{getElementById:id=>fields[id]},
    window:{location:{assign:url=>{redirected=url}}}, Date, encodeURIComponent});
  return {fields,handlers,get redirected(){return redirected},get focused(){return focused}};
}
function iso(date){
 const z=n=>String(n).padStart(2,'0');
 return [date.getFullYear(),z(date.getMonth()+1),z(date.getDate())].join('-');
}
function offsetDays(n){
 const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return iso(d);
}
function submit(x){x.handlers['bookingForm:submit']({preventDefault(){}})}
test('rejects same-day checkout without leaving website',()=>{
 const x=setup();x.fields.checkin.value=offsetDays(1);
 x.handlers['checkin:change']();
 x.fields.checkout.value=x.fields.checkin.value;
 submit(x);
 assert.equal(x.redirected,null);
 assert.match(x.fields.bookingStatus.textContent,/Choose a valid/);
 assert.equal(x.focused,'checkout');
});
test('rejects nonexistent calendar date',()=>{
 const x=setup();x.fields.checkin.value='2027-02-30';x.fields.checkout.value='2027-03-02';
 submit(x);
 assert.equal(x.redirected,null);
 assert.equal(x.focused,'checkin');
});
test('rejects past dates and empty fields',()=>{
 const x=setup();x.fields.checkin.value='2026-01-01';x.fields.checkout.value='2026-01-03';
 submit(x);assert.equal(x.redirected,null);
});
test('valid dates open WhatsApp enquiry with verified text, not confirmation',()=>{
 const x=setup();x.fields.checkin.value=offsetDays(1);
 x.handlers['checkin:change']();
 x.fields.checkout.value=offsetDays(3);
 submit(x);
 assert.ok(x.redirected.startsWith('https://wa.me/918999541081?text='));
 const text=decodeURIComponent(x.redirected.split('?text=')[1]);
 assert.match(text,/Please confirm availability, the current rate/);
 assert.match(text,/Dorm Bed/);
 assert.match(text,/2 guests/);
 assert.match(x.fields.bookingStatus.textContent,/not confirmed/);
});
test('changing check-in invalidates earlier checkout',()=>{
 const x=setup();x.fields.checkin.value=offsetDays(3);
 x.fields.checkout.value=offsetDays(2);
 x.handlers['checkin:change']();
 assert.equal(x.fields.checkout.value,'');
});
