import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Bell, House, Search } from 'lucide-react-native';
import { describe, expect, it, vi } from 'vitest';

import { lightTheme } from '@/styles/themes';

import { AppChromeProvider, type AppChrome } from '../app-chrome/AppChromeProvider';
import { useAppChrome } from '../app-chrome/useAppChrome';
import { TabBar } from './TabBar';

let chrome: AppChrome;

function CaptureChrome() {
  chrome = useAppChrome();
  return null;
}

const routes = [
  { key: 'index-key', name: 'index', params: undefined, title: 'ホーム', icon: House },
  { key: 'search-key', name: 'search', params: undefined, title: '検索', icon: Search },
  { key: 'notifications-key', name: 'notifications', params: undefined, title: undefined, icon: Bell },
];

/** Builds the props the Tabs navigator passes to a custom tab bar. */
function createProps({ index = 0, defaultPrevented = false } = {}) {
  const emit = vi.fn(() => ({ defaultPrevented }));
  const navigate = vi.fn();
  const props = {
    state: {
      index,
      routes: routes.map(({ key, name, params }) => ({ key, name, params })),
    },
    descriptors: Object.fromEntries(
      routes.map(({ key, title, icon: Icon }) => [
        key,
        {
          options: {
            title,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Icon color={color} size={size} />
            ),
          },
        },
      ]),
    ),
    navigation: { emit, navigate },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as BottomTabBarProps;
  return { props, emit, navigate };
}

function renderTabBar(props: BottomTabBarProps) {
  render(
    <AppChromeProvider>
      <CaptureChrome />
      <TabBar {...props} />
    </AppChromeProvider>,
  );
}

describe('TabBar', () => {
  it('各タブのタイトルとアイコンを表示する', () => {
    renderTabBar(createProps().props);

    expect(screen.getByRole('tab', { name: 'ホーム' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '検索' })).toBeInTheDocument();
    expect(screen.getByTestId('icon-House')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Search')).toBeInTheDocument();
  });

  it('title がないタブはルート名を表示する', () => {
    renderTabBar(createProps().props);

    expect(screen.getByRole('tab', { name: 'notifications' })).toBeInTheDocument();
  });

  it('選択中のタブを selected にし、アイコンをリンク色で表示する', () => {
    renderTabBar(createProps({ index: 1 }).props);

    expect(screen.getByRole('tab', { name: '検索' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'ホーム' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('icon-Search')).toHaveAttribute('data-color', lightTheme.colors.link);
    expect(screen.getByTestId('icon-House')).toHaveAttribute('data-color', lightTheme.colors.textMuted);
  });

  it('選択していないタブを押すと tabPress を通知してそのタブへ移動する', async () => {
    const user = userEvent.setup();
    const { props, emit, navigate } = createProps({ index: 0 });
    renderTabBar(props);

    await user.click(screen.getByRole('tab', { name: '検索' }));

    expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'search-key', canPreventDefault: true });
    expect(navigate).toHaveBeenCalledWith('search', undefined);
  });

  it('選択中のタブを押しても移動しない', async () => {
    const user = userEvent.setup();
    const { props, emit, navigate } = createProps({ index: 0 });
    renderTabBar(props);

    await user.click(screen.getByRole('tab', { name: 'ホーム' }));

    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'tabPress', target: 'index-key' }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('tabPress が preventDefault されたときは移動しない', async () => {
    const user = userEvent.setup();
    const { props, navigate } = createProps({ index: 0, defaultPrevented: true });
    renderTabBar(props);

    await user.click(screen.getByRole('tab', { name: '検索' }));

    expect(navigate).not.toHaveBeenCalled();
  });

  it('タブを押すと隠れていたヘッダーとフッタを再表示する', async () => {
    const user = userEvent.setup();
    renderTabBar(createProps().props);
    act(() => {
      chrome.hidden.value = true;
      chrome.progress.value = 1;
    });

    await user.click(screen.getByRole('tab', { name: '検索' }));

    expect(chrome.hidden.value).toBe(false);
    await waitFor(() => expect(chrome.progress.value).toBe(0));
  });

  it('隠れる状態になるとフェードアウトし、表示に戻るとフェードインする', async () => {
    renderTabBar(createProps().props);
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveStyle({ opacity: '1' });

    act(() => {
      chrome.progress.value = 1;
    });
    await waitFor(() => expect(tabList).toHaveStyle({ opacity: '0' }));

    act(() => {
      chrome.progress.value = 0;
    });
    await waitFor(() => expect(tabList).toHaveStyle({ opacity: '1' }));
  });
});
