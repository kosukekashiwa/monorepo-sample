import type { NativeScrollEvent } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

import { CHROME_ANIMATION_DURATION } from './AppChromeProvider';
import { useAppChrome } from './useAppChrome';

/** Ignore smaller movements so that a slight jitter doesn't toggle the chrome. */
const SCROLL_THRESHOLD = 4;

/**
 * Returns a scroll handler that hides the header and footer while scrolling down
 * and shows them again while scrolling up. Pass it to an `Animated.ScrollView` /
 * `Animated.FlatList` from react-native-reanimated as `onScroll`.
 */
export function useHideOnScroll() {
  const { progress, hidden } = useAppChrome();
  const lastY = useSharedValue(0);

  return useAnimatedScrollHandler({
    onScroll: (event: NativeScrollEvent) => {
      const y = event.contentOffset.y;
      const maxY = event.contentSize.height - event.layoutMeasurement.height;
      const dy = y - lastY.value;

      if (y <= 0) {
        // At (or bouncing past) the top: always show.
        if (hidden.value) {
          hidden.value = false;
          progress.value = withTiming(0, { duration: CHROME_ANIMATION_DURATION });
        }
      } else if (y < maxY && Math.abs(dy) >= SCROLL_THRESHOLD) {
        // Skip the bottom bounce, which would otherwise read as scrolling up.
        const shouldHide = dy > 0;
        if (hidden.value !== shouldHide) {
          hidden.value = shouldHide;
          progress.value = withTiming(shouldHide ? 1 : 0, { duration: CHROME_ANIMATION_DURATION });
        }
      }

      if (y <= 0 || Math.abs(dy) >= SCROLL_THRESHOLD) {
        lastY.value = y;
      }
    },
  });
}
