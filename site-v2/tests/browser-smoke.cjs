"use strict";
// Dell-local, unauthenticated browser QA. External WhatsApp navigation is intercepted.
const fs=require("fs");
const path=require("path");
const os=require("os");
const {pathToFileURL}=require("url");
const assert=require("assert").strict;
let chromium;
for(const modulePath of ["playwright",path.join(os.homedir(),"moksha-browser","node_modules","playwright"),path.join(os.homedir(),"dell-ai-operator","node_modules","playwright")]){
  try{chromium=require(modulePath).chromium;break;}catch{}
}
if(!chromium)throw new Error("Existing Dell Playwright installation not found");
const root=path.resolve(__dirname,"..");
const screenshots=path.join(root,".qa-artifacts");
const pages=["index.html","rooms.html","experiences.html","explore.html","contact.html"];
const checks=[];
function pass(label){checks.push(label);console.log("PASS",label);}
function url(name){return pathToFileURL(path.join(root,name)).href;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
async function main(){
  fs.mkdirSync(screenshots,{recursive:true});
  const browser=await chromium.launch({executablePath:"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  try{
    for(const width of [390,768,1440]){
      const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:false});
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",error=>errors.push(error.message));
      for(const name of pages){
        await page.goto(url(name),{waitUntil:"load"});
        assert.equal(await page.locator("h1").count(),1);
        assert.equal(await page.locator('nav a[aria-current="page"]').count(),1);
        const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
        assert(geom.scroll<=geom.view+1,name+" horizontal overflow at "+width+": "+JSON.stringify(geom));
        assert.equal(await page.locator("main").count(),1);
        assert.equal(await page.locator("footer").count(),1);
        const bg=await page.locator("body").evaluate(el=>getComputedStyle(el).backgroundColor);
        assert.notEqual(bg,"rgba(0, 0, 0, 0)");
        pass(name+" "+width+"px structure and layout");
      }
      assert.deepEqual(errors,[]);
      if(width===390){
        await page.goto(url("index.html"));
        const menu=page.locator("[data-menu-toggle]");
        assert.equal(await menu.getAttribute("aria-expanded"),"false");
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"),"true");
        await page.locator('[data-nav] a[href="rooms.html"]').click();
        await page.waitForURL("**/rooms.html");
        assert.equal(await page.locator('[data-nav] a[aria-current="page"]').textContent(),"Rooms");
        pass("mobile menu open and navigation");
        await page.goto(url("index.html"));
        await page.screenshot({path:path.join(screenshots,"home-mobile-390.png"),fullPage:true});
        await page.goto(url("contact.html"));
        await page.screenshot({path:path.join(screenshots,"contact-mobile-390.png"),fullPage:true});
        pass("mobile screenshots captured");
      }
      if(width===1440){
        await page.goto(url("index.html"));
        await page.screenshot({path:path.join(screenshots,"home-desktop-1440.png"),fullPage:true});
        pass("desktop screenshot captured");
      }
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:390,height:850}});
    const page=await context.newPage();
    await page.route("https://wa.me/**",route=>route.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>Intercepted dry run</title>"}));
    await page.goto(url("contact.html")+"?room=ac-dorm");
    assert.equal(await page.locator("#room-type").inputValue(),"AC six-bed dorm");
    pass("room deep link preselection");
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator("#form-error").textContent(),/complete all fields/);
    pass("empty form rejected");
    const first=new Date(),second=new Date(),third=new Date();
    first.setDate(first.getDate()+2);second.setDate(second.getDate()+2);third.setDate(third.getDate()+4);
    await page.locator("#guest-name").fill("Synthetic QA Guest");
    await page.locator("#checkin").fill(iso(first));
    await page.locator("#checkout").fill(iso(second));
    await page.locator("#guests").fill("2");
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator("#form-error").textContent(),/Checkout must be after check-in/);
    pass("invalid same-day checkout rejected");
    await page.locator("#checkout").fill(iso(third));
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("https://wa.me/**");
    const decoded=new URL(page.url()).searchParams.get("text");
    assert(decoded.includes("Synthetic QA Guest"));
    assert(decoded.includes("AC six-bed dorm"));
    assert(decoded.includes("Guests: 2"));
    assert(decoded.includes("Please share availability"));
    pass("valid WhatsApp enquiry built and intercepted without submission");
    await context.close();
    console.log("BROWSER QA PASS",checks.length,"checks; screenshots stored locally on Dell only");
  }finally{await browser.close();}
}
main().catch(error=>{console.error("BROWSER QA FAIL",error.stack||error);process.exitCode=1;});
