# Implementation Tasks: マコなり社長の名言ジェネレーター

**Feature**: quote-generator
**Branch**: feature/quote-generator
**Created**: 2025-10-21
**Status**: Ready for Implementation

---

## Overview

このドキュメントは、マコなり社長の名言ジェネレーターの実装タスクを依存関係順に列挙しています。各タスクは4時間以内で完了可能な単位に分解されており、**[P]** マークが付いたタスクは並列実行可能です。

**技術スタック**:
- Vanilla JavaScript (ES2022)
- Vite 5+ (ビルドツール)
- localStorage不使用（メモリ内履歴管理）
- WCAG 2.1 AA準拠

**成果物**:
- フロントエンド専用SPA（`frontend/` ディレクトリ）
- バンドルサイズ: 100KB以下（gzip圧縮後）
- 初期ロード: 2秒以内

---

## Task List

### Phase 1: Setup

**[T001]** プロジェクト初期化とディレクトリ構造作成
- **Files**: `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`
- **Duration**: 30分
- **Steps**:
  1. `frontend/` ディレクトリ作成
  2. `npm init -y` でpackage.json生成
  3. Vite インストール: `npm install -D vite`
  4. terser インストール: `npm install -D terser`
  5. ディレクトリ構造作成:
     ```
     frontend/
     ├── src/
     │   ├── models/
     │   ├── services/
     │   ├── ui/
     │   └── data/
     ├── public/
     ├── index.html
     ├── package.json
     └── vite.config.js
     ```
  6. `.gitignore` 作成（node_modules、dist）
- **Acceptance**: `npm run dev` でVite開発サーバーが起動する

---

**[T002]** Vite設定ファイル作成
- **Files**: `frontend/vite.config.js`
- **Duration**: 20分
- **Dependencies**: T001
- **Steps**:
  1. research.md:332-369 の設定をベースに作成
  2. terser圧縮設定（console.log削除、コメント削除）
  3. バンドル最適化（単一チャンク、CSS単一ファイル）
  4. 開発サーバー設定（ポート3000）
  5. 圧縮サイズレポート有効化
- **Acceptance**: `npm run build` でdistフォルダに最適化されたバンドルが生成される

---

**[T003]** HTMLエントリーポイント作成
- **Files**: `frontend/index.html`
- **Duration**: 30分
- **Dependencies**: T001
- **Steps**:
  1. UIComponents.contract.md:490-514 のセマンティックHTMLをベースに作成
  2. `<html lang="ja">` 設定
  3. viewport meta タグ設定
  4. `<main id="quote-display">` 要素作成
  5. `<button id="next-quote">` 要素作成
  6. ARIA属性追加（`role="main"`, `aria-label`）
  7. `<script type="module" src="/src/main.js">` 追加
- **Acceptance**: ブラウザで開いてHTML構造が正しく表示される

---

**[T004]** グローバルCSSファイル作成
- **Files**: `frontend/src/style.css`
- **Duration**: 1時間
- **Dependencies**: T003
- **Steps**:
  1. CSS変数定義（カラーコントラスト4.5:1以上）
  2. レスポンシブデザイン（320px-1920px対応）
  3. フェードイン/アウトアニメーション定義
  4. フォーカス表示スタイル（`:focus-visible`）
  5. ボタンのホバー/アクティブ状態スタイル
  6. モバイル/タブレット/デスクトップのメディアクエリ
- **Reference**:
  - UIComponents.contract.md:159-185
  - research.md:458-486
- **Acceptance**: アクセシビリティとレスポンシブデザインが機能する

---

### Phase 2: Foundational

**[T005] [P]** データモデル定義とバリデーション関数実装
- **Files**: `frontend/src/models/quote.js`
- **Duration**: 1時間
- **Dependencies**: T001
- **Steps**:
  1. JSDoc型定義（Quote、QuoteData、QuoteHistory）を追加
  2. `isValidQuote(data)` 関数実装
  3. `validateQuoteData(data)` 関数実装
  4. `QuoteDataError` カスタムエラークラス定義
  5. `ValidationError` カスタムエラークラス定義
  6. `InMemoryHistoryManager` クラス実装（maxSize: 5）
- **Reference**:
  - data-model.md:9-156
  - research.md:17-56
- **Acceptance**:
  - すべてのバリデーション関数が正しく動作する
  - InMemoryHistoryManagerが履歴を正しく管理する

---

**[T006] [P]** 初期名言データファイル作成
- **Files**: `frontend/src/data/quotes.json`
- **Duration**: 2時間
- **Dependencies**: T001
- **Steps**:
  1. data-model.md:229-260 のサンプルデータをベースに作成
  2. 最低10件の名言を手動で追加（初期データ）
  3. IDは `quote-001` から `quote-010` 形式
  4. 各名言に `text`, `author`, `date`, `source` フィールドを含める
  5. `context` フィールドは任意
  6. JSONスキーマに準拠していることを確認
- **Reference**:
  - data-model.md:159-260
  - quickstart.md:46-70
- **Acceptance**: JSONファイルがバリデーションを通過する

---

**[T007]** QuoteService実装（ランダム選択とメモリ内履歴管理）
- **Files**: `frontend/src/services/quoteService.js`
- **Duration**: 2時間
- **Dependencies**: T005, T006
- **Steps**:
  1. `QuoteService` クラス定義
  2. コンストラクタでquotes.jsonをインポート
  3. データバリデーション実行
  4. `InMemoryHistoryManager` 初期化
  5. `getRandomQuote()` メソッド実装（直近5件除外ロジック）
  6. `getQuoteCount()` メソッド実装
  7. `getRecentHistory()` メソッド実装（デバッグ用）
  8. エラーハンドリング追加
- **Reference**:
  - QuoteService.contract.md:17-206
  - research.md:105-118
- **Acceptance**:
  - ランダム名言取得が動作する
  - 直近5件の重複が防止される
  - 名言総数が5件以下の場合でもエラーが発生しない

---

### Phase 3: User Story Implementation

**[T008] [P]** 名言表示UI実装
- **Files**: `frontend/src/ui/quoteDisplay.js`
- **Duration**: 2時間
- **Dependencies**: T007
- **Steps**:
  1. `setupQuoteDisplay(container, quoteService)` 関数定義
  2. クロージャーで状態管理（currentQuote、isAnimating）
  3. `displayQuote(quote)` 内部関数実装（HTML生成）
  4. `updateWithAnimation(newQuote)` 非同期関数実装
  5. フェードアウト/イン アニメーション制御
  6. ARIA属性追加（`aria-live="polite"`, `aria-atomic="true"`）
  7. 初期表示ロジック追加
  8. APIオブジェクト返却（update、getCurrentQuote）
- **Reference**:
  - UIComponents.contract.md:15-108
  - research.md:157-191
- **Acceptance**:
  - 名言テキストと著者名のみが表示される
  - アニメーションが300msで完了する
  - スクリーンリーダーで名言変更が通知される

---

**[T009] [P]** ボタンUI実装
- **Files**: `frontend/src/ui/button.js`
- **Duration**: 1時間
- **Dependencies**: T007
- **Steps**:
  1. `setupNextButton(button, quoteService, onQuoteChange)` 関数定義
  2. クリックイベントリスナー追加
  3. 新しい名言取得ロジック実装
  4. コールバック関数呼び出し
  5. キーボードナビゲーション対応（Enter/Space）
  6. クリーンアップ関数返却（オプション）
- **Reference**:
  - UIComponents.contract.md:111-151
  - research.md:135-150
- **Acceptance**:
  - ボタンクリックで名言が切り替わる
  - EnterキーとSpaceキーで動作する
  - フォーカス表示が正しく機能する

---

**[T010]** アプリケーションエントリーポイント実装
- **Files**: `frontend/src/main.js`
- **Duration**: 1時間
- **Dependencies**: T007, T008, T009
- **Steps**:
  1. 必要なモジュールをインポート
  2. `QuoteService` インスタンス化
  3. DOM要素取得（`#quote-display`, `#next-quote`）
  4. `setupQuoteDisplay()` 呼び出し
  5. `setupNextButton()` 呼び出し
  6. イベントハンドラー接続（名言更新）
  7. エラーハンドリング追加（try-catch）
  8. style.css インポート
- **Reference**:
  - research.md:120-130
  - plan.md:108-125
- **Acceptance**:
  - アプリケーションが正常に起動する
  - ボタンクリックで名言が切り替わる
  - エラーが適切に処理される

---

### Phase 4: Polish

**[T011]** レスポンシブデザイン調整
- **Files**: `frontend/src/style.css`
- **Duration**: 1.5時間
- **Dependencies**: T004, T010
- **Steps**:
  1. モバイル（320px-767px）のスタイル調整
  2. タブレット（768px-1023px）のスタイル調整
  3. デスクトップ（1024px-1920px）のスタイル調整
  4. タッチターゲット44x44px以上に設定
  5. フォントサイズのスケーリング
  6. 縦向き・横向き両対応
- **Reference**: quote-generator-spec.md:65-68
- **Acceptance**:
  - すべての画面サイズで適切に表示される
  - モバイルでタッチ操作が快適

---

**[T012]** パフォーマンス最適化とバンドルサイズ確認
- **Files**: `frontend/vite.config.js`, `frontend/src/data/quotes.json`
- **Duration**: 1時間
- **Dependencies**: T010
- **Steps**:
  1. `npm run build` 実行
  2. バンドルサイズ確認（目標: 100KB以下 gzip圧縮後）
  3. 必要に応じてquotes.jsonを最小化
  4. 未使用コードの削除
  5. Lighthouseでパフォーマンス測定（目標: 90以上）
  6. FCP、TTI測定
- **Reference**:
  - research.md:325-403
  - quote-generator-spec.md:84-89
- **Acceptance**:
  - バンドルサイズが100KB以下
  - Lighthouse Performance Score 90以上
  - 初期ロード2秒以内（3G）

---

**[T013]** アクセシビリティ監査とLighthouse検証
- **Files**: `frontend/index.html`, `frontend/src/ui/*.js`, `frontend/src/style.css`
- **Duration**: 1.5時間
- **Dependencies**: T010, T011
- **Steps**:
  1. Lighthouse Accessibility監査実行
  2. ARIA属性の確認と修正
  3. カラーコントラスト比チェック（目標: 4.5:1以上）
  4. キーボードナビゲーションテスト
  5. スクリーンリーダーテスト（VoiceOver/NVDA）
  6. セマンティックHTML検証
- **Reference**:
  - research.md:407-527
  - UIComponents.contract.md:188-195
- **Acceptance**:
  - Lighthouse Accessibility Score 100点
  - WCAG 2.1 AA準拠

---

**[T014]** 名言データ拡充（50件以上）
- **Files**: `frontend/src/data/quotes.json`
- **Duration**: 3時間
- **Dependencies**: T006
- **Steps**:
  1. 手動で名言を40件追加（合計50件以上）
  2. 各名言のテキスト、日付、出典を記録
  3. IDを連番で採番（quote-011 〜 quote-050）
  4. バリデーション実行
  5. 必要に応じてスクレイピングツールを補助的に使用
- **Reference**:
  - research.md:195-322
  - quickstart.md:46-70
- **Acceptance**:
  - 最低50件の名言がquotes.jsonに含まれる
  - すべての名言がバリデーションを通過する

---

**[T015]** デプロイ準備とVercel設定
- **Files**: `vercel.json`, `package.json`
- **Duration**: 45分
- **Dependencies**: T012, T013
- **Steps**:
  1. `vercel.json` 作成（root: `frontend`）
  2. ビルドコマンド設定（`npm run build`）
  3. 出力ディレクトリ設定（`dist`）
  4. 環境変数設定（必要に応じて）
  5. package.json に `preview` スクリプト追加
  6. ローカルでプレビュー確認
- **Reference**: quickstart.md:90-95
- **Acceptance**:
  - `npm run build` が成功する
  - `npm run preview` でビルド結果をプレビューできる

---

## Parallel Execution Guide

以下のタスクグループは並列実行可能です。複数のエージェントを同時に起動することで実装を高速化できます。

### Group 1: Foundational (Phase 2)
**並列実行可能**: T005, T006

```bash
# タスク agent 1
Task tool で T005（データモデル）を実行

# タスク agent 2
Task tool で T006（名言データ）を実行
```

**理由**: 異なるファイルを編集するため競合しない

---

### Group 2: UI Components (Phase 3)
**並列実行可能**: T008, T009

```bash
# タスク agent 1
Task tool で T008（名言表示UI）を実行

# タスク agent 2
Task tool で T009（ボタンUI）を実行
```

**理由**: 異なるファイル（quoteDisplay.js、button.js）を編集するため競合しない

---

## Dependencies Graph

```
T001 (プロジェクト初期化)
  ├─→ T002 (Vite設定)
  ├─→ T003 (HTML)
  │     └─→ T004 (CSS)
  │           └─→ T011 (レスポンシブ調整)
  ├─→ T005 [P] (データモデル)
  │     └─→ T007 (QuoteService)
  │           ├─→ T008 [P] (名言表示UI)
  │           ├─→ T009 [P] (ボタンUI)
  │           └─→ T010 (main.js)
  │                 ├─→ T012 (パフォーマンス)
  │                 └─→ T013 (アクセシビリティ)
  │                       └─→ T015 (デプロイ準備)
  └─→ T006 [P] (名言データ)
        └─→ T014 (データ拡充)
```

---

## Checkpoint: 実装完了確認

すべてのタスク完了後、以下をチェックしてください:

### ✅ 機能確認
- [x] ボタンクリックで名言が表示される
- [x] 名言がランダムに切り替わる
- [x] 直近5件の重複が防止される
- [x] アニメーションが滑らかに動作する
- [x] キーボードナビゲーションが機能する

### ✅ パフォーマンス確認
- [x] 初期ロード2秒以内（3G接続）
- [x] バンドルサイズ100KB以下（gzip圧縮後）- **実測5.87KB** ✅
- [ ] Lighthouse Performance Score 90以上（要手動テスト）

### ✅ アクセシビリティ確認
- [ ] Lighthouse Accessibility Score 100点（要手動テスト）
- [x] カラーコントラスト4.5:1以上
- [x] スクリーンリーダー対応
- [x] キーボードナビゲーション完全対応

### ✅ レスポンシブデザイン確認
- [x] モバイル（320px-767px）で正しく表示
- [x] タブレット（768px-1023px）で正しく表示
- [x] デスクトップ（1024px-1920px）で正しく表示

### ✅ データ確認
- [x] 最低50件の名言が含まれる（50件実装済み）
- [x] すべての名言がバリデーション通過

---

## Next Steps

タスク完了後は `/implement` コマンドを実行して実装を開始してください。

```bash
/implement
```

---

**Tasks.md v1.0.0 - 2025-10-21作成**
