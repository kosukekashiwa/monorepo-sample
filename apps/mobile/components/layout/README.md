# layout

画面のレイアウトに関わるコンポーネント群です。スタイリングは [Unistyles](https://unistyl.es/)、アイコンは [Lucide](https://lucide.dev/) を使用しています。

すべて named export です。各ファイルから直接 import してください。

```
components/layout/
└── image-gallery/
    ├── types.ts           # GalleryImageSource, MAX_GALLERY_IMAGES
    ├── ImageGallery.tsx   # プレビュー表示（最大 4 枚）
    ├── ImageViewer.tsx    # 拡大表示（全画面）
    └── GalleryImage.tsx   # 読み込み失敗時のフォールバック付き画像
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
