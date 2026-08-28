---
name: react-native-implementation
description: >-
  apps/app 配下（Expo Router によるモバイル/Web共通画面）の実装時に使用。
  画面・コンポーネントの追加、状態管理の使い分け、NativeWindでのスタイリング、
  i18n対応、APIクライアント利用など、React Native実装全般で参照する。
---

# React Native (apps/app) 実装ガイド

## 前提スタック
- ルーティング: Expo Router（`apps/app` はモバイル/Webで共通実装）
- スタイリング: NativeWind のみ使用。`StyleSheet.create` や inline style オブジェクトは使わない
- 状態管理: Zustand（クライアントローカル状態）と React Query（サーバー状態）を明確に分離する
  - サーバーから取得/更新するデータは必ず React Query 経由。Zustand にサーバーデータをキャッシュしない
  - UIの一時的な状態（モーダル開閉、フォーム入力途中値など）のみ Zustand へ
- i18n: react-i18next。対応言語は日本語・英語のみ。テナント単位のテキストカスタマイズは行わない
- APIクライアント: orval が OpenAPI から自動生成した型付きクライアントを使用する
  - 生成ファイルは git 管理外・CIで再生成されるため、手動編集しない
  - 生成クライアントは React Query の hooks として利用する

## 実装時の手順
1. 既存の似た画面/コンポーネントを `apps/app` 内から探し、ディレクトリ構成・命名規則を踏襲する
2. サーバーデータが必要な場合は、まず対応する orval 生成 hook が存在するか確認する
   - 存在しない場合は `api-design` スキルの手順でAPI設計→OpenAPI定義→orval再生成を先に行う
3. スタイルは NativeWind のユーティリティクラスで記述する。共通スタイルが必要な場合は `packages/core` 側の共通コンポーネントを検討する（`apps/app` と `apps/admin` の間で共有UIパッケージは持たない方針のため、admin向けの共有は不要）
4. テキストは全てi18nキー経由にし、`ja` / `en` 両方のリソースファイルに追加する
5. 認証関連のロジックが必要な場合は `packages/core/features/auth/client` を利用する。新規に認証クライアントを作らない

## 避けるべきパターン
- Zustand ストアにAPIレスポンスをそのまま保存する
- `fetch` や `axios` を直接呼び出す（orval生成クライアントを経由しない）
- StyleSheet や styled-components 等、NativeWind以外のスタイリング手段の導入
- ハードコードされた日本語/英語文字列の直書き
