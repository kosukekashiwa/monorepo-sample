---
description: "実装エージェントを呼び出し、React Native/Hono実装とVitestテストを行う"
name: "implement"
agent: "implement"
argument-hint: "実装対象（未指定の場合は直前の /design の内容を実装）"
---

以下の内容を実装してください。

実装対象: ${input:target:実装対象を入力（未入力の場合は直前の設計内容を対象とする）}

- 直前の `/design` の会話がある場合は、その設計内容に基づいて実装してください
- React Native側は `react-native-implementation` スキール、バックエンドは `hono-implementation` スキル、
  テストは `vitest-unit-testing` スキルの規約に従ってください
- 実装後は必ずVitestのユニットテストを追加し、テストを実行して結果を報告してください
- 変更が複数レイヤーにまたがる場合は、変更ファイル一覧を最後にまとめてください
