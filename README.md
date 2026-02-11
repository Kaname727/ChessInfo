# ♟️ ChessInfo Overlay

> ブラウザ上に“今ほしい情報”をミニマル表示する、Chrome拡張。<br>
> 日付・時刻・経過日数・Lichess / Chess.com の指標・メモを、常に視界の端へ。

---

## ✨ Features

- 🕒 **リアルタイム時計**（1秒ごとに更新）
- 📅 **日付表示**（曜日つき）
- 🚀 **「〇〇を始めて N 日目」表示**（開始日から自動計算）
- ♟️ **Lichess 指標表示**
  - Rapid / Blitz / Classical / Bullet
  - レート / 対局数 / 勝率
- 🏁 **Chess.com 指標表示**
  - Rapid / Blitz / Bullet / Daily
  - レート / 対局数 / 勝率
- 📝 **自由メモ表示**
- 🧲 **パネルのドラッグ移動**（位置を保存）
- 🙈 **空欄項目は自動で非表示**

---

## 📦 Installation（ローカル読み込み）

1. Chrome で `chrome://extensions/` を開く
2. 右上の **デベロッパーモード** を ON
3. **パッケージ化されていない拡張機能を読み込む** をクリック
4. このリポジトリ（`ChessInfo`）フォルダを選択

---

## 🚀 Usage

1. 任意のページを開くと、右上に情報パネルが表示されます
2. 拡張アイコンをクリックしてポップアップを開きます
3. 以下を必要に応じて入力して **保存**
   - 開始ラベル・開始日
   - Lichess ユーザー名 + 表示種別
   - Chess.com ユーザー名 + 表示種別
   - メモ
4. パネル上部のグリップをドラッグすると表示位置を変更できます

---

## 🧩 Tech Notes

- Manifest: **V3**
- 保存領域:
  - `chrome.storage.sync` … ユーザー設定
  - `chrome.storage.local` … パネル位置
- 取得 API:
  - `https://lichess.org/api/user/:username`
  - `https://api.chess.com/pub/player/:username/stats`

---

## 🗂️ Project Structure

- `manifest.json` - 拡張の基本設定・権限
- `content.js` - ページ上オーバーレイ描画、時刻更新、外部API取得
- `content.css` - オーバーレイUIスタイル
- `popup.html` - 設定用ポップアップUI
- `popup.js` - 設定の読み書き処理

---

## ⚠️ Notes

- API取得に失敗した場合は、パネル上にエラーメッセージを表示します
- サイトのCSSやレイアウトによっては、表示位置の微調整が必要な場合があります

---

## 📄 License

必要に応じて追記してください（`MIT` など）。
