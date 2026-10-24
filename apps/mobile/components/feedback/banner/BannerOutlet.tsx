import { useContext, type ReactNode } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Banner } from './Banner';
import { BannerStateContext } from './BannerProvider';
import { useBanner } from './useBanner';

type BannerOutletProps = {
  /** Adds the status bar inset as top padding. Use when the outlet sits at the top edge of the window. */
  safeAreaTop?: boolean;
};

/** Renders the banner shown via `useBanner().show()`. Must be inside a `BannerProvider`. */
export function BannerOutlet({ safeAreaTop = false }: BannerOutletProps) {
  const banner = useContext(BannerStateContext);
  const { hide } = useBanner();

  if (!banner) {
    return null;
  }

  const { id, onDismiss, ...options } = banner;

  return (
    <Banner
      key={id}
      {...options}
      show
      safeAreaTop={safeAreaTop}
      onDismiss={() => {
        hide(id);
        onDismiss?.();
      }}
    />
  );
}

type BannerScreenLayoutProps = {
  children: ReactNode;
  /** Whether the navigation header is shown above this screen. Defaults to true. */
  headerShown?: boolean;
};

/**
 * Wraps a screen so the banner is inserted at its top (below the navigation header),
 * pushing the screen content down. Intended for `<Stack screenLayout>`.
 */
export function BannerScreenLayout({ children, headerShown = true }: BannerScreenLayoutProps) {
  return (
    <Animated.View style={styles.root} layout={LinearTransition}>
      {/* Without a header the banner sits at the top edge of the window. */}
      <BannerOutlet safeAreaTop={!headerShown} />
      {/*
        A nested provider measures insets from its own frame, so a screen below the
        banner doesn't add the status bar inset again.
      */}
      <Animated.View style={styles.content} layout={LinearTransition}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
