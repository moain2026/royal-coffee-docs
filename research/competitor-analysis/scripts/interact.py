import asyncio, json
from playwright.async_api import async_playwright
OUT="/home/user/analysis"

async def run():
    log={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        for site,url in [("keif","https://keifaldiafa.com/"),("asoul","https://asoulaldiafa.com/")]:
            ctx=await b.new_context(locale="ar-SA", viewport={"width":390,"height":844}, device_scale_factor=2,
                is_mobile=True, has_touch=True, reduced_motion="reduce",
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
            pg=await ctx.new_page()
            await pg.goto(url, wait_until="networkidle", timeout=90000)
            await pg.wait_for_timeout(2500)
            await pg.add_style_tag(content="*,*::before,*::after{animation:none!important;transition:none!important}")
            info={}
            # open menu
            try:
                btn = pg.locator("text=القائمة").first
                await btn.click(timeout=8000)
                await pg.wait_for_timeout(1200)
                await pg.screenshot(path=f"{OUT}/screens/{site}_mobile_menu_open.png")
                info["menu"]= await pg.evaluate("""()=>{
                    const panels=[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return (s.position==='fixed') && r.height>300 && r.width>200 && s.zIndex && +s.zIndex>=40;});
                    return panels.slice(0,4).map(e=>{const r=e.getBoundingClientRect(); return {cls:(typeof e.className==='string'?e.className.slice(0,90):''), w:Math.round(r.width),h:Math.round(r.height),z:getComputedStyle(e).zIndex, items:[...e.querySelectorAll('a')].length, txt:(e.innerText||'').replace(/\\n+/g,' | ').slice(0,220)}});
                }""")
                # close
                await pg.keyboard.press("Escape")
                await pg.wait_for_timeout(600)
            except Exception as e:
                info["menuErr"]=str(e)
            # scroll to gallery & check lightbox
            try:
                g = pg.locator("img").nth(6)
                await g.scroll_into_view_if_needed(timeout=8000)
                await pg.wait_for_timeout(800)
                before = await pg.evaluate("()=>document.querySelectorAll('[role=dialog],.lightbox,[data-lightbox]').length")
                await g.click(timeout=6000)
                await pg.wait_for_timeout(1200)
                after = await pg.evaluate("()=>document.querySelectorAll('[role=dialog],.lightbox,[data-lightbox]').length")
                info["lightbox"]={"before":before,"after":after,"url":pg.url}
                await pg.screenshot(path=f"{OUT}/screens/{site}_mobile_imgclick.png")
                if pg.url!=url:
                    await pg.goto(url, wait_until="networkidle"); await pg.wait_for_timeout(1500)
            except Exception as e:
                info["lightboxErr"]=str(e)
            # horizontal scrollers
            info["scrollers"]= await pg.evaluate("""()=>[...document.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+20 && e.clientWidth>200).slice(0,8).map(e=>({cls:(typeof e.className==='string'?e.className.slice(0,80):''), sw:e.scrollWidth, cw:e.clientWidth, children:e.children.length}))""")
            # FAQ accordion
            info["details"]= await pg.evaluate("()=>document.querySelectorAll('details').length")
            info["buttonsAria"]= await pg.evaluate("()=>[...document.querySelectorAll('[aria-expanded]')].length")
            # check header hide-on-scroll
            info["headerOnScroll"]= await pg.evaluate("""async()=>{const h=document.querySelector('header'); const a=getComputedStyle(h).transform+'|'+h.getBoundingClientRect().top; window.scrollTo(0,2000); await new Promise(r=>setTimeout(r,700)); const b=getComputedStyle(h).transform+'|'+h.getBoundingClientRect().top+'|'+getComputedStyle(h).backgroundColor; window.scrollTo(0,0); return {top:a, scrolled:b};}""")
            log[site]=info
            print(site, json.dumps(info,ensure_ascii=False)[:1200], flush=True)
            await ctx.close()
        await b.close()
    json.dump(log,open(OUT+"/data/interact.json","w"),ensure_ascii=False,indent=1)
asyncio.run(run())
