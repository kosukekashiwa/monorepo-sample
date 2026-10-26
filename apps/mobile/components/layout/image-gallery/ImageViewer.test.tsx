import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useFakeImage } from '@/test/fakeImage';

import { ImageViewer } from './ImageViewer';

const images = [
  { uri: 'https://example.com/1.png' },
  { uri: 'https://example.com/2.png' },
  { uri: 'https://example.com/3.png' },
];

describe('ImageViewer', () => {
  useFakeImage();

  it('open が false のときは何も表示しない', () => {
    render(<ImageViewer open={false} onClose={() => {}} images={images} />);

    expect(screen.queryByRole('button', { name: '戻る' })).not.toBeInTheDocument();
  });

  it('open が true のときは戻るボタンとすべての画像を表示する', () => {
    render(<ImageViewer open onClose={() => {}} images={images} />);

    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    expect(screen.getByLabelText('画像 1/3')).toBeInTheDocument();
    expect(screen.getByLabelText('画像 2/3')).toBeInTheDocument();
    expect(screen.getByLabelText('画像 3/3')).toBeInTheDocument();
  });

  it('画像は横並びのリストで表示する', () => {
    render(<ImageViewer open onClose={() => {}} images={images} />);

    const first = screen.getByLabelText('画像 1/3');
    const second = screen.getByLabelText('画像 2/3');
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('戻るボタンを押すと onClose が呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImageViewer open onClose={onClose} images={images} />);

    await user.click(screen.getByRole('button', { name: '戻る' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('読み込めない画像は「読み込めませんでした。」と表示する', async () => {
    render(
      <ImageViewer
        open
        onClose={() => {}}
        images={[{ uri: 'https://example.com/1.png' }, { uri: 'https://example.com/error.png' }]}
      />,
    );

    expect(await screen.findByText('読み込めませんでした。')).toBeInTheDocument();
  });
});
