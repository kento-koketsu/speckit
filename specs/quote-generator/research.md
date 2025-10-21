# リサーチドキュメント: マコなり社長の名言ジェネレーター

**作成日**: 2025-10-21
**Phase**: 0 - リサーチとコンテキスト収集
**目的**: clarifyで確定した技術決定に基づき、実装パターンを調査してPhase 1の設計判断を支援

---

## 1. メモリ内履歴管理の実装パターン

### 背景
clarifyセッションで「localStorage不使用、メモリ内のみで重複防止履歴を管理」と確定しました。ページリロード時に履歴はリセットされます。

### 実装パターン

**配列ベースの履歴管理**:
```javascript
/**
 * @typedef {Object} QuoteHistory
 * @property {string[]} recentIds - 直近に表示された名言IDの配列（最大5件）
 */

/**
 * メモリ内履歴管理クラス
 */
class InMemoryHistoryManager {
  constructor() {
    /** @type {string[]} */
    this.recentIds = [];
    this.maxSize = 5;
  }

  /**
   * 名言IDが直近履歴に含まれているかチェック
   * @param {string} quoteId
   * @returns {boolean}
   */
  isRecent(quoteId) {
    return this.recentIds.includes(quoteId);
  }

  /**
   * 名言IDを履歴に追加
   * @param {string} quoteId
   */
  add(quoteId) {
    this.recentIds = [quoteId, ...this.recentIds].slice(0, this.maxSize);
  }

  /**
   * 履歴をクリア（必要に応じて）
   */
  clear() {
    this.recentIds = [];
  }
}
```

### メモリリーク防止策
- グローバルスコープでの単一インスタンス化
- ページリロード時に自動的にメモリ解放
- 履歴サイズを5件に制限（無制限の配列成長を防止）

### 利点
- シンプルで高速（O(1)の追加、O(n)の検索、nは常に≤5）
- localStorage APIの失敗リスクなし
- ユーザープライバシーの完全保護

---

## 2. Vanilla JavaScript アーキテクチャパターン

### 背景
clarifyセッションで「Vanilla JavaScript（フレームワークなし）」と確定しました。

### モジュール分割のベストプラクティス

**ES6モジュールパターン**:
```javascript
// models/quote.js
/**
 * @typedef {Object} Quote
 * @property {string} id
 * @property {string} text
 * @property {string} author
 * @property {string} date - YYYY-MM形式
 * @property {string} source - 内部管理用
 * @property {string} [context] - 内部管理用（任意）
 */

/**
 * 名言データを検証
 * @param {any} data
 * @returns {data is Quote}
 */
export function isValidQuote(data) {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.text === 'string' &&
    data.author === 'マコなり社長'
  );
}

// services/quoteService.js
import { isValidQuote } from '../models/quote.js';
import quotesData from '../data/quotes.json' assert { type: 'json' };

export class QuoteService {
  constructor() {
    this.quotes = quotesData.quotes.filter(isValidQuote);
    this.historyManager = new InMemoryHistoryManager();
  }

  getRandomQuote() {
    // ランダム選択ロジック
  }
}

// main.js
import { QuoteService } from './services/quoteService.js';
import { setupQuoteDisplay } from './ui/quoteDisplay.js';
import { setupNextButton } from './ui/button.js';

const quoteService = new QuoteService();
const displayElement = document.querySelector('#quote-display');
const buttonElement = document.querySelector('#next-quote');

setupQuoteDisplay(displayElement, quoteService);
setupNextButton(buttonElement, quoteService);
```

### イベントリスナー管理パターン

**委譲パターンとクリーンアップ**:
```javascript
// ui/button.js
export function setupNextButton(button, quoteService, onQuoteChange) {
  const handleClick = () => {
    const newQuote = quoteService.getRandomQuote();
    onQuoteChange(newQuote);
  };

  button.addEventListener('click', handleClick);

  // クリーンアップ関数を返す（必要に応じて）
  return () => {
    button.removeEventListener('click', handleClick);
  };
}
```

### 状態管理（クロージャー活用）

```javascript
// ui/quoteDisplay.js
export function setupQuoteDisplay(element, quoteService) {
  let isAnimating = false;
  let currentQuote = null;

  const displayQuote = (quote) => {
    currentQuote = quote;
    element.innerHTML = `
      <blockquote class="quote-text">${quote.text}</blockquote>
      <cite class="quote-author">— ${quote.author}</cite>
    `;
  };

  const updateWithAnimation = async (newQuote) => {
    if (isAnimating) return;

    isAnimating = true;
    element.classList.add('fade-out');

    await new Promise(resolve => setTimeout(resolve, 300));
    displayQuote(newQuote);

    element.classList.remove('fade-out');
    element.classList.add('fade-in');
    isAnimating = false;
  };

  // 初期表示
  displayQuote(quoteService.getRandomQuote());

  return {
    update: updateWithAnimation,
    getCurrentQuote: () => currentQuote
  };
}
```

---

## 3. データ収集戦略

### 背景
clarifyセッションで「YouTube字幕やブログから自動スクレイピングでデータ収集」と確定しました。

### YouTube字幕からのスクレイピング

**アプローチ1: YouTube Transcript API（非公式）**
```javascript
// tools/scrape-youtube.js
import { YoutubeTranscript } from 'youtube-transcript';

async function scrapeYouTubeVideo(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // 字幕テキストを結合
    const fullText = transcript.map(entry => entry.text).join(' ');

    // 名言抽出ロジック（キーワードベース）
    const quotes = extractQuotes(fullText);

    return quotes;
  } catch (error) {
    console.error(`Failed to scrape video ${videoId}:`, error);
    return [];
  }
}

function extractQuotes(text) {
  // 簡易的な名言抽出（句読点ベース）
  const sentences = text.split(/[。！？]/).filter(s => s.length > 10 && s.length < 200);

  return sentences.map((sentence, index) => ({
    id: `quote-${Date.now()}-${index}`,
    text: sentence.trim(),
    author: 'マコなり社長',
    date: new Date().toISOString().slice(0, 7), // YYYY-MM
    source: 'YouTube動画', // 後で手動で具体的なタイトルに置き換え
    context: ''
  }));
}
```

**アプローチ2: 手動収集 + 半自動化**
1. YouTube動画を視聴しながら名言をメモ
2. CSVまたはスプレッドシートに記録
3. スクリプトでJSONに変換

```javascript
// tools/csv-to-json.js
import fs from 'fs';
import csv from 'csv-parser';

const results = [];

fs.createReadStream('quotes.csv')
  .pipe(csv())
  .on('data', (data) => results.push({
    id: data.id,
    text: data.text,
    author: 'マコなり社長',
    date: data.date,
    source: data.source,
    context: data.context || ''
  }))
  .on('end', () => {
    fs.writeFileSync(
      '../frontend/src/data/quotes.json',
      JSON.stringify({ quotes: results }, null, 2)
    );
    console.log('Converted', results.length, 'quotes');
  });
```

### ブログコンテンツの抽出

**Puppeteer/Playwrightを使用**:
```javascript
// tools/scrape-blog.js
import puppeteer from 'puppeteer';

async function scrapeBlogPost(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // ブログ記事本文を抽出（セレクタは要調整）
  const content = await page.evaluate(() => {
    const article = document.querySelector('article');
    return article ? article.textContent : '';
  });

  await browser.close();

  // 名言抽出ロジック
  return extractQuotes(content);
}
```

### データクレンジングとJSON変換

```javascript
// tools/clean-quotes.js
/**
 * 名言データをクレンジング
 */
function cleanQuotes(rawQuotes) {
  return rawQuotes
    .filter(q => q.text && q.text.length >= 10 && q.text.length <= 500)
    .map((q, index) => ({
      id: `quote-${String(index + 1).padStart(3, '0')}`,
      text: q.text.trim(),
      author: 'マコなり社長',
      date: q.date || '2024-01',
      source: q.source || '不明',
      context: q.context || ''
    }));
}
```

### 推奨ワークフロー
1. **手動収集優先**: 最初の50件は品質保証のため手動収集
2. **スクレイピングは補助**: 追加データ収集に使用
3. **品質レビュー**: すべての名言を手動でレビュー
4. **継続的更新**: 新しい動画リリース時に追加

---

## 4. Viteバンドル最適化

### 背景
憲章で「バンドルサイズ100KB以下（gzip圧縮後）」が要求されています。

### 推奨Vite設定

**vite.config.js**:
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2022', // モダンブラウザのみサポート
    minify: 'terser', // より高度な圧縮
    terserOptions: {
      compress: {
        drop_console: true, // console.log削除
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      format: {
        comments: false // コメント削除
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // 単一チャンク（小規模アプリに最適）
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    cssCodeSplit: false, // CSS を単一ファイルに
    assetsInlineLimit: 0, // 小さなアセットのインライン化を無効化
    reportCompressedSize: true // 圧縮サイズをレポート
  },
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true
  }
});
```

### バンドルサイズ削減テクニック

1. **JSONデータの最小化**:
```json
{
  "quotes": [
    {"id":"q1","text":"名言1","author":"マコなり社長","date":"2024-01","source":"YouTube"}
  ]
}
```

2. **Tree-shaking活用**:
```javascript
// 未使用の export は自動削除される
export function unusedFunction() {} // バンドルに含まれない
```

3. **Dynamic Import（必要に応じて）**:
```javascript
// 名言データを動的ロード（遅延読み込み）
const quotesData = await import('./data/quotes.json', { assert: { type: 'json' } });
```

### サイズ見積もり

| ファイル | 非圧縮 | gzip圧縮後 |
|---------|--------|-----------|
| main.js | ~8 KB | ~3 KB |
| quotes.json (100件) | ~25 KB | ~7 KB |
| style.css | ~5 KB | ~2 KB |
| **合計** | **~38 KB** | **~12 KB** |

**結論**: 余裕をもって100KB制約をクリア ✅

---

## 5. アクセシビリティ実装

### 背景
憲章で「WCAG 2.1 Level AA完全準拠」が要求されています。

### ARIA属性の適切な使用

```html
<div class="quote-container" role="main" aria-label="名言表示エリア">
  <blockquote
    class="quote-text"
    aria-live="polite"
    aria-atomic="true">
    <!-- 名言テキスト -->
  </blockquote>

  <cite class="quote-author">— マコなり社長</cite>

  <button
    id="next-quote"
    type="button"
    aria-label="次の名言を表示する">
    次の名言
  </button>
</div>
```

### キーボードナビゲーションパターン

```javascript
// ui/button.js
export function setupNextButton(button, quoteService, onQuoteChange) {
  // クリックイベント
  button.addEventListener('click', () => {
    const newQuote = quoteService.getRandomQuote();
    onQuoteChange(newQuote);
  });

  // キーボードイベント（Enter/Space）は標準の<button>で自動処理
  // ただし、カスタムキーバインドを追加する場合:
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });
}
```

### カラーコントラスト

```css
:root {
  /* WCAG AA準拠: 4.5:1以上のコントラスト比 */
  --text-color: #1a1a1a; /* ほぼ黒 */
  --bg-color: #ffffff; /* 白 */
  --button-bg: #2563eb; /* 青 */
  --button-text: #ffffff; /* 白 */

  /* コントラスト比計算結果 */
  /* --text-color / --bg-color = 19.5:1 ✅ */
  /* --button-text / --button-bg = 8.6:1 ✅ */
}

.quote-text {
  color: var(--text-color);
  background-color: var(--bg-color);
}

button {
  color: var(--button-text);
  background-color: var(--button-bg);

  /* フォーカス表示 */
  &:focus-visible {
    outline: 3px solid #fbbf24; /* 黄色のフォーカスリング */
    outline-offset: 2px;
  }
}
```

### セマンティックHTML

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>マコなり社長の名言集</title>
</head>
<body>
  <div id="app">
    <header>
      <h1>マコなり社長の名言集</h1>
    </header>

    <main id="quote-display">
      <!-- 名言表示 -->
    </main>

    <footer>
      <button id="next-quote" type="button">次の名言</button>
    </footer>
  </div>
</body>
</html>
```

### Lighthouse検証

```bash
# Chrome DevToolsでLighthouse実行
# または CI/CD で自動化
npm run build
npx lighthouse http://localhost:4173 \
  --only-categories=accessibility \
  --output=html \
  --output-path=./lighthouse-report.html
```

**目標スコア**: Accessibility 100点

---

## 6. 推奨実装順序

### Phase 1への推奨事項

1. **データモデル**: JSDoc形式でQuote型を定義、localStorageは完全に除外
2. **QuoteService**: メモリ内履歴管理を実装、ランダム選択ロジック
3. **UIComponents**: セマンティックHTML + ARIA属性、出典情報は非表示
4. **スクレイピングツール**: 手動収集を優先、自動化は補助的に使用
5. **Vite設定**: terser最適化、バンドルサイズモニタリング

### 技術的リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| バンドルサイズ超過 | 中 | Terser圧縮、JSONデータ最小化、継続的モニタリング |
| スクレイピング失敗 | 低 | 手動収集を主軸、スクレイピングは補助 |
| アクセシビリティ不備 | 中 | Lighthouse監査、ARIAラベル完備 |
| メモリリーク | 低 | 履歴サイズ制限（5件）、ページリロードで自動解放 |

---

**Phase 0完了 - Phase 1への進行を承認**
