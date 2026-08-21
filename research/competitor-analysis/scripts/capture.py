import asyncio, json, os, re, sys
from playwright.async_api import async_playwright

OUT = "/home/user/analysis"
SITES = {
    "keif": "https://keifaldiafa.com",
    "asoul": "https://asoulaldiafa.com",
}
PAGES = {
    "keif": ["/", "/services", "/offerings", "/portfolio", "/about", "/contact", "/locations", "/qahwajiin-riyadh"],
    "asoul": ["/", "/services", "/offerings", "/portfolio", "/about", "/contact", "/rukn-qahwa-arabiya", "/sababin-qahwa-jeddah"],
}
VIEWPORTS = {
    "mobile": dict(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                   user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"),
    "desktop": dict(viewport={"width":1440,"height":900}, device_scale_factor=1, is_mobile=False, has_touch=False,
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
}

METRICS_JS = """
() => {
  const px = v => parseFloat(v)||0;
  const res = {};
  res.url = location.href;
  res.title = document.title;
  res.docHeight = document.documentElement.scrollHeight;
  res.viewport = {w: innerWidth, h: innerHeight};
  res.dir = document.documentElement.dir || getComputedStyle(document.documentElement).direction;
  res.lang = document.documentElement.lang;
  const b = getComputedStyle(document.body);
  res.body = {font: b.fontFamily, size: b.fontSize, lh: b.lineHeight, color: b.color, bg: b.backgroundColor};

  // headings
  res.headings = [...document.querySelectorAll('h1,h2,h3,h4')].slice(0,60).map(h=>{
    const s = getComputedStyle(h);
    return {tag:h.tagName, text:(h.innerText||'').trim().slice(0,80), size:s.fontSize, weight:s.fontWeight,
            family:s.fontFamily.split(',')[0], ls:s.letterSpacing, lh:s.lineHeight, color:s.color, align:s.textAlign};
  });

  // sections outline
  res.sections = [...document.querySelectorAll('section,header,footer,main>div')].slice(0,60).map(s=>{
    const r = s.getBoundingClientRect(); const c = getComputedStyle(s);
    return {tag:s.tagName, id:s.id||null, cls:(s.className&&typeof s.className==='string'? s.className.slice(0,120):null),
            top: Math.round(r.top + scrollY), h: Math.round(r.height), pt:c.paddingTop, pb:c.paddingBottom, bg:c.backgroundColor,
            heading: (s.querySelector('h1,h2,h3')?.innerText||'').trim().slice(0,60)};
  });

  // tap targets < 44px
  const inter = [...document.querySelectorAll('a,button,[role=button],input,select,textarea')];
  res.interactiveCount = inter.length;
  res.smallTargets = inter.map(e=>{const r=e.getBoundingClientRect();return {t:e.tagName, txt:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,40), w:Math.round(r.width), h:Math.round(r.height)}})
      .filter(o=> (o.w>0&&o.h>0) && (o.h<44||o.w<44));

  // font sizes distribution of text nodes
  const sizes = {};
  document.querySelectorAll('p,span,li,a,div').forEach(e=>{
    if(e.children.length===0 && (e.innerText||'').trim().length>2){
      const s=getComputedStyle(e).fontSize; sizes[s]=(sizes[s]||0)+1;
    }
  });
  res.fontSizes = Object.entries(sizes).sort((a,b)=>b[1]-a[1]).slice(0,15);

  // colors used
  const colc={}, bgc={};
  document.querySelectorAll('*').forEach(e=>{const s=getComputedStyle(e);
    if(s.color) colc[s.color]=(colc[s.color]||0)+1;
    if(s.backgroundColor && s.backgroundColor!=='rgba(0, 0, 0, 0)') bgc[s.backgroundColor]=(bgc[s.backgroundColor]||0)+1;
    });
  res.textColors = Object.entries(colc).sort((a,b)=>b[1]-a[1]).slice(0,12);
  res.bgColors = Object.entries(bgc).sort((a,b)=>b[1]-a[1]).slice(0,12);

  // images
  res.images = [...document.querySelectorAll('img')].slice(0,80).map(i=>({src:(i.currentSrc||i.src||'').slice(0,220), alt:(i.alt||'').slice(0,60), nw:i.naturalWidth, nh:i.naturalHeight, dw:Math.round(i.getBoundingClientRect().width), loading:i.loading, fetchp:i.getAttribute('fetchpriority')}));
  res.imgCount = document.images.length;

  // fonts loaded
  try { res.fonts = [...document.fonts].map(f=>f.family+' '+f.weight+' '+f.status).filter((v,i,a)=>a.indexOf(v)===i).slice(0,25); } catch(e){ res.fonts=[]; }

  // effects: backdrop filters, shadows, animations
  let blur=0, shadow=0, anim=0, transition=0, gradient=0, radiusSet={};
  document.querySelectorAll('*').forEach(e=>{const s=getComputedStyle(e);
    if(s.backdropFilter && s.backdropFilter!=='none') blur++;
    if(s.boxShadow && s.boxShadow!=='none') shadow++;
    if(s.animationName && s.animationName!=='none') anim++;
    if(s.transitionProperty && s.transitionProperty!=='all' && s.transitionDuration!=='0s') transition++;
    if(s.backgroundImage && s.backgroundImage.includes('gradient')) gradient++;
    if(s.borderRadius && s.borderRadius!=='0px') radiusSet[s.borderRadius]=(radiusSet[s.borderRadius]||0)+1;
  });
  res.effects={blur,shadow,anim,transition,gradient, radius:Object.entries(radiusSet).sort((a,b)=>b[1]-a[1]).slice(0,10)};

  // sticky / fixed elements
  res.fixed = [...document.querySelectorAll('*')].filter(e=>{const p=getComputedStyle(e).position; return p==='fixed'||p==='sticky';})
      .slice(0,20).map(e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
        return {tag:e.tagName, cls:(typeof e.className==='string'?e.className.slice(0,80):''), pos:s.position, z:s.zIndex, w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top), bottom:Math.round(innerHeight-r.bottom), txt:(e.innerText||'').trim().slice(0,40)};
      });

  // horizontal overflow
  res.hOverflow = document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0;
  const wide=[]; document.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width>innerWidth+2) wide.push({tag:e.tagName, cls:(typeof e.className==='string'?e.className.slice(0,60):''), w:Math.round(r.width)});});
  res.wideEls = wide.slice(0,10);

  // CTA / whatsapp links
  res.links = [...document.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'), txt:(a.innerText||'').trim().slice(0,40)}));
  res.schema = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{const j=JSON.parse(s.textContent); return Array.isArray(j)?j.map(x=>x['@type']):(j['@type']||'?')}catch(e){return 'parse-error'}});
  return res;
}
"""

async def run():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        for site, base in SITES.items():
            for vp_name, vp in VIEWPORTS.items():
                ctx = await browser.new_context(locale="ar-SA", timezone_id="Asia/Riyadh", **vp)
                page = await ctx.new_page()
                perf = []
                for path in PAGES[site]:
                    url = base + path
                    key = f"{site}|{vp_name}|{path}"
                    try:
                        t = await page.goto(url, wait_until="networkidle", timeout=60000)
                        await page.wait_for_timeout(2500)
                        # scroll through to trigger lazy anims
                        await page.evaluate("""async()=>{const h=document.body.scrollHeight; for(let y=0;y<h;y+=window.innerHeight*0.8){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,220));} window.scrollTo(0,0); await new Promise(r=>setTimeout(r,600));}""")
                        m = await page.evaluate(METRICS_JS)
                        m["status"] = t.status if t else None
                        try:
                            nav = await page.evaluate("()=>{const n=performance.getEntriesByType('navigation')[0]||{}; const res=performance.getEntriesByType('resource'); const by={}; let total=0; res.forEach(r=>{const k=r.initiatorType||'other'; by[k]=(by[k]||0)+ (r.transferSize||0); total+=(r.transferSize||0)}); const lcp=performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]; return {domContentLoaded:n.domContentLoadedEventEnd, load:n.loadEventEnd, resources:res.length, transferByType:by, transferTotal:total, fcp:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime, lcp: lcp? lcp.startTime:null}}")
                        except Exception as e:
                            nav = {"err": str(e)}
                        m["perf"] = nav
                        results[key] = m
                        safe = path.strip("/").replace("/", "_") or "home"
                        fp = f"{OUT}/screens/{site}_{vp_name}_{safe}"
                        # full page
                        await page.screenshot(path=fp + "_full.png", full_page=True)
                        await page.screenshot(path=fp + "_fold.png")
                        print("OK", key, m["docHeight"], flush=True)
                    except Exception as e:
                        print("ERR", key, e, flush=True)
                        results[key] = {"error": str(e)}
                await ctx.close()
        await browser.close()
    with open(f"{OUT}/data/metrics.json","w",encoding="utf-8") as f:
        json.dump(results,f,ensure_ascii=False,indent=1)
    print("DONE")

asyncio.run(run())
