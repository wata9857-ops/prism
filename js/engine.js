// PRISM scene engine — one full-screen scene at a time, chapters with cinematic title cards,
// tap / swipe / keyboard / buttons, pause · replay · skip, chapter menu, details sheet, position memory.
import { setAccent } from "./fx.js";

const $ = (s, r = document) => r.querySelector(s);
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CANCEL = Symbol("cancel");
const SKIP_TAGS = "button, a, input, select, label, textarea, [data-tap], [data-noswipe]";

export function createEngine(chapters, data) {
  // ---------- flatten chapters into a list of scenes (a title card first in each numbered chapter) ----------
  const list = [];
  chapters.forEach((ch, ci) => {
    if (ch.num) list.push({ ci, card: true, kind: "card" });
    ch.scenes.forEach((def) => list.push({ ci, def, kind: def.kind || "narr" }));
  });
  const firstOf = chapters.map((_, ci) => list.findIndex((s) => s.ci === ci));
  const stage = $("#stage"), bar = $("#bar"), hint = $("#hint"), chip = $("#chip");
  const st = { idx: -1, token: 0, paused: false, ff: false, running: 0, done: false, auto: localStorage.getItem("prism-auto") !== "0", cleanup: null, autoTimer: null };

  // ---------- progress bar (one segment per chapter) ----------
  const prog = $("#prog");
  chapters.forEach((ch, ci) => {
    const b = document.createElement("button");
    b.type = "button"; b.innerHTML = "<i><b></b></i>";
    b.setAttribute("aria-label", ch.num ? `第${+ch.num}章 ${ch.title}へ` : ch.title);
    b.addEventListener("click", () => go(firstOf[ci]));
    prog.appendChild(b);
  });

  // ---------- API given to each scene ----------
  function makeApi(token, el) {
    const alive = () => token === st.token;
    const api = {
      data, el,
      get ff() { return st.ff; },
      wait(ms) {
        return new Promise((res, rej) => {
          let left = RM ? Math.min(ms, 120) : ms, last = performance.now();
          const tick = () => {
            if (!alive()) return rej(CANCEL);
            if (st.ff) return res();
            const now = performance.now();
            if (!st.paused) left -= now - last;
            last = now;
            if (left <= 0) res(); else setTimeout(tick, 30);
          };
          tick();
        });
      },
      async type(node, text, cps = 22) {
        node.classList.remove("hide");
        node.classList.add("typing");
        node.textContent = "";
        for (const ch of text) {
          if (!alive()) throw CANCEL;
          if (st.ff || RM) { node.textContent = text; break; }
          node.textContent += ch;
          await api.wait("、。？！".includes(ch) ? 260 : 1000 / cps);
        }
        node.classList.remove("typing");
      },
      count(node, to, { from = 0, dur = 1300, fmt = (v) => Math.round(v).toLocaleString() } = {}) {
        return new Promise((res, rej) => {
          const t0 = performance.now();
          const step = (now) => {
            if (!alive()) return rej(CANCEL);
            const k = st.ff || RM ? 1 : Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - k, 3);
            node.textContent = fmt(from + (to - from) * e);
            if (k < 1) requestAnimationFrame(step); else res();
          };
          requestAnimationFrame(step);
        });
      },
      show(...nodes) { nodes.forEach((n) => { n.classList.remove("hide", "gone"); n.classList.add("fadein"); }); },
      run(fn) {
        st.running++; updateBar();
        Promise.resolve().then(fn).catch((e) => { if (e !== CANCEL) console.error(e); }).finally(() => {
          if (alive()) { st.running = Math.max(0, st.running - 1); st.ff = false; updateBar(); }
        });
      },
      done() {
        if (!alive()) return;
        st.done = true;
        updateBar();
        const cur = list[st.idx];
        if (cur.kind === "narr") showHint("タップで次へ");
        if (cur.kind === "card" && st.auto) {
          clearTimeout(st.autoTimer);
          st.autoTimer = setTimeout(function tick() { if (!alive()) return; if (st.paused) { st.autoTimer = setTimeout(tick, 300); return; } next(); }, RM ? 400 : 1500);
        }
      },
      sheet: openSheet,
      next: () => next(), prev: () => prev(), go: (i) => go(i), goChapter: (ci) => go(firstOf[ci]),
      onLeave(fn) { st.cleanup = fn; },
      hint: showHint,
      saved: () => +(localStorage.getItem("prism-pos") || 0),
      menu: () => openMenu(true),
    };
    return api;
  }

  // ---------- render a scene ----------
  function go(i, dir) {
    i = Math.max(0, Math.min(list.length - 1, i));
    if (i === st.idx) return;
    const prevIdx = st.idx;
    dir = dir || (i > prevIdx ? "next" : "prev");
    const chapterChange = prevIdx < 0 || list[i].ci !== list[prevIdx].ci;
    try { st.cleanup && st.cleanup(); } catch (e) { /* ignore */ }
    st.cleanup = null;
    clearTimeout(st.autoTimer);
    st.token++; st.idx = i; st.ff = false; st.running = 0; st.done = false;
    hideHint(); closeSheet();
    const item = list[i], ch = chapters[item.ci];
    const old = stage.querySelector(".scene:not(.leaving)");
    if (old) {
      old.classList.add("leaving", chapterChange ? "leave-chapter" : "leave-" + dir);
      setTimeout(() => old.remove(), 600);
    }
    if (chapterChange && prevIdx >= 0 && !RM) {
      const w = document.createElement("div");
      w.className = "wipe"; document.body.appendChild(w); setTimeout(() => w.remove(), 1100);
    }
    const el = document.createElement("section");
    el.className = "scene " + (chapterChange ? "enter-chapter" : "enter-" + dir);
    el.tabIndex = -1;
    el.setAttribute("aria-roledescription", "シーン");
    stage.appendChild(el);
    setAccent(ch.accent || "#ffd23f");
    document.documentElement.style.setProperty("--accent", ch.accent && ch.accent !== "#ffffff" ? ch.accent : "#ffd23f");
    const api = makeApi(st.token, el);
    if (item.card) renderCard(el, ch, api); else item.def.render(el, api);
    // HUD
    const inCh = list.filter((s) => s.ci === item.ci && !s.card);
    const pos = item.card ? 0 : inCh.indexOf(item) + 1;
    chip.innerHTML = ch.num ? `<b>${ch.num}</b>${ch.title}${pos ? ` <span class="num">· ${pos}/${inCh.length}</span>` : ""}` : "";
    [...prog.children].forEach((b, ci) => { b.classList.toggle("cur", ci === item.ci); b.classList.toggle("done", ci < item.ci); });
    history.replaceState(null, "", `#/${item.ci}/${item.card ? 0 : inCh.indexOf(item) + 1}`);
    localStorage.setItem("prism-pos", String(i));
    $("#live").textContent = ch.num ? `第${+ch.num}章 ${ch.title}` : ch.title;
    requestAnimationFrame(() => el.focus({ preventScroll: true }));
    updateBar();
  }
  function renderCard(el, ch, api) {
    el.innerHTML = `<div class="ch-num num" aria-hidden="true">${ch.num}</div>
      <h2 class="t-xl ch-title">${ch.title}</h2><p class="t-m hide" id="cs"></p><p class="sr">第${+ch.num}章</p>`;
    api.run(async () => {
      await api.wait(1300);
      await api.type(el.querySelector("#cs"), ch.sub, 18);
      api.done();
    });
  }
  const next = () => { if (st.idx < list.length - 1) go(st.idx + 1, "next"); };
  const prev = () => { if (st.idx > 0) go(st.idx - 1, "prev"); };

  // ---------- controls ----------
  function updateBar() {
    $("#b-prev").disabled = st.idx <= 0;
    $("#b-next").disabled = st.idx >= list.length - 1;
    $("#b-next").classList.toggle("pulse", st.done && list[st.idx]?.kind === "inter");
    const pb = $("#b-pause");
    const canPause = st.running > 0 || (list[st.idx]?.kind === "card" && st.auto);
    pb.disabled = !canPause;
    pb.innerHTML = st.paused ? '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>';
    pb.setAttribute("aria-label", st.paused ? "再生" : "一時停止");
  }
  $("#b-prev").addEventListener("click", prev);
  $("#b-next").addEventListener("click", () => { if (st.running && !st.done) { st.ff = true; } else next(); });
  $("#b-pause").addEventListener("click", () => { st.paused = !st.paused; updateBar(); showHint(st.paused ? "一時停止中" : ""); });
  $("#b-replay").addEventListener("click", () => { const i = st.idx; st.idx = -2; go(i, "next"); });
  let hintTimer = null;
  function showHint(t, keep) {
    hint.textContent = t || ""; hint.classList.toggle("on", !!t);
    clearTimeout(hintTimer);
    if (t && !keep && list[st.idx]?.kind === "inter") hintTimer = setTimeout(hideHint, 2600);
  }
  function hideHint() { hint.classList.remove("on"); }

  // tap on the stage: fast-forward a running sequence, otherwise advance (story scenes only)
  let down = null;
  stage.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now(), skip: !!e.target.closest(SKIP_TAGS), noswipe: !!e.target.closest("[data-noswipe], input") }; });
  stage.addEventListener("pointerup", (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y, dt = performance.now() - down.t;
    const d = down; down = null;
    if (!d.noswipe && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 900) { dx < 0 ? next() : prev(); return; }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !d.skip) {
      const item = list[st.idx];
      if (st.running && !st.done) { st.ff = true; return; }
      if (item.kind === "narr" || item.kind === "card") {
        if (e.clientX < innerWidth * 0.22 && st.idx > 0) prev(); else next();
      } else if (st.done) showHint("› で次へ");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if ($("#menu").classList.contains("on")) { if (e.key === "Escape") openMenu(false); return; }
    if ($("#sheet").classList.contains("on")) { if (e.key === "Escape") closeSheet(); return; }
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); if (st.running && !st.done) st.ff = true; else next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
    else if (e.key === " " && !e.target.closest("button")) { e.preventDefault(); if (st.running && !st.done) st.ff = true; else if (list[st.idx].kind !== "inter") next(); }
    else if (e.key === "Escape" || e.key === "m") openMenu(true);
    else if (e.key === "p") $("#b-pause").click();
  });

  // ---------- chapter menu ----------
  const grid = $("#menu-grid");
  chapters.forEach((ch, ci) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "mcard";
    b.innerHTML = `<span class="n num">${ch.num || (ci === 0 ? "▶" : "◆")}</span><span class="tt">${ch.title}</span><span class="st">${ch.menu || ch.sub || ""}</span>`;
    b.addEventListener("click", () => { openMenu(false); go(firstOf[ci]); });
    grid.appendChild(b);
  });
  function openMenu(on) {
    $("#menu").classList.toggle("on", on);
    $("#menu").setAttribute("aria-hidden", on ? "false" : "true");
    if (on) {
      [...grid.children].forEach((b, ci) => b.classList.toggle("cur", ci === list[st.idx].ci));
      st.pausedByMenu = !st.paused; st.paused = true;
      setTimeout(() => grid.children[list[st.idx].ci]?.focus(), 50);
    } else if (st.pausedByMenu) { st.paused = false; st.pausedByMenu = false; updateBar(); }
  }
  $("#b-menu").addEventListener("click", () => openMenu(true));
  $("#brand").addEventListener("click", () => openMenu(true));
  $("#menu-close").addEventListener("click", () => openMenu(false));
  $("#m-restart").addEventListener("click", () => { openMenu(false); go(0, "prev"); });
  const autoBox = $("#m-auto");
  autoBox.checked = st.auto;
  autoBox.addEventListener("change", () => { st.auto = autoBox.checked; localStorage.setItem("prism-auto", st.auto ? "1" : "0"); });

  // ---------- details sheet ----------
  function openSheet(title, html) {
    $("#sheet-title").textContent = title;
    $("#sheet-body").innerHTML = html;
    $("#sheet").classList.add("on"); $("#scrim").classList.add("on");
    $("#sheet").setAttribute("aria-hidden", "false");
    st.pausedBySheet = !st.paused; st.paused = true;
    setTimeout(() => $("#sheet-close").focus(), 60);
  }
  function closeSheet() {
    if (!$("#sheet").classList.contains("on")) return;
    $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on");
    $("#sheet").setAttribute("aria-hidden", "true");
    if (st.pausedBySheet) { st.paused = false; st.pausedBySheet = false; }
  }
  $("#scrim").addEventListener("click", closeSheet);
  $("#sheet-close").addEventListener("click", closeSheet);

  // ---------- start position (URL → saved → beginning) ----------
  function fromHash() {
    const m = location.hash.match(/^#\/(\d+)\/(\d+)/);
    if (!m) return null;
    const ci = Math.min(+m[1], chapters.length - 1), si = +m[2];
    const inCh = list.map((s, i) => [s, i]).filter(([s]) => s.ci === ci);
    if (!inCh.length) return null;
    const hit = si === 0 ? inCh[0] : inCh.filter(([s]) => !s.card)[si - 1] || inCh[0];
    return hit[1];
  }
  addEventListener("hashchange", () => { const i = fromHash(); if (i != null && i !== st.idx) go(i); });
  const start = fromHash();
  go(start != null ? start : 0);
  return { go, next, prev, list, firstOf };
}
