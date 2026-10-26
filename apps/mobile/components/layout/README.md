# layout

画面のレイアウトに関わるコンポーネント群です。スタイリングは [Unistyles](https://unistyl.es/)、アイコンは [Lucide](https://lucide.dev/) を使用しています。

すべて named export です。各ファイルから直接 import してください。

```
components/layout/
├── app-chrome/
│   ├── AppChromeProvider.tsx  # ヘッダー・フッタの表示状態を共有
│   ├── useAppChrome.ts
│   ├── useHideOnScroll.ts     # スクロール方向で表示・非表示を切り替えるハンドラ
│   └── ChromeScrollView.tsx   # 上記を組み込んだ ScrollView
├── app-header/
│   └── AppHeader.tsx          # アプリ名を表示するヘッダー
├── tab-bar/
│   └── TabBar.tsx             # タブ切り替え用のフッタ
└── image-gallery/
    ├── types.ts           # GalleryImageSource, MAX_GALLERY_IMAGES
    ├── ImageGallery.tsx   # プレビュー表示（最大 4 枚）
    ├── ImageViewer.tsx    # 拡大表示（全画面）
    └── GalleryImage.tsx   # 読み込み失敗時のフォールバック付き画像
```

## AppHeader / TabBar

タブ画面の上部にアプリ名を表示する `AppHeader` と、下部でタブを切り替える `TabBar` です。どちらも画面の上に重ねて表示し、下スクロールでフェードアウト、上スクロールで再表示されます。

### セットアップ

`app/(tabs)/_layout.tsx` で、expo-router の `Tabs` に組み込んでいます。

```tsx
import { Tabs } from 'expo-router/js-tabs';

<AppChromeProvider>
  <View style={{ flex: 1 }}>
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'ホーム', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      {/* ... */}
    </Tabs>
    <AppHeader>
      <BannerOutlet />
    </AppHeader>
  </View>
</AppChromeProvider>
```

サンプルとして次の 5 つのタブを用意しています（各画面の中身は `components/sample/SampleScreen.tsx` のダミーリスト）。

| ファイル | タイトル | アイコン |
|---|---|---|
| `app/(tabs)/index.tsx` | ホーム | `House` |
| `app/(tabs)/search.tsx` | 検索 | `Search` |
| `app/(tabs)/post.tsx` | 投稿 | `SquarePlus` |
| `app/(tabs)/notifications.tsx` | 通知 | `Bell` |
| `app/(tabs)/profile.tsx` | マイページ | `User` |

タブを追加・変更するときは、`app/(tabs)/` にファイルを置き、`_layout.tsx` に `Tabs.Screen` を追加して `title` と `tabBarIcon` を指定します。

### AppHeader

```ts
type AppHeaderProps = {
  title?: string;       // 既定は app.json の expo.name
  children?: ReactNode; // ヘッダーの直下に表示する内容（例: <BannerOutlet />）
};
```

- ステータスバーの下に、高さ 52px のバーでタイトルを表示します。
- `children` はヘッダーと一緒に上へ移動しますが、フェードアウトはしません。`<BannerOutlet />` を渡すと Banner がヘッダーの下に差し込まれ、ヘッダーが隠れると画面上部へ詰めて表示されます。

### TabBar

`<Tabs tabBar={(props) => <TabBar {...props} />}>` として使います。各画面の `title` と `tabBarIcon` オプションを表示し、選択中のタブはテーマの `colors.link`、それ以外は `colors.textMuted` で表示します。タブを押すと、ヘッダーとフッタを再表示します。

### スクロールで隠す

画面の中身には `ChromeScrollView` を使います。

```tsx
import { ChromeScrollView } from '@/components/layout/app-chrome/ChromeScrollView';

export default function HomeScreen() {
  return <ChromeScrollView>{/* ... */}</ChromeScrollView>;
}
```

- ヘッダー・フッタ（と Banner）に隠れないよう、内容の上下に自動で余白を付けます。ヘッダー・フッタが隠れても余白は変わらないので、中身の位置は動きません。
- 下スクロールでヘッダーとフッタを隠し、上スクロールで再表示します。4px 未満の動きは無視します。
- 最上部ではいつも表示します。最下部でのバウンスは上スクロールとして扱いません。
- 隠れるときはフェードアウトしながら、ヘッダーはバーの高さ分だけ上へ、フッタは画面外へ移動します（隠れたフッタを誤って押さないため）。

`FlatList` などを使う場合は、Reanimated の `Animated.FlatList` に `useHideOnScroll()` のハンドラを渡し、`useAppChrome()` の `topInset` / `bottomInset` を余白に使います。

```tsx
const onScroll = useHideOnScroll();
const { topInset, bottomInset } = useAppChrome();

<Animated.FlatList
  data={items}
  renderItem={renderItem}
  onScroll={onScroll}
  scrollEventThrottle={16}
  contentContainerStyle={{ paddingTop: topInset, paddingBottom: bottomInset }}
/>
```

## ImageGallery

最大 4 枚の画像をプレビュー表示し、タップした画像を全画面で拡大表示します。

```ts
type GalleryImageSource = ImageURISource | ImageRequireSource; // { uri } または require('./image.png')

type ImageGalleryProps = {
  images: GalleryImageSource[]; // 最大 4 枚。5 枚目以降は無視（開発時は警告を出力）
};
```

```tsx
import { ImageGallery } from '@/components/layout/image-gallery/ImageGallery';

<ImageGallery
  images={[
    { uri: 'https://example.com/photo1.jpg' },
    { uri: 'https://example.com/photo2.jpg' },
    require('@/assets/images/sample.png'),
  ]}
/>
```

幅は親要素いっぱいに広がり、高さは下記のアスペクト比で決まります。

### プレビューのレイアウト

| 枚数 | 各画像のアスペクト比 | 配置 |
|---|---|---|
| 1 枚 | 縦長 3:4 / 正方形 1:1 / 横長 16:9 | 1 枚を全幅で表示 |
| 2 枚 | 8:9, 8:9 | 左右に並べる |
| 3 枚 | 8:9, 16:9, 16:9 | 左に 8:9、右に 16:9 を上下 2 枚 |
| 4 枚 | すべて 16:9 | 2 × 2 |

```
2 枚            3 枚            4 枚
┌────┬────┐  ┌────┬────┐  ┌────┬────┐
│    │    │  │    │ 2  │  │ 1  │ 2  │
│ 1  │ 2  │  │ 1  ├────┤  ├────┼────┤
│    │    │  │    │ 3  │  │ 3  │ 4  │
└────┴────┘  └────┴────┘  └────┴────┘
```

- 2〜4 枚のときは全体が 16:9 の枠になり、各画像は枠を分割して並びます。画像の間には 2px の隙間があるため、各画像の比率は隙間の分だけわずかにずれます。
- 画像は枠に合わせてトリミングされます（`cover`）。
- 1 枚のときの縦長・正方形・横長の判定:
  - `require()` の画像、または `{ uri, width, height }` のようにサイズを指定した画像は、読み込み前に判定します。
  - サイズ不明の `{ uri }` は、読み込みが完了するまで 16:9 で表示し、読み込み後に実際のサイズで判定し直します。
  - 縦横比の差が 1% 未満なら正方形として扱います。

### 拡大表示

プレビューの画像をタップすると、`ImageViewer` で全画面表示します。

- 背景は黒一色で、左上に戻るボタン（`ArrowLeft` アイコン）だけを表示します。Android の戻るボタンでも閉じます。
- 画像は画面に収まるように表示されます（`contain`）。
- 複数枚のときは横スワイプで前後の画像に切り替えられます。タップした画像から表示を始めます。
- ピンチやダブルタップでのズームには対応していません。

## ImageViewer

`ImageGallery` の内部で使っている全画面ビューアーです。単体でも使えます。

```ts
type ImageViewerProps = {
  open: boolean;
  onClose: () => void;            // 戻るボタンと Android の戻るボタンで呼ばれる
  images: GalleryImageSource[];
  initialIndex?: number;          // 最初に表示する画像。既定 0
};
```

```tsx
import { ImageViewer } from '@/components/layout/image-gallery/ImageViewer';

const [index, setIndex] = useState<number | null>(null);

<ImageViewer
  open={index !== null}
  onClose={() => setIndex(null)}
  images={images}
  initialIndex={index ?? 0}
/>
```

## 読み込めない画像のフォールバック

画像の読み込みに失敗すると（URL が存在しない、ネットワークエラーなど）、画像の代わりに「読み込めませんでした。」と表示します。プレビューと拡大表示の両方で有効です。

| 表示場所 | 背景 | 文字色 |
|---|---|---|
| プレビュー | テーマの `colors.border` | テーマの `colors.textMuted` |
| 拡大表示 | 黒 | 白 |

フォールバック表示中の画像もタップでき、拡大表示でも同じメッセージを表示します。

## 注意

- スタイルは `react-native-unistyles` の `StyleSheet` を使っています。スタイルを展開（`{...styles.x}`）せず、配列（`[styles.x, styles.y]`）で合成してください。
- Unistyles はネイティブモジュールを含むため、Expo Go では動作しません。開発ビルド（`npx expo run:ios` / `npx expo run:android`）で確認してください。
