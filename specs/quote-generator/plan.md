# Implementation Plan: マコなり社長の名言・格言ジェネレーター

**Branch**: `feature/quote-generator` | **Date**: 2025-10-21 | **Spec**: [quote-generator-spec.md](../quote-generator-spec.md)
**Input**: Feature specification from `/specs/quote-generator-spec.md`

## Summary

マコなり社長の名言・格言ジェネレーターは、ユーザーがボタンをクリックするだけでマコなり社長の感銘的な名言をランダムに表示するシンプルなWebアプリケーションです。

**主要要件**:
- ランダム名言表示機能（直近5件の重複防止、メモリ内管理）
- ボタンクリックによる名言切り替え
- レスポンシブデザイン（320px〜1920px対応）
- アクセシビリティ完全対応（WCAG 2.1 AA準拠）
- 高速パフォーマンス（初期ロード2秒以内、バンドル100KB以下）

**技術アプローチ**:
- Vanilla JavaScriptベース（フレームワーク不使用）
- 名言データは静的JSONとしてバンドル
- CSSアニメーションによる滑らかなUI遷移
- Viteによる高速ビルドと開発体験
- YouTube/ブログから自動スクレイピングでデータ収集

## Technical Context

**Language/Version**: JavaScript (ES2022), Vite 5+
**Primary Dependencies**: Vite (ビルドツールのみ、本番依存なし)
**Storage**: 静的JSONファイル（`quotes.json`）、メモリ内履歴管理（localStorage不使用）
**Testing**: 手動テスト + Lighthouse（パフォーマンス/アクセシビリティ検証）
**Target Platform**: モダンブラウザ（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
**Project Type**: single（フロントエンド専用シングルページアプリケーション）
**Performance Goals**:
  - 初期ロード: 2秒以内（3G接続）
  - 名言生成: 50ms以内
  - Lighthouse Performance Score: 90以上
**Constraints**:
  - バンドルサイズ100KB以下（gzip圧縮後）
  - データベース不使用（静的サイト）
  - バックエンドAPI不使用
  - localStorage使用禁止（メモリ内のみ）
  - UIフレームワーク不使用（Vanilla JavaScript）
**Scale/Scope**:
  - 初期名言データ: 50〜100件
  - 想定ユーザー数: 10,000ユーザー/月
  - デプロイ: 静的ホスティング（Vercel/Netlify）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 0前の憲章チェック

✅ **原則1: ユーザー体験優先**
- 即座のレスポンス（名言表示100ms以内）
- レスポンシブデザイン（320px-1920px対応）
- 視覚的フィードバック（ボタンクリック、アニメーション）

✅ **原則2: コンテンツの完全性**
- 名言データに出典・コンテキスト情報を内部管理用として保持
- 著者名「マコなり社長」を明確に表示
- 日本語の真正性を維持

✅ **原則3: シンプルさと集中**
- 単一目的: ランダム名言表示
- 最小限の依存関係（Viteのみ）
- バンドルサイズ100KB以下

✅ **原則4: アクセシビリティと包摂性**
- WCAG 2.1 AA準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応（ARIA属性）
- カラーコントラスト4.5:1以上

✅ **原則5: パフォーマンスと効率性**
- 初期ロード2秒以内（3G）
- 名言生成50ms以内
- バンドルサイズ100KB以下

✅ **原則6: コード品質と保守性**
- JSDoc型定義
- テスト戦略の策定
- 明確なデータモデル定義

✅ **原則7: データ主権とプライバシー**
- 個人データ収集なし
- localStorage不使用（メモリ内のみ）
- サードパーティトラッキングなし

**Phase 0への進行を承認**

## Project Structure

### Documentation (this feature)

```
specs/quote-generator/
├── plan.md              # 本ファイル（/plan コマンド出力）
├── research.md          # Phase 0 出力（/plan コマンド）
├── data-model.md        # Phase 1 出力（/plan コマンド）
├── quickstart.md        # Phase 1 出力（/plan コマンド）
├── contracts/           # Phase 1 出力（/plan コマンド）
└── tasks.md             # Phase 2 出力（/tasks コマンド - /plan では作成されない）
```

### Source Code (repository root)

```
frontend/
├── src/
│   ├── main.js              # アプリケーションエントリーポイント
│   ├── style.css            # グローバルスタイル
│   ├── models/
│   │   └── quote.js         # 名言データモデル定義（JSDoc）
│   ├── services/
│   │   └── quoteService.js  # 名言ロジック（ランダム選択、履歴管理）
│   ├── ui/
│   │   ├── quoteDisplay.js  # 名言表示UI制御
│   │   └── button.js        # ボタンコンポーネント
│   └── data/
│       └── quotes.json      # 名言データファイル
├── public/
│   └── favicon.ico          # ファビコン
├── index.html               # HTMLエントリーポイント
├── package.json
└── vite.config.js           # Vite設定

tests/
└── manual/
    ├── functionality.md     # 機能テスト手順
    ├── accessibility.md     # アクセシビリティテスト手順
    └── performance.md       # パフォーマンステスト手順
```

**Structure Decision**: フロントエンド専用のシングルページアプリケーション（Option 1ベース）。`frontend/` ディレクトリに全コードを集約し、`src/` 内部は機能別（models、services、ui、data）に分割。テストはドキュメントベースの手動テストとLighthouse自動化。

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

本プロジェクトには憲章違反はありません。すべての原則に準拠しています。

---

## Phase 0: リサーチとコンテキスト収集

### 目的
既存コードベースの理解、技術的な制約の特定、類似実装パターンの調査を行い、Phase 1の設計判断を支援します。

### リサーチタスク

1. **メモリ内履歴管理の実装パターン**
   - localStorage不使用でのセッション内重複防止手法
   - JavaScript配列ベースの履歴管理
   - メモリリーク防止策

2. **Vanilla JavaScript アーキテクチャパターン**
   - モジュール分割のベストプラクティス
   - イベントリスナー管理パターン
   - 状態管理（クロージャー活用）

3. **データ収集戦略**
   - YouTube字幕からのスクレイピング手法
   - ブログコンテンツの抽出方法
   - データクレンジングとJSON変換

4. **Viteバンドル最適化**
   - 100KB制約達成のための設定
   - Tree-shaking最適化
   - 圧縮設定（terser）

5. **アクセシビリティ実装**
   - WCAG 2.1 AA準拠の具体的実装
   - ARIA属性の適切な使用
   - キーボードナビゲーションパターン

### 成果物
- `research.md`: 上記リサーチ結果をまとめたドキュメント

---

## Phase 1: 設計アーティファクト生成

### 目的
データモデル、コントラクト、クイックスタートガイドを作成し、実装の青写真を確立します。

### 設計タスク

1. **データモデル設計** (`data-model.md`)
   - Quote型定義（JSDoc形式）
   - QuoteHistory型定義（メモリ内履歴管理用）
   - JSONスキーマ定義

2. **コントラクト設計** (`contracts/`)
   - `QuoteService.contract.md`: 名言サービスのAPI仕様（localStorage不使用）
   - `UIComponents.contract.md`: UIコンポーネントのインターフェース仕様（出典非表示）

3. **クイックスタートガイド** (`quickstart.md`)
   - 開発環境セットアップ手順（Vanilla JS + Vite）
   - ローカル開発サーバー起動方法
   - 名言データの追加・編集方法
   - スクレイピングスクリプトの使用方法
   - ビルドとデプロイ手順

### 成果物
- `data-model.md`: データモデル定義
- `contracts/`: サービス・コンポーネントコントラクト
- `quickstart.md`: 開発者向けクイックスタート

### Phase 1後の憲章再チェック

**実施日**: 2025-10-21

✅ **原則1: ユーザー体験優先**
- 名言表示レスポンス100ms以内の設計
- スムーズなアニメーション（300ms）実装
- ARIA属性によるスクリーンリーダー対応

✅ **原則2: コンテンツの完全性**
- 名言データに出典情報を内部管理用として保持
- 著者名「マコなり社長」を明確に表示
- 日本語の真正性を維持

✅ **原則3: シンプルさと集中**
- 依存関係: Viteのみ（本番依存なし）
- Vanilla JavaScript（フレームワーク不使用）
- 単一目的: ランダム名言表示

✅ **原則4: アクセシビリティと包摂性**
- WCAG 2.1 AA完全準拠設計
- aria-live="polite" でスクリーンリーダー対応
- セマンティックHTML（blockquote、cite、button）
- カラーコントラスト比4.5:1以上

✅ **原則5: パフォーマンスと効率性**
- QuoteService: 50ms以内のランダム選択（O(n)アルゴリズム）
- バンドルサイズ見積もり: 12KB（gzip圧縮後）
- CSSアニメーション: opacity/transformのみ（GPU加速）

✅ **原則6: コード品質と保守性**
- JSDoc型定義（Quote、QuoteHistory）
- 全APIにJSDocコメント記載
- エラーハンドリング（QuoteDataError、ValidationError）
- バリデーション関数とテスト要件を定義

✅ **原則7: データ主権とプライバシー**
- 個人データ収集なし
- localStorage不使用（メモリ内のみ）
- サードパーティトラッキングなし

**Phase 1憲章チェック結果: 全原則に準拠 ✅**

**Phase 2への進行を承認**

---

## Phase 2: タスク分解

### 目的
Phase 1の設計に基づいて、実装可能な具体的タスクに分解します。

### タスク生成基準
- 各タスクは4時間以内で完了可能
- タスク間の依存関係を明確化
- テスト可能な完了条件を定義

### 成果物
- `tasks.md`: 実装タスクリスト（依存関係順に並べ替え）

**注意**: `tasks.md` は `/tasks` コマンドで生成されます。`/plan` コマンドでは作成されません。

---

## 進捗追跡

### Phase 0: リサーチとコンテキスト収集 ✅
- [x] メモリ内履歴管理パターンの調査
- [x] Vanilla JavaScript アーキテクチャ調査
- [x] データ収集戦略の調査
- [x] Viteバンドル最適化の調査
- [x] アクセシビリティ実装の調査
- [x] research.md 作成

**完了日**: 2025-10-21

### Phase 1: 設計アーティファクト生成 ✅
- [x] data-model.md 作成
- [x] contracts/ 作成
  - [x] QuoteService.contract.md（StorageService削除）
  - [x] UIComponents.contract.md
- [x] quickstart.md 作成
- [x] 憲章再チェック実施

**完了日**: 2025-10-21

### Phase 2: タスク分解 ✅
- [x] tasks.md 生成（/tasks コマンド使用）

**完了日**: 2025-10-21

---

## 次のステップ

✅ ~~1. Phase 0のリサーチタスクを実行~~ **完了**
✅ ~~2. research.md を作成~~ **完了**
✅ ~~3. Phase 1の設計アーティファクトを生成~~ **完了**
✅ ~~4. 憲章再チェックを実施~~ **完了**
✅ ~~5. Phase 2で `/tasks` コマンドを実行してタスク分解~~ **完了**
⏭️ **6. `/implement` コマンドを実行して実装開始** ← 次はここ

---

## 生成されたアーティファクト

### Phase 0
- ✅ `research.md`: リサーチ結果（メモリ内履歴、Vanilla JS、データ収集、Vite最適化、アクセシビリティ）

### Phase 1
- ✅ `data-model.md`: データ型定義（JSDoc形式、localStorage不使用）
- ✅ `contracts/QuoteService.contract.md`: 名言サービスAPI仕様
- ✅ `contracts/UIComponents.contract.md`: UIコンポーネント仕様（出典非表示）
- ✅ `quickstart.md`: 開発者向けクイックスタートガイド

**注意**: StorageService.contract.mdは削除（localStorage不使用のため）

### Phase 2
- ✅ `tasks.md`: 実装タスクリスト（15タスク、依存関係順、並列実行ガイド付き）

---

**実装計画 v2.0.0 - 2025-10-21作成（clarify反映版）**
**Phase 0-2完了 - 2025-10-21**
