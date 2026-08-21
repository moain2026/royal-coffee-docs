import asyncio, json
from playwright.async_api import async_playwright
OUT="/home/user/analysis"

INIT = r"""
window.__vitals={lcp:0,cls:0,shifts:[],lt:[]};
new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__vitals.lcp=e.startTime; window.__vitals.lcpEl=(e.element&&(e.element.tagName+'.'+(typeof e.element.className==='string'?e.element.className.slice(0,50):'')))||''; window.__vitals.lcpSize=e.size;}}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput){window.__vitals.cls+=e.value; window.__vitals.shifts.push(+e.value.toFixed(4));}}}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__vitals.lt.push(Math.round(e.duration));}}).observe({type:'longtask',buffered:true});
"""

CONTRAST = r"""
() => {
  function parse(c){const m=(c||'').match(/[\d.]+/g); if(!m) return null; return [ +m[0], +m[1], +m[2], m.length>3? +m[3]:1 ];}
  function over(fg,bg){const a=fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a),1];}
  function effBg(el){
    let stack=[]; let n=el;
    while(n && n!==document.documentElement){ const s=getComputedStyle(n);
      const c=parse(s.backgroundColor); if(c && c[3]>0) stack.push(c);
      if(s.backgroundImage && s.backgroundImage!=='none') stack.push('img');
      n=n.parentElement; }
    let base=[10,10,10,1]; let hasImg=false;
    for(let i=stack.length-1;i>=0;i--){ if(stack[i]==='img'){hasImg=true; continue;} base=over(stack[i],base); }
    return {bg:base, hasImg};
  }
  function lum(c){const f=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);}
  const res=[];
  document.querySelectorAll('h1,h2,h3,h4,p,span,a,li,button,strong,div').forEach(e=>{
    if(e.children.length) return; const t=(e.innerText||'').trim(); if(t.length<3) return;
    const r=e.getBoundingClientRect(); if(r.width<4||r.height<4) return;
    const s=getComputedStyle(e); const fg0=parse(s.color); if(!fg0) return;
    const {bg,hasImg}=effBg(e); const fg=over(fg0,bg);
    const l1=lum(fg), l2=lum(bg);
    const ratio=+((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2);
    const size=parseFloat(s.fontSize), w=parseInt(s.fontWeight)||400;
    const large = size>=24 || (size>=18.66 && w>=700);
    res.push({t:t.slice(0,36), size, w, ratio, need: large?3:4.5, pass: ratio >= (large?3:4.5), overImg:hasImg, color:s.color});
  });
  const fails=res.filter(r=>!r.pass);
  return {total:res.length, failCount:fails.length, fails:fails.sort((a,b)=>a.ratio-b.ratio).slice(0,30), sample:res.slice(0,5)};
}
"""

async def run():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        for site,url in [("keif","https://keifaldiafa.com/"),("asoul","https://asoulaldiafa.com/")]:
            for label, throttle in [("fast",None),("4g",{"download":1.6*1024*1024/8,"upload":750*1024/8,"latency":150})]:
                ctx=await b.new_context(locale="ar-SA", viewport={"width":390,"height":844}, device_scale_factor=2,
                        is_mobile=True, has_touch=True,
                        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
                pg=await ctx.new_page()
                await pg.add_init_script(INIT)
                cdp=await ctx.new_cdp_session(pg)
                await cdp.send("Network.enable")
                if throttle:
                    await cdp.send("Network.emulateNetworkConditions", {"offline":False,"downloadThroughput":throttle["download"],"uploadThroughput":throttle["upload"],"latency":throttle["latency"]})
                    await cdp.send("Emulation.setCPUThrottlingRate", {"rate":4})
                await pg.goto(url, wait_until="load", timeout=180000)
                await pg.wait_for_timeout(6000)
                v=await pg.evaluate("()=>window.__vitals")
                nav=await pg.evaluate("()=>{const n=performance.getEntriesByType('navigation')[0]; const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime; return {ttfb:Math.round(n.responseStart), fcp:Math.round(fcp||0), dcl:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), transfer:Math.round(performance.getEntriesByType('resource').reduce((a,r)=>a+(r.transferSize||0),0)/1024), reqs:performance.getEntriesByType('resource').length}}")
                key=f"{site}|{label}"
                out[key]={"lcp":round(v.get("lcp") or 0), "lcpEl":v.get("lcpEl"), "cls":round(v.get("cls") or 0,4), "shifts":v.get("shifts")[:10], "longtasks":v.get("lt")[:12], **nav}
                if label=="fast":
                    out[key]["contrast"]=await pg.evaluate(CONTRAST)
                print(key, out[key]["lcp"], out[key]["cls"], out[key]["fcp"], out[key]["load"], out[key]["transfer"], flush=True)
                await ctx.close()
        await b.close()
    json.dump(out,open(OUT+"/data/vitals.json","w"),ensure_ascii=False,indent=1)
    print("DONE")
asyncio.run(run())
