/**
 * マコなり社長の名言ジェネレーター - QuoteService
 *
 * @module services/quoteService
 */

import { isValidQuote, validateQuoteData, QuoteDataError, InMemoryHistoryManager } from '../models/quote.js';
import quotesData from '../data/quotes.json';

/**
 * 名言サービスクラス
 * ランダム選択、履歴管理、重複防止を提供
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
   * @returns {Quote} ランダムに選択された名言
   * @throws {Error} 利用可能な名言がない場合
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
   * @returns {number} 名言の総数
   */
  getQuoteCount() {
    return this.quotes.length;
  }

  /**
   * 直近の名言履歴を取得（デバッグ用）
   * @returns {string[]} 直近5件の名言ID配列（最新が先頭）
   */
  getRecentHistory() {
    return this.historyManager.getRecent();
  }
}
