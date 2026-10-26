import type { ComponentProps } from 'react';
import Animated from 'react-native-reanimated';

import { useAppChrome } from './useAppChrome';
import { useHideOnScroll } from './useHideOnScroll';

type ChromeScrollViewProps = Omit<ComponentProps<typeof Animated.ScrollView>, 'onScroll'>;

/**
 * A scroll view for screens under `AppHeader` and `TabBar`. It pads its content so
 * nothing is covered by them, and hides / shows them according to the scroll direction.
 */
export function ChromeScrollView({ contentContainerStyle, children, ...props }: ChromeScrollViewProps) {
  const { topInset, bottomInset } = useAppChrome();
  const onScroll = useHideOnScroll();

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      {...props}
      onScroll={onScroll}
      contentContainerStyle={[contentContainerStyle, { paddingTop: topInset, paddingBottom: bottomInset }]}
    >
      {children}
    </Animated.ScrollView>
  );
}
