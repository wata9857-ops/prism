// PRISM — chapters and scenes. 数値はすべて data/prism.json（検証済みの集計値）か、出典を明記した過去の報告の値。
// 「例」と書いたものだけが、説明のための架空の値。
import { prismIntro, beams, COLORS } from "./fx.js";

const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const yen = (x) => Math.round(x).toLocaleString() + "円";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const q = (el, s) => el.querySelector(s);
const qa = (el, s) => [...el.querySelectorAll(s)];
const SITE = "https://wata9857-ops.github.io/jra-ai-analytics-web/";
const HORSE = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 8c-3 0-5 2-6 4l-9 3c-6 2-11 7-13 13l-3 10c-1 3 0 5 2 6l2 1-3 9h5l3-8 4 1v7h4v-7c5 0 9-2 12-5l2 12h5l-2-15c2-3 3-7 3-11V23l4-2c2-1 2-3 1-5l-3-4c-2-3-5-4-8-4zm1 7a2 2 0 110 4 2 2 0 010-4z"/></svg>';

// ======================================================================== 00 opening
const OPEN = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<img class="op-mark hide" src="assets/mark.svg" alt="" width="140" height="140">
      <h1 class="hide" id="op-logo" style="margin:0"><img class="op-logo" src="assets/wordmark.svg" alt="PRISM" width="520" height="135"></h1>
      <p class="op-tag hide" id="op-tag">ONE RACE. MULTIPLE PERSPECTIVES.</p>
      <p class="t-m hide" id="op-line"></p>
      <div class="row hide" id="op-btns">
        <button class="btn primary glow" type="button" id="op-start">はじめる <span aria-hidden="true">▶</span></button>
        ${api.saved() > 2 ? '<button class="btn" type="button" id="op-resume">続きから</button>' : ""}
        <button class="btn" type="button" id="op-menu">目次</button>
      </div>
      <p class="t-src hide" id="op-time">約 8 分 ・ タップ / スワイプで進む</p>
      <canvas id="op-canvas" aria-hidden="true"></canvas>`;
    const stop = prismIntro(q(el, "#op-canvas"), api);
    api.onLeave(stop);
    q(el, "#op-start").addEventListener("click", () => api.next());
    q(el, "#op-menu").addEventListener("click", () => api.menu());
    const r = q(el, "#op-resume");
    if (r) r.addEventListener("click", () => api.go(api.saved()));
    api.run(async () => {
      await api.wait(2600);
      q(el, "#op-canvas").style.opacity = ".12";   // 光の演出を背景に下げ、ロゴと重ならないようにする
      api.show(q(el, ".op-mark"), q(el, "#op-logo"));
      await api.wait(600);
      api.show(q(el, "#op-tag"));
      await api.wait(500);
      await api.type(q(el, "#op-line"), "競馬AIは、ここまで進化した。", 16);
      api.show(q(el, "#op-btns"), q(el, "#op-time"));
      api.done();
    });
  },
};

// ======================================================================== 01 question
const Q1 = {
  render(el, api) {
    el.innerHTML = `<p class="t-xl" id="a"></p><p class="t-xl" id="b"></p>`;
    api.run(async () => {
      await api.wait(400);
      await api.type(q(el, "#a"), "1番人気は、");
      await api.type(q(el, "#b"), "どれくらい勝つのか。");
      api.done();
    });
  },
};
const Q2 = {
  render(el, api) {
    const w = Math.round(api.data.accuracy.prism_test.mkt.top1_win * 100);
    el.innerHTML = `<p class="t-m" id="a"></p><div class="dots100" aria-hidden="true">${"<i></i>".repeat(100)}</div>
      <p class="big num hide" id="n"><span id="c">0</span><small>回</small></p>
      <p class="t-src hide" id="src">1番人気が勝った回数（2021〜26年・新馬戦を除く全平地レース）</p>
      <p class="t-l hide" id="b"></p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "100レースあったら、");
      api.show(q(el, "#n"));
      const dots = qa(el, ".dots100 i");
      const pick = [...dots.keys()].sort(() => Math.random() - .5).slice(0, w);
      const p = api.count(q(el, "#c"), w, { dur: 1600 });
      for (let i = 0; i < w; i++) { dots[pick[i]].classList.add("on"); if (!api.ff) await api.wait(40); }
      pick.forEach((k) => dots[k].classList.add("on"));
      await p;
      api.show(q(el, "#src"));
      await api.wait(900);
      await api.type(q(el, "#b"), `残りの${100 - w}回を、どう読むか。`);
      api.done();
    });
  },
};

// ======================================================================== 02 history (discover the problems)
const H1 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="k">最初のAI（v2・v3）</p>
      <p class="t-l">AIが「お得」と判断した<br>ワイドの馬券。</p>
      <p class="t-m">当たる確率は <b class="warm">1.84%</b> と予測。</p>
      <p class="t-s">実際は、予測どおり当たった？</p>
      <div class="row" id="ch"><button class="choice" type="button" data-a="1">当たった</button><button class="choice" type="button" data-a="0">当たらなかった</button></div>
      <div class="hide" id="res"><p class="t-src">実際の的中率</p><p class="big num"><span id="c">1.84</span><small>%</small></p>
      <p class="t-m">市場と大きく食い違うほど、<br>AIのほうが間違っていた。</p><p><span class="tag">勝者の呪い</span></p>
      <button class="more" type="button" id="m">データを見る</button></div>`;
    qa(el, "#ch .choice").forEach((b) => b.addEventListener("click", () => {
      qa(el, "#ch .choice").forEach((x) => { x.setAttribute("aria-pressed", x === b); x.disabled = true; });
      api.show(q(el, "#res"));
      api.run(async () => {
        await api.count(q(el, "#c"), 1.41, { from: 1.84, dur: 1500, fmt: (v) => v.toFixed(2) });
        api.hint(b.dataset.a === "0" ? "正解。予測より少なかった。" : "実は、予測より少なかった。");
        api.done();
      });
    }));
    q(el, "#m").addEventListener("click", () => api.sheet("最初のAIの検証", `<p>期待値が 1 を超えると判断したワイドは、2025〜26年の G1・G2 で 2,918 組。予測した的中率 1.84% に対し、実際は 1.41% でした。</p>
      <p>期待値 1.3〜1.6 の帯では 1.44% → 0.76%、1.6 超では 0.97% → 0.14%。AI と市場の意見が大きく分かれる組み合わせほど、AI の誤りでした。</p><p class="t-src">出典：v23 報告（2026年10月）</p>`));
  },
};
const H2 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="k">回収率への挑戦（v30・v31）</p>
      <p class="t-l">回収率 305% の<br>買い方を見つけた。</p>
      <p class="big num"><span id="c">305</span><small>%</small></p>
      <div class="meter"><div class="track"><i id="bar" style="width:95%"></i><span class="line100" style="left:31.25%"><b>100%</b></span></div></div>
      <button class="btn glow" type="button" id="rm">いちばん大きな配当の<br>1レースを抜く</button>
      <p class="t-m hide" id="t"></p>
      <p class="t-src">高配当ハンター（2025〜26年・58レース・的中 5 レース）</p>`;
    q(el, "#rm").addEventListener("click", (e) => {
      e.currentTarget.disabled = true; e.currentTarget.classList.remove("glow");
      api.run(async () => {
        q(el, "#bar").style.width = (99 / 320 * 100) + "%";
        await api.count(q(el, "#c"), 99, { from: 305, dur: 1600 });
        await api.type(q(el, "#t"), "大当たり1回で、勝ったように見えていただけ。");
        api.done();
      });
    });
  },
};
const H3 = {
  render(el, api) {
    el.innerHTML = `<p class="k">土台を作り直す（v32）</p><p class="t-l" id="a"></p>
      <p class="big num hide" id="n"><span id="c">0</span></p><p class="t-m hide" id="u">レース</p>
      <p class="t-s hide" id="b">1986〜2026年の全レースを、公式データで照合。</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "30年分のデータを、ひとつずつ。");
      api.show(q(el, "#n"), q(el, "#u"));
      await api.count(q(el, "#c"), 139977, { dur: 1800 });
      api.show(q(el, "#b"));
      api.done();
    });
  },
};
const H4 = {
  render(el, api) {
    el.innerHTML = `<p class="k">能力評価の強化（v33）</p><p class="t-l" id="a"></p>
      <div class="versus hide" id="v"><div class="vs-side"><p class="lab">以前</p><p class="val num">27.7%</p></div><div class="vs-side win"><p class="lab">スピード指数を追加</p><p class="val num" id="c">27.7%</p></div></div>
      <p class="t-s hide" id="b">オッズを使わないAIの、1位の勝率。</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "タイムを、馬場と距離で補正した。");
      api.show(q(el, "#v"));
      await api.wait(700);
      await api.count(q(el, "#c"), 29.6, { from: 27.7, dur: 1400, fmt: (v) => v.toFixed(1) + "%" });
      api.show(q(el, "#b"));
      api.done();
    });
  },
};
const H5 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="k">35のアイデア（v44〜v51）</p><p class="t-l">BOX、軸流し、クラス別のAI……<br>全部、試した。</p>
      <div class="tiles" aria-hidden="true">${"<i><span>✕</span></i>".repeat(35)}</div>
      <button class="btn glow" type="button" id="go">検証する</button>
      <p class="t-m hide" id="r">合格 <b class="num" id="c">0</b> / 35</p>
      <p class="t-s hide" id="t">うまくいかなかった記録も、すべて残した。</p>
      <button class="more hide" type="button" id="m">試したことの一覧</button>`;
    q(el, "#go").addEventListener("click", (e) => {
      e.currentTarget.classList.add("gone");
      api.show(q(el, "#r"));
      api.run(async () => {
        for (const t of qa(el, ".tiles i")) { t.classList.add("x"); await api.wait(55); }
        qa(el, ".tiles i").forEach((t) => t.classList.add("x"));
        api.show(q(el, "#t"), q(el, "#m"));
        api.done();
      });
    });
    q(el, "#m").addEventListener("click", () => api.sheet("試して、採用しなかったこと", `<ul>
      <li>BOX・1〜2頭軸流し・フォーメーション（AI順位・人気順の両方で）</li><li>期待値の高い三連複の組み合わせ（選んだ期間では良く、確かめる期間で崩れた）</li>
      <li>クラス・距離・芝ダ別の専用モデル</li><li>予算の分け方・期待値に応じた金額の調整</li><li>G3・L・OP・2勝・1勝 クラス別の予想と買い方</li></ul>
      <p>どれも「選ぶ期間」と「確かめる期間」を分けて検証し、確かめる期間で基準に届きませんでした。</p>`));
  },
};
const H6 = {
  render(el, api) {
    el.innerHTML = `<p class="t-l" id="a"></p><p class="t-m hide" id="b">オッズだけの予想のほうが、<br>勝ち馬をよく当てていた。</p><p class="t-xl warm hide" id="c"></p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "それでもAIは、市場に届かなかった。");
      api.show(q(el, "#b"));
      await api.wait(1500);
      await api.type(q(el, "#c"), "だから、AIの「目」を作り直した。");
      api.done();
    });
  },
};

// ======================================================================== 03 the documentary: did the AI really evolve?
const A1 = {
  render(el, api) {
    el.innerHTML = `<p class="t-xl" id="a"></p><p class="t-xl" id="b"></p>`;
    api.run(async () => {
      await api.wait(300);
      await api.type(q(el, "#a"), "AIの予想は、");
      await api.type(q(el, "#b"), "本当に進化したのか。");
      api.done();
    });
  },
};
const A2 = {
  render(el, api) {
    const d = api.data.accuracy.disagree;
    el.innerHTML = `<p class="t-m">2つのAIの「1位」が、<br>別の馬だったレースで。</p>
      <div class="versus"><div class="vs-side"><p class="lab">以前のAI（v33）</p><p class="val num" id="o">—</p></div>
        <div class="vs-side hide" id="nw"><p class="lab">新しい目（v52）</p><p class="val num" id="n">0.0%</p></div></div>
      <p class="t-s hide" id="s">それぞれの1位が、実際に勝った割合</p>
      <p class="t-src hide" id="src">2021〜26年・${d.races.toLocaleString()}レース・どちらも学習に使っていない年 ／ v52 は PRISM の中心になったAI</p>`;
    api.run(async () => {
      await api.wait(900);
      await api.count(q(el, "#o"), d.v33_pick_win * 100, { dur: 1300, fmt: (v) => v.toFixed(1) + "%" });
      api.show(q(el, "#s"));
      await api.wait(1700);
      const n = q(el, "#nw"); n.classList.remove("hide"); n.classList.add("pop", "win");
      await api.count(q(el, "#n"), d.v52_pick_win * 100, { dur: 1500, fmt: (v) => v.toFixed(1) + "%" });
      api.show(q(el, "#src"));
      api.done();
    });
  },
};
const A3 = {
  kind: "inter",
  render(el, api) {
    const d = api.data.accuracy.disagree;
    const o = Math.round(d.v33_pick_win * 100), n = Math.round(d.v52_pick_win * 100);
    el.innerHTML = `<p class="t-l">100回、意見が割れたら？</p>
      <div class="row" role="group" aria-label="比べるAI"><button class="choice" type="button" data-m="o" aria-pressed="true">以前のAI<small>v33</small></button><button class="choice" type="button" data-m="n" aria-pressed="false">新しい目<small>v52</small></button></div>
      <div class="dots100" id="g" aria-hidden="true">${"<i></i>".repeat(100)}</div>
      <p class="t-xl"><span class="num" id="c">${o}</span>回 当たる</p>
      <p class="t-s" id="t">押して切り替える</p>`;
    const dots = qa(el, "#g i");
    let seen = false;
    const set = (k) => {
      const v = k === "o" ? o : n;
      dots.forEach((x, i) => x.classList.toggle("on", i < v));
      q(el, "#c").textContent = v;
      qa(el, ".choice").forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === k));
      if (k === "n" && !seen) { seen = true; q(el, "#t").innerHTML = `<b style="color:#fff">${n - o}回の差。</b>同じレースでも、選ぶ馬が変わった。`; api.done(); }
    };
    qa(el, ".choice").forEach((b) => b.addEventListener("click", () => set(b.dataset.m)));
    set("o");
  },
};
const A4 = {
  render(el, api) {
    const s = api.data.accuracy.steps;
    el.innerHTML = `<p class="t-xl" id="a"></p><p class="t-xl grad" id="b"></p><button class="more hide" type="button" id="m">何が効いたのか（内訳）</button>`;
    q(el, "#m").addEventListener("click", () => {
      const rows = s.map((x, i) => `<tr><td>${esc(x.label)}</td><td class="r num">${x.dev.toFixed(4)}</td><td class="r num">${x.test.toFixed(4)}</td></tr>`).join("");
      api.sheet("精度の改善の内訳", `<p>勝ち馬を当てる力を「対数損失」（小さいほど良い）で測りました。オッズを使わないAIの値です。</p>
        <table><tr><th>工程</th><th class="r">2016〜20</th><th class="r">2021〜26</th></tr>${rows}</table>
        <p>改善の幅は、選んだ期間（2016〜20）と確かめた期間（2021〜26）でほぼ同じ（どちらも −0.027）。偶然ではないことを示しています。</p>
        <p class="t-src">各年は、その年より前のデータだけで学習したモデルで計算。</p>`);
    });
    api.run(async () => {
      await api.type(q(el, "#a"), "同じレースでも、");
      await api.type(q(el, "#b"), "見えている未来が違う。");
      api.show(q(el, "#m"));
      api.done();
    });
  },
};

// ======================================================================== 04 build a prediction: 8 perspectives
const PERSP = [
  { k: "スピード", c: COLORS[0], g: null, d: "走破タイムを、コース・距離・その日の馬場で補正した「スピード指数」。v33 から続く、能力の土台です。", imp: "以前から使っている中心の情報" },
  { k: "距離", c: COLORS[1], g: ["距離適性", "スタミナ・距離延長"], d: "今回の距離に近いレースほど重く見る。初めての距離延長への強さも。" },
  { k: "血統", c: COLORS[2], g: ["血統"], d: "父・母父の子どもたちが得意な距離（スタミナ）と、雨の馬場の得意不得意。" },
  { k: "コース", c: COLORS[3], g: ["コース適性"], d: "同じ競馬場・同じ芝かダートでの、この馬の走り。" },
  { k: "馬場", c: COLORS[4], g: ["馬場適性"], d: "良・稍重・重・不良。今日に近い馬場のレースほど重く見る。" },
  { k: "騎手・調教師", c: COLORS[5], g: ["騎手・調教師"], d: "この競馬場でのこの騎手、この距離でのこの厩舎の好走率。" },
  { k: "この条件", c: COLORS[6], g: ["条件込み総合指数"], d: "距離・馬場・コースを全部合わせた「この条件での実力」を、出走メンバーの中で比べる。" },
  { k: "オッズ", c: COLORS[7], g: null, d: "能力の評価には一切使わない。最後に、市場の見方と合わせるときだけ使う。", imp: "8つの能力モデルには入れていない" },
];
const F1 = {
  kind: "inter",
  render(el, api) {
    const A = api.data.ablation.groups;
    const max = Math.max(...A.map((g) => g.d_order));
    const rankOf = (name) => [...A].sort((a, b) => b.d_order - a.d_order).findIndex((g) => g.group === name) + 1;
    el.innerHTML = `<p class="t-l">1頭の馬を、<br>8つの角度から見る。</p>
      <div class="persp"><svg class="rays" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
        <div class="core">${HORSE}</div>
        ${PERSP.map((p, i) => { const a = -Math.PI / 2 + i * Math.PI / 4; return `<button class="pchip" type="button" data-i="${i}" style="--pc:${p.c};left:${50 + Math.cos(a) * 41}%;top:${50 + Math.sin(a) * 41}%">${p.k}</button>`; }).join("")}
      </div>
      <div class="pcard" aria-live="polite"><h4>どれかを押してみよう</h4><p>PRISM が見ている情報が分かります。</p></div>
      <p class="t-src"><span class="num" id="cnt">0</span> / 8 ・ 考え方を示す図です（この馬の実際の計算ではありません）</p>`;
    const seen = new Set();
    const rays = q(el, ".rays");
    qa(el, ".pchip").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i, p = PERSP[i];
      qa(el, ".pchip").forEach((x) => x.classList.remove("cur"));
      b.classList.add("seen", "cur");
      if (!seen.has(i)) {
        seen.add(i);
        const a = -Math.PI / 2 + i * Math.PI / 4;
        const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
        Object.entries({ x1: 50 + Math.cos(a) * 36, y1: 50 + Math.sin(a) * 36, x2: 50, y2: 50, stroke: p.c, "stroke-width": .8, opacity: .8 }).forEach(([k, v]) => ln.setAttribute(k, v));
        rays.appendChild(ln);
      }
      let imp = p.imp || "";
      if (p.g) {
        const gs = p.g.map((n) => A.find((x) => x.group === n)).filter(Boolean);
        const best = gs.sort((x, y) => y.d_order - x.d_order)[0];
        const r = rankOf(best.group);
        imp = r === 1 ? "外したときに予想が最も悪くなった（7グループ中 1位）" : best.d_order / max < 0.05
          ? "単独で外しても予想はほぼ変わらない（ほかの情報と重なっている）" : `外したときの悪くなり方：7グループ中 ${r}位`;
      }
      q(el, ".pcard").innerHTML = `<h4 style="color:${p.c}">${p.k}</h4><p>${p.d}</p><p class="imp">${imp}</p>`;
      q(el, "#cnt").textContent = seen.size;
      q(el, ".core").style.boxShadow = `0 0 ${10 + seen.size * 5}px ${seen.size}px rgba(255,255,255,.12)`;
      if (seen.size === 8) api.done();
    }));
  },
};
const F2 = {
  kind: "inter",
  render(el, api) {
    const A = [...api.data.ablation.groups].sort((a, b) => b.d_order - a.d_order);
    const max = A[0].d_order;
    const opts = ["血統", "距離適性", "騎手・調教師", "馬場適性"];
    el.innerHTML = `<p class="k">クイズ</p><p class="t-l">どの情報を外すと、<br>予想がいちばん悪くなる？</p>
      <div class="row" id="ch">${opts.map((o) => `<button class="choice" type="button" data-o="${o}">${o}</button>`).join("")}</div>
      <div class="hide" id="res" style="display:flex;flex-direction:column;gap:14px;align-items:center">
        <p class="t-m" id="ans"></p>
        <div class="hbars">${A.map((g, i) => `<div class="hbar"><span class="nm">${g.group}</span><span class="tr"><i style="background:${COLORS[i]}" data-w="${Math.max(1.5, g.d_order / max * 100)}"></i><span>${Math.round(g.d_order / max * 100)}</span></span></div>`).join("")}</div>
        <p class="t-src">外したときの悪くなり方（血統 = 100 とした大きさ）</p>
        <p class="t-s">「距離」は、ほかの情報と重なっていた。</p>
        <button class="more" type="button" id="m">実験の方法と数字</button></div>`;
    qa(el, "#ch .choice").forEach((b) => b.addEventListener("click", () => {
      qa(el, "#ch .choice").forEach((x) => { x.setAttribute("aria-pressed", x === b); x.disabled = true; });
      q(el, "#ans").textContent = b.dataset.o === "血統" ? "正解。答えは、血統。" : "答えは、血統。";
      const r = q(el, "#res"); r.classList.remove("hide"); r.classList.add("fadein");
      requestAnimationFrame(() => qa(el, ".hbar i").forEach((i) => (i.style.width = i.dataset.w + "%")));
      api.done();
    }));
    q(el, "#m").addEventListener("click", () => {
      const ab = api.data.ablation;
      api.sheet("アブレーション（外して学習し直す実験）", `<p>44個の新しい特徴量を 7 つのグループに分け、1 グループずつ外して学習し直しました。外したときに予想がどれだけ悪くなったか（1〜3着の並びの対数損失の増加）を比べています。</p>
        <table><tr><th>外したグループ</th><th class="r">増加</th></tr>${A.map((g) => `<tr><td>${g.group}</td><td class="r num">+${g.d_order.toFixed(5)}</td></tr>`).join("")}
        <tr><td><b>44個すべて</b></td><td class="r num"><b>+${ab.all_new.toFixed(5)}</b></td></tr></table>
        <p class="t-src">${esc(ab.setting)}</p>`);
    });
  },
};
const F3 = {
  kind: "inter",
  render(el, api) {
    const runs = [[1600, 96], [1800, 101], [2000, 104], [2200, 103], [2400, 98], [3000, 92]];
    el.innerHTML = `<p class="k">体験</p><p class="t-l">距離が近いレースほど、<br>重く見る。</p>
      <div id="viz" data-noswipe style="width:min(520px,92vw);margin:0 auto"></div>
      <label class="t-m" for="r">今日の距離 <b class="num" id="d">2000m</b></label>
      <input data-noswipe type="range" id="r" min="1200" max="3200" step="100" value="2000" style="width:min(520px,90vw);height:44px;accent-color:var(--accent)">
      <div class="versus"><div class="vs-side"><p class="lab">ただの平均</p><p class="val num" id="avg"></p></div><div class="vs-side win"><p class="lab">この距離での実力</p><p class="val num" id="w"></p></div></div>
      <p><span class="tag ex">例（架空の馬）</span></p>`;
    const avg = runs.reduce((a, r) => a + r[1], 0) / runs.length;
    q(el, "#avg").textContent = avg.toFixed(1);
    const draw = (d0) => {
      let ws = 0, wv = 0;
      const items = runs.map(([d, v]) => { const w = Math.exp(-Math.abs(d - d0) / 250); ws += w; wv += w * v; return { d, v, w }; });
      q(el, "#viz").innerHTML = `<svg viewBox="0 0 520 170" aria-hidden="true">${items.map(({ d, v, w }) => {
        const x = 30 + (d - 1200) / 2000 * 460, y = 140 - (v - 88) * 6;
        return `<circle cx="${x}" cy="${y}" r="${8 + 14 * w}" fill="#ffd23f" opacity="${.15 + .85 * w}"/><text x="${x}" y="${y - 16 - 14 * w}" fill="#fff" font-size="14" text-anchor="middle">${v}</text><text x="${x}" y="166" fill="#c3c9d6" font-size="12" text-anchor="middle">${d}m</text>`;
      }).join("")}<line x1="${30 + (d0 - 1200) / 2000 * 460}" x2="${30 + (d0 - 1200) / 2000 * 460}" y1="10" y2="150" stroke="#fff" stroke-dasharray="4 4"/></svg>`;
      q(el, "#w").textContent = (wv / ws).toFixed(1);
      q(el, "#d").textContent = d0 + "m";
    };
    q(el, "#r").addEventListener("input", (e) => { draw(+e.target.value); api.done(); });
    draw(2000);
  },
};
const F4 = {
  render(el, api) {
    const ab = api.data.ablation;
    const x = ab.g1g2_all_new / ab.all_new;
    el.innerHTML = `<p class="t-m" id="a"></p><p class="big num hide" id="n">×<span id="c">1.0</span></p><p class="t-l hide" id="b">大きなレースほど、<br>条件の違いが効いてくる。</p>
      <p class="t-src hide" id="s">44個の新しい特徴量を外したときの悪くなり方（G1・G2 と全レース平均の比）</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "G1・G2では、新しい目の効果が");
      api.show(q(el, "#n"));
      await api.count(q(el, "#c"), x, { from: 1, dur: 1500, fmt: (v) => v.toFixed(1) });
      api.show(q(el, "#b"), q(el, "#s"));
      api.done();
    });
  },
};

// ======================================================================== 05 eight perspectives into one
const E1 = {
  render(el, api) {
    el.innerHTML = `<p class="t-l" id="a"></p><svg id="bm" style="width:min(380px,90vw);height:auto" role="img" aria-label="8つのAIの予想が1つの確率にまとまる図"></svg><p class="t-l grad" id="b"></p>
      <button class="more hide" type="button" id="m">仕組みを詳しく</button>`;
    q(el, "#m").addEventListener("click", () => api.sheet("合成のしくみ", `<p>8つのAIは、それぞれ違う目標で学習しています（着順全体・3着以内・1着・クラス別・距離別・順位）。</p>
      <p>それぞれの評価をレースの中で標準化し、<b>過去4年で 1〜3着の並びを最もよく説明できた重み</b>で合成します。これがオッズを使わない「能力評価」です。</p>
      <p>最後に単勝オッズから求めた市場の確率を合わせたものが「AI予想」の勝率です。重みは、その年より前のデータだけで決めています。</p>`));
    api.run(async () => {
      await api.type(q(el, "#a"), "8つのAIが、別々に予想する。");
      beams(q(el, "#bm"));
      await api.wait(2900);
      await api.type(q(el, "#b"), "その答えを、ひとつの確率に。");
      api.show(q(el, "#m"));
      api.done();
    });
  },
};
const LAYERS = [["market", "市場", "#c9ced8"], ["v33", "以前のAI", "#3a86ff"], ["v52", "v52", "#ff9f1c"], ["prism", "PRISM", "#ffd23f"]];
const E2 = {
  kind: "inter",
  render(el, api) {
    const ex = api.data.example;
    const rows = ex.rows.slice(0, 8);
    const H = innerHeight < 900 ? 40 : 48;
    el.innerHTML = `<p class="k">実際のレース</p><p class="t-m">${esc(ex.title)}</p>
      <div class="tabs" role="group" aria-label="AIを切り替える">${LAYERS.map(([k, n]) => `<button class="tab" type="button" data-k="${k}" aria-pressed="false">${n}</button>`).join("")}</div>
      <div class="board" data-noswipe style="height:${rows.length * H}px">${rows.map((r) => `<button class="horse" type="button" style="height:${H - 4}px" data-u="${r.umaban}"><span class="rk num"></span><span class="hb"><i></i><span>${r.umaban} ${esc(r.horse)}</span></span><span class="p num"></span><span class="fin num f${r.pos}">${r.pos}着</span></button>`).join("")}</div>
      <div class="row"><button class="btn" type="button" id="res">結果を見る</button><button class="btn" type="button" id="tk">買い目を見る</button></div>
      <div class="pcard" id="info" aria-live="polite"><h4>左右にスワイプ / タブで AI を切り替え</h4><p>馬を押すと、4つの見方を比べられます。</p></div>
      <p class="t-src">すべて、このレースの年より前のデータだけで学習した予測</p>`;
    const board = q(el, ".board");
    let cur = "market", touched = new Set();
    const set = (k) => {
      cur = k;
      const col = LAYERS.find((l) => l[0] === k)[2];
      const order = [...rows].sort((a, b) => b[k] - a[k]);
      const mx = Math.max(...rows.map((r) => r[k]));
      qa(board, ".horse").forEach((h) => {
        const r = rows.find((x) => x.umaban === +h.dataset.u);
        const rank = order.indexOf(r);
        h.style.transform = `translateY(${rank * H}px)`;
        q(h, ".rk").textContent = rank + 1;
        q(h, ".hb i").style.width = (r[k] / Math.max(mx, .25) * 100) + "%";
        q(h, ".hb i").style.background = col;
        q(h, ".p").textContent = pct(r[k]);
      });
      qa(el, ".tab").forEach((t) => t.setAttribute("aria-pressed", t.dataset.k === k));
      touched.add(k);
      if (touched.size >= 3) api.done();
    };
    qa(el, ".tab").forEach((t) => t.addEventListener("click", () => set(t.dataset.k)));
    q(el, "#res").addEventListener("click", (e) => { board.classList.toggle("showres"); e.currentTarget.textContent = board.classList.contains("showres") ? "結果を隠す" : "結果を見る"; });
    qa(board, ".horse").forEach((h) => h.addEventListener("click", () => {
      qa(board, ".horse").forEach((x) => x.classList.toggle("sel", x === h));
      const r = rows.find((x) => x.umaban === +h.dataset.u);
      q(el, "#info").innerHTML = `<h4>${r.umaban}番 ${esc(r.horse)}　<span style="color:#c3c9d6;font-size:15px">単勝 ${r.odds}倍</span></h4>
        <p>${LAYERS.map(([k, n]) => `${n} <b class="num">${pct(r[k])}</b>`).join("　")}</p><p class="imp">${board.classList.contains("showres") ? `結果：${r.pos}着` : "結果は「結果を見る」で"}</p>`;
      q(el, "#info").scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }));
    // swipe on the board switches the AI (not the scene)
    let sx = null;
    board.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    board.addEventListener("pointerup", (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) < 50) return;
      const i = LAYERS.findIndex((l) => l[0] === cur);
      set(LAYERS[(i + (dx < 0 ? 1 : LAYERS.length - 1)) % LAYERS.length][0]);
    });
    set("market");
    touched.clear(); touched.add("market");
    q(el, "#tk").addEventListener("click", () => api.sheet("このレースの AI推奨の買い目", `<p><b>以前のAI</b>：${esc(ex.tickets.v33)}</p><p><b>v52</b>：${esc(ex.tickets.v52)}</p><p><b>PRISM</b>：${esc(ex.tickets.prism)}</p>
      <p>1点100円。PRISM がうまくいった例です。外れたレースも多く、成績はすべてのレースで集計しています（第8章）。</p>`));
  },
};
const BLUEPRINT = [
  ["データを集める", "1986〜2026年の全レース。着順・タイム・通過順・オッズ・血統・坂路調教。", "139,977", "レース"],
  ["未来を締め出す", "その日より前の情報だけで計算。検証する年は、学習にも調整にも使わない。", "0", "使う未来の情報"],
  ["特徴量を作る", "1頭ごとに、能力・近走・適性・人などを数字にする。", "181", "1頭あたりの数字"],
  ["能力を推定する", "性質の違う8つのAIが、オッズを使わずに能力を評価。", "8", "AIの数"],
  ["条件に合わせる", "クラス別・距離別に少しだけ学び足す。効いた区分だけ。", "9 / 11", "使う区分"],
  ["確率にする", "1着→2着→3着の並びを、そのまま学習する。", "1→2→3", "学ぶ並び"],
  ["8つを合成する", "過去4年で着順を最もよく説明できた重みで、ひとつに。", "4年", "重みを決める期間"],
  ["市場と比べる", "最後に単勝オッズの確率を合わせ、勝率を出す。", "約2倍", "市場に勝つ幅（以前比）"],
  ["期待値を較正する", "同じ条件の買い目が実際にいくら戻ったかで、期待値を補正。", "300件+", "補正に使う最低件数"],
  ["買い目を選ぶ", "4つの買い方が、それぞれのルールで選ぶ。AI推奨は見送りあり。", "4", "買い方"],
];
const E3 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="k">設計図</p><p class="t-l">データから買い目まで、<br>10の工程。</p>
      <div class="carousel" data-noswipe tabindex="0" aria-label="10の工程（横にスワイプ）">${BLUEPRINT.map(([t, d, f, fs], i) => `<article class="bp"><span class="no grad num">${String(i + 1).padStart(2, "0")}</span><h4>${t}</h4><p>${d}</p><p class="fig num">${f}<small>${fs}</small></p></article>`).join("")}</div>
      <div class="cdots" aria-hidden="true">${"<i></i>".repeat(10)}</div><p class="t-src">横にスワイプ</p>`;
    const c = q(el, ".carousel"), dots = qa(el, ".cdots i");
    const upd = () => { const w = c.querySelector(".bp").offsetWidth + 12; const i = Math.round(c.scrollLeft / w); dots.forEach((d, k) => d.classList.toggle("on", k === i)); if (i >= 9) api.done(); };
    c.addEventListener("scroll", upd, { passive: true });
    upd();
    setTimeout(() => api.done(), 4000);
  },
};

// ======================================================================== 06 accuracy is not profit
const T1 = {
  render(el, api) {
    const X = api.data.strategies.cross;
    el.innerHTML = `<p class="t-xl" id="a"></p><p class="t-xl hide warm" id="b">でも、回収率は下がった。</p>
      <p class="big num hide" id="n"><span id="c">128</span><small>%</small></p>
      <p class="t-src hide" id="s">AI推奨・2021〜26年・同じレース・同じルール（新馬戦を含む）</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "精度は上がった。");
      await api.wait(900);
      api.show(q(el, "#b"));
      await api.wait(800);
      api.show(q(el, "#n"), q(el, "#s"));
      await api.count(q(el, "#c"), X["v52|v52"] * 100, { from: X["v33|v33"] * 100, dur: 1800 });
      api.done();
    });
  },
};
const T2 = {
  kind: "inter",
  render(el, api) {
    const c = api.data.strategies.v33_concentration;
    el.innerHTML = `<p class="t-xl">なぜ？</p>
      <button class="btn glow" type="button" id="go">以前の利益の中身を見る</button>
      <div class="hide" id="r" style="display:flex;flex-direction:column;gap:14px;align-items:center">
        <svg viewBox="0 0 120 120" style="width:min(200px,50vw)" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="18"/>
          <circle id="arc" cx="60" cy="60" r="46" fill="none" stroke="#2ec4b6" stroke-width="18" stroke-dasharray="0 289" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1)"/>
          <text x="60" y="68" fill="#fff" font-size="24" font-weight="900" text-anchor="middle">${Math.round(c.share_of_payout * 100)}%</text></svg>
        <p class="t-l">利益の${Math.round(c.share_of_payout * 100)}%が、<br>たった1種類の買い目から。</p>
        <p class="t-s">当たりにくい三連複。${c.tickets.toLocaleString()}点を買って、的中${c.hits}回。</p>
        <p class="t-m">精度の高いAIは、この買い目を選ばなくなった。</p></div>`;
    q(el, "#go").addEventListener("click", (e) => {
      e.currentTarget.classList.add("gone");
      q(el, "#r").classList.remove("hide"); q(el, "#r").classList.add("fadein");
      requestAnimationFrame(() => requestAnimationFrame(() => q(el, "#arc").setAttribute("stroke-dasharray", `${289 * c.share_of_payout} 289`)));
      api.done();
    });
  },
};
const T3 = {
  render(el, api) {
    const v = api.data.accuracy.vs_market;
    const rel = (x) => x / v.v33;
    const rows = [["以前のAI", rel(v.v33), "#3a86ff"], ["v52", rel(v.v52), "#ff9f1c"], ["PRISM", rel(v.prism), "#ffd23f"]];
    el.innerHTML = `<p class="t-l" id="a"></p>
      <p class="t-s hide" id="q">市場（オッズ）より、勝ち馬をよく当てた度合い</p>
      <div class="hbars hide" id="h">${rows.map(([n, x, c]) => `<div class="hbar"><span class="nm">${n}</span><span class="tr"><i style="background:${c}" data-w="${x / 2.4 * 100}"></i><span>×${x.toFixed(1)}</span></span></div>`).join("")}</div>
      <p class="t-src hide" id="s">以前のAI = 1 とした比較・2021〜26年</p>
      <p class="t-l grad hide" id="b">市場に勝つ幅が、約2倍に。</p>
      <button class="more hide" type="button" id="m">正確な数字</button>`;
    q(el, "#m").addEventListener("click", () => api.sheet("市場との比較（正確な数字）", `<p>AI と市場を合わせた確率が、市場だけの確率より勝ち馬をどれだけよく当てたか（勝ち馬の対数損失の差。マイナスほど良い）。</p>
      <table><tr><td>以前のAI（v33）</td><td class="r num">${v.v33}</td></tr><tr><td>v52</td><td class="r num">${v.v52}</td></tr><tr><td>PRISM</td><td class="r num">${v.prism}</td></tr></table>
      <p>PRISM の 90% 区間は ${v.prism_ci90[0]} 〜 ${v.prism_ci90[1]}。0 をまたがないため、偶然では説明しにくい差です。市場は非常に強い予想なので、上回ること自体が難しいのです。</p>`));
    api.run(async () => {
      await api.type(q(el, "#a"), "答えは、混ぜることだった。");
      api.show(q(el, "#q"), q(el, "#h"), q(el, "#s"));
      requestAnimationFrame(() => qa(el, ".hbar i").forEach((i) => (i.style.width = i.dataset.w + "%")));
      await api.wait(1500);
      api.show(q(el, "#b"), q(el, "#m"));
      api.done();
    });
  },
};
const T4 = {
  kind: "inter",
  render(el, api) {
    const X = api.data.strategies.cross, keys = ["v33", "v52", "ens"], nm = { v33: "以前", v52: "v52", ens: "PRISM" };
    el.innerHTML = `<p class="k">実験</p><p class="t-l">2つの確率、<br>どのAIから取る？</p>
      <div class="pick3"><div></div>${keys.map((c) => `<div class="h">AIだけの確率<br><b style="color:#fff">${nm[c]}</b></div>`).join("")}
      ${keys.map((r) => `<div class="h">市場と合わせた確率<br><b style="color:#fff">${nm[r]}</b></div>${keys.map((c) => `<button type="button" data-k="${r}|${c}" aria-label="${nm[r]} と ${nm[c]}">?</button>`).join("")}`).join("")}</div>
      <p class="t-s" id="t">マスを押すと、AI推奨の回収率（2021〜26年）が出る</p>`;
    const opened = new Set();
    qa(el, ".pick3 button").forEach((b) => b.addEventListener("click", () => {
      const v = X[b.dataset.k];
      b.textContent = Math.round(v * 100) + "%";
      b.classList.add("open", v >= 1.05 ? "hi" : v < 1 ? "lo" : "mid");
      if (b.dataset.k === "ens|ens") b.classList.add("me");
      opened.add(b.dataset.k);
      if (opened.size >= 3) {
        q(el, "#t").innerHTML = `<b style="color:#fff">結果は、行（市場と合わせた確率）でほぼ決まる。</b><br>左上の高い数字は、選ぶ期間（2016〜20年）では悪く、選べなかった組み合わせ。`;
        api.done();
      }
    }));
  },
};

// ======================================================================== 07 value game
const V1 = {
  kind: "inter",
  render(el, api) {
    const A = { n: "本命A", p: .4, o: 2.0 }, B = { n: "実力馬B", p: .12, o: 10.0 };
    el.innerHTML = `<p class="t-l">100円ずつ100回買うなら、<br>どっち？</p>
      <div class="vgame">${[A, B].map((h, i) => `<button class="vh" type="button" data-i="${i}"><p class="nm">${h.n}</p>
        <div class="stat"><span><b class="num">${h.p * 100}%</b>勝率</span><span><b class="num">${h.o.toFixed(1)}</b>倍</span></div>
        <p class="ret num" id="r${i}">?</p><div class="coins" aria-hidden="true">${"<i></i>".repeat(100)}</div></button>`).join("")}</div>
      <p class="t-m hide" id="t"></p><p><span class="tag ex">例（架空の2頭・勝率どおりに当たった場合）</span></p>`;
    let picked = false;
    qa(el, ".vh").forEach((b) => b.addEventListener("click", () => {
      if (picked) return;
      picked = true;
      b.classList.add("pick");
      api.run(async () => {
        const hs = [A, B];
        for (let k = 0; k < 2; k++) {
          const h = hs[k], coins = qa(el, `.vh[data-i="${k}"] .coins i`), wins = Math.round(h.p * 100);
          const idx = [...Array(100).keys()].sort(() => Math.random() - .5).slice(0, wins);
          for (const i of idx) { coins[i].classList.add("w"); if (!api.ff) await api.wait(14); }
          idx.forEach((i) => coins[i].classList.add("w"));
          const ret = wins * h.o * 100;
          const r = q(el, "#r" + k); r.classList.add(ret >= 10000 ? "up" : "down");
          await api.count(r, ret, { dur: 900, fmt: (v) => Math.round(v).toLocaleString() + "円" });
        }
        await api.type(q(el, "#t"), "勝ちやすさより、オッズとのバランス。");
        api.hint(+b.dataset.i === 1 ? "正解。1万円が1万2千円に。" : "本命は勝つけれど、8千円に減った。");
        api.done();
      });
    }));
  },
};
const V2 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="t-l">オッズを動かして、<br>分かれ目を探そう。</p>
      <div class="vh" style="width:min(420px,92vw);margin:0 auto"><p class="nm">本命A　勝率40%</p>
        <p class="t-s">オッズ <b class="num" style="color:#fff;font-size:26px" id="o">2.0</b> 倍</p>
        <input data-noswipe type="range" id="r" min="1.2" max="4" step="0.1" value="2.0" aria-label="オッズ">
        <p class="t-src">1万円 → </p><p class="ret num" id="ret"></p></div>
      <p class="t-m">分かれ目は <b class="warm">100 ÷ 勝率 = 2.5倍</b></p>
      <p class="t-s">PRISMは、この分かれ目を超える買い目だけを探す。</p>
      <p><span class="tag ex">例</span> 実際は払戻率（約75〜80%）が引かれるため、分かれ目を超える買い目はめったに無い。</p>`;
    const upd = () => {
      const o = +q(el, "#r").value, ret = 10000 * .4 * o;
      q(el, "#o").textContent = o.toFixed(1);
      const r = q(el, "#ret"); r.textContent = Math.round(ret).toLocaleString() + "円";
      r.className = "ret num " + (ret > 10000 ? "up" : ret < 10000 ? "down" : "");
      if (o > 2.5) api.done();
    };
    q(el, "#r").addEventListener("input", upd);
    upd();
  },
};

// ======================================================================== 08 1,000 yen
const STRATS = [["ai", "AI推奨", "見送りあり・最大3点"], ["stable", "安定型", "複勝・ワイド"], ["balance", "バランス型", "毎レース1点"], ["high", "高配当型", "三連複・馬連"]];
let curStrat = "ai";
const R1 = {
  kind: "inter",
  render(el, api) {
    const S = api.data.strategies.prism;
    el.innerHTML = `<p class="t-m">1,000円を賭けていたら、<br>いくら戻った？</p>
      <div class="tabs" role="group" aria-label="買い方">${STRATS.map(([k, n]) => `<button class="tab" type="button" data-k="${k}">${n}</button>`).join("")}</div>
      <p class="yen num" id="y" data-noswipe><span id="yv">1,000</span><small>円</small></p>
      <p class="t-s" id="sub"></p>
      <div class="versus" data-noswipe style="width:min(520px,94vw)"><div class="vs-side"><p class="lab">当たったレース</p><p class="val num" style="font-size:clamp(30px,9vw,48px)" id="hit"></p></div><div class="vs-side"><p class="lab">90%の範囲</p><p class="val num" style="font-size:clamp(20px,6vw,30px)" id="ci"></p></div></div>
      <p class="t-src">2021〜26年（10月18日まで）・新馬戦を除く・過去の検証。将来の利益を約束するものではありません。</p>
      <button class="more" type="button" id="m">選択期間・通算も見る</button>`;
    const set = (k) => {
      curStrat = k;
      const s = S[k], n = STRATS.find((x) => x[0] === k);
      qa(el, ".tab").forEach((t) => t.setAttribute("aria-pressed", t.dataset.k === k));
      q(el, "#sub").innerHTML = `${n[1]}（${n[2]}）・購入 ${Math.round(s.test_races).toLocaleString()} レース`;
      q(el, "#hit").textContent = `100回中 ${Math.round(s.hit_rate * 100)}回`;
      q(el, "#ci").textContent = `${yen(s.ci90[0] * 1000)}〜${yen(s.ci90[1] * 1000)}`;
      const y = q(el, "#y"); y.classList.toggle("up", s.test_roi >= 1);
      api.run(async () => { await api.count(q(el, "#yv"), s.test_roi * 1000, { from: 1000, dur: 1300 }); });
      api.done();
    };
    qa(el, ".tab").forEach((t) => t.addEventListener("click", () => set(t.dataset.k)));
    let sx = null;
    el.addEventListener("pointerdown", (e) => { sx = e.target.closest(".yen, .versus") ? e.clientX : null; });
    el.addEventListener("pointerup", (e) => {
      if (sx == null) return; const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) < 50) return;
      const i = STRATS.findIndex((x) => x[0] === curStrat);
      set(STRATS[(i + (dx < 0 ? 1 : 3)) % 4][0]);
    });
    q(el, "#m").addEventListener("click", () => api.sheet("4つの買い方（新馬戦を除く）", `<table><tr><th>買い方</th><th class="r">2016〜20</th><th class="r">2021〜26</th><th class="r">通算</th></tr>
      ${STRATS.map(([k, n]) => `<tr><td>${n}</td><td class="r num">${pct(S[k].dev_roi)}</td><td class="r num"><b>${pct(S[k].test_roi)}</b></td><td class="r num">${pct(S[k].full_roi)}</td></tr>`).join("")}</table>
      <p>回収率 100% で、賭けた金額と同じだけ戻ります。2016〜20年は買い方を選ぶのに使った期間、2021〜26年は確かめるだけの期間です。各年は、その年より前のデータだけで学習・較正したモデルで計算しています。</p>
      <p>確定オッズで計算しているため、発走前に見られるオッズとは少し異なります。90% の範囲の下限が 1,000 円前後のものは、利益が出ると言い切れる証拠ではありません。</p>`));
    set(curStrat);
  },
};
const R2 = {
  kind: "inter",
  render(el, api) {
    const D = api.data.strategies;
    el.innerHTML = `<p class="t-m" id="ttl"></p>
      <div class="tabs" role="group" aria-label="買い方">${STRATS.map(([k, n]) => `<button class="tab" type="button" data-k="${k}">${n}</button>`).join("")}</div>
      <div class="ybars" id="yb" data-noswipe></div>
      <div class="legend"><span><i style="background:#9aa3b4"></i>2016〜20（選ぶ期間）</span><span><i style="background:#ffd23f"></i>2021〜26（確かめる期間）</span><span><i style="background:#6b7489"></i>以前のAI</span></div>
      <p class="t-m" id="pick">棒を押すと、その年の1,000円の行方</p>
      <button class="btn hold" type="button" id="hold">長押しで以前のAIと比べる</button>
      <p class="t-src">新馬戦を除く・1点100円・過去の検証</p>`;
    const yb = q(el, "#yb");
    const draw = () => {
      const p = D.prism[curStrat].by_year, o = D.v33[curStrat].by_year, years = Object.keys(p).sort();
      const hi = Math.max(1.6, ...years.flatMap((y) => [p[y], o[y] || 0])) * 1.05;
      q(el, "#ttl").textContent = `${STRATS.find((x) => x[0] === curStrat)[1]}：年ごとに、1,000円がいくらに？`;
      yb.innerHTML = years.map((y) => `<button class="yb ${+y >= 2021 ? "test" : ""}" type="button" data-y="${y}" aria-label="${y}年"><i class="o" data-h="${(o[y] || 0) / hi * 100}"></i><i class="p" data-h="${p[y] / hi * 100}"></i><span>${String(y).slice(2)}</span></button>`).join("")
        + `<div class="ref" style="bottom:${1 / hi * 100}%"><b>1,000円</b></div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => qa(yb, "i").forEach((i) => (i.style.height = i.dataset.h + "%"))));
      qa(yb, ".yb").forEach((b) => b.addEventListener("click", () => {
        qa(yb, ".yb").forEach((x) => x.classList.toggle("sel", x === b));
        const y = b.dataset.y;
        q(el, "#pick").innerHTML = `${y}年：1,000円 → <b style="color:${p[y] >= 1 ? "#7be495" : "#fff"}">${yen(p[y] * 1000)}</b>（以前のAI ${yen((o[y] || 0) * 1000)}）`;
        api.done();
      }));
      qa(el, ".tab").forEach((t) => t.setAttribute("aria-pressed", t.dataset.k === curStrat));
    };
    qa(el, ".tab").forEach((t) => t.addEventListener("click", () => { curStrat = t.dataset.k; draw(); }));
    const hold = q(el, "#hold");
    const on = (e) => { e.preventDefault(); yb.classList.add("cmp"); hold.classList.add("on"); api.done(); };
    const off = () => { yb.classList.remove("cmp"); hold.classList.remove("on"); };
    hold.addEventListener("pointerdown", on); ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hold.addEventListener(ev, off));
    hold.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") on(e); });
    hold.addEventListener("keyup", off);
    draw();
  },
};
const R3 = {
  kind: "inter",
  render(el, api) {
    const S = api.data.strategies;
    const order = ["2・3勝", "未勝利", "1勝", "OP・L・G3", "G1・G2", "新馬"];
    const dorder = ["芝短", "ダ短", "ダ中長", "芝中", "芝長"];
    const bars = (obj, keys) => `<div class="hbars">${keys.filter((k) => obj[k]).map((k) => { const [v, n] = obj[k]; return `<div class="hbar"><span class="nm">${k}</span><span class="tr"><i style="background:${v >= 1 ? "#7be495" : "#6b7489"}" data-w="${Math.min(v / 1.6, 1) * 100}"></i><span>${yen(v * 1000)}・${n}R</span></span></div>`; }).join("")}</div>`;
    el.innerHTML = `<p class="t-l">得意なレース、<br>苦手なレース。</p>
      <div class="tabs" role="group"><button class="tab" type="button" data-v="c" aria-pressed="true">クラス別</button><button class="tab" type="button" data-v="d" aria-pressed="false">距離別</button></div>
      <div id="b"></div>
      <p class="t-s">数が少ない区分ほど、偶然で大きく動く。</p>
      <p class="t-src">AI推奨・2021〜26年・1,000円あたり（新馬戦を含む全レース）</p>`;
    const show = (v) => {
      q(el, "#b").innerHTML = v === "c" ? bars(S.ai_by_class, order) : bars(S.ai_by_dist, dorder);
      qa(el, ".tab").forEach((t) => t.setAttribute("aria-pressed", t.dataset.v === v));
      requestAnimationFrame(() => requestAnimationFrame(() => qa(el, ".hbar i").forEach((i) => (i.style.width = i.dataset.w + "%"))));
    };
    qa(el, ".tab").forEach((t) => t.addEventListener("click", () => { show(t.dataset.v); api.done(); }));
    show("c");
    setTimeout(() => api.done(), 2500);
  },
};

// ======================================================================== 09 G1・G2
const G1s = {
  render(el, api) {
    const t = api.data.g1g2.ens_test["G1+G2"];
    el.innerHTML = `<p class="t-m" id="a"></p><p class="big num hide" id="n"><span id="c">0</span><small>%</small></p>
      <p class="t-src hide" id="s">AI推奨・2021〜26年・G1とG2の ${t.races}レース</p><p class="t-l hide" id="b">これは、PRISMの弱点なのか？</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "G1・G2だけで見ると、回収率は");
      api.show(q(el, "#n"), q(el, "#s"));
      await api.count(q(el, "#c"), t.roi * 100, { dur: 1400 });
      await api.wait(800);
      api.show(q(el, "#b"));
      api.done();
    });
  },
};
const G2s = {
  kind: "inter",
  render(el, api) {
    const G = api.data.g1g2, h = G.hist, k = G.chance.k;
    const total = h.counts.reduce((a, b) => a + b, 0);
    const draw1 = () => {
      let r = Math.random() * total, i = 0;
      while (r > h.counts[i]) { r -= h.counts[i]; i++; }
      return h.edges[i] + Math.random() * (h.edges[i + 1] - h.edges[i]);
    };
    el.innerHTML = `<p class="k">実験：偶然を試す</p><p class="t-m">G1・G2以外のレースから、<br>${k}レースを無作為に選ぶと？</p>
      <div class="strip" id="st" data-noswipe><span class="mk" style="left:${.69 / 3 * 100}%;background:#ffd23f"><b style="color:#ffd23f">69%</b></span><span class="mk" style="left:${1 / 3 * 100}%;background:rgba(255,255,255,.6)"><b style="color:#fff">100%</b></span></div>
      <div class="axis"><span>0%</span><span>150%</span><span>300%〜</span></div>
      <div class="row"><button class="btn glow" type="button" id="one">1回選ぶ</button><button class="btn" type="button" id="many">まとめて50回</button></div>
      <p class="t-m"><span class="num" id="cnt">0</span>回中、69%以下は <b class="num" id="le">0</b>回</p>
      <p class="t-l grad hide" id="ans"></p>`;
    let n = 0, le = 0;
    const strip = q(el, "#st");
    const add = () => {
      const v = draw1(); n++; if (v <= .69) le++;
      const d = document.createElement("span"); d.className = "dot";
      d.style.left = Math.min(v / 3, 1) * 100 + "%"; d.style.top = (18 + Math.random() * 84) + "%";
      d.style.background = v <= .69 ? "#ff5a5f" : "#3a86ff";
      strip.appendChild(d);
      if (strip.children.length > 260) strip.children[2].remove();
      q(el, "#cnt").textContent = n; q(el, "#le").textContent = le;
      if (n >= 20 && q(el, "#ans").classList.contains("hide")) {
        q(el, "#ans").textContent = `20,000回試すと、${Math.round(G.chance.share_le * 100)}%が69%以下。`;
        api.show(q(el, "#ans")); api.done();
      }
    };
    q(el, "#one").addEventListener("click", add);
    q(el, "#many").addEventListener("click", () => { api.run(async () => { for (let i = 0; i < 50; i++) { add(); if (!api.ff) await api.wait(35); } }); });
  },
};
const G3s = {
  render(el, api) {
    const d = api.data.g1g2.ens_dev["G1+G2"];
    el.innerHTML = `<p class="t-xl" id="a"></p><p class="t-m hide" id="b">同じPRISMが、2016〜20年のG1・G2では <b class="warm num">${Math.round(d.roi * 100)}%</b>。</p>
      <p class="t-l hide" id="c">専用のAIは、あえて作らなかった。</p><p class="t-s hide" id="d">偶然に合わせ込むほうが、ずっと危ないから。</p>`;
    api.run(async () => {
      await api.type(q(el, "#a"), "弱点ではなく、少なさ。");
      api.show(q(el, "#b"));
      await api.wait(1400);
      api.show(q(el, "#c"));
      await api.wait(900);
      api.show(q(el, "#d"));
      api.done();
    });
  },
};

// ======================================================================== 10 promises
const CAVEATS = [
  ["⚖", "利益は約束しない", "90%の範囲の下限は、どの買い方も 100% 前後かそれ以下。過去に超えても、未来も超えるとは限らない。"],
  ["🎯", "大きな配当が、数字を動かす", "払戻の大きいレースを除くと、どの買い方も 100% を下回る。"],
  ["⏱", "オッズは確定値で計算", "発走前に見られるオッズとは、少し違う。"],
  ["🔍", "検証期間は、何度も見た", "8つを混ぜる方法は、v52 単独がうまくいかないのを見た後に決めた。買い方のルールは変えていない。"],
  ["🐣", "新馬戦は、成績から外した", "過去の成績が無い馬だけのレースだから。外すと検証期間は上がるが、選ぶ期間では少し下がる。予想は表示する。"],
  ["🔒", "公開した予想は、変えない", "発走後の予想と買い目は凍結。後から書き換えられない仕組みにした。"],
];
const P1 = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<p class="t-l">数字を読む前に、<br>知ってほしいこと。</p>
      <div class="deck" data-noswipe>${CAVEATS.map(([i, h, p], k) => `<article class="dcard" style="z-index:${10 - k};transform:translateY(${k * 8}px) scale(${1 - k * .03})"><span class="cnt num">${k + 1} / ${CAVEATS.length}</span><span class="ic" aria-hidden="true">${i}</span><h4>${h}</h4><p>${p}</p></article>`).join("")}</div>
      <div class="row"><button class="btn" type="button" id="bk">‹ 戻す</button><button class="btn primary" type="button" id="nx">次のカード ›</button></div>
      <p class="t-src">カードを左にスワイプしても進む</p>`;
    const cards = qa(el, ".dcard");
    let i = 0;
    const lay = () => cards.forEach((c, k) => {
      const d = k - i;
      c.classList.toggle("out", d < 0);
      if (d >= 0) c.style.transform = `translateY(${d * 8}px) scale(${1 - d * .03})`;
    });
    const fwd = () => { if (i < cards.length - 1) { i++; lay(); } if (i === cards.length - 1) api.done(); };
    const back = () => { if (i > 0) { i--; lay(); } };
    q(el, "#nx").addEventListener("click", fwd);
    q(el, "#bk").addEventListener("click", back);
    let sx = null;
    q(el, ".deck").addEventListener("pointerdown", (e) => { sx = e.clientX; });
    q(el, ".deck").addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (dx < -50) fwd(); else if (dx > 50) back(); });
  },
};

// ======================================================================== ending
const END = {
  kind: "inter",
  render(el, api) {
    el.innerHTML = `<img class="op-mark" src="assets/mark.svg" alt="" width="140" height="140"><img class="op-logo" src="assets/wordmark.svg" alt="PRISM" width="520" height="135">
      <p class="op-tag">ONE RACE. MULTIPLE PERSPECTIVES.</p>
      <p class="t-xl" id="a"></p>
      <div class="row hide" id="b"><a class="btn primary" href="${SITE}" rel="noopener">PRISMの予想を見る ↗</a><button class="btn" type="button" id="re">最初から見る</button><button class="btn" type="button" id="mn">目次</button></div>
      <p class="t-src hide" id="c">過去の検証は、将来の利益を保証しません。馬券は20歳以上の方が、ご自身の判断で。JRAの公式サイトではありません。</p>`;
    q(el, "#re").addEventListener("click", () => api.go(0));
    q(el, "#mn").addEventListener("click", () => api.menu());
    api.run(async () => {
      await api.wait(600);
      await api.type(q(el, "#a"), "競馬AIは、ここまで進化した。", 14);
      api.show(q(el, "#b"), q(el, "#c"));
      api.done();
    });
  },
};

export const CHAPTERS = [
  { id: "open", title: "オープニング", menu: "PRISM とは", accent: "#ffffff", scenes: [OPEN] },
  { id: "q", num: "01", title: "1番人気の真実", sub: "すべては、この問いから。", menu: "100レースで、何回勝つ？", accent: "#ffd23f", scenes: [Q1, Q2] },
  { id: "hist", num: "02", title: "遠回りの記録", sub: "失敗が、PRISMを作った。", menu: "305% の正体・35の失敗", accent: "#ff5a5f", scenes: [H1, H2, H3, H4, H5, H6] },
  { id: "acc", num: "03", title: "見えている未来", sub: "AIは、本当に進化したのか。", menu: "19.5% → 23.5%", accent: "#3a86ff", scenes: [A1, A2, A3, A4] },
  { id: "feat", num: "04", title: "44の新しい目", sub: "1頭を、8つの角度から。", menu: "予想を組み立てる", accent: "#ff9f1c", scenes: [F1, F2, F3, F4] },
  { id: "ens", num: "05", title: "8つの視点を、ひとつに", sub: "One race. Multiple perspectives.", menu: "AIを切り替えて比べる", accent: "#d08cff", scenes: [E1, E2, E3] },
  { id: "twist", num: "06", title: "精度と利益は、別もの", sub: "当てることと、勝つことは違う。", menu: "128% → 99% の謎", accent: "#2ec4b6", scenes: [T1, T2, T3, T4] },
  { id: "value", num: "07", title: "勝ちそう ≠ お得", sub: "あなたなら、どちらを買う？", menu: "100回買うゲーム", accent: "#7be495", scenes: [V1, V2] },
  { id: "roi", num: "08", title: "1,000円の行方", sub: "過去の検証で、いくら戻ったか。", menu: "4つの買い方の成績", accent: "#ffd23f", scenes: [R1, R2, R3] },
  { id: "g1", num: "09", title: "偶然を疑う", sub: "G1・G2の69%は、弱点か。", menu: "偶然を試す実験", accent: "#8b5cf6", scenes: [G1s, G2s, G3s] },
  { id: "honest", num: "10", title: "数字の約束", sub: "PRISMは、利益を約束しない。", menu: "6つの注意", accent: "#ffffff", scenes: [P1] },
  { id: "end", title: "エンディング", menu: "予想サイトへ", accent: "#ffffff", scenes: [END] },
];
