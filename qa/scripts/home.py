import sys, os
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3000'
OUT = '/home/user/qa/v5'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg.goto(BASE + '/', wait_until='load')
    pg.wait_for_timeout(600)
    # force every reveal animation to its end state so nothing is captured mid-fade
    pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))")
    h = pg.evaluate("document.body.scrollHeight")
    print('page height', h)
    # scroll through to trigger lazy loading
    y = 0
    while y < h:
        pg.evaluate(f"scrollTo(0,{y})")
        pg.wait_for_timeout(220)
        y += 700
    pg.evaluate("scrollTo(0,0)")
    pg.wait_for_timeout(400)
    # slice the page into readable strips
    for i in range(0, min(h, 12000), 800):
        pg.evaluate(f"scrollTo(0,{i})")
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/home_{i:05d}.png')
    b.close()
print('done ->', OUT)
