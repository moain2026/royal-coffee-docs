import sys, os
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3000'
OUT = '/home/user/qa/v5'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    pg.goto(BASE + '/services', wait_until='load')
    pg.wait_for_timeout(400)
    pg.click('.burger')
    pg.wait_for_timeout(700)
    box = pg.evaluate("""() => {
      const s = document.getElementById('sheet');
      const r = s.getBoundingClientRect();
      const g = (sel) => { const e = document.querySelector(sel); if(!e) return null;
        const q = e.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; };
      return { sheetH: Math.round(r.height), vh: innerHeight,
               pct: Math.round(r.height / innerHeight * 100),
               wa: g('.sact-wa'), tel: g('.sact-tel'),
               tile: g('.sheet-list a'), list: g('.sheet-list') };
    }""")
    print(box)
    pg.screenshot(path=f'{OUT}/sheet_mobile.png')
    el = pg.query_selector('#sheet')
    el.screenshot(path=f'{OUT}/sheet_only.png')
    b.close()
print('done ->', OUT)
