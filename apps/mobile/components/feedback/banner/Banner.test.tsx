import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Banner } from './Banner';

describe('Banner', () => {
  it('show が true のときタイトルとメッセージを表示する', () => {
    render(<Banner show title="未確認です" message="メールを確認してください。" />);

    expect(screen.getByText('未確認です')).toBeInTheDocument();
    expect(screen.getByText('メールを確認してください。')).toBeInTheDocument();
  });

  it('show が false のときは何も表示しない', () => {
    render(<Banner show={false} message="メールを確認してください。" />);

    expect(screen.queryByText('メールを確認してください。')).not.toBeInTheDocument();
  });

  it('variant に応じたアイコンを表示する', () => {
    render(<Banner show variant="warning" message="警告" />);

    expect(screen.getByTestId('icon-TriangleAlert')).toBeInTheDocument();
  });

  it('既定では閉じるボタンを表示し、押すと onDismiss が呼ばれる', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Banner show message="メッセージ" onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismissible が false のときは閉じるボタンを表示しない', () => {
    render(<Banner show message="メッセージ" dismissible={false} />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('アクションを押すと onPress のあとに onDismiss が呼ばれる', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <Banner
        show
        message="メッセージ"
        actions={[{ label: '再送', onPress: () => calls.push('onPress') }]}
        onDismiss={() => calls.push('onDismiss')}
      />,
    );

    await user.click(screen.getByRole('button', { name: '再送' }));

    expect(calls).toEqual(['onPress', 'onDismiss']);
  });

  it('アクションは最大 2 件まで表示する', () => {
    render(
      <Banner
        show
        message="メッセージ"
        actions={[
          { label: 'アクション1', onPress: () => {} },
          { label: 'アクション2', onPress: () => {} },
          { label: 'アクション3', onPress: () => {} },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'アクション1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'アクション2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'アクション3' })).not.toBeInTheDocument();
  });
});
