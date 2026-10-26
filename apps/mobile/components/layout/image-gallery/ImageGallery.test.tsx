import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useFakeImage } from '@/test/fakeImage';

import { ImageGallery } from './ImageGallery';

const image = (name: string) => ({ uri: `https://example.com/${name}.png` });

/** The preview tiles (buttons that open the viewer), in DOM order. */
function getTiles() {
  return screen.getAllByRole('button', { name: /^画像 \d\/\d$/ });
}

/** Renders the gallery and returns its outer frame (the element the aspect ratio is set on). */
function renderGallery(images: Parameters<typeof ImageGallery>[0]['images']) {
  const { container } = render(<ImageGallery images={images} />);
  return () => container.firstElementChild as HTMLElement;
}

/** The number of tiles in each column of a 2-4 image preview. */
function countTilesPerColumn(frame: HTMLElement) {
  return Array.from(frame.children).map(
    (column) => within(column as HTMLElement).getAllByRole('button').length,
  );
}

/**
 * react-native-web's Modal keeps rendering until the CSS `animationend` event of its animation
 * element (the top element inside the portal), which jsdom never fires by itself.
 */
function finishModalAnimation(elementInModal: HTMLElement) {
  let element = elementInModal;
  while (element.parentElement && element.parentElement.parentElement !== document.body) {
    element = element.parentElement;
  }
  fireEvent.animationEnd(element);
}

function aspectRatioOf(element: HTMLElement) {
  return parseFloat(getComputedStyle(element).aspectRatio);
}

describe('ImageGallery', () => {
  useFakeImage();

  it('画像がないときは何も表示しない', () => {
    const { container } = render(<ImageGallery images={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  describe('1 枚のとき', () => {
    it('縦長の画像は 3:4 で表示する', () => {
      const getFrame = renderGallery([{ uri: 'https://example.com/a.png', width: 300, height: 400 }]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(3 / 4);
    });

    it('正方形の画像は 1:1 で表示する', () => {
      const getFrame = renderGallery([{ uri: 'https://example.com/a.png', width: 500, height: 500 }]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(1);
    });

    it('横長の画像は 16:9 で表示する', () => {
      const getFrame = renderGallery([{ uri: 'https://example.com/a.png', width: 1600, height: 900 }]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(16 / 9);
    });

    it('縦横の差が 1% 未満なら正方形として扱う', () => {
      const getFrame = renderGallery([{ uri: 'https://example.com/a.png', width: 1000, height: 1005 }]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(1);
    });

    it('サイズが分からない画像は 16:9 で表示し、読み込み後に実サイズで判定し直す', async () => {
      const getFrame = renderGallery([{ uri: 'https://example.com/a.png#300x400' }]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(16 / 9);
      await waitFor(() => expect(aspectRatioOf(getFrame())).toBeCloseTo(3 / 4));
    });
  });

  describe('2 枚以上のとき', () => {
    it('2 枚のときは 16:9 の枠に左右 1 枚ずつ並べる', () => {
      const getFrame = renderGallery([image('1'), image('2')]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(16 / 9);
      expect(countTilesPerColumn(getFrame())).toEqual([1, 1]);
    });

    it('3 枚のときは左に 1 枚、右に 2 枚を上下に並べる', () => {
      const getFrame = renderGallery([image('1'), image('2'), image('3')]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(16 / 9);
      expect(countTilesPerColumn(getFrame())).toEqual([1, 2]);
    });

    it('4 枚のときは 2 × 2 で、左上から右へ順に並べる', () => {
      const getFrame = renderGallery([image('1'), image('2'), image('3'), image('4')]);

      expect(aspectRatioOf(getFrame())).toBeCloseTo(16 / 9);
      expect(countTilesPerColumn(getFrame())).toEqual([2, 2]);
      // Each column holds the top and bottom tile: 1 | 2 over 3 | 4.
      const [left, right] = Array.from(getFrame().children) as HTMLElement[];
      expect(within(left!).getByLabelText('画像 1/4')).toBeInTheDocument();
      expect(within(left!).getByLabelText('画像 3/4')).toBeInTheDocument();
      expect(within(right!).getByLabelText('画像 2/4')).toBeInTheDocument();
      expect(within(right!).getByLabelText('画像 4/4')).toBeInTheDocument();
    });

    it('5 枚以上渡すと先頭の 4 枚だけを表示して警告を出す', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<ImageGallery images={[image('1'), image('2'), image('3'), image('4'), image('5')]} />);

      expect(getTiles()).toHaveLength(4);
      expect(screen.queryByLabelText('画像 5/5')).not.toBeInTheDocument();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('up to 4 images'));
    });
  });

  it('読み込めない画像は「読み込めませんでした。」と表示する', async () => {
    render(<ImageGallery images={[image('1'), image('error')]} />);

    expect(await screen.findByText('読み込めませんでした。')).toBeInTheDocument();
  });

  it('画像を押すと拡大表示を開き、戻るボタンで閉じる', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={[image('1'), image('2')]} />);

    const [, second] = getTiles();
    await user.click(second!);
    const back = await screen.findByRole('button', { name: '戻る' });
    expect(screen.getAllByLabelText('画像 2/2')).toHaveLength(2);

    await user.click(back);
    finishModalAnimation(back);
    await waitFor(() => expect(screen.queryByRole('button', { name: '戻る' })).not.toBeInTheDocument());
  });
});
