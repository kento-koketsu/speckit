# Quickstart: マコなり社長の名言ジェネレーター

**作成日**: 2025-10-21
**バージョン**: 2.0.0（clarify反映版）
**対象**: 開発者
**所要時間**: 10分

---

## 前提条件

- **Node.js**: v18以上
- **npm**: v9以上
- **Git**: v2.30以上

---

## セットアップ

### 1. リポジトリクローン

```bash
git clone <repository-url>
cd speckit
git checkout feature/quote-generator
```

### 2. 依存関係インストール

```bash
cd frontend
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

---

## 名言データの追加

### 1. JSONファイル編集

`frontend/src/data/quotes.json`:

```json
{
  "version": "1.0.0",
  "quotes": [
    {
      "id": "quote-001",
      "text": "新しい名言",
      "author": "マコなり社長",
      "date": "2024-10",
      "source": "YouTube"
    }
  ]
}
```

### 2. IDの採番規則

- 形式: `quote-XXX`（3桁ゼロパディング）
- 例: `quote-001`, `quote-050`, `quote-100`

---

## ビルドとデプロイ

### ビルド

```bash
npm run build
```

出力: `frontend/dist/`

バンドルサイズ確認:
```bash
ls -lh frontend/dist/assets/
```

目標: 100KB以下（gzip圧縮後）

### デプロイ（Vercel）

```bash
vercel --prod
```

---

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果プレビュー |

---

## プロジェクト構造

```
frontend/
├── src/
│   ├── main.js              # エントリーポイント
│   ├── models/quote.js      # データモデル（JSDoc）
│   ├── services/quoteService.js  # ビジネスロジック
│   ├── ui/quoteDisplay.js   # 名言表示UI
│   ├── ui/button.js         # ボタン制御
│   └── data/quotes.json     # 名言データ
├── index.html
├── package.json
└── vite.config.js
```

---

## トラブルシューティング

### ポート3000が使用中

```bash
npm run dev -- --port 3001
```

### ビルドサイズ超過

```bash
npm run build
# バンドルアナライザー使用
npx vite-bundle-visualizer
```

---

**Quickstart完了**
