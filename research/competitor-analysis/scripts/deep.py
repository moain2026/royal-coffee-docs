import asyncio, json
from playwright.async_api import async_playwright
OUT="/home/user/analysis"

DEEP_JS = r"""
() => {
  const out = {};
  const vh = innerHeight, vw = innerWidth;
  // hero
  const hero = document.querySelector('section') || document.body.children[1];
  const hr = hero.getBoundingClientRect();
  out.hero = {h: Math.round(hr.height), vh, ratio: +(hr.height/vh).toFixed(2)};
  // header/footer bars
  const bars = [...document.querySelectorAll('*')].filter(e=>{const p=getComputedStyle(e).position;return p==='fixed'});
  out.barsHeight = bars.map(e=>Math.round(e.getBoundingClientRect().height));
  // above the fold text
  const afText = [];
  document.querySelectorAll('h1,h2,h3,p,a,button,span').forEach(e=>{
    const r = e.getBoundingClientRect();
    if(r.top>=0 && r.top < vh && r.height>0 && e.children.length===0){
      const t=(e.innerText||'').trim(); if(t) afText.push({tag:e.tagName, size:getComputedStyle(e).fontSize, y:Math.round(r.top), t:t.slice(0,50)});
    }
  });
  out.aboveFold = afText.slice(0,30);
  // tap targets grouped
  const inter=[...document.querySelectorAll('a,button,[role=button],input,select,textarea')];
  out.tap = inter.map(e=>{const r=e.getBoundingClientRect(); return {t:e.tagName,w:Math.round(r.width),h:Math.round(r.height),txt:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30)}}).filter(o=>o.w>0);
  // contrast: compute for main text vs bg
  function lum(c){const m=c.match(/[\d.]+/g).map(Number); const f=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);}
  function cr(a,b){const l1=lum(a),l2=lum(b);return +((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2);}
  const samples=[];
  document.querySelectorAll('p,span,h1,h2,h3,h4,a,li,button').forEach(e=>{
    if(e.children.length) return; const t=(e.innerText||'').trim(); if(t.length<3) return;
    const s=getComputedStyle(e); let bg='rgb(0,0,0)'; let n=e;
    while(n && n!==document.documentElement){const b=getComputedStyle(n).backgroundColor; if(b && b!=='rgba(0, 0, 0, 0)'){bg=b;break;} n=n.parentElement;}
    try{ samples.push({t:t.slice(0,32), size:parseFloat(s.fontSize), color:s.color, bg, ratio:cr(s.color,bg)}); }catch(e){}
  });
  out.contrast = samples.sort((a,b)=>a.ratio-b.ratio).slice(0,25);
  out.contrastFails = samples.filter(s=> s.ratio < (s.size>=24 || (s.size>=18.66) ? 3 : 4.5)).length;
  out.contrastTotal = samples.length;
  // image weights
  out.imgs=[...document.images].map(i=>({src:(i.currentSrc||'').split('/').pop().slice(0,90), nw:i.naturalWidth, nh:i.naturalHeight, dw:Math.round(i.getBoundingClientRect().width), dh:Math.round(i.getBoundingClientRect().height), loading:i.loading}));
  // section rhythm: vertical gaps between top-level sections
  const secs=[...document.querySelectorAll('main > section, main > div, body > section')].map(s=>{const r=s.getBoundingClientRect();const c=getComputedStyle(s);return {h:Math.round(r.height), pt:parseFloat(c.paddingTop), pb:parseFloat(c.paddingBottom), heading:(s.querySelector('h1,h2')?.innerText||'').trim().slice(0,40)}});
  out.sectionRhythm=secs;
  // scroll depth of key CTA
  const whats=[...document.querySelectorAll('a')].filter(a=>(a.href||'').includes('wa.me')||(a.href||'').includes('whatsapp'));
  out.waLinks = whats.length;
  out.telLinks = [...document.querySelectorAll('a[href^="tel:"]')].length;
  out.forms = [...document.querySelectorAll('form')].length;
  out.inputs = [...document.querySelectorAll('input,textarea,select')].map(i=>({t:i.tagName,type:i.type,ph:i.placeholder,h:Math.round(i.getBoundingClientRect().height), fs:getComputedStyle(i).fontSize}));
  out.docH = document.documentElement.scrollHeight;
  out.screens = +(document.documentElement.scrollHeight/vh).toFixed(1);
  return out;
}
"""

async def run():
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        for site,url in [("keif","https://keifaldiafa.com/"),("asoul","https://asoulaldiafa.com/")]:
            for vpn,vp in [("mobile",dict(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True,
                            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")),
                           ("desktop",dict(viewport={"width":1440,"height":900}))]:
                ctx=await b.new_context(locale="ar-SA",reduced_motion="reduce",**vp)
                pg=await ctx.new_page()
                sizes={}
                async def on_resp(r):
                    try:
                        h=await r.all_headers(); cl=int(h.get('content-length','0') or 0)
                    except: cl=0
                    sizes[r.url]= (r.request.resource_type, cl)
                pg.on("response", lambda r: asyncio.create_task(on_resp(r)))
                await pg.goto(url,wait_until="networkidle",timeout=90000)
                await pg.wait_for_timeout(3000)
                d=await pg.evaluate(DEEP_JS)
                # aggregate transfer by type
                agg={}
                for u,(t,c) in sizes.items(): agg[t]=agg.get(t,0)+c
                d["bytesByType"]={k:round(v/1024) for k,v in sorted(agg.items(),key=lambda x:-x[1])}
                d["bytesTotalKB"]=round(sum(agg.values())/1024)
                d["reqCount"]=len(sizes)
                res[f"{site}|{vpn}"]=d
                print(site,vpn,"screens",d["screens"],"contrastFails",d["contrastFails"],"/",d["contrastTotal"],"KB",d["bytesTotalKB"])
                await ctx.close()
        await b.close()
    json.dump(res,open(OUT+"/data/deep.json","w"),ensure_ascii=False,indent=1)
    print("DONE")
asyncio.run(run())
