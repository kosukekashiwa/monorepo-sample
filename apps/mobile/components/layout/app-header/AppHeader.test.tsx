import { act, render, screen, waitFor } from '@testing-library/react';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

import { AppChromeProvider, type AppChrome } from '../app-chrome/AppChromeProvider';
import { useAppChrome } from '../app-chrome/useAppChrome';
import { AppHeader } from './AppHeader';

vi.mock('expo-constants', () => ({
  default: { expoConfig: { name: 'テストアプリ' } },
}));

let chrome: AppChrome;

function CaptureChrome() {
  chrome = useAppChrome();
  return null;
}

/** The element that fades out: the header bar including the status bar area. */
function getHeaderBar() {
  return screen.getByRole('heading').parentElement?.parentElement as HTMLElement;
}

describe('AppHeader', () => {
  it('既定では app.json のアプリ名を表示する', () => {
    render(
      <AppChromeProvider>
        <AppHeader />
      </AppChromeProvider>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('テストアプリ');
  });

  it('title を渡すとそのタイトルを表示する', () => {
    render(
      <AppChromeProvider>
        <AppHeader title="マイアプリ" />
      </AppChromeProvider>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('マイアプリ');
  });

  it('children をヘッダーの下に表示する', () => {
    render(
      <AppChromeProvider>
        <AppHeader title="マイアプリ">
          <Text>お知らせ</Text>
        </AppHeader>
      </AppChromeProvider>,
    );

    const heading = screen.getByRole('heading');
    const child = screen.getByText('お知らせ');
    expect(heading.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('隠れる状態になるとフェードアウトし、表示に戻るとフェードインする', async () => {
    render(
      <AppChromeProvider>
        <CaptureChrome />
        <AppHeader title="マイアプリ" />
      </AppChromeProvider>,
    );
    expect(getHeaderBar()).toHaveStyle({ opacity: '1' });

    act(() => {
      chrome.progress.value = 1;
    });
    await waitFor(() => expect(getHeaderBar()).toHaveStyle({ opacity: '0' }));

    act(() => {
      chrome.progress.value = 0;
    });
    await waitFor(() => expect(getHeaderBar()).toHaveStyle({ opacity: '1' }));
  });

  it('children はフェードアウトしない', async () => {
    render(
      <AppChromeProvider>
        <CaptureChrome />
        <AppHeader title="マイアプリ">
          <Text>お知らせ</Text>
        </AppHeader>
      </AppChromeProvider>,
    );

    act(() => {
      chrome.progress.value = 1;
    });
    await waitFor(() => expect(getHeaderBar()).toHaveStyle({ opacity: '0' }));

    expect(getHeaderBar()).not.toContainElement(screen.getByText('お知らせ'));
    expect(screen.getByText('お知らせ')).toBeVisible();
  });
});
