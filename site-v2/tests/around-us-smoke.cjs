"use strict";
// Dell-local, unauthenticated Around Us browser QA. No external navigation.
const assert=require("assert").strict;
const path=require("path"),os=require("os"),fs=require("fs");
const {pathToFileURL}=require("url");
let chromium;
for(const candidate of ["playwright",path.join(os.homedir(),"moksha-browser","node_modules","playwright"),path.join(os.homedir(),"dell-ai-operator","node_modules","playwright")]){
  try{chromium=require(candidate).chromium;break;}catch{}
}
if(!chromium)throw new Error("Existing Dell Playwright installation not found");
const root=path.resolve(__dirname,"..");
const target=pathToFileURL(path.join(root,"explore.html")).href;
const artifacts=path.join(root,".qa-artifacts");
let checks=0;
function pass(label){checks++;console.log("PASS",label);}
async function main(){
  fs.mkdirSync(artifacts,{recursive:true});
  const browser=await chromium.launch({executablePath:"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  try{
    for(const width of [320,390,768,1024,1440]){
      const context=await browser.newContext({viewport:{width,height:900}});
      const page=await context.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.goto(target,{waitUntil:"load"});
      const cards=page.locator("[data-explore-item]"),visible=page.locator("[data-explore-item]:visible");
      assert.equal(await cards.count(),12);
      assert.equal(await visible.count(),12);
      pass(width+"px: 12 visible, crawlable place cards");
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
      assert(size.scroll<=size.view+1,"overflow "+width+" "+JSON.stringify(size));
      pass(width+"px: no horizontal overflow");
      await page.locator("#place-search").fill("Morjim");
      assert.equal(await visible.count(),1);
      assert.match(await visible.first().locator("h3").textContent(),/Morjim/);
      assert.match(page.url(),/q=Morjim/);
      pass(width+"px: instant search and shareable query");
      await page.locator("[data-explore-clear]").click();
      assert.equal(await visible.count(),12);
      pass(width+"px: clear search");
      await page.locator('[data-explore-type="heritage"]').click();
      assert.equal(await visible.count(),2);
      assert.equal(await page.locator('[data-explore-type="heritage"]').getAttribute("aria-pressed"),"true");
      pass(width+"px: fort filter and pressed state");
      await page.locator("#place-area").selectOption("north");
      assert.equal(await visible.count(),1);
      assert.match(await visible.first().textContent(),/Tiracol/);
      pass(width+"px: combined category and area filter");
      await page.locator("#place-search").fill("impossible-destination");
      assert.equal(await visible.count(),0);
      assert.equal(await page.locator("#explore-empty").isVisible(),true);
      assert.match(await page.locator("#explore-count").textContent(),/^0 places/);
      pass(width+"px: empty state and result count");
      await page.locator("[data-explore-reset]").click();
      assert.equal(await visible.count(),12);
      assert.equal(await page.locator("#place-area").inputValue(),"all");
      assert.equal(await page.locator('[data-explore-type="all"]').getAttribute("aria-pressed"),"true");
      pass(width+"px: reset restores full list");
      assert.deepEqual(errors,[]);
      pass(width+"px: no runtime exceptions");
      if(width===390)await page.screenshot({path:path.join(artifacts,"around-us-mobile-390.png"),fullPage:true});
      if(width===1440)await page.screenshot({path:path.join(artifacts,"around-us-desktop-1440.png"),fullPage:true});
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:390,height:900}});
    const page=await context.newPage();
    await page.goto(target+"?q=beach&type=beach&area=north");
    assert.equal(await page.locator("#place-search").inputValue(),"beach");
    assert.equal(await page.locator("#place-area").inputValue(),"north");
    assert.equal(await page.locator('[data-explore-type="beach"]').getAttribute("aria-pressed"),"true");
    assert.equal(await page.locator("[data-explore-item]:visible").count(),1);
    pass("deep-linked search, interest and area restored");
    const links=await page.locator("[data-explore-item] a[href]").evaluateAll(nodes=>nodes.map(n=>({href:n.href,target:n.target,rel:n.rel})));
    assert.equal(links.length,12);
    assert(links.every(x=>x.href.startsWith("https://www.google.com/maps/search/?api=1")&&x.target==="_blank"&&x.rel.includes("noopener")));
    pass("12 valid external Maps links, no navigation executed");
    await context.close();
    console.log("AROUND US QA PASS",checks,"checks");
  }finally{await browser.close();}
}
main().catch(e=>{console.error("AROUND US QA FAIL",e.stack||e);process.exitCode=1;});