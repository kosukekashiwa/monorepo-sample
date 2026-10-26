import { act, render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';

import { mockScrollMetrics, scrollTo } from '@/test/scroll';

import { AppChromeProvider, type AppChrome } from './AppChromeProvider';
import { ChromeScrollView } from './ChromeScrollView';
import { useAppChrome } from './useAppChrome';

let chrome: AppChrome;

function CaptureChrome() {
  chrome = useAppChrome();
  return null;
}

function renderChromeScrollView() {
  render(
    <AppChromeProvider>
      <CaptureChrome />
      <ChromeScrollView testID="scroll">
        <Text>内容</Text>
      </ChromeScrollView>
    </AppChromeProvider>,
  );
  return screen.getByTestId('scroll');
}

describe('ChromeScrollView', () => {
  it('子要素を表示する', () => {
    renderChromeScrollView();

    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  it('ヘッダーとフッタの高さ分だけ内容の上下に余白を付ける', () => {
    const scrollView = renderChromeScrollView();

    act(() => {
      chrome.setTopInset(120);
      chrome.setBottomInset(80);
    });

    const content = scrollView.firstElementChild as HTMLElement;
    expect(getComputedStyle(content).paddingTop).toBe('120px');
    expect(getComputedStyle(content).paddingBottom).toBe('80px');
  });

  it('下にスクロールするとヘッダーとフッタを隠し、上にスクロールすると再表示する', async () => {
    const scrollView = renderChromeScrollView();
    mockScrollMetrics(scrollView, { content: 3000, viewport: 800 });

    await scrollTo(scrollView, 300);
    expect(chrome.hidden.value).toBe(true);

    await scrollTo(scrollView, 200);
    expect(chrome.hidden.value).toBe(false);
  });
});
