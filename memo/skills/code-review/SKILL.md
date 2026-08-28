---
name: code-review
description: >-
  プルリクエストのコードレビュー時に使用。React Native(apps/app)とHonoバックエンド
  双方について、このリポジトリのアーキテクチャ規約(状態管理の分離、NativeWind、
  マルチテナンシー/RLS、OpenAPI-orvalワークフロー)への準拠をチェックする観点をガイドする。
---

# コードレビュー観点

Copilot code review はこのスキルを自動的に参照する。レビュー時は以下の観点でチェックする。

## React Native (apps/app) 変更のレビュー観点
- サーバーデータをZustandに保存していないか（React Queryを使うべき箇所）
- NativeWind以外のスタイリング手段（StyleSheet, inline style, styled-components等）が混入していないか
- APIクライアントを直接fetch/axiosで呼んでいないか（orval生成クライアント経由か）
- 新規/変更されたUIテキストがi18n化され、`ja`/`en` 両方に追加されているか
- 認証ロジックを `packages/core/features/auth/client` を経由せず独自実装していないか

## Hono バックエンド変更のレビュー観点
- 新規テーブル/カラムに `tenant_id` と対応する `pgPolicy` が定義されているか（テナントスコープが必要なデータの場合）
- テナントコンテキストを経由せずDBアクセスしている箇所がないか
- エンドポイント変更に対してOpenAPI定義が追従しているか（orval生成物とのdriftがないか）
- エラーレスポンスの形式が既存APIと統一されているか

## テストのレビュー観点
- 変更されたロジックに対応するVitestのユニットテストが追加/更新されているか
- テストがAAAパターンに沿っているか、1テストで複数の振る舞いを検証していないか
- RLSに関わる変更の場合、実PostgreSQLに対する統合テストの追加/更新が必要かどうか検討されているか（PGLiteでの代替は不可）

## 共通観点
- `ADR-001-architecture.md` に記載された既存の決定事項から逸脱する変更が、議論なく紛れ込んでいないか
- TurboRepoの依存関係境界を越えた不要な依存（例: apps/app と apps/admin 間の直接依存）が追加されていないか
