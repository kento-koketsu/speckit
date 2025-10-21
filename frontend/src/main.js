/**
 * マコなり社長の名言ジェネレーター - メインエントリーポイント
 *
 * @module main
 */

import './style.css';
import { QuoteService } from './services/quoteService.js';
import { setupQuoteDisplay } from './ui/quoteDisplay.js';
import { setupNextButton } from './ui/button.js';

/**
 * アプリケーション初期化
 */
function initApp() {
  try {
    // QuoteServiceインスタンス化
    const quoteService = new QuoteService();
    console.log(`Loaded ${quoteService.getQuoteCount()} quotes`);

    // DOM要素取得
    const displayElement = document.querySelector('#quote-display');
    const buttonElement = document.querySelector('#next-quote');

    if (!displayElement || !buttonElement) {
      throw new Error('Required DOM elements not found');
    }

    // 名言表示UIセットアップ
    const quoteDisplay = setupQuoteDisplay(displayElement, quoteService);

    // ボタンUIセットアップ
    setupNextButton(buttonElement, quoteService, (newQuote) => {
      quoteDisplay.update(newQuote);
    });

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);

    // エラー表示
    const appElement = document.querySelector('#app');
    if (appElement) {
      appElement.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">エラーが発生しました</h1>
          <p style="color: #6b7280;">アプリケーションの初期化に失敗しました。</p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
            ${error.message}
          </p>
        </div>
      `;
    }
  }
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
