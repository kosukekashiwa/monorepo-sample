import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text, type LayoutChangeEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAppChrome } from '../app-chrome/useAppChrome';

/**
 * Tab bar for `<Tabs tabBar={(props) => <TabBar {...props} />}>`, overlaid at the bottom of the screen.
 * Uses each screen's `title` and `tabBarIcon` options. Fades out while scrolling down and
 * reappears while scrolling up (see `ChromeScrollView`). Must be inside an `AppChromeProvider`.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useUnistyles();
  const { progress, footerHeight, setBottomInset, show } = useAppChrome();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
    transform: [{ translateY: footerHeight.value * progress.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessibilityRole="tablist"
      onLayout={(event: LayoutChangeEvent) => {
        footerHeight.value = event.nativeEvent.layout.height;
        setBottomInset(event.nativeEvent.layout.height);
      }}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) {
          return null;
        }
        const { options } = descriptor;
        const focused = state.index === index;
        const label = options.title ?? route.name;
        const color = focused ? theme.colors.link : theme.colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          // Show the header and footer again for the newly selected tab.
          show();
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            accessibilityRole="tab"
            aria-selected={focused}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
          >
            {options.tabBarIcon?.({ focused, color, size: 24 })}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingBottom: rt.insets.bottom,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(0.5),
    paddingVertical: theme.gap(2),
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
}));
