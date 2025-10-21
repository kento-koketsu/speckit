# Contract: QuoteService

**作成日**: 2025-10-21
**バージョン**: 2.0.0（clarify反映版）
**目的**: 名言ロジック（ランダム選択、履歴管理）のAPI仕様（localStorage不使用、メモリ内管理）

---

## 概要

QuoteServiceは名言のランダム選択と重複防止を提供するサービスです。clarifyで確定した通り、履歴はメモリ内のみで管理し、localStorageは使用しません。

---

## API仕様

### コンストラクタ

```javascript
/**
 * QuoteServiceを初期化
 * @constructor
 * @throws {QuoteDataError} 名言データのロードまたはバリデーションに失敗した場合
 */
constructor()
```

**動作**:
1. `quotes.json`をインポート
2. データをバリデーション（`validateQuoteData`）
3. 有効な名言のみをフィルタリング
4. `InMemoryHistoryManager`を初期化

**例**:
```javascript
import { QuoteService } from './services/quoteService.js';

try {
  const quoteService = new QuoteService();
  console.log('QuoteService initialized with', quoteService.getQuoteCount(), 'quotes');
} catch (error) {
  console.error('Failed to initialize QuoteService:', error);
}
```

---

### getRandomQuote()

```javascript
/**
 * ランダムに名言を選択（直近5件は除外）
 * @returns {Quote} ランダムに選択された名言
 * @throws {Error} 利用可能な名言がない場合
 */
getRandomQuote()
```

**動作**:
1. 全名言から履歴にない名言をフィルタリング
2. フィルタ後の配列からランダムに1件選択
3. 選択した名言のIDを履歴に追加
4. 名言オブジェクトを返却

**重複防止ロジック**:
- 直近5件の名言IDを履歴から除外
- 名言総数が5件以下の場合は重複を許容
- ページリロード時に履歴リセット（localStorage不使用）

**計算量**: O(n) （n = 名言総数）

**例**:
```javascript
const quote = quoteService.getRandomQuote();
console.log(quote.text); // "行動しない人に成功はない..."
console.log(quote.author); // "マコなり社長"
```

**エラーケース**:
```javascript
// 名言データが空の場合
try {
  const quote = quoteService.getRandomQuote();
} catch (error) {
  console.error('No quotes available:', error.message);
}
```

---

### getQuoteCount()

```javascript
/**
 * 利用可能な名言の総数を取得
 * @returns {number} 名言の総数
 */
getQuoteCount()
```

**例**:
```javascript
const count = quoteService.getQuoteCount();
console.log(`Total quotes: ${count}`); // "Total quotes: 50"
```

---

### getRecentHistory()

```javascript
/**
 * 直近の名言履歴（ID）を取得
 * @returns {string[]} 直近5件の名言ID配列（最新が先頭）
 */
getRecentHistory()
```

**注意**: このメソッドは主にデバッグ用途です。UIでは使用しません。

**例**:
```javascript
const history = quoteService.getRecentHistory();
console.log(history); // ['quote-003', 'quote-001', 'quote-005']
```

---

## 実装例

```javascript
// services/quoteService.js
import { isValidQuote, validateQuoteData, QuoteDataError } from '../models/quote.js';
import { InMemoryHistoryManager } from '../models/quote.js';
import quotesData from '../data/quotes.json' assert { type: 'json' };

/**
 * 名言サービスクラス
 */
export class QuoteService {
  constructor() {
    // データバリデーション
    try {
      validateQuoteData(quotesData);
    } catch (error) {
      throw new QuoteDataError('Invalid quote data', error);
    }

    // 有効な名言のみフィルタ
    /** @type {Quote[]} */
    this.quotes = quotesData.quotes.filter(isValidQuote);

    if (this.quotes.length === 0) {
      throw new QuoteDataError('No valid quotes found');
    }

    // メモリ内履歴管理（localStorage不使用）
    /** @type {InMemoryHistoryManager} */
    this.historyManager = new InMemoryHistoryManager();
  }

  /**
   * ランダムに名言を選択（直近5件は除外）
   * @returns {Quote}
   */
  getRandomQuote() {
    // 履歴にない名言をフィルタ
    const availableQuotes = this.quotes.filter(
      q => !this.historyManager.isRecent(q.id)
    );

    // 全て履歴にある場合（名言総数≤5）は全体から選択
    const candidates = availableQuotes.length > 0
      ? availableQuotes
      : this.quotes;

    if (candidates.length === 0) {
      throw new Error('No quotes available');
    }

    // ランダム選択
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selectedQuote = candidates[randomIndex];

    // 履歴に追加
    this.historyManager.add(selectedQuote.id);

    return selectedQuote;
  }

  /**
   * 利用可能な名言の総数を取得
   * @returns {number}
   */
  getQuoteCount() {
    return this.quotes.length;
  }

  /**
   * 直近の名言履歴を取得（デバッグ用）
   * @returns {string[]}
   */
  getRecentHistory() {
    return this.historyManager.getRecent();
  }
}
```

---

## テストケース

### 1. 正常系: ランダム選択

```javascript
const quoteService = new QuoteService();

const quote1 = quoteService.getRandomQuote();
expect(quote1).toBeDefined();
expect(quote1.author).toBe('マコなり社長');

const quote2 = quoteService.getRandomQuote();
expect(quote2).toBeDefined();
expect(quote2.id).not.toBe(quote1.id); // 直近は重複しない
```

### 2. 正常系: 重複防止（5件）

```javascript
const quoteService = new QuoteService();
const selectedIds = new Set();

// 5回連続で選択
for (let i = 0; i < 5; i++) {
  const quote = quoteService.getRandomQuote();
  selectedIds.add(quote.id);
}

// 5件すべてが異なることを確認（名言総数が5以上の場合）
if (quoteService.getQuoteCount() >= 5) {
  expect(selectedIds.size).toBe(5);
}
```

### 3. エッジケース: 名言総数が5件以下

```javascript
// quotes.jsonに3件しかない場合
const quoteService = new QuoteService();

// 10回選択してもエラーが発生しない
for (let i = 0; i < 10; i++) {
  const quote = quoteService.getRandomQuote();
  expect(quote).toBeDefined();
}
```

### 4. 異常系: 空のデータ

```javascript
// quotes.jsonが空の場合
expect(() => {
  new QuoteService();
}).toThrow(QuoteDataError);
```

### 5. 履歴リセット（ページリロード）

```javascript
// 最初のセッション
const quoteService1 = new QuoteService();
quoteService1.getRandomQuote();
const history1 = quoteService1.getRecentHistory();
expect(history1.length).toBe(1);

// ページリロード後（新しいインスタンス）
const quoteService2 = new QuoteService();
const history2 = quoteService2.getRecentHistory();
expect(history2.length).toBe(0); // 履歴リセット
```

---

## パフォーマンス要件

| 操作 | 目標時間 | 実測値目安 |
|------|---------|----------|
| `constructor()` | < 10ms | ~5ms (100件) |
| `getRandomQuote()` | < 50ms | ~1ms (100件) |
| `getQuoteCount()` | < 1ms | ~0.1ms |
| `getRecentHistory()` | < 1ms | ~0.1ms |

**憲章要件**: 名言生成レスポンス50ms以内 ✅

---

## エラーハンドリング

### QuoteDataError

```javascript
export class QuoteDataError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'QuoteDataError';
    this.cause = cause;
  }
}
```

**発生条件**:
- `quotes.json`のロード失敗
- バリデーション失敗
- 有効な名言が0件

---

## 依存関係

```
QuoteService
├── models/quote.js
│   ├── isValidQuote()
│   ├── validateQuoteData()
│   ├── QuoteDataError
│   └── InMemoryHistoryManager
└── data/quotes.json
```

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-14 | 初版（TypeScript、StorageService使用） |
| 2.0.0 | 2025-10-21 | clarify反映版（Vanilla JS、localStorage削除） |

---

**Contract: QuoteService完了**
