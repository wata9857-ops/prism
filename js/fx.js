// PRISM visual effects: ambient light particles, opening prism, beam diagram
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const COLORS = ["#ff5a5f", "#ff9f1c", "#ffd23f", "#7be495", "#2ec4b6", "#3a86ff", "#8b5cf6", "#d08cff"];
const NS = "http://www.w3.org/2000/svg";

// ---------------- ambient background (light particles drifting toward a soft beam) ----------------
let bgAccent = [255, 210, 63], bgTarget = [255, 210, 63];
export function setAccent(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  bgTarget = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function startBG(canvas) {
  const g = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  let W, H, parts = [], running = true;
  const resize = () => {
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    const n = Math.round(Math.min(70, (innerWidth * innerHeight) / 14000));
    parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.6 + .4) * dpr,
      vx: (Math.random() * .25 + .05) * dpr, vy: (Math.random() - .5) * .1 * dpr, a: Math.random() * .5 + .15, c: COLORS[(Math.random() * 8) | 0] }));
  };
  resize(); addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !RM) requestAnimationFrame(draw); });
  function draw() {
    for (let i = 0; i < 3; i++) bgAccent[i] += (bgTarget[i] - bgAccent[i]) * .03;
    g.clearRect(0, 0, W, H);
    const grd = g.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .38, Math.max(W, H) * .7);
    grd.addColorStop(0, `rgba(${bgAccent.map(Math.round).join(",")},.10)`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; }
      g.globalAlpha = p.a; g.fillStyle = p.c;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    if (running && !RM) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ---------------- opening: a white beam enters a prism and splits into eight ----------------
export function prismIntro(canvas, api) {
  const g = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = (canvas.width = innerWidth * dpr), H = (canvas.height = innerHeight * dpr);
  const cx = W * .5, cy = H * .36, s = Math.min(W, H) * .2;
  const tri = [[cx, cy - s * .9], [cx + s * .8, cy + s * .55], [cx - s * .8, cy + s * .55]];
  const hit = [cx - s * .4, cy - s * .17], out = [cx + s * .38, cy - s * .12];
  const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  const t0 = performance.now();
  let stop = false;
  function frame(now) {
    if (stop) return;
    const t = api.ff || RM ? 9 : (now - t0) / 1000;
    g.clearRect(0, 0, W, H);
    const pa = ease(t / .9);
    g.strokeStyle = `rgba(255,255,255,${.6 * pa})`; g.lineWidth = 1.5 * dpr;
    g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath(); g.stroke();
    g.fillStyle = `rgba(255,255,255,${.04 * pa})`; g.fill();
    const b = ease((t - .4) / .9);
    if (b > 0) {
      g.strokeStyle = "#fff"; g.lineWidth = 2.4 * dpr; g.shadowColor = "#fff"; g.shadowBlur = 14 * dpr;
      g.beginPath(); g.moveTo(0, hit[1] + cy * .06); g.lineTo(hit[0] * b, hit[1] + cy * .06 * (1 - b)); g.stroke(); g.shadowBlur = 0;
    }
    const sp = ease((t - 1.2) / 1.1);
    if (sp > 0) {
      COLORS.forEach((col, i) => {
        const ang = -.34 + i * .1, len = (W - out[0]) * 1.15 * sp;
        g.strokeStyle = col; g.globalAlpha = .9; g.lineWidth = 2.2 * dpr; g.shadowColor = col; g.shadowBlur = 10 * dpr;
        g.beginPath(); g.moveTo(hit[0], hit[1]); g.lineTo(out[0], out[1] + (i - 3.5) * 2 * dpr);
        g.lineTo(out[0] + Math.cos(ang) * len, out[1] + Math.sin(ang) * len); g.stroke();
      });
      g.globalAlpha = 1; g.shadowBlur = 0;
    }
    const dim = ease((t - 2.5) / 1);
    if (dim > 0) { g.fillStyle = `rgba(5,6,10,${.7 * dim})`; g.fillRect(0, 0, W, H); }
    if (t < 4) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return () => { stop = true; };
}

// ---------------- beam diagram: 8 perspectives converge into one probability ----------------
export const MODEL_NAMES = ["着順全体", "クラス別", "距離別", "順位", "3着以内", "着順全体", "3着以内", "1着"];
export const MODEL_SRC = ["v52", "v52", "v52", "v52", "v52", "v33", "v33", "v33"];
export function beams(svg, { animate = true } = {}) {
  const W = 360, H = 420;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";
  const el = (tag, a, p = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const x0 = 30, xl = 116, xc = 318, cy = H / 2;
  el("path", { d: `M0 ${cy} L${x0} ${cy}`, stroke: "#fff", "stroke-width": 3 });
  COLORS.forEach((c, i) => {
    const y = 26 + i * ((H - 52) / 7);
    const p1 = el("path", { d: `M${x0} ${cy} C ${x0 + 60} ${cy}, ${xl - 70} ${y}, ${xl - 8} ${y}`, stroke: c, "stroke-width": 2.6, fill: "none", "stroke-linecap": "round" });
    const t = el("text", { x: xl, y: y + 5, fill: c, "font-size": 13, "font-weight": 700, "font-family": "inherit" });
    t.textContent = `${MODEL_NAMES[i]}（${MODEL_SRC[i]}）`;
    const p2 = el("path", { d: `M${xl + 124} ${y} C ${xl + 150} ${y}, ${xc - 30} ${cy}, ${xc} ${cy}`, stroke: c, "stroke-width": 2, fill: "none", opacity: .85 });
    [p1, p2].forEach((p, k) => {
      if (!animate || RM) return;
      const L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.style.transition = `stroke-dashoffset ${k ? .9 : 1.1}s ${(k ? 1.4 : 0) + i * .09}s cubic-bezier(.2,.8,.2,1)`;
      requestAnimationFrame(() => requestAnimationFrame(() => (p.style.strokeDashoffset = 0)));
    });
  });
  const dot = el("circle", { cx: xc + 8, cy, r: 11, fill: "#fff" });
  if (animate && !RM) { dot.style.opacity = 0; dot.style.transition = "opacity .6s 2.4s"; requestAnimationFrame(() => requestAnimationFrame(() => (dot.style.opacity = 1))); }
  const t = el("text", { x: xc + 4, y: cy + 36, fill: "#fff", "font-size": 15, "font-weight": 800, "text-anchor": "middle" });
  t.textContent = "PRISM";
}
