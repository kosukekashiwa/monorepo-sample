import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockScrollMetrics, scrollTo } from '@/test/scroll';

import { AppChromeProvider, type AppChrome } from './AppChromeProvider';
import { useAppChrome } from './useAppChrome';
import { useHideOnScroll } from './useHideOnScroll';

let chrome: AppChrome;

function ScrollHarness() {
  chrome = useAppChrome();
  const onScroll = useHideOnScroll();
  return (
    <Animated.ScrollView testID="scroll" onScroll={onScroll} scrollEventThrottle={16}>
      <Text>内容</Text>
    </Animated.ScrollView>
  );
}

/** Renders a scroll view using useHideOnScroll: content 3000px tall in an 800px viewport. */
function renderScrollView() {
  render(
    <AppChromeProvider>
      <ScrollHarness />
    </AppChromeProvider>,
  );
  const scrollView = screen.getByTestId('scroll');
  mockScrollMetrics(scrollView, { content: 3000, viewport: 800 });
  return scrollView;
}

describe('useHideOnScroll', () => {
  beforeEach(() => {
    chrome = undefined as unknown as AppChrome;
  });

  it('下にスクロールするとヘッダーとフッタを隠す', async () => {
    const scrollView = renderScrollView();

    await scrollTo(scrollView, 100);

    expect(chrome.hidden.value).toBe(true);
    expect(chrome.progress.value).toBe(1);
  });

  it('上にスクロールするとヘッダーとフッタを再表示する', async () => {
    const scrollView = renderScrollView();
    await scrollTo(scrollView, 300);

    await scrollTo(scrollView, 200);

    expect(chrome.hidden.value).toBe(false);
    expect(chrome.progress.value).toBe(0);
  });

  it('4px 未満の動きでは表示を切り替えない', async () => {
    const scrollView = renderScrollView();
    await scrollTo(scrollView, 300);

    await scrollTo(scrollView, 297);

    expect(chrome.hidden.value).toBe(true);
  });

  it('最上部に戻ると表示する', async () => {
    const scrollView = renderScrollView();
    await scrollTo(scrollView, 300);

    await scrollTo(scrollView, 0);

    expect(chrome.hidden.value).toBe(false);
  });

  it('最下部でのバウンスでは再表示しない', async () => {
    const scrollView = renderScrollView();
    // The bottom is 3000 - 800 = 2200.
    await scrollTo(scrollView, 2100);
    await scrollTo(scrollView, 2250);

    await scrollTo(scrollView, 2200);

    expect(chrome.hidden.value).toBe(true);
  });
});
