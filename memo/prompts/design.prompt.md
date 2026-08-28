---
description: "設計エージェントを呼び出し、DB設計・API設計を検討する"
name: "design"
agent: "design"
argument-hint: "設計したい機能の概要（例: フォロー機能のブロックリスト対応）"
---

以下の機能について設計を行ってください。

対象機能: ${input:feature:設計したい機能の概要を入力}

- 既存の `ADR-001-architecture.md` の決定事項との整合性を確認したうえで進めてください
- DBスキーマ変更が必要な場合は `db-design` スキルの規約に従ってください
- APIエンドポイントが必要な場合は `api-design` スキルの規約（OpenAPI-first, orval生成）に従ってください
- 要件が不明確な部分があれば、実装に進める前にこちらに確認してください
