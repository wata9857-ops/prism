# design/walkthrough.py — 全シーンを実際のブラウザで順に進め、主な操作を試し、スクリーンショットとエラーを記録する
#   使い方: python design/walkthrough.py URL OUTDIR [w h]
import sys
sys.stdout.reconfigure(encoding="utf-8")
import os
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (390, 844)
os.makedirs(OUT, exist_ok=True)
errs = []
INTERACT = {
    # chip title (chapter, scene index) -> actions
}


def act(pg):
    """そのシーンの主な操作を 1 つ試す（あれば）"""
    s = pg.locator(".scene:not(.leaving)").last
    for sel in ["#op-start"]:
        pass
    for sel, kind in [(".choice[data-a='0']", "click"), (".choice[data-o='血統']", "click"), ("#rm", "click"), ("#go", "click"),
                      (".choice[data-m='n']", "click"), (".pchip", "all"), ("input[type=range]", "range"), (".tab", "tabs"),
                      ("#res", "click"), (".horse", "click"), (".pick3 button", "pick3"), (".vh[data-i='1']", "click"),
                      ("#one", "many"), ("#many", "click"), ("#nx", "deck"), (".yb", "click"), ("#hold", "hold"), (".carousel", "scroll")]:
        loc = s.locator(sel)
        if loc.count() == 0:
            continue
        try:
            if kind == "click":
                if loc.first.is_visible() and loc.first.is_enabled():
                    loc.first.click()
                    pg.wait_for_timeout(500)
            elif kind == "all":
                for i in range(loc.count()):
                    loc.nth(i).click(); pg.wait_for_timeout(120)
            elif kind == "range":
                loc.first.evaluate("(e)=>{e.value=e.max; e.dispatchEvent(new Event('input',{bubbles:true}))}")
            elif kind == "tabs":
                for i in range(loc.count()):
                    if loc.nth(i).is_visible():
                        loc.nth(i).click(timeout=3000); pg.wait_for_timeout(250)
            elif kind == "pick3":
                for i in (0, 4, 8):
                    loc.nth(i).click(); pg.wait_for_timeout(150)
            elif kind == "many":
                for _ in range(22):
                    loc.first.click()
            elif kind == "deck":
                for _ in range(6):
                    loc.first.click(); pg.wait_for_timeout(150)
            elif kind == "hold":
                b = loc.first.bounding_box()
                pg.mouse.move(b["x"] + 10, b["y"] + 10); pg.mouse.down(); pg.wait_for_timeout(500)
                pg.screenshot(path=os.path.join(OUT, f"{n:02d}b_hold.png")); pg.mouse.up()
            elif kind == "scroll":
                loc.first.evaluate("(e)=>e.scrollTo({left:e.scrollWidth})"); pg.wait_for_timeout(300)
        except Exception as ex:  # noqa: BLE001
            errs.append(("action", sel, str(ex)[:120]))
    pg.wait_for_timeout(1500)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=2 if W < 800 else 1, has_touch=False, reduced_motion=(sys.argv[5] if len(sys.argv) > 5 else "no-preference"))
    pg = ctx.new_page()
    pg.on("console", lambda m: errs.append(("console", m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
    pg.goto(URL, wait_until="networkidle")
    pg.evaluate("localStorage.clear(); localStorage.setItem('prism-auto','0')")
    pg.goto(URL + "#/0/1", wait_until="networkidle")
    n = 0
    seen = []
    while n < 60:
        pg.wait_for_timeout(1200)
        # fast-forward any running sequence by clicking next once if not done
        chip = pg.locator("#chip").inner_text()
        pg.screenshot(path=os.path.join(OUT, f"{n:02d}a.png"))
        act(pg)
        # let narrative sequences finish
        pg.wait_for_timeout(2500)
        pg.screenshot(path=os.path.join(OUT, f"{n:02d}c.png"))
        seen.append(chip)
        nxt = pg.locator("#b-next")
        if nxt.is_disabled():
            break
        nxt.click()  # fast-forward if running
        pg.wait_for_timeout(250)
        if pg.locator("#chip").inner_text() == chip:
            nxt.click()
        n += 1
    # menu + sheet + keyboard + back
    pg.locator("#b-menu").click(); pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(OUT, "menu.png"))
    pg.locator(".mcard").nth(5).click(); pg.wait_for_timeout(2500)
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(300); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(1500)
    if pg.locator(".scene:not(.leaving) .more").count():
        pg.locator(".scene:not(.leaving) .more").first.click(); pg.wait_for_timeout(600); pg.screenshot(path=os.path.join(OUT, "sheet.png"))
        pg.keyboard.press("Escape")
    print("hash", pg.evaluate("location.hash"))
    pg.locator("#b-prev").click(); pg.wait_for_timeout(800)
    print("scenes visited:", len(seen))
    print("\n".join(dict.fromkeys(seen)))
    b.close()
print("ERRORS:", errs)
