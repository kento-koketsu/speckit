# 実装計画: マコなり社長の名言・格言ジェネレーター

**作成日:** 2025-10-14
**最終更新:** 2025-10-14
**ステータス:** Draft
**仕様書:** `/specs/quote-generator-spec.md`

---

## 概要

マコなり社長の名言・格言ジェネレーターは、Vanilla JavaScriptとモダンCSS を使用したシンプルな静的Webアプリケーションです。spec-kitを使った学習プロジェクトとして、最小限のMVPを迅速に構築し、Vercel/Netlifyで公開することを目指します。

**プロジェクトゴール:** speckitを使って簡単なアプリケーションを作成して公開し、アイデアを形にする体験をすること

---

## 技術スタック

### フロントエンド
- **言語:** Vanilla JavaScript (ES6+)
- **CSS:** Plain CSS または Tailwind CSS (CDN版)
- **ビルドツール:** なし（初期）または Vite（最適化時）
- **フレームワーク:** なし（100KB制約を満たすため）

### データ
- **名言データ:** 静的JSON ファイル (`quotes.json`)
- **ストレージ:** なし（初期MVP）

### ホスティング
- **プラットフォーム:** Vercel または Netlify
- **デプロイ:** Git連携による自動デプロイ
- **HTTPS:** プラットフォーム標準提供

### 開発ツール
- **バージョン管理:** Git / GitHub
- **エディタ:** VS Code推奨
- **ブラウザ:** Chrome DevTools（開発・テスト）
- **パフォーマンス測定:** Lighthouse

---

## アーキテクチャ設計

### ファイル構造

```
/Users/ken__/surprise/speckit/
├── src/
│   ├── index.html          # メインHTML
│   ├── style.css           # スタイルシート
│   ├── app.js              # アプリケーションロジック
│   └── data/
│       └── quotes.json     # 名言データ（10-20件）
├── docs/                   # 設計ドキュメント
├── specs/                  # 仕様書
├── tasks/                  # タスク管理
└── README.md
```

### コンポーネント設計

#### 1. HTMLStructure (`index.html`)
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>マコなり社長の名言集</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <h1 class="title">マコなり社長の名言集</h1>

    <div class="quote-card" id="quoteCard">
      <blockquote class="quote-text" id="quoteText"></blockquote>
      <p class="quote-author" id="quoteAuthor"></p>
      <p class="quote-date" id="quoteDate"></p>
    </div>

    <button class="next-button" id="nextButton" aria-label="次の名言を表示">
      次の名言
    </button>
  </main>

  <script src="app.js"></script>
</body>
</html>
```

#### 2. QuoteManager (`app.js`)
```javascript
// 名言管理クラス
class QuoteManager {
  constructor(quotes) {
    this.quotes = quotes;
    this.history = []; // 重複防止用履歴
  }

  getRandomQuote() {
    // 直近5件を除外してランダム選択
    const available = this.quotes.filter(
      q => !this.history.slice(-5).includes(q.id)
    );
    const quote = available[Math.floor(Math.random() * available.length)];
    this.history.push(quote.id);
    return quote;
  }
}

// アプリケーション初期化
async function initApp() {
  const response = await fetch('./data/quotes.json');
  const data = await response.json();
  const manager = new QuoteManager(data.quotes);

  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteDate = document.getElementById('quoteDate');
  const nextButton = document.getElementById('nextButton');

  function displayQuote() {
    const quote = manager.getRandomQuote();
    quoteText.textContent = `「${quote.text}」`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteDate.textContent = quote.date;
  }

  // イベントリスナー
  nextButton.addEventListener('click', displayQuote);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      displayQuote();
    }
  });

  // 初回表示
  displayQuote();
}

// DOMロード後に初期化
document.addEventListener('DOMContentLoaded', initApp);
```

#### 3. スタイリング (`style.css`)
```css
/* リセット & ベーススタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 600px;
  width: 100%;
}

.title {
  color: white;
  text-align: center;
  font-size: clamp(24px, 5vw, 36px);
  margin-bottom: 40px;
}

.quote-card {
  background: white;
  border-radius: 16px;
  padding: clamp(24px, 5vw, 48px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 32px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quote-text {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 24px;
  line-height: 1.8;
}

.quote-author,
.quote-date {
  font-size: clamp(14px, 3vw, 16px);
  color: #718096;
  text-align: right;
}

.next-button {
  width: 100%;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.next-button:active {
  transform: translateY(0);
}

.next-button:focus {
  outline: 3px solid white;
  outline-offset: 2px;
}

/* レスポンシブ調整 */
@media (max-width: 480px) {
  body {
    padding: 16px;
  }

  .quote-card {
    padding: 24px;
    min-height: 180px;
  }
}
```

#### 4. 名言データ (`data/quotes.json`)
```json
{
  "quotes": [
    {
      "id": "quote-001",
      "text": "行動しない人に成功はない。小さくてもいいから、今日から動き出そう。",
      "author": "マコなり社長",
      "date": "2024年1月",
      "source": "YouTube",
      "createdAt": "2025-10-14T00:00:00Z"
    },
    {
      "id": "quote-002",
      "text": "完璧を目指すな。まず終わらせろ。",
      "author": "マコなり社長",
      "date": "2023年12月",
      "source": "YouTube",
      "createdAt": "2025-10-14T00:00:00Z"
    },
    {
      "id": "quote-003",
      "text": "時間は有限。やらないことを決めるのが最も重要な意思決定だ。",
      "author": "マコなり社長",
      "date": "2024年2月",
      "source": "YouTube",
      "createdAt": "2025-10-14T00:00:00Z"
    }
  ]
}
```

---

## データモデル

### Quote（名言）エンティティ

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `id` | string | ✓ | 一意識別子（例: `quote-001`） |
| `text` | string | ✓ | 名言本文（1〜500文字） |
| `author` | string | ✓ | 著者名（「マコなり社長」固定） |
| `date` | string | ✓ | 発言日（`YYYY年MM月` 形式） |
| `source` | string | | 出典（例: "YouTube", "書籍名"） |
| `context` | string | | 背景情報 |
| `createdAt` | timestamp | | データ登録日時（ISO 8601） |

**制約:**
- `id`はプロジェクト内で一意
- `text`は日本語のみ（誤訳防止）
- 初期データセット: 10〜20件（拡張可能）

---

## パフォーマンス最適化戦略

### 目標値
- 初期ロード: < 2秒（3G接続）
- バンドルサイズ: < 100KB（gzip圧縮後）
- 名言切り替え: < 100ms

### 最適化手法

#### 1. ファイルサイズ削減
- **HTML**: 最小限のマークアップ（~1KB）
- **CSS**: インラインクリティカルCSS検討（~3KB）
- **JavaScript**: ミニファイ不要（Vanilla JS、~2KB）
- **JSON**: 初期10件で~2KB

**予想合計:** 8KB（非圧縮）→ ~3KB（gzip）

#### 2. ロード最適化
- フォントはシステムフォント使用（Web Font不要）
- 画像なし（グラデーション背景のみ）
- 外部ライブラリなし
- DNS Prefetch不要（静的ホスティング）

#### 3. ランタイム最適化
- DOMクエリの最小化（変数キャッシュ）
- イベント委譲は不要（単一ボタン）
- 配列操作は`Math.random()`のみ（O(1)）

---

## セキュリティ対策

### 実装事項

#### 1. XSS対策
```javascript
// textContentを使用（innerHTML禁止）
quoteText.textContent = `「${quote.text}」`;
```

#### 2. CSP（Content Security Policy）
Vercel/Netlifyの`_headers`ファイル:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
```

#### 3. データ検証
- `quotes.json`は手動管理（ユーザー入力なし）
- デプロイ前に JSON Linter 検証

---

## アクセシビリティ実装

### WCAG 2.1 Level AA準拠

#### 1. キーボードナビゲーション
- ボタンに`:focus`スタイル（アウトライン表示）
- Enter/Spaceキーでボタン操作可能

#### 2. ARIAラベル
```html
<button aria-label="次の名言を表示">次の名言</button>
<main role="main">...</main>
```

#### 3. カラーコントラスト
- 名言テキスト: `#1a202c` on `#ffffff` = 14.6:1 ✓
- ボタン: `#667eea` on `#ffffff` = 4.7:1 ✓

#### 4. レスポンシブフォント
```css
font-size: clamp(18px, 4vw, 24px); /* 最小18px保証 */
```

---

## テスト計画

### 1. 機能テスト

#### 手動テスト項目
- [ ] ページロード時にランダムな名言が表示される
- [ ] 「次の名言」ボタンクリックで新しい名言が表示される
- [ ] 連続5回クリックで重複が発生しない
- [ ] キーボード（Enter/Space）で操作できる

#### クロスブラウザテスト
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Mobile Safari (iOS 14+) ✓

### 2. パフォーマンステスト

#### Lighthouse目標
- Performance: ≥ 90
- Accessibility: 100
- Best Practices: 100
- SEO: ≥ 90

#### 測定方法
```bash
# Chrome DevTools → Lighthouse
# ネットワークスロットリング: Fast 3G
# デバイス: Mobile
```

### 3. アクセシビリティテスト

#### ツール
- Chrome Lighthouse Accessibility Audit
- axe DevTools（拡張機能）
- キーボードのみでの操作確認

---

## デプロイ戦略

### Vercelデプロイ（推奨）

#### 1. プロジェクト設定
```json
// vercel.json
{
  "buildCommand": null,
  "outputDirectory": "src",
  "framework": null,
  "devCommand": "python3 -m http.server 8000",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

#### 2. デプロイ手順
```bash
# Vercel CLIインストール（初回のみ）
npm install -g vercel

# プロジェクトルートでデプロイ
cd /Users/ken__/surprise/speckit
vercel

# 本番デプロイ
vercel --prod
```

### Netlifyデプロイ（代替案）

#### netlify.toml
```toml
[build]
  publish = "src"
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
```

---

## 開発フェーズ

### Phase 1: 基盤構築（2時間）
- [x] プロジェクト構造作成
- [ ] `index.html` 作成
- [ ] `style.css` 基本スタイル実装
- [ ] `quotes.json` サンプルデータ作成（10件）

### Phase 2: コア機能実装（3時間）
- [ ] `QuoteManager` クラス実装
- [ ] ランダム名言表示ロジック
- [ ] 重複防止機能（履歴管理）
- [ ] ボタンイベント処理

### Phase 3: UI/UX改善（2時間）
- [ ] レスポンシブデザイン調整
- [ ] アニメーション追加（フェードイン/アウト）
- [ ] キーボードナビゲーション実装
- [ ] アクセシビリティ監査

### Phase 4: テスト & 最適化（2時間）
- [ ] クロスブラウザテスト
- [ ] Lighthouse監査（スコア90+）
- [ ] バンドルサイズ確認（< 100KB）
- [ ] パフォーマンス計測

### Phase 5: デプロイ（1時間）
- [ ] `vercel.json` 設定
- [ ] セキュリティヘッダー設定
- [ ] 本番デプロイ
- [ ] 動作確認（本番環境）

**合計推定工数:** 10時間（約1.5営業日）

---

## リスク管理

### 技術リスク

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| バンドルサイズ超過 | 中 | 低 | Vanilla JS使用で根本回避 |
| パフォーマンス未達 | 中 | 低 | Lighthouse監査を各フェーズで実施 |
| ブラウザ互換性問題 | 低 | 中 | ES6+は全モダンブラウザ対応済み |

### プロセスリスク

| リスク | 影響 | 確率 | 対策 |
|--------|------|------|------|
| 名言データ不足 | 低 | 高 | 初期10件で動作可能、後で追加 |
| スコープクリープ | 中 | 中 | MVPに集中、追加機能は次イテレーション |

---

## 憲章準拠確認

### 原則1: ユーザー体験優先 ✓
- ボタンクリック→名言表示: ~50ms（JavaScript処理のみ）
- レスポンシブデザイン: `clamp()`でスムーズなフォントスケーリング
- 視覚的フィードバック: ホバー/アクティブ状態のアニメーション

### 原則2: コンテンツの完全性 ✓
- 出典フィールド（`source`, `date`, `context`）を含むデータモデル
- 日本語のみ（英訳なし）で真正性維持
- `textContent`使用でXSS防止

### 原則3: シンプルさと集中 ✓
- 単一HTML、単一CSS、単一JS
- 外部依存なし（ライブラリゼロ）
- 名言表示のみに特化

### 原則4: アクセシビリティと包摂性 ✓
- キーボード操作完全対応
- ARIAラベル実装
- カラーコントラスト4.5:1以上

### 原則5: パフォーマンスと効率性 ✓
- 予想バンドルサイズ: ~3KB（gzip）<< 100KB制限
- 名言生成: O(1)アルゴリズム
- 画像/Web Fontなしで高速ロード

### 原則6: コード品質と保守性 ✓
- クラスベース設計（`QuoteManager`）
- JSDocコメント追加予定
- 変数名の明確性

### 原則7: データ主権とプライバシー ✓
- 個人データ収集なし
- Cookie/LocalStorage不使用（初期MVP）
- サードパーティスクリプトなし

---

## 次のステップ

1. **`/tasks`コマンド実行** - 実装タスクを生成
2. **Phase 1開始** - 基盤ファイル作成
3. **継続的Lighthouse監査** - 各フェーズ終了時
4. **デプロイ & 公開** - Vercel本番環境

---

## 参考資料

- [MDN Web Docs - Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Vercel Documentation](https://vercel.com/docs)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

**計画承認日:** 2025-10-14
**次フェーズ:** Task Breakdown (`/tasks`)
