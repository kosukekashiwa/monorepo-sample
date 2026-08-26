# ADR-001: X風つぶやきアプリ アーキテクチャ決定記録

- **ステータス**: 決定（Accepted）
- **対象範囲**: モノレポ構成、クロスプラットフォーム(iOS/Android/Web/Windows Desktop)、バックエンド、マルチテナント、i18n

---

## 1. 背景

React Native をベースに iOS / Android / Web / Windows Desktop の4プラットフォームへ、X（旧Twitter）のようなつぶやき機能・マイページ機能を持つアプリを展開する。バックエンドは Hono、モノレポ管理は TurboRepo、認証は Keycloak によるマルチテナント構成とし、将来的な認証・つぶやき機能のマイクロサービス分離を見据えたモジュラーモノリスとする。

---

## 2. 決定事項サマリー

| #   | 論点                           | 決定                                                                                                  |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | Windows Desktop実装方式        | **Tauri**                                                                                             |
| 2   | マルチテナントのデータ分離方式 | **単一DB + tenant_idカラム(行レベル分離) + Postgres RLS**、Keycloakは realm-per-tenant                |
| 3   | バックエンド実行ランタイム     | **Node.js**                                                                                           |
| 4   | ナビゲーション                 | **React Navigation**（native-stackに統一）                                                            |
| 5   | クライアントローカル状態管理   | **Zustand**（React Queryとサーバー状態/クライアント状態で明確に住み分け）                             |
| 6   | i18n                           | **react-i18next**、対応言語は日本語・英語のみ。バックエンドi18n・テナント文言カスタマイズは対応しない |
| 7   | ORM / RLS実装                  | **Drizzle ORM**の`pgPolicy`でスキーマとRLSポリシーを一元管理                                          |
| 8   | CI/CD                          | **GitLab CI + TurboRepo affected filtering**                                                          |

---

## 3. 各決定の詳細

### 3.1 Windows Desktop: Tauri

**検討した選択肢**: Tauri / Electron / WebView2ネイティブホスト(C#/.NET)

**決定**: Tauri

**理由**:

- モノレポの他部分（mobile/web/backend）がTypeScript中心である中、Tauriも「TS + Rust少々」で技術スタックの分断が少ない。
- バンドルサイズ・メモリ効率でElectronより優位（Electron: 100MB+、Tauri: 数MB〜数十MB）。
- 公式プラグイン（`tauri-plugin-autostart`、`tauri-plugin-notification`、コア機能の`tray-icon`）で以下の要件を満たせる。
  - Windowsスタートアップ時の自動起動
  - ウィンドウを閉じてもトレイに常駐し、バックグラウンドでも通知を表示

**却下理由**:

- Electron: 機能要件は満たせるが、常駐時のリソース消費が大きく、モノレポ全体のTypeScript統一という方針とも若干ズレる。ネイティブ機能を頻繁に追加する見込みが出た場合は再検討の余地あり。
- WebView2(C#/.NET): 最も軽量・Windows統合が深いが、Windows専用でモノレポの技術スタック（TS/Rust）から完全に外れ、CI/CDパイプラインも別建てが必要になるためオーバースペック。

**実装ディレクトリ**: `apps/desktop/src-tauri/`

---

### 3.2 マルチテナント分離方式

**検討した選択肢**: 単一DB+tenant_idカラム(行レベル) / スキーマ分離 / DB分離

**決定**: 単一DB + tenant_idカラム + PostgreSQL RLS。Keycloak側はrealm-per-tenant。

**理由**:

- PGLiteでのローカル開発が単一DB前提であり、スキーマ/DB分離だとローカル環境の再現コストが増す。
- モジュラーモノリス → 将来のマイクロサービス移行を見据えると、tenant_idを軸にサービス境界を切り出しやすい。
- テナント数が増えても運用コストが線形に増えにくい。

**重要な制約（設計時の注意点）**:

- PGLiteはPostgresの「シングルユーザーモード」をWASM化したものであり、事実上スーパーユーザー相当の単一接続で動作する。PostgresのRLSはスーパーユーザー/テーブルオーナーを常にバイパスするため、**PGLite単体ではRLSポリシーの実効性を検証できない**。
- 対応: ローカル開発(PGLite)はスキーマ・アプリロジックの確認用途に限定し、**RLSの実効性テストはCI上の実Postgresコンテナに対して実施**する（3.7参照）。

---

### 3.3 バックエンド実行ランタイム: Node.js

**決定**: Node.js（Cloudflare Workers、Bunは不採用）

Honoはランタイム非依存だが、通常のNode.jsサーバーとして運用する方針で確定。

---

### 3.4 ナビゲーション: React Navigation（native-stack統一）

**決定**: `@react-navigation/native-stack` を mobile / web(RN for Web) / desktop(Tauri) 全プラットフォームで統一使用。React Router は採用しない。

**理由**:

- React Navigationはweb(RN for Web)を公式サポートしており、mobile/webでナビゲーション定義（Stack/Tab構成）を1つのコードで共有できる。
- react-routerを混在させると、`packages/core`のナビゲーションロジック（画面遷移フック等）や画面コンポーネント自体をプラットフォームごとに分岐させる必要が生じ、機能単位でロジック/UIを共有する設計方針と矛盾する。
- `native-stack`はweb上でも基本動作する（react-native-screensのweb実装経由）。web上ではnative-stack/stackどちらもOSネイティブのアニメーション・ジェスチャーは効かない（web専用の利点がない）ため、mobileでのパフォーマンス・ネイティブ感を優先しnative-stackに統一する。

**web特有の注意点**:

- 画面遷移は`navigation.navigate()`よりも`<Link>`コンポーネントを主手段にする（`<a>`タグとして描画され、右クリック新規タブ・SEOクローラー認識等のweb標準挙動を確保）。
- `react-native-gesture-handler` / `react-native-reanimated` はweb未使用のため、ネイティブジェスチャー実装は`.native.tsx`に分離しバンドルサイズ増加を避ける。

**配置**: `packages/core/src/navigation/`（`RootNavigator.tsx`, `linking.ts`, `types.ts`）

---

### 3.5 クライアントローカル状態管理: Zustand

**決定**: Zustand。React Query（サーバー状態）とは明確に役割分担する。

| 状態の種類                 | 管理方法            | 例                                           |
| -------------------------- | ------------------- | -------------------------------------------- |
| サーバーデータのキャッシュ | React Query         | つぶやき一覧、プロフィール                   |
| クライアントのみの状態     | Zustand             | 認証トークン、UI開閉状態、投稿下書き、テーマ |
| フォーム単体の一時状態     | useState/useReducer | 個別コンポーネント内で完結する入力           |

**鉄則**: APIから取得したデータをZustandに二重管理しない（React Queryキャッシュとの同期ズレを防止）。

**配置**: feature単位で`packages/core/src/features/*/store/`、機能横断のUI状態は`packages/core/src/stores/`。

**永続化**: `persist`ミドルウェア + 既存の`storage`抽象化層（native: AsyncStorage / web・desktop: localStorage）でプラットフォーム分岐を吸収。

---

### 3.6 i18n: react-i18next

**決定**:

- ライブラリ: react-i18next
- 対応言語: 日本語・英語の2言語のみ（RTL対応不要）
- バックエンド(Hono)側のi18n実装: **不要**。APIはエラーコード（enum）のみを返し、表示文言はフロント側の`packages/i18n/locales/*/error.json`で解決する。
- テナントごとの文言カスタマイズ: **不要**

**設計のポイント**:

- feature単位でnamespace分割（`common` / `tweet` / `profile` / `auth` / `error`）し、遅延読み込みを可能にする。
- エラーコードのenumは`apps/api`のzodスキーマを唯一のソースとし、openapi.yml経由で`packages/api-client`の型に自動反映。フロント側で存在しないエラーコードを参照するミスをコンパイル時に検出できる。
- ユーザーの言語設定はプロフィールに保存された値を優先し、OS/ブラウザ検出は初回フォールバックとする。

**配置**: `packages/i18n/`

---

### 3.7 ORM / RLS実装: Drizzle ORM

**決定**: Drizzle ORMの`pgPolicy`でテーブル定義とRLSポリシーを同一スキーマファイルに統合管理する。

**実装方針**:

- 各テナントスコープのテーブルに`tenant_id`カラム + `tenant_id`を含む複合インデックスを必須とする。
- SELECT / INSERT / UPDATE / DELETE それぞれに`pgPolicy`でポリシーを定義（`current_setting('app.current_tenant')`と比較）。
- アプリケーション接続用ロール（`authenticated`）はテーブルオーナーとは別ロールにし、`ALTER TABLE ... FORCE ROW LEVEL SECURITY`を適用（オーナーによるRLSバイパスを防止）。`BYPASSRLS`属性は付与しない。
- Honoミドルウェアでリクエスト単位のトランザクションを開始し、`SELECT set_config('app.current_tenant', $tenantId, true)`でテナントコンテキストを注入する。**第3引数は必ず`true`（トランザクションローカル）**とし、コネクションプーリング環境でのテナント情報残留・漏洩事故を防ぐ。
- RLSはアプリケーション側の`tenant_id`スコープ実装の「最後の砦」であり、主たる防御はアプリコード側とする。

**テスト方針**:

- RLSの実効性テストはPGLiteでは検証不能（3.2参照）なため、CI上の実Postgresコンテナに対して実施する。

---

### 3.8 CI/CD: GitLab CI + TurboRepo

**決定**:

- TurboRepoの`--filter`（affected filtering）でMR差分に応じたタスクのみ実行。
- ステージ構成: `install → static-check(lint/typecheck/openapiドリフト検知) → test(unit/RLS) → build(api/web/mobile-bundle/desktop) → deploy-review/staging/production`
- openapi.ymlはzodスキーマからの自動生成結果とリポジトリ内ファイルの差分をCIで検知し、更新漏れを機械的に防止する。
- RLSテストジョブは実Postgresをサービスコンテナとして起動し、DBスキーマ変更時のみ実行。
- Windows Desktop(Tauri)ビルドはWindows専用ランナーが必須。Rustのビルドキャッシュ(`target/`, `.cargo/registry/`)を個別にキャッシュ設定する。
- iOS/Android実機ビルド(ipa/apk)は本パイプラインの対象外とし、JSバンドルとしてのビルド可否確認までに留める。実機配布ビルドはFastlane等を用いた別パイプラインに分離する想定（要確認、4章参照）。
- Turbo Remote Cacheは初期段階では未導入。GitLab CIキャッシュのみで開始し、ビルド時間が課題になった時点で導入を検討する。

---

## 4. 未決定・要確認事項

以下は今回のADR策定時点で結論が出ていない、または方針の確認が必要な項目。

1. **iOS/Android実機ビルドパイプラインの詳細**: Fastlane採用可否、証明書/プロビジョニングプロファイル管理方法、macOSランナーの調達方法（GitLab.com SaaS macOSランナー vs セルフホスト）。
2. **本番デプロイ先インフラ**: ホスティング先（AWS ECS / Cloud Run / 自前Kubernetes等）が未確定。決定後、`deploy-staging` / `deploy-production`ジョブの具体化が必要。
3. **Turbo Remote Cacheの導入時期**: チーム規模・CI実行時間の状況を見て判断。
4. **`packages/ui`のスタイリング方針**: `StyleSheet.create`+デザイントークンのみか、NativeWind導入かは未確定（チームの好みによる）。

---

## 5. ディレクトリ構成（最終形）

```
repo-root/
├── apps/
│   ├── mobile/                  # React Native (iOS/Android)
│   ├── web/                     # React Native for Web
│   ├── desktop/                 # Tauri (Windows)
│   │   └── src-tauri/
│   └── api/                     # Hono backend (Node.js)
│       └── src/
│           ├── modules/         # auth / tweets / users / tenants (モジュラーモノリス)
│           ├── db/
│           │   ├── schema/      # Drizzle ORM + pgPolicy
│           │   └── migrations/
│           ├── middleware/      # tenant-context, error-handler
│           └── openapi/         # openapi.yml自動生成
│
├── packages/
│   ├── ui/                      # 共有UIコンポーネント(Presentational)
│   ├── core/                    # 共有ロジック(hooks, navigation, store)
│   ├── api-client/              # openapi.ymlから自動生成する型付きクライアント
│   ├── auth-client/             # Keycloak連携共通ロジック
│   ├── i18n/                    # react-i18next設定・翻訳リソース
│   ├── config/                  # 共有tsconfig/eslint/prettier
│   └── types/
│
├── infra/
│   ├── docker-compose.yml       # Keycloak, Postgres(RLSテスト用)
│   └── keycloak/realm-export/
│
├── turbo.json
├── pnpm-workspace.yaml
└── .gitlab-ci.yml
```

---

## 6. 変更履歴

| 日付       | 内容                             |
| ---------- | -------------------------------- |
| 2026-08-26 | 初版作成。全論点の決定事項を確定 |
