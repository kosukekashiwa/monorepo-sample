import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFakeImage } from '@/test/fakeImage';

import { FALLBACK_MESSAGE, GalleryImage } from './GalleryImage';

describe('GalleryImage', () => {
  useFakeImage();

  it('画像を表示する', () => {
    render(
      <GalleryImage
        source={{ uri: 'https://example.com/photo.png' }}
        mode="preview"
        accessibilityLabel="写真"
      />,
    );

    expect(screen.getByLabelText('写真')).toBeInTheDocument();
    expect(screen.queryByText(FALLBACK_MESSAGE)).not.toBeInTheDocument();
  });

  it('読み込みに失敗すると「読み込めませんでした。」と表示する', async () => {
    render(<GalleryImage source={{ uri: 'https://example.com/error.png' }} mode="preview" />);

    expect(await screen.findByText('読み込めませんでした。')).toBeInTheDocument();
  });

  it('拡大表示でも読み込みに失敗すると「読み込めませんでした。」と表示する', async () => {
    render(<GalleryImage source={{ uri: 'https://example.com/error.png' }} mode="viewer" />);

    expect(await screen.findByText('読み込めませんでした。')).toBeInTheDocument();
  });

  it('読み込みが完了すると onLoad に画像の実サイズを渡す', async () => {
    const onLoad = vi.fn();
    render(
      <GalleryImage
        source={{ uri: 'https://example.com/photo.png#640x480' }}
        mode="preview"
        onLoad={onLoad}
      />,
    );

    await waitFor(() => expect(onLoad).toHaveBeenCalledWith({ width: 640, height: 480 }));
  });

  it('読み込みに失敗したときは onLoad を呼ばない', async () => {
    const onLoad = vi.fn();
    render(<GalleryImage source={{ uri: 'https://example.com/error.png' }} mode="preview" onLoad={onLoad} />);

    await screen.findByText('読み込めませんでした。');
    expect(onLoad).not.toHaveBeenCalled();
  });
});
