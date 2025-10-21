# データモデル: マコなり社長の名言ジェネレーター

**作成日**: 2025-10-21
**Phase**: 1 - 設計アーティファクト生成
**目的**: clarifyで確定した技術決定（Vanilla JS、localStorage不使用、出典非表示）に基づくデータ型定義

---

## 1. JSDoc型定義

### 1.1 Quote（名言）

名言の基本データ構造です。UIでは著者名のみを表示し、出典情報は内部管理用として保持します。

```javascript
/**
 * 名言データを表す型
 * @typedef {Object} Quote
 * @property {string} id - 名言の一意識別子（例: "quote-001"）
 * @property {string} text - 名言本文（1〜500文字）
 * @property {string} author - 著者名（固定値: "マコなり社長"）
 * @property {string} date - 発言日（YYYY-MM形式、内部管理用）
 * @property {string} source - 出典情報（内部管理用、UI非表示）
 * @property {string} [context] - 発言の背景情報（任意、内部管理用）
 */

/**
 * 名言データを検証する
 * @param {any} data - 検証対象データ
 * @returns {boolean} 有効なQuote型の場合true
 */
export function isValidQuote(data) {
  return (
    data &&
    typeof data.id === 'string' &&
    data.id.length > 0 &&
    typeof data.text === 'string' &&
    data.text.length >= 1 &&
    data.text.length <= 500 &&
    data.author === 'マコなり社長' &&
    typeof data.date === 'string' &&
    /^\d{4}-\d{2}$/.test(data.date) &&
    typeof data.source === 'string' &&
    data.source.length > 0 &&
    (data.context === undefined || typeof data.context === 'string')
  );
}
```

### 1.2 QuoteData（名言データベース）

複数の名言を格納するコレクション型です。

```javascript
/**
 * 名言データベース全体を表す型
 * @typedef {Object} QuoteData
 * @property {Quote[]} quotes - 名言の配列
 * @property {string} [version] - データベースバージョン（例: "1.0.0"）
 */

/**
 * QuoteDataを検証する
 * @param {any} data - 検証対象データ
 * @returns {boolean} 有効なQuoteData型の場合true
 * @throws {Error} バリデーション失敗時
 */
export function validateQuoteData(data) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Quote data must be an object');
  }

  if (!Array.isArray(data.quotes)) {
    throw new Error('Quote data must have a "quotes" array');
  }

  if (data.quotes.length === 0) {
    throw new Error('Quote data must have at least one quote');
  }

  for (let i = 0; i < data.quotes.length; i++) {
    if (!isValidQuote(data.quotes[i])) {
      throw new Error(`Invalid quote at index ${i}`);
    }
  }

  // IDの一意性チェック
  const ids = data.quotes.map(q => q.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    throw new Error('Duplicate quote IDs found');
  }

  return true;
}
```

### 1.3 QuoteHistory（履歴管理）

**重要**: clarifyで確定した通り、履歴はメモリ内のみで管理します（localStorage不使用）。ページリロード時に履歴はリセットされます。

```javascript
/**
 * メモリ内名言履歴を管理する型
 * @typedef {Object} QuoteHistory
 * @property {string[]} recentIds - 直近に表示された名言IDの配列（最大5件、最新が先頭）
 * @property {number} maxSize - 履歴の最大保持数（固定値: 5）
 */

/**
 * メモリ内履歴管理クラス
 * localStorage不使用、ページリロード時にリセット
 */
export class InMemoryHistoryManager {
  constructor() {
    /** @type {string[]} */
    this.recentIds = [];

    /** @type {number} */
    this.maxSize = 5;
  }

  /**
   * 名言IDが直近履歴に含まれているかチェック
   * @param {string} quoteId - チェックする名言ID
   * @returns {boolean} 履歴に含まれている場合true
   */
  isRecent(quoteId) {
    return this.recentIds.includes(quoteId);
  }

  /**
   * 名言IDを履歴に追加
   * @param {string} quoteId - 追加する名言ID
   */
  add(quoteId) {
    this.recentIds = [quoteId, ...this.recentIds].slice(0, this.maxSize);
  }

  /**
   * 履歴をクリア
   */
  clear() {
    this.recentIds = [];
  }

  /**
   * 現在の履歴を取得
   * @returns {string[]} 直近の名言ID配列
   */
  getRecent() {
    return [...this.recentIds];
  }
}
```

---

## 2. JSONスキーマ

### 2.1 quotes.json スキーマ

名言データファイルの構造です。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Quote Data",
  "description": "マコなり社長の名言データベース",
  "type": "object",
  "required": ["quotes"],
  "properties": {
    "version": {
      "type": "string",
      "description": "データベースバージョン",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "example": "1.0.0"
    },
    "quotes": {
      "type": "array",
      "description": "名言の配列",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "text", "author", "date", "source"],
        "properties": {
          "id": {
            "type": "string",
            "description": "名言の一意識別子",
            "pattern": "^quote-\\d{3}$",
            "example": "quote-001"
          },
          "text": {
            "type": "string",
            "description": "名言本文",
            "minLength": 1,
            "maxLength": 500,
            "example": "行動しない人に成功はない。"
          },
          "author": {
            "type": "string",
            "description": "著者名",
            "const": "マコなり社長"
          },
          "date": {
            "type": "string",
            "description": "発言日（YYYY-MM形式、内部管理用）",
            "pattern": "^\\d{4}-\\d{2}$",
            "example": "2024-01"
          },
          "source": {
            "type": "string",
            "description": "出典情報（内部管理用、UI非表示）",
            "minLength": 1,
            "example": "YouTube: ビジネスで成功する秘訣"
          },
          "context": {
            "type": "string",
            "description": "発言の背景情報（任意、内部管理用）",
            "example": "起業初期の心構えについて"
          }
        }
      }
    }
  }
}
```

### 2.2 サンプルデータ

```json
{
  "version": "1.0.0",
  "quotes": [
    {
      "id": "quote-001",
      "text": "行動しない人に成功はない。小さくてもいいから、今日から動き出そう。",
      "author": "マコなり社長",
      "date": "2024-01",
      "source": "YouTube: ビジネスで成功する秘訣",
      "context": "起業初期の心構えについて"
    },
    {
      "id": "quote-002",
      "text": "失敗を恐れるな。失敗は成功への最短ルートだ。",
      "author": "マコなり社長",
      "date": "2024-02",
      "source": "YouTube: 失敗から学ぶ方法"
    },
    {
      "id": "quote-003",
      "text": "時間は誰にも平等。使い方で人生が変わる。",
      "author": "マコなり社長",
      "date": "2024-03",
      "source": "YouTube: 時間管理の極意",
      "context": "生産性向上のテクニックについて"
    }
  ]
}
```

---

## 3. データフロー図

```
┌─────────────────┐
│  quotes.json    │ (静的JSONファイル)
└────────┬────────┘
         │
         │ ビルド時にViteがバンドル
         ↓
┌─────────────────────────┐
│  QuoteService           │ (ビジネスロジック)
│  - quotes[]             │
│  - InMemoryHistory      │ ← localStorage不使用
└────────┬────────────────┘
         │
         │ getRandomQuote()
         │ 重複チェック（メモリ内）
         ↓
┌─────────────────────────┐
│ setupQuoteDisplay()     │ (UI表示制御)
│ - 著者名のみ表示        │ ← 出典情報は非表示
│ - アニメーション        │
└─────────────────────────┘
         │
         │ ページリロード時
         ↓
     履歴リセット
   （localStorage不使用）
```

---

## 4. メモリ管理

### 4.1 履歴データのライフサイクル

```javascript
// アプリケーション起動時
const historyManager = new InMemoryHistoryManager();

// 名言表示時に履歴追加
historyManager.add('quote-001');
historyManager.add('quote-002');
// => recentIds: ['quote-002', 'quote-001']

// 重複チェック
historyManager.isRecent('quote-001'); // => true
historyManager.isRecent('quote-999'); // => false

// ページリロード時
// => historyManager は破棄され、新しいインスタンスが生成
// => recentIds: [] （履歴リセット）
```

### 4.2 メモリリーク防止

- **履歴サイズ制限**: 最大5件で自動切り詰め
- **グローバル単一インスタンス**: メモリ使用量一定
- **ページリロード時の自動解放**: ブラウザがメモリ管理

---

## 5. データサイズ見積もり

### 5.1 名言1件あたりのサイズ

```
{
  "id": "quote-001",                    // ~15 bytes
  "text": "行動しない人に成功はない...",  // ~50-200 bytes (平均100)
  "author": "マコなり社長",               // ~20 bytes
  "date": "2024-01",                     // ~10 bytes
  "source": "YouTube: ...",              // ~30-100 bytes (平均50)
  "context": "..."                       // ~30-100 bytes (平均50, 任意)
}
```

**平均サイズ**: 約245 bytes/件

### 5.2 100件の名言データサイズ

- 非圧縮: 245 bytes × 100 = 24.5 KB
- gzip圧縮後: 約6〜8 KB（圧縮率70%）

**結論**: 憲章の制約（バンドル100KB以下）を大幅に下回り、問題なし ✅

---

## 6. エラーハンドリング

### 6.1 データロードエラー

```javascript
/**
 * 名言データロードエラー
 */
export class QuoteDataError extends Error {
  /**
   * @param {string} message - エラーメッセージ
   * @param {unknown} [cause] - 元のエラー
   */
  constructor(message, cause) {
    super(message);
    this.name = 'QuoteDataError';
    this.cause = cause;
  }
}

// 使用例
try {
  const data = await import('./data/quotes.json', { assert: { type: 'json' } });
  validateQuoteData(data);
} catch (error) {
  throw new QuoteDataError('Failed to load quote data', error);
}
```

### 6.2 バリデーションエラー

```javascript
/**
 * 名言データバリデーションエラー
 */
export class ValidationError extends Error {
  /**
   * @param {string} field - エラーフィールド
   * @param {string} message - エラーメッセージ
   */
  constructor(field, message) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// 使用例
if (!isValidQuote(quote)) {
  throw new ValidationError('quote', 'Invalid quote format');
}
```

---

## 7. データ更新プロセス

### 7.1 新しい名言の追加

1. `frontend/src/data/quotes.json` を編集
2. 新しい名言オブジェクトを `quotes` 配列に追加
3. IDは連番（`quote-XXX` 形式）
4. バリデーション実行（開発中）:
   ```javascript
   import { validateQuoteData } from './models/quote.js';
   import quotesData from './data/quotes.json' assert { type: 'json' };

   validateQuoteData(quotesData); // エラーがあればthrow
   ```
5. ビルド: `npm run build`
6. デプロイ

### 7.2 データバージョニング

- `version` フィールドでデータベースバージョンを管理
- セマンティックバージョニング（例: "1.0.0" → "1.1.0"）
- 名言追加: MINOR バージョンアップ
- スキーマ変更: MAJOR バージョンアップ

---

## 8. UI表示仕様

### 8.1 表示する情報（clarify確定）

**表示される**:
- ✅ `quote.text` - 名言本文
- ✅ `quote.author` - 著者名「マコなり社長」

**表示されない**:
- ❌ `quote.date` - 日付（内部管理用）
- ❌ `quote.source` - 出典（内部管理用）
- ❌ `quote.context` - 背景情報（内部管理用）

### 8.2 表示例

```html
<blockquote class="quote-text">
  行動しない人に成功はない。小さくてもいいから、今日から動き出そう。
</blockquote>
<cite class="quote-author">— マコなり社長</cite>
```

---

## 9. データモデルのバージョン管理

**現在のバージョン**: 2.0.0（clarify反映版）

### 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-14 | 初版データモデル定義（TypeScript、localStorage使用） |
| 2.0.0 | 2025-10-21 | clarify反映版（Vanilla JS、localStorage削除、出典非表示） |

---

**Phase 1: データモデル設計完了**
