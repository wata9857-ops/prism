# PRISM — One race. Multiple perspectives.

競馬予想エンジン **PRISM** の紹介サイト（静的サイト・GitHub Pages）。

- 予想システム本体（モデル・データ・コード）とは別のリポジトリです。ここには、検証済みの**集計値だけ**（`data/prism.json`）と、表示用の HTML / CSS / JavaScript だけを置いています。
- 数値は予想システム側の `tools/prism_site_data.py` で作り直してコピーします。
- ロゴ：`assets/mark.svg`（プリズム）・`assets/wordmark.svg`（文字）・`assets/logo.svg`（横組み）・`assets/favicon.svg`・`assets/og.png`（`design/_og.html` から生成）。
- 外部の読み込み（フォント・スクリプト・解析タグ）はありません。

## 構成（v3：章ごとのシーン型）

- `js/engine.js` — シーンエンジン（章・シーンの移動、タップ／スワイプ／キーボード、目次、一時停止、もう一度、続きから、`#/章/シーン` の URL、詳しい説明のシート、動きを減らす設定への対応）
- `js/scenes.js` — 12 章（オープニング・01〜10・エンディング）の中身。数値はすべて `data/prism.json` から読みます（「例」と書いた図は説明用の仮の数字です）
- `js/fx.js` — 背景の粒子、オープニングの光、AI の合成を表すビームの図
- `css/prism.css` — スマホ優先のスタイル
- `design/walkthrough.py` — Playwright で全シーンを進めて操作・撮影・エラー確認（`python design/walkthrough.py URL 出力先 [幅 高さ [reduce]]`）
