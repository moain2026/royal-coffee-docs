import sys, os
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3000'
OUT = '/home/user/qa/v5'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    for tag, vp in (('m', {'width': 390, 'height': 844}), ('d', {'width': 1440, 'height': 900})):
        pg = b.new_page(viewport=vp, device_scale_factor=1)
        pg.goto(BASE + '/', wait_until='load')
        # capture at several beats so the cross-fade / sheen are visible
        for t in (1600, 6000, 12000):
            pg.wait_for_timeout(t if t == 1600 else t - 1600 if t == 6000 else 6000)
            pg.screenshot(path=f'{OUT}/cine_{tag}_{t}.png')
        info = pg.evaluate("""() => {
          const g = s => { const e=document.querySelector(s); if(!e) return null;
            const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
            return {w:Math.round(r.width),h:Math.round(r.height),op:c.opacity,anim:c.animationName}; };
          return { bg1:g('.hero-bg'), bg2:g('.hero-bg-2'), shine:g('.hero-shine'),
                   veil:g('.hero-veil'), h1:g('.hero-ttl'),
                   overflowX: document.documentElement.scrollWidth - innerWidth };
        }""")
        print(tag, info)
        pg.close()
    b.close()
print('done ->', OUT)
