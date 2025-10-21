# Contract: UIComponents

**作成日**: 2025-10-21
**バージョン**: 2.0.0（clarify反映版）
**目的**: 名言表示とボタンUIコンポーネントのインターフェース仕様（出典非表示、Vanilla JS）

---

## 概要

UIコンポーネントは名言の表示（著者名のみ）とユーザーインタラクションを担当します。clarifyで確定した通り、出典情報（日付、ソース、コンテキスト）は表示しません。

---

## 1. setupQuoteDisplay()

### 目的
名言テキストと著者名を表示し、アニメーション付きで切り替える。

### 関数定義

```javascript
/**
 * 名言表示UIをセットアップ
 * @param {HTMLElement} container - 名言を表示するコンテナ要素
 * @param {QuoteService} quoteService - 名言サービス
 * @returns {Object} 名言表示を制御する関数群
 */
export function setupQuoteDisplay(container, quoteService)
```

### 返り値

```javascript
{
  update: (quote) => Promise<void>,  // 名言を更新（アニメーション付き）
  getCurrentQuote: () => Quote | null // 現在の名言を取得
}
```

### 表示内容（clarify確定）

**表示される**:
- ✅ `quote.text` - 名言本文
- ✅ `quote.author` - 著者名「マコなり社長」

**表示されない**:
- ❌ `quote.date` - 日付
- ❌ `quote.source` - 出典
- ❌ `quote.context` - 背景情報

### HTML構造

```html
<div id="quote-display" role="main" aria-label="名言表示エリア">
  <blockquote class="quote-text" aria-live="polite" aria-atomic="true">
    行動しない人に成功はない。小さくてもいいから、今日から動き出そう。
  </blockquote>
  <cite class="quote-author">— マコなり社長</cite>
</div>
```

### 実装例

```javascript
// ui/quoteDisplay.js
export function setupQuoteDisplay(container, quoteService) {
  let currentQuote = null;
  let isAnimating = false;

  const displayQuote = (quote) => {
    currentQuote = quote;
    container.innerHTML = `
      <blockquote class="quote-text" aria-live="polite" aria-atomic="true">
        ${quote.text}
      </blockquote>
      <cite class="quote-author">— ${quote.author}</cite>
    `;
  };

  const updateWithAnimation = async (newQuote) => {
    if (isAnimating) return;

    isAnimating = true;
    container.classList.add('fade-out');

    await new Promise(resolve => setTimeout(resolve, 300));
    displayQuote(newQuote);

    container.classList.remove('fade-out');
    container.classList.add('fade-in');

    setTimeout(() => {
      container.classList.remove('fade-in');
      isAnimating = false;
    }, 300);
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

## 2. setupNextButton()

### 目的
「次の名言」ボタンのクリック/キーボードイベントを処理する。

### 関数定義

```javascript
/**
 * 「次の名言」ボタンをセットアップ
 * @param {HTMLButtonElement} button - ボタン要素
 * @param {QuoteService} quoteService - 名言サービス
 * @param {Function} onQuoteChange - 名言変更時のコールバック
 */
export function setupNextButton(button, quoteService, onQuoteChange)
```

### HTML構造

```html
<button
  id="next-quote"
  type="button"
  aria-label="次の名言を表示する">
  次の名言
</button>
```

### 実装例

```javascript
// ui/button.js
export function setupNextButton(button, quoteService, onQuoteChange) {
  button.addEventListener('click', () => {
    const newQuote = quoteService.getRandomQuote();
    onQuoteChange(newQuote);
  });

  // キーボードナビゲーション（Enter/Spaceは<button>で自動対応）
}
```

---

## CSS仕様

### アニメーション

```css
.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.fade-in {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}
```

### アクセシビリティ

```css
button:focus-visible {
  outline: 3px solid #fbbf24;
  outline-offset: 2px;
}

/* カラーコントラスト: WCAG AA準拠（4.5:1以上） */
.quote-text {
  color: #1a1a1a; /* 黒 */
  background-color: #ffffff; /* 白 */
}
```

---

## アクセシビリティ要件

- ✅ ARIA属性（`aria-live`, `aria-label`）
- ✅ セマンティックHTML（`<blockquote>`, `<cite>`, `<button>`）
- ✅ キーボードナビゲーション対応
- ✅ カラーコントラスト4.5:1以上
- ✅ タッチターゲット44x44px以上

---

## パフォーマンス要件

| 操作 | 目標時間 |
|------|---------|
| 初期表示 | < 100ms |
| 名言切り替え | < 100ms（体感） |
| アニメーション | 300ms（固定） |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-14 | 初版（TypeScript、出典表示あり） |
| 2.0.0 | 2025-10-21 | clarify反映版（Vanilla JS、出典非表示） |

---

**Contract: UIComponents完了**
