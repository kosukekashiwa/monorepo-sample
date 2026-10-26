# テスト

`apps/mobile` のコンポーネントは [Vitest](https://vitest.dev/) でテストしています。React Native のコードを react-native-web 経由で jsdom 上に描画し、[Testing Library](https://testing-library.com/docs/react-testing-library/intro/) と [user-event](https://testing-library.com/docs/user-event/intro) で操作・検証します。

## 実行

```sh
pnpm --filter mobile test          # 1 回実行
pnpm --filter mobile test:watch    # ファイル変更を監視して実行
pnpm --filter mobile check-types   # アプリとテストの型チェック
pnpm test                          # リポジトリ全体（turbo run test）
```

## 書き方

- テストは対象ファイルと同じディレクトリに `<ファイル名>.test.tsx` として置きます（例: `Dialog.tsx` → `Dialog.test.tsx`）。
- `describe` で対象をまとめ、各テストは `it` で書きます。テスト名は日本語で、期待する振る舞いを書きます。
- `describe` / `it` / `expect` / `vi` は `vitest` から import します（グローバルは使いません）。
- 要素は、ユーザーから見える情報（ロール・ラベル・テキスト）で取得します。操作は `userEvent.setup()` で作った `user` を使います。

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('プライマリアクションを押すと onPress が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Dialog open onClose={() => {}} title="タイトル" primaryAction={{ label: '削除', onPress }} />);

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## テスト環境の仕組み

設定は `vitest.config.mts`、`vitest.polyfills.ts`、`vitest.setup.ts` にあります。

| 対応 | 理由 |
|---|---|
| `react-native` を `react-native-web` に置き換え、`*.web.*` のファイルを優先して解決 | Metro の Web ビルドと同じ実装でテストするため |
| アプリのファイルに Unistyles と Reanimated（worklets）の Babel プラグインを適用 | Unistyles は Babel プラグインがないとスタイルが DOM に反映されないため。Reanimated も `useAnimatedStyle` などでプラグインを前提にしているため |
| `react-native-safe-area-context` を ES モジュール版に置き換え | CommonJS 版が react-native（Flow のソース）を直接読み込むため |
| Reanimated の `webUtils` をテスト用のファイル（`test/reanimatedWebUtils.ts`）に置き換え | 元のファイルの `require` が ES モジュールとして処理されると失敗し、アニメーションのスタイルが DOM に反映されないため |
| `lucide-react-native` をモック | react-native-svg が react-native（Flow のソース）を読み込むため。アイコンは `data-testid="icon-<アイコン名>"` と `data-color` を持つ要素として描画されるので、どのアイコンが何色で表示されているかを検証できます |
| `window.matchMedia` を用意し、「視差効果を減らす」を有効として返す | jsdom にないため。また Reanimated のアニメーションを省略し、要素がすぐ表示され `withTiming` がすぐ終わるようにするため |
| `innerText` を `textContent` に対応付け | Unistyles が `innerText` で CSS を書き込むため（jsdom は未実装） |
| `AnimationEvent` を用意 | ないと React が `webkitAnimationEnd` を待ち受け、`fireEvent.animationEnd` が届かないため |
| `NODE_ENV` を `development` にする | `test` のままだと Reanimated が Jest 専用のモードになり、スタイルを更新できないため |

## テスト用のヘルパー（`test/`）

| ファイル | 内容 |
|---|---|
| `fakeImage.ts` | `useFakeImage()`。jsdom は画像を読み込まないため、`window.Image` を偽物に置き換えます。URL に `error` を含むと読み込み失敗、`#<幅>x<高さ>` で終わるとそのサイズで読み込み成功になります |
| `scroll.ts` | `mockScrollMetrics()` でスクロール領域の高さを設定し、`scrollTo()` でスクロールイベントを発生させます（react-native-web のスロットリングを避けるため少し待ちます） |

## 制約

- jsdom にはレイアウトがないため、要素の実際の幅・高さ・位置は検証できません。アスペクト比などは CSS の値（`getComputedStyle`）で検証します。
- Web 版の実装でテストするため、iOS / Android 固有の挙動（ネイティブモジュール、`*.ios.tsx` / `*.android.tsx` など）は対象外です。
- react-native-web の `Modal` はフェードアウトの `animationend` で閉じるので、閉じたことを確かめるには `fireEvent.animationEnd` でアニメーションの終了を発生させます（`ImageGallery.test.tsx` を参照）。
- `fireEvent` / `user-event` とフェイクタイマーを組み合わせると `user.click` が終わらないことがあります。タイマーを進めるテストと、クリックするテストは分けてください（`Toast.test.tsx` を参照）。
