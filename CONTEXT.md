# 実装依頼：QuaggaJS 視覚的フィードバックの導入 (v1.1.11)

現在の `index.html` に対して、以下の改善を適用してください。

## 1. QuaggaJS 視覚的フィードバック
スキャン中にどこを認識しているか可視化します。
- `Quagga.onProcessed` コールバックの実装：
  - 検知したバーコードの領域（result.boxes）に緑色の枠線を描画。
  - 現在ターゲットにしている枠（result.box）に青色の太枠を描画。
  - 読み取りライン（result.line）に赤色の線を描画。
- `Quagga.ImageDebug.drawPath` を使用してください。

## 2. 数量入力方法の変更
プラス、マイナスのボタンではなく、キーボードで数字を入力できるようにしてください。


## 3. バージョンとドキュメント同期
- アプリの表示バージョンを **v1.1.11 ** に更新。
- `sw.js` の `CACHE_NAME` を `v1.1.11` に更新。
- `DEVELOPMENT_LOG.md` に「v1.1.11: QuaggaJS視覚的フィードバックの実装」を追記。
- この `download_helper.html` の内容も v1.1.11 完了状態に同期させること。

## 3. 実行後の報告
修正した JavaScript の主要な変更点（onProcessedの処理）を提示してください。