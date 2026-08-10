project-root/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── keycloak-client.ts
│   │   │   │   ├── auth-provider.tsx
│   │   │   │   └── protected-route.tsx
│   │   │   ├── routes/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   │   └── auth-store.ts 
│   │   │   ├── lib/
│   │   │   │   └── api.ts             # createApiClient(getToken, onUnauthorized)
│   │   │   ├── app.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── package.json               # dependencies: "api": "workspace:*"（型のみ）
│   │   └── tsconfig.json
│   │
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── keycloak-client.ts # react-native-app-auth
│   │   │   │   ├── auth-provider.tsx
│   │   │   │   └── token-storage.ts   # react-native-keychain
│   │   │   ├── navigation/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   └── api.ts
│   │   │   └── App.tsx
│   │   ├── ios/
│   │   ├── android/
│   │   ├── package.json               # dependencies: "api": "workspace:*"（型のみ）
│   │   └── tsconfig.json
│   │
│   └── api/                            # package.json の name: "api"
│       ├── drizzle/
│       │   └── schema.ts
│       ├── src/
│       │   ├── domains/
│       │   │   ├── auth/
│       │   │   │   ├── openapi.ts      # createRoute()
│       │   │   │   ├── routes.ts       # OpenAPIHono
│       │   │   │   ├── controller.ts
│       │   │   │   ├── keycloak-admin-client.ts
│       │   │   │   ├── idp-resolver.ts
│       │   │   │   ├── service.ts
│       │   │   │   └── schema.ts       # Zodスキーマ本体
│       │   │   ├── hoge/
│       │   │   ├── fuga/
│       │   │   └── piyo/
│       │   ├── openapi/
│       │   │   ├── registry.ts         # 全ドメインのOpenAPIHonoを集約
│       │   │   └── generate.ts         # openapi.ymlを書き出す実行スクリプト
│       │   ├── shared/
│       │   │   ├── db/
│       │   │   │   └── client.ts       # withTenantDb(c, fn), assertValidTenantId
│       │   │   ├── middleware/
│       │   │   │   ├── verify-jwt.ts   # jose + JWKS, issuer検証
│       │   │   │   ├── tenant-context.ts
│       │   │   │   └── require-role.ts # 403判定
│       │   │   └── errors/
│       │   │       └── error-handler.ts # app.onError
│       │   ├── events/
│       │   └── app.ts                   # OpenAPIHono() + export type AppType
│       ├── server.ts                     # @hono/node-server
│       ├── openapi.yml                   # 生成物(コミット対象、CIでドリフトチェック)
│       ├── tests/
│       │   └── integration/
│       │       └── tenant-isolation.test.ts
│       ├── .eslintrc.js                  # domains外からのPrisma直import禁止
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/
│   ├── api-client/
│   │   ├── src/
│   │   │   └── index.ts                 # hc<AppType>（RPCモード）
│   │   └── package.json                  # dependencies: hono, "api": "workspace:*"
│   ├── auth-shared/
│   │   ├── types.ts
│   │   └── jwt-decode.ts
│   ├── i18n/
│   ├── utils/
│   ├── config-eslint/
│   │   ├── base.js
│   │   ├── web.js
│   │   ├── native.js
│   │   └── node.js
│   └── config-prettier/
│       └── index.js
│
├── infra/
│   ├── docker-compose.yml
│   ├── keycloak/
│   │   ├── realm-export.json
│   │   ├── identity-providers/
│   │   │   ├── acme-oidc-config.json
│   │   │   └── globex-saml-config.json
│   │   └── themes/
│   └── README.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json