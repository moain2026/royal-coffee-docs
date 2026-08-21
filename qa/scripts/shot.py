import asyncio, json, os
from playwright.async_api import async_playwright
OUT="/home/user/qa/shots"; os.makedirs(OUT, exist_ok=True)
PAGES=[("home","/"),("services","/services"),("svc","/services/qahwajiin"),
       ("occ","/occasions/weddings"),("menu","/menu"),("mcat","/menu/coffee"),
       ("gallery","/gallery"),("prices","/prices"),("about","/about"),
       ("faq","/faq"),("contact","/contact"),("social","/social"),
       ("locs","/locations"),("city","/locations/jeddah"),("fam","/qahwajiin-jeddah"),
       ("nf","/nope")]
VP={"mobile":dict(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True),
    "desktop":dict(viewport={"width":1440,"height":900},device_scale_factor=1)}
JS="""()=>{const o={};o.scrollW=document.documentElement.scrollWidth;o.clientW=document.documentElement.clientWidth;
o.hOverflow=[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+2||e.getBoundingClientRect().left<-2).slice(0,12).map(e=>e.tagName+'.'+e.className);
const t=[...document.querySelectorAll('a,button,summary,input,select,textarea')];
o.tapTotal=t.length;o.tapSmall=t.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<44||r.width<24)}).map(e=>e.tagName+'.'+String(e.className).slice(0,30)+' '+Math.round(e.getBoundingClientRect().height)).slice(0,15);
o.h1=[...document.querySelectorAll('h1')].map(e=>e.textContent.trim().slice(0,60));
o.imgBroken=[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.currentSrc||i.src);
o.svg=document.querySelectorAll('svg').length;
o.rvNotIn=document.querySelectorAll('.rv:not(.in)').length;
o.docH=document.body.scrollHeight;return o}"""
async def main():
    rep={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vn,vp in VP.items():
            ctx=await b.new_context(locale="ar-SA",timezone_id="Asia/Riyadh",reduced_motion="reduce",**vp)
            for name,path in PAGES:
                pg=await ctx.new_page()
                await pg.goto("http://localhost:3000"+path,wait_until="networkidle",timeout=60000)
                await pg.evaluate("()=>new Promise(r=>{let y=0;const t=setInterval(()=>{y+=700;scrollTo(0,y);if(y>document.body.scrollHeight){clearInterval(t);scrollTo(0,0);r()}},50)})")
                await pg.wait_for_timeout(700)
                await pg.add_style_tag(content="*,*::before,*::after{animation:none!important;transition:none!important}")
                rep[f"{vn}_{name}"]=await pg.evaluate(JS)
                await pg.screenshot(path=f"{OUT}/{vn}_{name}_fold.png",animations="disabled")
                await pg.screenshot(path=f"{OUT}/{vn}_{name}_full.png",full_page=True,animations="disabled")
                await pg.close()
                print(vn,name,"ok",flush=True)
            await ctx.close()
        await b.close()
    open("/home/user/qa/report.json","w").write(json.dumps(rep,ensure_ascii=False,indent=1))
asyncio.run(main())
