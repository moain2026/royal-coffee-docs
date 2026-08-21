import asyncio, json
from playwright.async_api import async_playwright
OUT="/home/user/analysis"
exec(open(OUT+"/capture.py").read().split('METRICS_JS = """')[1].split('"""')[0] and "" or "")
METRICS_JS = open(OUT+"/capture.py").read().split('METRICS_JS = """')[1].split('"""')[0]

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        for vp_name, vp in [("mobile", dict(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True,
              user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"))]:
            ctx = await b.new_context(locale="ar-SA", timezone_id="Asia/Riyadh", reduced_motion="reduce", **vp)
            page = await ctx.new_page()
            await page.goto("https://asoulaldiafa.com/", wait_until="networkidle", timeout=90000)
            await page.wait_for_timeout(3000)
            await page.evaluate("""async()=>{const h=document.body.scrollHeight; for(let y=0;y<h;y+=window.innerHeight*0.8){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,250));} window.scrollTo(0,0); await new Promise(r=>setTimeout(r,800));}""")
            m = await page.evaluate(METRICS_JS)
            nav = await page.evaluate("()=>{const n=performance.getEntriesByType('navigation')[0]||{}; const res=performance.getEntriesByType('resource'); let total=0; const by={}; res.forEach(r=>{const k=r.initiatorType||'other'; by[k]=(by[k]||0)+(r.transferSize||0); total+=(r.transferSize||0)}); return {load:n.loadEventEnd, resources:res.length, transferByType:by, transferTotal:total}}")
            m["perf"]=nav
            d=json.load(open(OUT+"/data/metrics.json"))
            d["asoul|mobile|/"]=m
            json.dump(d,open(OUT+"/data/metrics.json","w"),ensure_ascii=False,indent=1)
            # disable animations for screenshot
            await page.add_style_tag(content="*,*::before,*::after{animation:none!important;transition:none!important}")
            await page.wait_for_timeout(1500)
            await page.screenshot(path=f"{OUT}/screens/asoul_{vp_name}_home_fold.png", animations="disabled")
            await page.screenshot(path=f"{OUT}/screens/asoul_{vp_name}_home_full.png", full_page=True, animations="disabled", timeout=120000)
            print("OK", m["docHeight"])
            await ctx.close()
        await b.close()
asyncio.run(run())
