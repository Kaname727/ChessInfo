# ChessInfo

Lichess と Chess.com のレーティングを、閲覧中のページ右上に常時表示する Chrome 拡張です。  
時計や日付、経過日数メモと一緒に、対局指標を一目で確認できます。
readmeはcodexに書かせました
youtubeの企画のために作成しました

---

## コンセプト
Lichess / Chess.com のユーザー名を設定しておけば、Web 閲覧中のどのページでも現在の指標をすぐに参照できます。

- Lichess: Rapid / Blitz / Classical / Bullet
- Chess.com: Rapid / Blitz / Bullet / Daily

---

## 主な機能

### 1. Lichess レーティング表示（メイン機能）
- ユーザー名を指定してレートを取得
- 表示対象の時間帯（Rapid / Blitz / Classical / Bullet）を選択可能
- 選択レート、対局数、勝率を表示

### 2. Chess.com レーティング表示（メイン機能）
- ユーザー名を指定してレートを取得
- 表示対象（Rapid / Blitz / Bullet / Daily）を選択可能
- 選択レート、対局数、勝率を表示
---

## セットアップ

1. Chrome で `chrome://extensions/` を開く
2. **デベロッパーモード** を ON
3. **パッケージ化されていない拡張機能を読み込む** をクリック
4. このリポジトリフォルダを選択

---

## 使い方（レーティング表示まで）

1. 拡張アイコンからポップアップを開く
2. `Lichess ユーザー名` と `表示するレーティング` を設定
3. `Chess.com ユーザー名` と `表示するレーティング` を設定
4. 保存
5. 任意ページ右上のパネルにレート情報が表示される

必要に応じて、開始日・メモも同じ画面で設定できます。

---

## データ取得について

- Lichess: `https://lichess.org/api/user/{username}`
- Chess.com: `https://api.chess.com/pub/player/{username}/stats`
- 一定時間キャッシュして API 呼び出しを抑制
- ユーザー未設定時は該当ブロックを非表示

---

## 補足

この拡張はコンテンツスクリプトとして動作し、ページ上に情報を重ねて表示します。  
サイト側のレイアウトや `z-index` 設定によって、見え方に差が出る場合があります。
