import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useAppChrome } from '../app-chrome/useAppChrome';

export type AppHeaderProps = {
  /** Defaults to the app name in app.json (`expo.name`). */
  title?: string;
  /**
   * Rendered right below the header bar (e.g. `<BannerOutlet />`). It is not faded out;
   * it moves up together with the header bar when the header hides.
   */
  children?: ReactNode;
};

/**
 * App header showing the app name, overlaid at the top of the screen.
 * Fades out while scrolling down and reappears while scrolling up (see `ChromeScrollView`).
 * Must be inside an `AppChromeProvider`.
 */
export function AppHeader({ title = Constants.expoConfig?.name ?? '', children }: AppHeaderProps) {
  const { progress, headerBarHeight, setTopInset } = useAppChrome();

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -headerBarHeight.value * progress.value }],
  }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
  }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      onLayout={(event: LayoutChangeEvent) => setTopInset(event.nativeEvent.layout.height)}
    >
      <Animated.View style={[styles.header, headerStyle]}>
        <View
          style={styles.bar}
          onLayout={(event) => {
            headerBarHeight.value = event.nativeEvent.layout.height;
          }}
        >
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        </View>
      </Animated.View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
  header: {
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bar: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: theme.gap(4),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
}));
