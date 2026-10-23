#!/usr/bin/env node
// Real Chrome DevTools mobile emulation. No packages or external network.
// Static preview only: not a PHP, WordPress, or PMS integration test.
'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {setTimeout:sleep}=require('node:timers/promises');
const ROOT=path.resolve(__dirname,'..');
const WIDTHS=[360,390,768,1280];
const CHROME=process.env.CHROME_BIN||'/usr/bin/google-chrome';
function preview(){
 let html=fs.readFileSync(path.join(ROOT,'wordpress/andaz-theme/front-page.php'),'utf8');
 html=html.replace(/<\?php[\s\S]*?\?>/g,'');
 html=html.replace(/@import\s+url\([^;]+;/g,'');
 if(html.includes('<?php'))throw Error('PHP tags remain in static preview');
 const js=fs.readFileSync(path.join(ROOT,'wordpress/andaz-theme/assets/booking.js'),'utf8');
 return html.replace('</body>','<script>'+js+'</script></body>');
}
async function waitFile(f,ms=12000){
 const end=Date.now()+ms;
 while(Date.now()<end){if(fs.existsSync(f))return fs.readFileSync(f,'utf8');await sleep(100)}
 throw Error('Chrome DevToolsActivePort timeout');
}
async function getTarget(port){
 const end=Date.now()+8000;
 while(Date.now()<end){
  try{
   const r=await fetch('http://127.0.0.1:'+port+'/json/list');
   const list=await r.json();
   const page=list.find(x=>x.type==='page');
   if(page)return page;
  }catch(e){}
  await sleep(150);
 }
 throw Error('Chrome CDP page target unavailable');
}
async function connect(url){
 const ws=new WebSocket(url);
 const pending=new Map();
 let counter=0;
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('WebSocket connect timeout')),8000);
  ws.onopen=()=>{clearTimeout(timer);resolve()};
  ws.onerror=()=>{clearTimeout(timer);reject(Error('WebSocket connect error'))};
 });
 ws.onmessage=e=>{
  let msg;
  try{msg=JSON.parse(e.data)}catch(err){return}
  if(!msg.id||!pending.has(msg.id))return;
  const p=pending.get(msg.id);pending.delete(msg.id);
  clearTimeout(p.timer);
  if(msg.error)p.reject(Error(msg.error.message||'CDP error'));
  else p.resolve(msg.result);
 };
 return {
  send(method,params={}){
   const id=++counter;
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP '+method+' timeout'))},9000);
    pending.set(id,{resolve,reject,timer});
    ws.send(JSON.stringify({id,method,params}));
   });
  },
  close(){ws.close()}
 };
}
const expression='('+(function(){
 const form=document.querySelector('#bookingForm');
 const mobile=document.querySelector('.mobilebook');
 const w=window.innerWidth;
 const overflows=[...document.querySelectorAll('body *')].filter(el=>{
   const style=getComputedStyle(el);
   if(style.position==='fixed'||style.visibility==='hidden')return false;
   const r=el.getBoundingClientRect();
   return r.width>0 && (r.right>w+2 || r.left< -2);
 }).slice(0,10).map(el=>({tag:el.tagName,id:el.id,cls:typeof el.className==='string'?el.className.slice(0,50):'',right:Math.round(el.getBoundingClientRect().right)}));
 return {width:w,scrollWidth:document.documentElement.scrollWidth,
  bookingForm:!!form&&form.getBoundingClientRect().width>0,
  bookingDatesBound:!!document.querySelector('#checkin')?.min,
  mobileCTA:!!mobile&&getComputedStyle(mobile).display!=='none',
  statusRole:document.querySelector('#bookingStatus')?.getAttribute('role'),overflows};
}).toString()+')()';
async function main(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'andaz-cdp-'));
 const html=path.join(dir,'preview.html');
 fs.writeFileSync(html,preview());
 const profile=path.join(dir,'profile');
 const chrome=spawn(CHROME,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions','--no-first-run',
  '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
  '--user-data-dir='+profile,'file://'+encodeURI(html)
 ],{stdio:'ignore'});
 let cdp;
 try{
  const portData=await waitFile(path.join(profile,'DevToolsActivePort'));
  const port=Number(portData.split('\n')[0]);
  if(!Number.isInteger(port)||port<1)throw Error('Invalid local CDP port');
  const target=await getTarget(port);
  cdp=await connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const rows=[];
  for(const width of WIDTHS){
   await cdp.send('Emulation.setDeviceMetricsOverride',{
    width,height:900,deviceScaleFactor:1,mobile:width<768
   });
   await cdp.send('Page.reload',{ignoreCache:true});
   await sleep(450);
   const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
   if(result.exceptionDetails)throw Error('Browser probe exception');
   const v=result.result.value;
   const checks={
    viewport_exact:v.width===width,
    no_horizontal_overflow:v.scrollWidth<=width+1,
    booking_form:v.bookingForm,
    date_validation:v.bookingDatesBound,
    aria_status:v.statusRole==='status',
    mobile_cta:v.mobileCTA===(width<=900)
   };
   const row={requested:width,...v,checks,pass:Object.values(checks).every(Boolean)};
   rows.push(row);
   console.log(JSON.stringify(row));
  }
  if(rows.some(x=>!x.pass))process.exitCode=1;
  else console.log('PASS: actual 360/390/768/1280 CSS-pixel mobile emulation');
 }finally{
  if(cdp)cdp.close();
  chrome.kill('SIGTERM');
  await sleep(300);
  fs.rmSync(dir,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('BLOCKED_OR_FAILED:',e.message);process.exitCode=1});
