// PRISM — boot
import { createEngine } from "./engine.js";
import { CHAPTERS } from "./scenes.js";
import { startBG } from "./fx.js";

startBG(document.getElementById("bg"));
fetch("data/prism.json", { cache: "no-cache" })
  .then((r) => r.json())
  .then((data) => createEngine(CHAPTERS, data))
  .catch((e) => {
    console.error(e);
    document.getElementById("stage").innerHTML = '<section class="scene"><p class="t-m">データを読み込めませんでした。</p><a class="btn" href="./">再読み込み</a></section>';
  });
