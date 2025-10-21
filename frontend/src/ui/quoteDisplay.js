/**
 * マコなり社長の名言ジェネレーター - 名言表示UI
 *
 * @module ui/quoteDisplay
 */

/**
 * 名言表示UIをセットアップ
 * @param {HTMLElement} container - 名言を表示するコンテナ要素
 * @param {QuoteService} quoteService - 名言サービス
 * @returns {Object} 名言表示を制御する関数群
 */
export function setupQuoteDisplay(container, quoteService) {
  let currentQuote = null;
  let isAnimating = false;

  /**
   * 名言を表示
   * @param {Quote} quote - 表示する名言
   */
  const displayQuote = (quote) => {
    currentQuote = quote;
    container.innerHTML = `
      <blockquote class="quote-text" aria-live="polite" aria-atomic="true">
        ${quote.text}
      </blockquote>
      <cite class="quote-author">— ${quote.author}</cite>
    `;
  };

  /**
   * アニメーション付きで名言を更新
   * @param {Quote} newQuote - 新しい名言
   * @returns {Promise<void>}
   */
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
  try {
    const initialQuote = quoteService.getRandomQuote();
    displayQuote(initialQuote);
  } catch (error) {
    console.error('Failed to display initial quote:', error);
    container.innerHTML = `
      <p style="color: #ef4444;">名言の読み込みに失敗しました。</p>
    `;
  }

  return {
    update: updateWithAnimation,
    getCurrentQuote: () => currentQuote
  };
}
