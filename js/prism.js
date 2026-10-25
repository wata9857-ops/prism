// PRISM presentation — One race. Multiple perspectives.
// すべての数値は data/prism.json（検証済みの集計値）から読む。簡略化した例はページ上で明示している。
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
const COLORS = ["#ff5a5f", "#ff9f1c", "#ffd23f", "#7be495", "#2ec4b6", "#3a86ff", "#8b5cf6", "#d08cff"];
const pct = (x, d = 1) => (x == null ? "—" : (x * 100).toFixed(d) + "%");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
function svgText(parent, x, y, text, attrs = {}) {
  const t = el("text", { x, y, ...attrs }, parent);
  t.textContent = text;
  return t;
}

// ---------------------------------------------------------------- opening
function opening() {
  const box = $("#opening"), skip = $("#skip");
  const seen = sessionStorage.getItem("prism-op");
  const finish = () => {
    box.classList.add("done");
    skip.classList.add("gone");
    document.body.style.overflow = "";
    sessionStorage.setItem("prism-op", "1");
  };
  if (RM || seen) { finish(); return; }
  document.body.style.overflow = "hidden";
  skip.addEventListener("click", finish);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" || e.key === "Enter") finish(); }, { once: true });
  const c = $("#op-canvas"), g = c.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
  const cx = W * 0.5, cy = H * 0.5, s = Math.min(W, H) * 0.22;
  const tri = [[cx, cy - s * 0.9], [cx + s * 0.8, cy + s * 0.55], [cx - s * 0.8, cy + s * 0.55]];
  const hit = [cx - s * 0.4, cy - s * 0.17];
  const out = [cx + s * 0.38, cy - s * 0.12];
  const t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  function frame(now) {
    const t = (now - t0) / 1000;
    g.clearRect(0, 0, W, H);
    // prism
    const pa = ease(t / 0.9);
    g.strokeStyle = `rgba(255,255,255,${0.55 * pa})`;
    g.lineWidth = 1.5 * dpr;
    g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath(); g.stroke();
    g.fillStyle = `rgba(255,255,255,${0.035 * pa})`; g.fill();
    // incoming white beam (data)
    const b = ease((t - 0.5) / 0.9);
    if (b > 0) {
      g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 2.2 * dpr; g.shadowColor = "#fff"; g.shadowBlur = 14 * dpr;
      g.beginPath(); g.moveTo(0, hit[1] + (cy * 0.06)); g.lineTo(hit[0] * b + 0 * (1 - b), hit[1] + cy * 0.06 * (1 - b)); g.stroke();
      g.shadowBlur = 0;
    }
    // internal + spectrum
    const sp = ease((t - 1.35) / 1.1);
    if (sp > 0) {
      COLORS.forEach((col, i) => {
        const ang = -0.34 + i * 0.1;
        const len = (W - out[0]) * 1.1 * sp;
        g.strokeStyle = col; g.globalAlpha = 0.85; g.lineWidth = 2 * dpr; g.shadowColor = col; g.shadowBlur = 10 * dpr;
        g.beginPath(); g.moveTo(hit[0], hit[1]); g.lineTo(out[0], out[1] + (i - 3.5) * 2 * dpr);
        g.lineTo(out[0] + Math.cos(ang) * len, out[1] + Math.sin(ang) * len); g.stroke();
      });
      g.globalAlpha = 1; g.shadowBlur = 0;
    }
    // converge to one point (the final probability)
    const cv = ease((t - 2.7) / 1.0);
    if (cv > 0) {
      g.fillStyle = `rgba(6,7,11,${0.75 * cv})`; g.fillRect(0, 0, W, H);
    }
    if (t > 2.9) { $("#op-word").classList.add("on"); $("#op-tag").classList.add("on"); }
    if (t < 6.2) requestAnimationFrame(frame); else finish();
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- hero beams (subtle background)
function heroBeams() {
  const c = $("#hero-canvas");
  if (!c) return;
  const g = c.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, t0 = performance.now(), running = true;
  const size = () => { W = c.width = c.clientWidth * dpr; H = c.height = c.clientHeight * dpr; };
  size(); addEventListener("resize", size);
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running && !RM) requestAnimationFrame(draw); }).observe(c);
  function draw(now) {
    const t = (now - t0) / 1000;
    g.clearRect(0, 0, W, H);
    COLORS.forEach((col, i) => {
      const y0 = H * (0.18 + i * 0.09) + Math.sin(t * 0.4 + i) * 12 * dpr;
      const grd = g.createLinearGradient(0, 0, W, 0);
      grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(0.5, col); grd.addColorStop(1, "rgba(255,255,255,0)");
      g.strokeStyle = grd; g.globalAlpha = 0.22; g.lineWidth = 1.2 * dpr;
      g.beginPath(); g.moveTo(0, H * 0.5); g.bezierCurveTo(W * 0.35, H * 0.5, W * 0.55, y0, W, y0); g.stroke();
    });
    g.globalAlpha = 1;
    if (running && !RM) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ---------------------------------------------------------------- scroll UI (progress, header, dots, reveal)
function scrollUI() {
  const secs = $$("section.ch[data-title]");
  const dots = $("#dots");
  secs.forEach((s) => {
    const a = document.createElement("a");
    a.href = "#" + s.id; a.innerHTML = `<span>${esc(s.dataset.title)}</span>`; a.setAttribute("aria-label", s.dataset.title);
    dots.appendChild(a);
  });
  const links = $$("a", dots);
  let last = 0;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $("#progress").style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    $("#top").classList.toggle("hide", y > last && y > 300);
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const i = secs.indexOf(e.target); links.forEach((l, j) => l.classList.toggle("on", i === j)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => io.observe(s));
  const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: 0.12 });
  $$(".reveal").forEach((x) => rv.observe(x));
  // kinetic question: rows light up with scroll
  const rows = $$("#kin .row");
  const kio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) rows.forEach((r, i) => setTimeout(() => r.classList.add("on"), RM ? 0 : i * 520)); }), { threshold: 0.4 });
  kio.observe($("#kin"));
}

// ---------------------------------------------------------------- timeline
const TL = [
  { v: "v2・v3", d: "2026-10-19", phase: "はじまり", t: "最初の予想エンジン", key: false,
    body: "約 90 の特徴量（多頭数 Elo・近走・タイム差・位置取り・適性・騎手・血統・当日の馬場の傾向）で、LightGBM の順位学習とロジットの合成を作りました。オッズの情報は、能力の評価と別に、最後に合わせる形にしました。",
    found: "期待値が 1 を超えると判断したワイドは、実際には予測ほど当たりませんでした（予測 1.84% → 実際 1.41%）。AI と市場の意見が大きく割れる組合せほど、AI の誤りであることが多い——「勝者の呪い」です。",
    stat: "約90", statNote: "最初の特徴量の数" },
  { v: "v24〜v31", d: "2026-10-19〜20", phase: "回収率への挑戦", t: "穴馬・高配当ハンター", key: false,
    body: "人気より AI の評価が高い穴馬、G1 で能力 1 位を 1 着に固定する三連単など、回収率を狙う買い方を数多く試しました。",
    found: "過去 2 年で 305% の戦略も、最も配当の大きい 1 レースを除くと 99%。過去の成績で戦略を選ぶほど、偶然の大当たりを拾ってしまうことがわかりました。",
    stat: "305%→99%", statNote: "最大の 1 レースを除いたとき" },
  { v: "v32", d: "2026-10-20", phase: "土台を作り直す", t: "30 年分の公式データ", key: true,
    body: "1986〜2026 年の全レースを公式データから読み込み、照合で着順・払戻の一致を確認しました。坂路調教・通過順・ペース・賞金なども使えるようになりました。",
    found: "AI は市場（オッズ）をわずかに上回るようになった一方、長期で 100% を超える買い方は、まだ見つかりませんでした。",
    stat: "139,977", statNote: "取り込んだレース数" },
  { v: "v33", d: "2026-10-21", phase: "能力評価の強化", t: "スピード指数・3 着内重視", key: true,
    body: "走破タイムをコース・距離と当日の馬場で補正したスピード指数・上がり指数を作り、着順全体・3 着以内・1 着を別々に学ぶ 3 つのモデルを合成しました。",
    found: "オッズを使わない AI の 1 位の勝率が 27.7% → 29.6% に。AI の 1 位が 1 番人気と違ったレースでは、AI の 1 位の勝率 23.9% が 1 番人気の 21.1% を上回りました。",
    stat: "29.6%", statNote: "AI 1 位の勝率（オッズ不使用）" },
  { v: "v34・v36", d: "2026-10-21", phase: "買い方の設計", t: "4 つの買い方と 2 つの期待値", key: true,
    body: "AI推奨・安定型・バランス型・高配当型の 4 つに整理。AI推奨は「市場と合わせた期待値」と「AI だけの期待値」の両方が基準を超えた買い目だけを買い、無ければ見送ります。",
    found: "AI推奨は 2016〜2026 年で 129%。ただし 2025 年は 16% と、少数の高配当に頼る不安定さも見えていました。",
    stat: "129%", statNote: "AI推奨（2016〜26年）" },
  { v: "v39", d: "2026-10-22", phase: "検証の決まり", t: "未来の情報を使わない", key: false,
    body: "過去のレースを公開するときは、そのレースの年より前のデータだけで学習したモデルで予想し直すことにしました。出走馬・確定オッズなど、発走前に分かる情報だけを使います。",
    found: "「良く見える」数字と「本当に使える」数字を分けることが、以後のすべての研究の土台になりました。",
    stat: "0", statNote: "予想に使う未来の情報" },
  { v: "v44〜v51", d: "2026-10-22〜25", phase: "限界の発見", t: "35 のアイデアを検証", key: false,
    body: "BOX・軸流し・期待値ポートフォリオ・クラス別のモデルや買い方などを、選ぶ期間と確かめる期間を分けて検証しました。",
    found: "どれも確かめる期間で基準に届かず、不採用。オッズを使わない AI は、どのクラスでも市場に届いていませんでした。",
    stat: "0 / 35", statNote: "基準を満たしたアイデア" },
  { v: "v52", d: "2026-10-26", phase: "予想の作り直し", t: "44 の新しい特徴量", key: true,
    body: "距離・馬場・コースごとの適性、スタミナ、血統の得意距離、騎手 × 競馬場などの 44 の特徴量を追加。1〜3 着の並びを直接学ぶ方法（Plackett–Luce）と、クラス・距離ごとの追加学習を組み合わせました。",
    found: "AI の 1 位が v33 と食い違ったレースで、v52 の 1 位の勝率は 23.5%（v33 は 19.5%）。精度の改善は、選んだ期間と確かめた期間でほぼ同じ大きさでした。",
    stat: "23.5%", statNote: "食い違ったときの v52 の 1 位の勝率" },
  { v: "v53", d: "2026-10-26", phase: "意外な結果", t: "精度は上がったのに", key: false,
    body: "v52 の予想で 4 つの買い方を同じレース・同じルールで計算し直しました。",
    found: "AI推奨の回収率は 128% → 99% に下がりました。新しい情報の多くは、すでにオッズに織り込まれていたのです。",
    stat: "128%→99%", statNote: "AI推奨（2021〜26年）" },
  { v: "v54", d: "2026-10-26", phase: "合成という答え", t: "2 つのモデルの視点を 1 つに", key: true,
    body: "v52 の 5 つと v33 の 3 つ、合わせて 8 つのモデルの評価を、過去 4 年で最もよく着順を説明できた重みで合成しました。",
    found: "市場と合わせた確率が市場だけより良くなった幅は、v33 や v52 単独の約 2 倍。4 つの買い方のうち 3 つで回収率が上がりました。",
    stat: "×2", statNote: "市場を上回った幅（v33 比）" },
  { v: "v55", d: "2026-10-26", phase: "仕組みの解明", t: "なぜ良くなったのか", key: false,
    body: "特徴量のグループを 1 つずつ外して学習し直す実験と、買い目を 1 枚ずつ分解する分析を行いました。",
    found: "最も効いていたのは血統のスタミナ情報。以前の AI推奨の利益の 76% は、たった 1 種類の買い目（低確率の三連複）から生まれていたこともわかりました。",
    stat: "76%", statNote: "以前の利益が 1 種類の買い目に集中" },
  { v: "v56", d: "2026-10-26", phase: "弱点の点検", t: "G1・G2 と新馬戦", key: false,
    body: "G1・G2 の AI推奨 69% は弱点なのかを調べ、成績の表示から新馬戦を外したときの数字も計算し直しました。",
    found: "69% は、同じ数のレースを偶然に選んでも 32% の確率で起きる範囲。専用のモデルを作ると、偶然に合わせ込む危険の方が大きいと判断しました。",
    stat: "32%", statNote: "偶然で 69% 以下になる確率" },
  { v: "PRISM", d: "2026-10-26", phase: "採用", t: "One race. Multiple perspectives.", key: true, prism: true,
    body: "8 つの視点を合成するアンサンブルを、本番の予想エンジン PRISM として採用しました。買い方のルールは変えていません。",
    found: "検証期間（2021〜26年・新馬戦を除く）の回収率は、AI推奨 120.6%・安定型 91.2%・バランス型 107.7%・高配当型 107.6%。利益を約束する数字ではありません。",
    stat: "120.6%", statNote: "AI推奨（2021〜26年・新馬戦を除く）" },
];
function timeline() {
  const track = $("#tl-track"), panel = $("#tl-panel");
  let cur = TL.length - 1;
  TL.forEach((m, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tl-node" + (m.key ? " key" : "") + (m.prism ? " prism" : "");
    b.setAttribute("role", "tab"); b.id = "tl-" + i; b.setAttribute("aria-controls", "tl-panel");
    b.innerHTML = `<span class="dot"></span><span class="v">${esc(m.v)}</span><span class="d num">${esc(m.d)}</span><span class="t">${esc(m.t)}</span>`;
    b.addEventListener("click", () => show(i));
    b.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { show(Math.min(cur + 1, TL.length - 1), true); e.preventDefault(); } if (e.key === "ArrowLeft") { show(Math.max(cur - 1, 0), true); e.preventDefault(); } });
    track.appendChild(b);
  });
  function show(i, focus) {
    cur = i;
    const m = TL[i];
    $$(".tl-node", track).forEach((n, j) => { n.classList.toggle("on", j === i); n.setAttribute("aria-selected", j === i); n.tabIndex = j === i ? 0 : -1; });
    panel.innerHTML = `<div><div class="phase">${esc(m.phase)} · ${esc(m.d)}</div><h3>${esc(m.v)}　${esc(m.t)}</h3><p>${esc(m.body)}</p><p class="found">${esc(m.found)}</p></div>
      <div style="display:grid;place-items:center;text-align:center"><div class="tl-stat num">${esc(m.stat)}<small>${esc(m.statNote)}</small></div></div>`;
    const node = $("#tl-" + i);
    if (focus) node.focus({ preventScroll: true });
    track.scrollTo({ left: node.offsetLeft - track.clientWidth / 2 + 60, behavior: RM ? "auto" : "smooth" });
  }
  $("#tl-prev").addEventListener("click", () => show(Math.max(cur - 1, 0)));
  $("#tl-next").addEventListener("click", () => show(Math.min(cur + 1, TL.length - 1)));
  show(0);
}

// ---------------------------------------------------------------- pipeline
const PIPE = [
  { t: "データを集める", s: "Data", body: "1986〜2026 年の JRA 全レースの公式データ（着順・タイム・通過順・オッズ・払戻・馬体重・血統・坂路調教など）を読み込みます。能力の学習には直近 8 年余り、過去走の集計には 1996 年以降の履歴を使います。",
    facts: [["139,977", "レース"], ["187万", "出走"], ["1,198万", "坂路調教の記録"]], viz: "data" },
  { t: "未来の情報を締め出す", s: "No leakage", body: "特徴量は、すべて「そのレースの日より前」の情報だけで計算します。検証では、ある年を予想するモデルを、その年より前の 8 年だけで学習し直しました（ウォークフォワード）。設定の調整にも、検証する年は一切使っていません。",
    facts: [["8 年", "各年の学習期間"], ["2014〜15", "設定の調整に使った年"], ["2021〜26", "確かめるだけの年"]], viz: "leak" },
  { t: "特徴量を作る", s: "Features", body: "1 頭ごとに 181 の数字を作ります。v33 から引き継いだ 137（Elo・スピード指数・上がり・近走・位置取り・騎手・調教・展開など）と、v52 で加えた条件適性 44 です。",
    facts: [["137", "v33 から"], ["44", "v52 で追加"], ["181", "1 頭あたり"]], viz: "feat" },
  { t: "能力を推定する", s: "8 models", body: "性質の違う 8 つのモデルが、オッズを使わずに能力を評価します。v52 の 5 つ（着順全体・クラス別・距離別・順位・3 着内）と、v33 の 3 つ（着順全体・3 着内・1 着）です。",
    facts: [["5", "v52 のモデル"], ["3", "v33 のモデル"], ["0", "使うオッズ"]], viz: "models" },
  { t: "条件に合わせる", s: "Conditions", body: "全体のモデルを出発点に、クラス別・芝ダ × 距離帯別に少しだけ学習を足します。足すのは、検証で良くなった区分だけ。完全に別のモデルを作る方法は、11 の区分すべてでデータ不足のため悪化しました。",
    facts: [["11/11", "別モデルが悪化した区分"], ["9", "追加学習を使う区分"]], viz: "seg" },
  { t: "確率にする", s: "Probability", body: "1 着 → 残りから 2 着 → 3 着と選ばれる確率（Plackett–Luce）で、1〜3 着の並びを直接学習しています。確率の鋭さは、過去 4 年の結果に合うよう調整します。",
    facts: [["1→2→3 着", "学習する並び"], ["4 年", "較正に使う期間"]], viz: "pl" },
  { t: "8 つの視点を合成する", s: "Ensemble", body: "8 つの評価をレース内で標準化し、過去 4 年で 1〜3 着の並びを最もよく説明できた重みで合成します。これが「AI独自評価」（オッズを使わない PRISM の評価）です。",
    facts: [["8", "合成する視点"], ["2023〜26", "重みを決めた期間"]], viz: "ens" },
  { t: "市場と比べる", s: "Market", body: "最後に単勝オッズから求めた市場の確率を合わせ、「AI予想」の勝率にします。2021〜26 年の検証で、市場だけの確率より勝ち馬をよく当てました。",
    facts: [["−0.0041", "市場との差（対数損失）"]], viz: "mkt" },
  { t: "期待値を較正する", s: "Calibration", body: "買い目ごとに、的中確率 ÷ 市場が示す確率 ×（1 − 控除率）で期待値を推定し、過去に同じ条件（券種・期待値・的中確率の帯）の買い目が実際にどれだけ戻ったかで補正します。",
    facts: [["300 件以上", "補正に使う最低件数"], ["5", "券種"]], viz: "cal" },
  { t: "買い目を選ぶ", s: "Strategy", body: "4 つの買い方が、それぞれのルールで買い目を選びます。AI推奨は、市場と合わせた期待値 1.10 以上かつ AI だけの期待値 0.70 以上の買い目を最大 3 点。無ければ見送ります。",
    facts: [["4", "買い方"], ["最大 3 点", "AI推奨"]], viz: "pick" },
];
function pipeline() {
  const list = $("#pipe-list"), view = $("#pipe-view");
  PIPE.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" role="tab" id="pp-${i}" aria-controls="pipe-view"><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(p.t)}</span></button>`;
    li.firstChild.addEventListener("click", () => show(i));
    li.firstChild.addEventListener("keydown", (e) => { if (e.key === "ArrowDown" || e.key === "ArrowRight") { show((i + 1) % PIPE.length, true); e.preventDefault(); } if (e.key === "ArrowUp" || e.key === "ArrowLeft") { show((i + PIPE.length - 1) % PIPE.length, true); e.preventDefault(); } });
    list.appendChild(li);
  });
  function show(i, focus) {
    const p = PIPE[i];
    $$("button", list).forEach((b, j) => { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
    if (focus) $("#pp-" + i).focus();
    view.innerHTML = `<div class="stage">STEP ${String(i + 1).padStart(2, "0")} · ${esc(p.s)}</div><h3>${esc(p.t)}</h3><p>${esc(p.body)}</p>
      <div class="facts">${p.facts.map(([a, b]) => `<div class="fact"><b class="num">${esc(a)}</b><span>${esc(b)}</span></div>`).join("")}</div><div class="pipe-viz" id="pipe-viz"></div>`;
    VIZ[p.viz]?.($("#pipe-viz"));
  }
  show(0);
}
const VIZ = {
  leak(box) {
    box.innerHTML = `<div class="leak"><div class="note">予想する日：<b id="lk-d" class="num"></b>　— 青い棒（過去）だけが計算に使われ、灰色（未来）は使われません。</div><div class="leak-row" id="lk-row"></div><input type="range" id="lk" min="4" max="35" value="20" aria-label="予想する日"></div>`;
    const row = $("#lk-row");
    const hs = Array.from({ length: 40 }, (_, i) => 20 + Math.round(40 * Math.abs(Math.sin(i * 1.7))));
    hs.forEach((h) => { const b = document.createElement("i"); b.style.height = h + "%"; row.appendChild(b); });
    const upd = () => {
      const v = +$("#lk").value;
      $$("i", row).forEach((b, i) => b.classList.toggle("future", i >= v));
      const d = new Date(2026, 0, 4 + v * 7);
      $("#lk-d").textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };
    $("#lk").addEventListener("input", upd); upd();
  },
  models(box) { beamsInto(box, true); },
  ens(box) { beamsInto(box, false); },
  data(box) { bigBars(box, [["1986〜2026 年のレース", 139977, "#3a86ff"], ["本番モデルの学習に使うレース（2018年〜）", 29340, "#2ec4b6"]], "件"); },
  feat(box) { bigBars(box, [["v33 から引き継いだ特徴量", 137, "#3a86ff"], ["v52 で追加した条件適性", 44, "#ffd23f"]], "個"); },
  seg(box) {
    const segs = [["新馬", 1], ["未勝利", 1], ["1勝", 1], ["2・3勝", 1], ["OP・L・G3", 1], ["G1・G2", 1], ["芝短", 1], ["芝中", 1], ["芝長", 0], ["ダ短", 1], ["ダ中長", 1]];
    box.innerHTML = `<div class="note" style="margin-bottom:10px">区分ごとの追加学習：検証で良くなった区分だけで使う（灰色は使わない区分）</div><div style="display:flex;flex-wrap:wrap;gap:8px">${segs.map(([n, u]) =>
      `<span class="tag" style="${u ? "border-color:#ffd23f;color:#ffd23f" : ""}">${esc(n)}</span>`).join("")}</div>
      <p class="note" style="margin-top:12px">2・3勝クラスは改善がごくわずかだったため、追加学習はほぼゼロ回です。</p>`;
  },
  pl(box) {
    box.innerHTML = `<div class="note" style="margin-bottom:10px">例：勝率 A 40%・B 30%・C 20%・D 10% のとき、「A → B → C」の順になる確率</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:15px" class="num">
      <span class="fact"><b>40%</b><span>A が 1 着</span></span>×<span class="fact"><b>50%</b><span>残り 3 頭で B</span></span>×<span class="fact"><b>67%</b><span>残り 2 頭で C</span></span>=<span class="fact"><b style="color:#ffd23f">13.3%</b><span>A→B→C</span></span></div>
      <p class="note" style="margin-top:10px">実際には 2・3 着の選ばれ方を少しなだらかにする補正も加えています（過去の結果に合わせて決めた値）。<span class="tag sim">簡略化した例</span></p>`;
  },
  mkt(box) { if (DATA) mktChart(box, true); },
  cal(box) {
    box.innerHTML = `<div class="note" style="margin-bottom:10px">推定した期待値が同じでも、実際の戻りは券種や的中確率で違います。過去の実績の表で補正します。</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center" class="num">
      ${[["推定 1.30", "→", "補正後 1.12"], ["券種・帯", "→", "過去の実績"], ["300 件以上", "→", "の区分だけ"]].map(([a, b, c]) => `<div class="fact"><b>${a}</b><span>${b} ${c}</span></div>`).join("")}</div>
      <p class="note" style="margin-top:10px"><span class="tag sim">数値は例</span> 補正の表は、各年について、その年より前の実績だけで作っています。</p>`;
  },
  pick(box) {
    const rows = [["AI推奨", "期待値 1.10 以上 かつ AI だけの期待値 0.70 以上を最大 3 点。無ければ見送り"], ["安定型", "複勝（3 着内率 40% 以上）・ワイド（的中率 25% 以上）から"], ["バランス型", "期待値が最も高い 1 点を毎レース"], ["高配当型", "三連複・馬連（的中率 5% 以下）から最大 3 点"]];
    box.innerHTML = rows.map(([a, b]) => `<div class="tk"><b>${a}</b><span>${b}</span></div>`).join("");
    box.style.display = "grid"; box.style.gap = "8px";
  },
};
function bigBars(box, rows, unit) {
  const mx = Math.max(...rows.map((r) => r[1]));
  box.innerHTML = `<div class="hbars">${rows.map(([l, v, c]) => `<div class="hb" style="grid-template-columns:1fr 140px"><div><div class="lab">${esc(l)}</div><div class="tr" style="height:14px;margin-top:6px"><i style="background:${c}" data-w="${(v / mx) * 100}"></i></div></div><b class="num" style="font-size:20px">${Math.round(v).toLocaleString()}<small style="font-size:12px;color:var(--muted)"> ${unit}</small></b></div>`).join("")}</div>`;
  requestAnimationFrame(() => $$("i[data-w]", box).forEach((i) => (i.style.width = i.dataset.w + "%")));
}
const MODEL_NAMES = ["着順全体（v52）", "クラス別（v52）", "距離別（v52）", "順位（v52）", "3 着内（v52）", "着順全体（v33）", "3 着内（v33）", "1 着（v33）"];
function beamsInto(box, split) {
  const svg = el("svg", { viewBox: "0 0 600 220", class: "chart", role: "img", "aria-label": "8 つのモデル" }, box);
  drawBeams(svg, 600, 220, split);
}
function drawBeams(svg, W, H, splitOnly) {
  if (innerWidth < 700 && !splitOnly) { W = 520; H = 460; }
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.classList.add("chart");
  svg.innerHTML = "";
  const fs = innerWidth < 700 ? 15 : 11;
  const cy = H / 2, x0 = W * 0.16, x1 = W * 0.62, x2 = W * 0.86;
  el("path", { d: `M0 ${cy} L${x0} ${cy}`, stroke: "#fff", "stroke-width": 2.5, fill: "none" }, svg);
  el("path", { d: `M${x0} ${cy - 46} L${x0 + 40} ${cy + 40} L${x0 - 40} ${cy + 40} Z`, fill: "rgba(255,255,255,.05)", stroke: "rgba(255,255,255,.6)" }, svg);
  svgText(svg, 6, cy - 10, "データ", { "font-size": innerWidth < 700 ? 15 : 12 });
  COLORS.forEach((c, i) => {
    const y = 18 + i * ((H - 36) / 7);
    const p = el("path", { d: `M${x0 + 8} ${cy} C ${x0 + 120} ${cy}, ${x1 - 120} ${y}, ${x1 - 70} ${y}`, stroke: c, "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, svg);
    const L = p.getTotalLength ? p.getTotalLength() : 400;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = RM ? 0 : L;
    p.style.transition = `stroke-dashoffset 1.1s ${i * 0.08}s cubic-bezier(.2,.7,.1,1)`;
    requestAnimationFrame(() => requestAnimationFrame(() => (p.style.strokeDashoffset = 0)));
    svgText(svg, x1 - 62, y + 4, MODEL_NAMES[i], { "font-size": fs, fill: c });
    if (!splitOnly) {
      const q = el("path", { d: `M${x1 + 40} ${y} C ${x1 + 90} ${y}, ${x2 - 50} ${cy}, ${x2} ${cy}`, stroke: c, "stroke-width": 1.6, fill: "none", opacity: 0.8 }, svg);
      q.style.strokeDasharray = 300; q.style.strokeDashoffset = RM ? 0 : 300; q.style.transition = `stroke-dashoffset 1s ${0.9 + i * 0.05}s ease`;
      requestAnimationFrame(() => requestAnimationFrame(() => (q.style.strokeDashoffset = 0)));
    }
  });
  if (!splitOnly) {
    el("circle", { cx: x2 + 8, cy, r: 9, fill: "#fff" }, svg);
    svgText(svg, x2 + 8, cy - 22, "PRISM", { "font-size": fs + 2, fill: "#fff", "font-weight": 700, "text-anchor": "middle" });
    svgText(svg, x2 + 8, cy + 34, "ひとつの確率", { "font-size": fs, "text-anchor": "middle" });
  }
}

// ---------------------------------------------------------------- features
const FG_INFO = {
  "血統": { n: 6, c: "#ff5a5f", d: "父・母父の産駒が 3 着以内に入ったレースの平均距離（スタミナの指標）と、今回の距離との差。父の産駒の重・不良馬場の得意不得意。いずれもそのレースの日より前の成績だけで計算します。" },
  "騎手・調教師": { n: 4, c: "#ff9f1c", d: "騎手 × 競馬場 × 芝ダ、調教師 × 芝ダ × 距離帯 の 3 着内率。少ない件数の偏りは、全体の平均に近づけて抑えます（縮小推定）。" },
  "条件込み総合指数": { n: 5, c: "#ffd23f", d: "同じ芝・ダートでのスピード指数の水準に、距離・馬場・コースの適性を足した「この条件での実力」と、出走メンバーの中での順位・偏差・最上位との差。" },
  "コース適性": { n: 4, c: "#7be495", d: "同じ競馬場・同じ芝ダでのスピード指数の平均と、全体の水準との差（走った回数が少ないほど 0 に近づける）。" },
  "馬場適性": { n: 7, c: "#2ec4b6", d: "良・稍重・重・不良の近さで重み付けした指数と、重・不良での着順と良での着順の差。初めての道悪かどうか。" },
  "スタミナ・距離延長": { n: 7, c: "#3a86ff", d: "今回の距離以上のレースでの指数・着順、これまでの最長距離との差（距離延長）、3 着以内に入った最長距離との差。" },
  "距離適性": { n: 11, c: "#8b5cf6", d: "距離の近い過去走ほど重く見た指数・着順・上がり。単独で外しても予想はほとんど悪くならず、ほかの特徴量（とくに条件込み総合指数）と情報が重なっていることがわかりました。" },
};
function features() {
  const A = DATA.ablation;
  let metric = "d_order";
  const box = $("#feat-groups");
  let sel = A.groups[0].group;
  const render = () => {
    const mx = Math.max(...A.groups.map((g) => g[metric]));
    box.innerHTML = A.groups.map((g) => {
      const f = FG_INFO[g.group] || { n: "", c: "#ffd23f" };
      return `<button type="button" class="fg" style="--fg:${f.c}" aria-pressed="${g.group === sel}" data-g="${esc(g.group)}"><div class="nm">${esc(g.group)}<span class="cnt">${f.n} 個</span></div>
        <div class="bar2"><i data-w="${Math.max(2, (g[metric] / mx) * 100)}"></i></div><div class="val num">外すと +${g[metric].toFixed(4)}</div></button>`;
    }).join("");
    $$(".fg", box).forEach((b) => b.addEventListener("click", () => { sel = b.dataset.g; render(); }));
    requestAnimationFrame(() => $$("i[data-w]", box).forEach((i) => (i.style.width = i.dataset.w + "%")));
    const g = A.groups.find((x) => x.group === sel), f = FG_INFO[sel] || {};
    $("#feat-info").innerHTML = `<span class="tag real">実験の結果</span><h3 style="margin-top:10px">${esc(sel)}</h3><p>${esc(f.d || "")}</p>
      <p class="note">外したときの損失の増加：1〜3 着の並び <b class="num">+${g.d_order.toFixed(5)}</b>／勝ち馬 <b class="num">+${g.d_win.toFixed(5)}</b><br>
      44 個すべてを外すと +${A.all_new.toFixed(4)}（G1・G2 では +${A.g1g2_all_new.toFixed(3)} と、平均の約 5 倍）。新しい特徴量は、モデルの判断の ${(A.gain_share_new * 100).toFixed(0)}% を占めます。<br>${esc(A.setting)}</p>`;
  };
  $$("#feat-metric button").forEach((b) => b.addEventListener("click", () => { metric = b.dataset.m; $$("#feat-metric button").forEach((x) => x.setAttribute("aria-pressed", x === b)); render(); }));
  render();
  const mx = Math.max(...A.top_features.map((x) => x.d));
  $("#perm-bars").innerHTML = A.top_features.map((x) => `<div class="hb"><div><div class="lab">${esc(x.name)}</div><div class="tr"><i data-w="${(x.d / mx) * 100}"></i></div></div><span class="num note">+${x.d.toFixed(4)}</span></div>`).join("");
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { $$("#perm-bars i").forEach((i) => (i.style.width = i.dataset.w + "%")); io.disconnect(); } });
  io.observe($("#perm-bars"));
}
function distDemo() {
  const runs = [[1600, 96], [1800, 101], [2000, 104], [2200, 103], [2400, 98], [3000, 92]];
  const svg = $("#dist-svg"), W = 520, H = 220, L = 46, R = 10, T = 14, B = 34;
  const x = (d) => L + ((d - 1000) / 2600) * (W - L - R), y = (v) => T + (1 - (v - 85) / 25) * (H - T - B);
  const draw = (d0) => {
    svg.innerHTML = "";
    [90, 100, 110].forEach((v) => { el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "grid" }, svg); svgText(svg, L - 8, y(v) + 4, v, { "text-anchor": "end" }); });
    [1200, 1600, 2000, 2400, 2800, 3200].forEach((d) => svgText(svg, x(d), H - 12, d + "m", { "text-anchor": "middle" }));
    el("line", { x1: x(d0), x2: x(d0), y1: T, y2: H - B, stroke: "#ffd23f", "stroke-dasharray": "4 4" }, svg);
    let ws = 0, wv = 0;
    runs.forEach(([d, v]) => {
      const w = Math.exp(-Math.abs(d - d0) / 250);
      ws += w; wv += w * v;
      el("circle", { cx: x(d), cy: y(v), r: 7 + 9 * w, fill: "#ffd23f", opacity: 0.15 + 0.85 * w }, svg);
      svgText(svg, x(d), y(v) - 14 - 9 * w, v, { "text-anchor": "middle", fill: "#f1f3f8" });
    });
    const avg = runs.reduce((a, r) => a + r[1], 0) / runs.length;
    $("#dist-avg").textContent = avg.toFixed(1);
    $("#dist-w").textContent = (wv / ws).toFixed(1);
    $("#dist-val").textContent = d0 + "m";
  };
  $("#dist-range").addEventListener("input", (e) => draw(+e.target.value));
  draw(2000);
}

// ---------------------------------------------------------------- ensemble example (real race)
const LAYERS = [["market", "市場（オッズ）", "#c9ced8"], ["v33", "以前の AI（v33）", "#3a86ff"], ["v52", "v52", "#ff9f1c"], ["prism_ai", "PRISM 能力評価", "#d08cff"], ["prism", "PRISM（AI予想）", "#ffd23f"]];
function ensemble() {
  drawBeams($("#beams-svg"), 900, 300, false);
  $("#beams-legend").innerHTML = MODEL_NAMES.map((n, i) => `<span><i style="background:${COLORS[i]}"></i>${esc(n)}</span>`).join("");
  const ex = DATA.example;
  $("#ex-title").textContent = "実際のレース：" + ex.title;
  const rows = ex.rows.slice(0, 10);
  let layer = "prism";
  const seg = $("#ex-layers");
  seg.innerHTML = LAYERS.map(([k, n]) => `<button type="button" data-k="${k}" aria-pressed="${k === layer}">${esc(n)}</button>`).join("");
  const bars = $("#ex-bars");
  bars.innerHTML = `<div class="rb rb-head"><span>着順</span><span>馬名</span><span class="pct">勝率</span><span class="pct">単勝</span></div>` + rows.map((r) =>
    `<div class="rb"><span class="pos ${r.pos <= 3 ? "p" + r.pos : ""} num">${r.pos ?? "—"}</span><div class="track"><i></i><span>${r.umaban} ${esc(r.horse)}</span></div><span class="pct num"></span><span class="pct num note">${r.odds}倍</span></div>`).join("");
  const upd = () => {
    const col = LAYERS.find((l) => l[0] === layer)[2];
    const mx = Math.max(...rows.map((r) => r[layer]));
    $$(".rb:not(.rb-head)", bars).forEach((b, i) => {
      const v = rows[i][layer];
      $("i", b).style.width = (v / Math.max(mx, 0.3)) * 100 + "%";
      $("i", b).style.background = col;
      $(".pct", b).textContent = pct(v);
    });
    $$("button", seg).forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === layer));
  };
  $$("button", seg).forEach((b) => b.addEventListener("click", () => { layer = b.dataset.k; upd(); }));
  upd();
  $("#ex-tickets").innerHTML = [["以前の AI（v33）", ex.tickets.v33], ["v52", ex.tickets.v52], ["PRISM", ex.tickets.prism]].map(([a, b]) => `<div class="tk"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("");
  $("#ex-note").textContent = ex.note + "　このレースは PRISM がうまくいった例です。うまくいかなかったレースも多くあり、成績は全レースで集計しています（第 7 章）。";
}

// ---------------------------------------------------------------- value demo (simulated)
function valueDemo() {
  const horses = [{ n: "人気の本命", p: 0.4, o: 2.0 }, { n: "中位の実力馬", p: 0.12, o: 6.5 }, { n: "人気薄", p: 0.03, o: 25 }];
  const g = $("#value-grid");
  g.innerHTML = horses.map((h, i) => `<div class="vh"><div class="row3"><b>${h.n}</b><span class="note">勝率 ${Math.round(h.p * 100)}%</span></div>
    <div class="ev num" id="ev-${i}"></div><div class="note">100 円あたりの平均の戻り</div>
    <div class="meter"><i id="mt-${i}"></i><span class="one"></span></div>
    <div class="note">損益の分かれ目：<b class="num">${(1 / h.p).toFixed(1)} 倍</b>（1 ÷ 勝率）</div>
    <label for="od-${i}">オッズ：<b class="num" id="ol-${i}"></b></label><input type="range" id="od-${i}" min="1.1" max="${i === 2 ? 80 : 20}" step="0.1" value="${h.o}"></div>`).join("");
  horses.forEach((h, i) => {
    const upd = () => {
      const o = +$("#od-" + i).value, ev = h.p * o;
      $("#ol-" + i).textContent = o.toFixed(1) + " 倍";
      $("#ev-" + i).textContent = Math.round(ev * 100) + " 円";
      $("#ev-" + i).classList.toggle("plus", ev > 1);
      $("#mt-" + i).style.width = Math.min(ev / 2, 1) * 100 + "%";
      $("#mt-" + i).style.background = ev > 1 ? "var(--good)" : "var(--c6)";
    };
    $("#od-" + i).addEventListener("input", upd); upd();
  });
}

// ---------------------------------------------------------------- accuracy
const STEP_SHORT = [["v33", "（3 モデル）"], ["着順全体を", "学習"], ["＋44 の", "新特徴量"], ["＋区分ごとの", "追加学習・合成"], ["v52", "（完成形）"]];
function accuracySection() {
  const a = DATA.accuracy;
  $("#fav-win").textContent = Math.round(a.prism_test.mkt.top1_win * 100) + "%";
  const d = a.disagree;
  $("#duel-note").textContent = `オッズを使わない AI の 1 位が、以前のモデル（v33）と v52 で違う馬だったレース（2021〜2026年・${d.races.toLocaleString()} レース）で、それぞれの 1 位が勝った割合。`;
  $("#duel").innerHTML = `<div class="side"><div class="note">以前の AI（v33）の 1 位</div><div class="pct num" data-to="${d.v33_pick_win}">0%</div></div>
    <div class="side win"><div class="note">v52 の 1 位</div><div class="pct num" data-to="${d.v52_pick_win}">0%</div></div>`;
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { $$("#duel .pct").forEach(countUp); io.disconnect(); } });
  io.observe($("#duel"));
  let per = "test";
  const drawStep = () => {
    const svg = $("#step-svg"); svg.innerHTML = "";
    const W = 520, H = 240, L = 10, R = 10, T = 24, B = 70;
    const vals = a.steps.map((s) => s[per]);
    const lo = Math.min(...vals) - 0.004, hi = Math.max(...vals) + 0.002;
    const bw = (W - L - R) / vals.length;
    a.steps.forEach((s, i) => {
      const v = s[per], h = ((hi - v) / (hi - lo)) * (H - T - B);
      const r = el("rect", { x: L + i * bw + 8, y: H - B - h, width: bw - 16, height: h, rx: 6, fill: i === a.steps.length - 1 ? "#ffd23f" : "#3a86ff", opacity: i === 0 ? 0.5 : 0.9 }, svg);
      r.innerHTML = `<title>${esc(s.label)}: ${v.toFixed(4)}</title>`;
      svgText(svg, L + i * bw + bw / 2, H - B - h - 8, v.toFixed(4), { "text-anchor": "middle", fill: "#f1f3f8" });
      const words = STEP_SHORT[i] || [s.label];
      words.forEach((w, k) => svgText(svg, L + i * bw + bw / 2, H - B + 18 + k * 14, w, { "text-anchor": "middle" }));
    });
    svgText(svg, L, 14, "高いほど良い（損失が小さい）", { fill: "#6b7385" });
  };
  $$("#step-per button").forEach((b) => b.addEventListener("click", () => { per = b.dataset.p; $$("#step-per button").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawStep(); }));
  drawStep();
  mktChart($("#mkt-svg"), false);
  $("#mkt-note").textContent = `PRISM の 90% 区間：${a.vs_market.prism_ci90[0]} 〜 ${a.vs_market.prism_ci90[1]}（0 をまたがない＝偶然では説明しにくい差）。差は小さく見えますが、市場は非常に強い予想なので、上回ること自体が難しいのです。`;
  // heatmap
  const S = DATA.strategies, X = S.cross;
  const nm = { v33: "v33", v52: "v52", ens: "PRISM" };
  const color = (v) => (v >= 1.2 ? "rgba(123,228,149,.55)" : v >= 1.0 ? "rgba(123,228,149,.28)" : v >= 0.97 ? "rgba(255,178,74,.28)" : "rgba(255,90,95,.3)");
  let h = `<div></div>${["v33", "v52", "ens"].map((c) => `<div class="h" style="justify-content:center">AI だけ：${nm[c]}</div>`).join("")}`;
  ["v33", "v52", "ens"].forEach((r) => {
    h += `<div class="h">市場と合わせた<br>確率：${nm[r]}</div>`;
    ["v33", "v52", "ens"].forEach((c) => {
      const v = X[`${r}|${c}`];
      h += `<div class="c num ${r === "v33" && c === "v33" ? "cur" : ""} ${r === "ens" && c === "ens" ? "pr" : ""}" style="background:${color(v)}">${Math.round(v * 100)}%<small>${r === "v33" && c === "v33" ? "以前" : r === "ens" && c === "ens" ? "PRISM" : ""}</small></div>`;
    });
  });
  $("#heat").innerHTML = h;
  const cc = S.v33_concentration;
  $("#heat-note").innerHTML = `以前の 128% は、利益の <b>${Math.round(cc.share_of_payout * 100)}%</b> が 1 種類の買い目（${esc(cc.desc)}・${cc.tickets.toLocaleString()} 点で的中 ${cc.hits} 回）から生まれていました。v52 の確率ではこの買い目が減り、回収率が下がりました。左上の 148% のような組合せは、選ぶ期間（2016〜20年）では以前の設定より悪く（112%）、選べなかった組合せです。`;
}
function mktChart(box, small) {
  const a = DATA.accuracy.vs_market;
  const svg = box.tagName === "svg" ? box : el("svg", { viewBox: "0 0 520 200", class: "chart" }, box);
  svg.innerHTML = "";
  const rows = [["以前の AI（v33）", a.v33, "#3a86ff"], ["v52", a.v52, "#ff9f1c"], ["PRISM", a.prism, "#ffd23f"]];
  const W = 520, L = 130, R = 60, x0 = W - R, sc = (W - L - R) / 0.005;
  rows.forEach(([n, v, c], i) => {
    const y = 30 + i * 52;
    svgText(svg, L - 10, y + 15, n, { "text-anchor": "end", fill: "#f1f3f8" });
    const w = Math.abs(v) * sc;
    const r = el("rect", { x: x0 - w, y, width: w, height: 22, rx: 5, fill: c }, svg);
    if (!RM) { r.style.transformOrigin = `${x0}px 0`; r.style.transform = "scaleX(0)"; r.style.transition = `transform 1s ${i * 0.15}s cubic-bezier(.2,.7,.1,1)`; requestAnimationFrame(() => requestAnimationFrame(() => (r.style.transform = "scaleX(1)"))); }
    svgText(svg, x0 - w - 8, y + 15, v.toFixed(4), { "text-anchor": "end", fill: "#f1f3f8" });
  });
  el("line", { x1: x0, x2: x0, y1: 16, y2: 180, class: "ref" }, svg);
  svgText(svg, x0 + 6, 190, "市場だけ", { fill: "#9aa3b4" });
  if (small) svgText(svg, 8, 196, "2021〜2026年・勝ち馬の対数損失の差", { fill: "#6b7385" });
}
function countUp(n) {
  const to = +n.dataset.to, t0 = performance.now(), D = RM ? 1 : 1200;
  const step = (now) => { const k = Math.min((now - t0) / D, 1); n.textContent = (to * 100 * (1 - Math.pow(1 - k, 3))).toFixed(1) + "%"; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------- ROI
const STRAT = [["ai", "AI推奨"], ["stable", "安定型"], ["balance", "バランス型"], ["high", "高配当型"]];
function roiSection() {
  const S = DATA.strategies;
  $("#roi-lead").innerHTML = `選択期間 2016〜2020年／検証期間 2021〜2026年（10月18日まで）。各年は、その年より前のデータだけで学習・較正したモデルで計算しています。<b>新馬戦は表示する成績から除いています</b>（過去の成績が無い馬だけのレースのため。予想と買い方は表示します）。1 点 100 円、実際の払戻金で精算。`;
  let cur = "ai";
  const k = $("#kpis");
  k.innerHTML = STRAT.map(([key, n]) => { const p = S.prism[key]; return `<button type="button" class="kpi" data-k="${key}" aria-pressed="${key === cur}"><div class="nm">${n}</div><div class="v num ${p.test_roi >= 1 ? "up" : ""}">${(p.test_roi * 100).toFixed(1)}%</div><div class="s">2021〜26年の回収率</div></button>`; }).join("");
  $$(".kpi", k).forEach((b) => b.addEventListener("click", () => { cur = b.dataset.k; $$(".kpi", k).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
  const draw = () => {
    const p = S.prism[cur], o = S.v33[cur];
    const name = STRAT.find((s) => s[0] === cur)[1];
    $("#yr-title").textContent = `年ごとの回収率：${name}`;
    const years = Object.keys(p.by_year).sort();
    const svg = $("#yr-svg"); svg.innerHTML = "";
    const W = 900, H = 300, L = 44, R = 10, T = 16, B = 34;
    const vals = years.flatMap((y) => [p.by_year[y], o.by_year[y]]).filter((v) => v != null);
    const hi = Math.max(1.4, ...vals) * 1.05;
    const y = (v) => T + (1 - v / hi) * (H - T - B);
    [0, 0.5, 1, 1.5, 2].filter((v) => v <= hi).forEach((v) => { el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 1 ? "ref" : "grid" }, svg); svgText(svg, L - 6, y(v) + 4, Math.round(v * 100) + "%", { "text-anchor": "end" }); });
    const bw = (W - L - R) / years.length;
    years.forEach((yr, i) => {
      const x = L + i * bw;
      if (+yr === 2021) { el("rect", { x, y: T, width: (W - R) - x, height: H - T - B, fill: "rgba(255,210,63,.04)" }, svg); svgText(svg, x + 6, T + 12, "検証期間 →", { fill: "#ffd23f" }); }
      [[o.by_year[yr], "#58607a", 0], [p.by_year[yr], "#ffd23f", 1]].forEach(([v, c, j]) => {
        if (v == null) return;
        const r = el("rect", { x: x + 8 + j * (bw - 16) / 2, y: y(v), width: (bw - 20) / 2, height: H - B - y(v), rx: 3, fill: c }, svg);
        r.innerHTML = `<title>${yr}年 ${j ? "PRISM" : "v33"}: ${(v * 100).toFixed(1)}%</title>`;
      });
      svgText(svg, x + bw / 2, H - 12, yr, { "text-anchor": "middle" });
    });
    const ci = p.ci90;
    $("#yr-note").innerHTML = `${esc(name)}（PRISM）：選択期間 2016〜20年 <b class="num">${(p.dev_roi * 100).toFixed(1)}%</b>／検証期間 2021〜26年 <b class="num">${(p.test_roi * 100).toFixed(1)}%</b>（90% 区間 ${(ci[0] * 100).toFixed(0)}〜${(ci[1] * 100).toFixed(0)}%・購入 ${p.test_races.toLocaleString()} レース・的中率 ${(p.hit_rate * 100).toFixed(1)}%）。
      以前のモデル（v33）：検証期間 ${(o.test_roi * 100).toFixed(1)}%。v52 単独：${(S.v52_test[cur] * 100).toFixed(1)}%（新馬戦を含む）。90% 区間が 100% をまたぐ場合、利益が出ると言い切れる証拠ではありません。`;
  };
  draw();
  catBars($("#cls-svg"), S.ai_by_class, ["新馬", "未勝利", "1勝", "2・3勝", "OP・L・G3", "G1・G2"]);
  catBars($("#dst-svg"), S.ai_by_dist, ["芝短", "芝中", "芝長", "ダ短", "ダ中長"]);
}
function catBars(svg, obj, order) {
  const W = 440, H = 240, L = 80, R = 60, T = 8;
  const keys = order.filter((k) => obj[k]);
  const bh = (H - T - 10) / keys.length;
  const mx = Math.max(1.5, ...keys.map((k) => obj[k][0]));
  const x = (v) => L + (v / mx) * (W - L - R);
  keys.forEach((k, i) => {
    const [v, n] = obj[k], yy = T + i * bh;
    svgText(svg, L - 8, yy + bh / 2 + 4, k, { "text-anchor": "end", fill: "#f1f3f8" });
    el("rect", { x: L, y: yy + 6, width: x(v) - L, height: bh - 12, rx: 4, fill: v >= 1 ? "#7be495" : "#58607a" }, svg);
    svgText(svg, x(v) + 6, yy + bh / 2 + 4, `${Math.round(v * 100)}%（${n}R）`, {});
  });
  el("line", { x1: x(1), x2: x(1), y1: T, y2: H - 4, class: "ref" }, svg);
}

// ---------------------------------------------------------------- G1/G2
function g1Section() {
  const G = DATA.g1g2;
  const t = G.ens_test, d = G.ens_dev;
  $("#g1-lead").innerHTML = `検証期間（2021〜26年）の AI推奨は G1 ${pct(t.G1.roi, 0)}（${t.G1.races} レース）・G2 ${pct(t.G2.roi, 0)}（${t.G2.races} レース）。ところが選択期間（2016〜20年）では、同じ PRISM が <b>G1・G2 で ${pct(d["G1+G2"].roi, 0)}</b> でした。期間によって向きが逆になるのは、少ないレース数による偶然の特徴です。なお以前のモデル（v33）の AI推奨は、G1・G2 で ${pct(G.v33_test_roi, 0)}（的中なし）でした。`;
  $("#g1-facts").innerHTML = [["G1・G2 の AI推奨（検証）", pct(t["G1+G2"].roi, 0)], ["同じ（選択期間）", pct(d["G1+G2"].roi, 0)], ["偶然で 69% 以下", pct(G.chance.share_le, 0)]].map(([a, b]) => `<div class="fact"><b class="num">${b}</b><span>${a}</span></div>`).join("");
  $("#hist-note").textContent = `G1・G2 以外のレースから、同じ ${G.chance.k} レースを無作為に選ぶことを 20,000 回くり返したときの回収率の分布。全体の回収率は ${pct(G.chance.other_roi, 0)} でも、${G.chance.k} レースだけでは ${pct(G.chance.p5_p50_p95[0], 0)}〜${pct(G.chance.p5_p50_p95[2], 0)} まで揺れます（90% の範囲）。`;
  const svg = $("#hist-svg"), W = 520, H = 240, L = 10, R = 10, T = 14, B = 34;
  const hist = G.hist;
  if (!hist) { svgText(svg, 20, 120, "（分布のデータを準備中）"); return; }
  const mx = Math.max(...hist.counts);
  const bw = (W - L - R) / hist.counts.length;
  hist.counts.forEach((c, i) => {
    const lo = hist.edges[i];
    const h = (c / mx) * (H - T - B);
    el("rect", { x: L + i * bw + 1, y: H - B - h, width: bw - 2, height: h, rx: 2, fill: lo < 0.69 ? "#ff5a5f" : "#3a86ff", opacity: 0.85 }, svg);
  });
  const xv = (v) => L + (v / 3) * (W - L - R);
  el("line", { x1: xv(0.69), x2: xv(0.69), y1: T, y2: H - B, stroke: "#ffd23f", "stroke-width": 2 }, svg);
  svgText(svg, xv(0.69) + 6, T + 10, "G1・G2 の 69%", { fill: "#ffd23f" });
  el("line", { x1: xv(1), x2: xv(1), y1: T, y2: H - B, class: "ref" }, svg);
  [0, 0.5, 1, 1.5, 2, 2.5].forEach((v) => svgText(svg, xv(v), H - 12, Math.round(v * 100) + "%", { "text-anchor": "middle" }));
  svgText(svg, xv(3) - 4, H - 12, "300%〜", { "text-anchor": "end" });
}

// ---------------------------------------------------------------- honesty
function honesty() {
  const items = [
    ["⚖", "利益は約束しません", "どの買い方も、90% 区間の下限は 100% 前後かそれ以下です。過去の検証で 100% を超えていても、将来も超えるとは限りません。"],
    ["🎯", "大きな配当の影響", "回収率は少数の大きな配当で大きく動きます。払戻の大きい上位のレースを除くと、どの買い方も 100% を下回ります。"],
    ["⏱", "オッズは確定値で計算", "検証は確定オッズで計算しています。発走前に実際に見られるオッズとは少し異なります。"],
    ["🔍", "検証期間は何度も見た", "2021〜26 年の結果は研究の途中で何度も確認しました。合成の方法は、v52 単独がうまくいかなかったのを見た後に決めています。買い方のルールは一切調整していません。"],
    ["🐣", "新馬戦の扱い", "新馬戦は、成績の表示から外しています（過去の成績が無い馬だけのため）。外すと検証期間の AI推奨は上がりますが、選択期間では逆に少し下がります。予想と買い方は新馬戦でも表示します。"],
    ["🔒", "公開した予想は変えない", "発走後に公開した予想・買い目は凍結し、後から書き換えられない仕組みにしています（内容のハッシュで照合）。"],
  ];
  $("#caveats").innerHTML = items.map(([i, h, p]) => `<div class="cv reveal"><div class="ic" aria-hidden="true">${i}</div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("");
  const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: 0.1 });
  $$("#caveats .reveal").forEach((x) => rv.observe(x));
}

// ---------------------------------------------------------------- boot
let DATA = null;
opening();
scrollUI();
timeline();
pipeline();
heroBeams();
valueDemo();
distDemo();
fetch("data/prism.json", { cache: "no-cache" }).then((r) => r.json()).then((d) => {
  DATA = d;
  features(); ensemble(); accuracySection(); roiSection(); g1Section(); honesty();
  $("#gen").textContent = "データ更新：" + String(d.generated).slice(0, 10);
}).catch(() => { $("#main").insertAdjacentHTML("afterbegin", '<p class="wrap note">データを読み込めませんでした。ページを再読み込みしてください。</p>'); });
