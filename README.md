# PRISM — One race. Multiple perspectives.

競馬予想エンジン **PRISM** の紹介サイト（静的サイト・GitHub Pages）。

- 予想システム本体（モデル・データ・コード）とは別のリポジトリです。ここには、検証済みの**集計値だけ**（`data/prism.json`）と、表示用の HTML / CSS / JavaScript だけを置いています。
- 数値は予想システム側の `tools/prism_site_data.py` で作り直してコピーします。
- ロゴ：`assets/mark.svg`（プリズム）・`assets/wordmark.svg`（文字）・`assets/logo.svg`（横組み）・`assets/favicon.svg`・`assets/og.png`（`design/_og.html` から生成）。
- 外部の読み込み（フォント・スクリプト・解析タグ）はありません。
