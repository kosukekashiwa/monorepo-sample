import { fireEvent } from '@testing-library/react';

/** jsdom has no layout, so give a scroll container the sizes react-native-web reads on scroll. */
export function mockScrollMetrics(
  element: HTMLElement,
  { content, viewport }: { content: number; viewport: number },
) {
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: content });
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: viewport });
}

/**
 * Scrolls `element` to `y` and fires a scroll event. Waits a little afterwards because
 * react-native-web drops scroll events that come within `scrollEventThrottle` (16ms) of the last one.
 */
export async function scrollTo(element: HTMLElement, y: number) {
  element.scrollTop = y;
  fireEvent.scroll(element);
  await new Promise<void>((resolve) => setTimeout(resolve, 20));
}
