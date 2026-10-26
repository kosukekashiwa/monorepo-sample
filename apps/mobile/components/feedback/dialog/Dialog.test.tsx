import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('open が true のときタイトルと説明を表示する', () => {
    render(<Dialog open onClose={() => {}} title="削除しますか？" description="取り消せません。" />);

    expect(screen.getByText('削除しますか？')).toBeInTheDocument();
    expect(screen.getByText('取り消せません。')).toBeInTheDocument();
  });

  it('open が false のときは何も表示しない', () => {
    render(<Dialog open={false} onClose={() => {}} title="削除しますか？" />);

    expect(screen.queryByText('削除しますか？')).not.toBeInTheDocument();
  });

  it('children を渡すと description の代わりに表示する', () => {
    render(
      <Dialog open onClose={() => {}} title="タイトル" description="説明">
        <Text>カスタム内容</Text>
      </Dialog>,
    );

    expect(screen.getByText('カスタム内容')).toBeInTheDocument();
    expect(screen.queryByText('説明')).not.toBeInTheDocument();
  });

  it('プライマリアクションを押すと onPress が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Dialog open onClose={() => {}} title="タイトル" primaryAction={{ label: '削除', onPress }} />);

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('セカンダリアクションを押すと onPress が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Dialog open onClose={() => {}} title="タイトル" secondaryAction={{ label: 'キャンセル', onPress }} />,
    );

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('アクションを押しても onClose は呼ばれない', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="タイトル" primaryAction={{ label: 'OK', onPress: () => {} }} />,
    );

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('背景を押すと onClose が呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="タイトル" />);

    await user.click(screen.getByLabelText('Close dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismissible が false のときは背景を押しても onClose が呼ばれない', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="タイトル" dismissible={false} />);

    await user.click(screen.getByLabelText('Close dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
