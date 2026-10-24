# feedback

ユーザーへのフィードバック表示用コンポーネント群です。スタイリングは [Unistyles](https://unistyl.es/)、アイコンは [Lucide](https://lucide.dev/) を使用しています。

| コンポーネント | 用途 | 表示位置 | 消え方 |
|---|---|---|---|
| `Dialog` | 確認・選択など、ユーザーの判断が必要なとき | 画面中央（モーダル） | ユーザーが操作して閉じる |
| `Toast` | 処理結果などの一時的な通知 | 画面上部に**重ねて**表示 | 時間経過（既定 3 秒）。`duration: null` で持続 |
| `Banner` | 対応を促す持続的な通知（未確認メール、オフラインなど） | 画面上部に**差し込み**、コンテンツを押し下げる | アクションまたは閉じるボタンが押されるまで持続 |

すべて named export です。各ファイルから直接 import してください。

```
components/feedback/
├── types.ts                 # FeedbackVariant, FeedbackAction
├── FeedbackIcon.tsx         # variant ごとの Lucide アイコン
├── dialog/Dialog.tsx
├── toast/
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   └── useToast.ts
└── banner/
    ├── Banner.tsx
    ├── BannerProvider.tsx
    └── useBanner.ts
```

## 共通の型

```ts
type FeedbackVariant = 'info' | 'success' | 'warning' | 'error';

type FeedbackAction = {
  label: string;
  onPress: () => void;
};
```

`variant` ごとのアイコンは次のとおりです。

| variant | アイコン |
|---|---|
| `info` | `Info` |
| `success` | `CircleCheck` |
| `warning` | `TriangleAlert` |
| `error` | `CircleAlert` |

色は `styles/themes.ts` の `colors.feedback.<variant>`（`background` / `foreground` / `accent`）で light / dark それぞれ定義しています。

## セットアップ

`ToastProvider` と `BannerProvider` は `app/_layout.tsx` で設定済みです。

```tsx
<ThemeProvider value={...}>
  <ToastProvider>
    <BannerProvider>
      <Stack />
    </BannerProvider>
  </ToastProvider>
</ThemeProvider>
```

- `ToastProvider` を外側に置くことで、Toast は Banner より手前に表示されます。
- `BannerProvider` は `Stack` を包んでいるため、Banner は画面遷移しても表示されたままです。Banner の表示中は、ヘッダーを含む画面全体が Banner の高さ分押し下げられます。

## Dialog

```ts
type DialogProps = {
  open: boolean;
  onClose: () => void;              // 背景タップ（dismissible 時）と Android の戻るボタンで呼ばれる
  title: string;
  description?: string;
  primaryAction?: FeedbackAction;
  secondaryAction?: FeedbackAction;
  dismissible?: boolean;            // 既定 true。false で背景タップでは閉じない
  children?: ReactNode;             // description の代わりに任意の内容を表示
};
```

開閉状態は呼び出し側で管理します。アクションを押しても自動では閉じないので、必要に応じて `onPress` 内で閉じてください。

```tsx
import { Dialog } from '@/components/feedback/dialog/Dialog';

const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="投稿を削除しますか？"
  description="この操作は取り消せません。"
  primaryAction={{
    label: '削除',
    onPress: () => {
      deletePost();
      setOpen(false);
    },
  }}
  secondaryAction={{ label: 'キャンセル', onPress: () => setOpen(false) }}
/>
```

## Toast

`useToast()` で呼び出します。

```ts
type ToastOptions = {
  message: string;
  title?: string;
  variant?: FeedbackVariant;   // 既定 'info'
  duration?: number | null;    // ミリ秒。既定 3000。null で自動では消えない
  action?: FeedbackAction;     // 押すと onPress を呼んだあと Toast を閉じる
  showCloseButton?: boolean;   // 既定は duration が null なら true、それ以外は false
};

type ToastApi = {
  show: (options: ToastOptions) => string; // toast の id を返す
  hide: (id: string) => void;
  hideAll: () => void;
};
```

```tsx
import { useToast } from '@/components/feedback/toast/useToast';

const toast = useToast();

toast.show({ message: '保存しました', variant: 'success' });

toast.show({
  message: '投稿を削除しました',
  action: { label: '元に戻す', onPress: restorePost },
});

// 自動で消えない Toast
const id = toast.show({ message: 'オフラインです', variant: 'warning', duration: null });
toast.hide(id);
```

- 画面上部（セーフエリアの内側）に、画面に重ねて表示します。下のレイアウトは動きません。
- 新しいものが上に積まれ、最大 3 件まで表示します。超えた分は古いものから消えます。

## Banner

`useBanner()` で呼び出します。

```ts
type BannerOptions = {
  message: string;
  title?: string;
  variant?: FeedbackVariant;   // 既定 'info'
  actions?: FeedbackAction[];  // 最大 2 件。押すと onPress を呼んだあと Banner を閉じる
  dismissible?: boolean;       // 閉じるボタンを表示するか。既定 true
  onDismiss?: () => void;      // ユーザーが閉じたとき（閉じるボタン・アクション）に呼ばれる
};

type BannerApi = {
  show: (options: BannerOptions) => string; // 表示中の Banner を置き換え、id を返す
  hide: (id?: string) => void;              // id 指定時は、その Banner が表示中の場合のみ閉じる
};
```

```tsx
import { useBanner } from '@/components/feedback/banner/useBanner';

const banner = useBanner();

banner.show({
  variant: 'warning',
  title: 'メールアドレスが未確認です',
  message: '届いたメールのリンクから確認を完了してください。',
  actions: [{ label: '確認メールを再送', onPress: resendMail }],
});

// 閉じるボタンなし。条件が解消したらコードから閉じる
const id = banner.show({ variant: 'error', message: 'オフラインです', dismissible: false });
banner.hide(id);
```

- 画面上部に差し込まれ、画面のコンテンツ（ヘッダー含む）を押し下げます。
- 時間経過では消えません。ユーザーがアクションか閉じるボタンを押すか、`hide()` を呼ぶまで表示されます。
- 同時に表示されるのは 1 件のみです。`show()` を呼ぶと現在の Banner を置き換えます。

`Banner` コンポーネント単体（`show` で表示を切り替え）も export しているので、Provider を使わず特定の画面内に置くこともできます。画面の上端（ステータスバーの下）に置く場合は `safeAreaTop` を指定すると、ステータスバー分の余白が入ります。

```tsx
import { Banner } from '@/components/feedback/banner/Banner';

<Banner show={isOffline} variant="error" message="オフラインです" dismissible={false} />
```

## 注意

- スタイルは `react-native-unistyles` の `StyleSheet` を使っています。スタイルを展開（`{...styles.x}`）せず、配列（`[styles.x, styles.y]`）で合成してください。
- Unistyles はネイティブモジュールを含むため、Expo Go では動作しません。開発ビルド（`npx expo run:ios` / `npx expo run:android`）で確認してください。
