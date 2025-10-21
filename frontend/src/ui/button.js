/**
 * マコなり社長の名言ジェネレーター - ボタンUI
 *
 * @module ui/button
 */

/**
 * 「次の名言」ボタンをセットアップ
 * @param {HTMLButtonElement} button - ボタン要素
 * @param {QuoteService} quoteService - 名言サービス
 * @param {Function} onQuoteChange - 名言変更時のコールバック
 * @returns {Function} クリーンアップ関数
 */
export function setupNextButton(button, quoteService, onQuoteChange) {
  const handleClick = () => {
    try {
      const newQuote = quoteService.getRandomQuote();
      onQuoteChange(newQuote);
    } catch (error) {
      console.error('Failed to get next quote:', error);
    }
  };

  button.addEventListener('click', handleClick);

  // キーボードナビゲーション（Enter/Spaceは<button>で自動対応）
  // 追加のキーボードサポートが必要な場合はここに実装

  // クリーンアップ関数を返す
  return () => {
    button.removeEventListener('click', handleClick);
  };
}
