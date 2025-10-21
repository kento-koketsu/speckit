/**
 * マコなり社長の名言ジェネレーター - データモデル
 *
 * @module models/quote
 */

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
 * 名言データベース全体を表す型
 * @typedef {Object} QuoteData
 * @property {Quote[]} quotes - 名言の配列
 * @property {string} [version] - データベースバージョン（例: "1.0.0"）
 */

/**
 * メモリ内名言履歴を管理する型
 * @typedef {Object} QuoteHistory
 * @property {string[]} recentIds - 直近に表示された名言IDの配列（最大5件、最新が先頭）
 * @property {number} maxSize - 履歴の最大保持数（固定値: 5）
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
