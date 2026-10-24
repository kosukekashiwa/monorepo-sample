import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { FeedbackIcon } from '../FeedbackIcon';
import type { FeedbackAction, FeedbackVariant } from '../types';

export type BannerProps = {
  show: boolean;
  message: string;
  title?: string;
  /** Defaults to 'info'. */
  variant?: FeedbackVariant;
  /** Up to two actions. Pressing one calls its `onPress`, then `onDismiss`. */
  actions?: FeedbackAction[];
  /** Shows the close button. Defaults to true. */
  dismissible?: boolean;
  /** Called when the close button or an action is pressed. */
  onDismiss?: () => void;
  /** Adds the status bar inset as top padding. Use when the banner sits at the top edge of the window. */
  safeAreaTop?: boolean;
};

export function Banner({
  show,
  message,
  title,
  variant = 'info',
  actions,
  dismissible = true,
  onDismiss,
  safeAreaTop = false,
}: BannerProps) {
  const { theme } = useUnistyles();

  styles.useVariants({ variant, safeAreaTop });

  if (!show) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        <FeedbackIcon variant={variant} />
        <View style={styles.body}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
        </View>
        {dismissible ? (
          <Pressable
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            onPress={onDismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={18} color={theme.colors.feedback[variant].foreground} />
          </Pressable>
        ) : null}
      </View>
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.slice(0, 2).map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
              onPress={() => {
                action.onPress();
                onDismiss?.();
              }}
              accessibilityRole="button"
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    gap: theme.gap(2),
    paddingVertical: theme.gap(3),
    paddingHorizontal: theme.gap(4),
    borderBottomWidth: 1,
    variants: {
      variant: {
        info: {
          backgroundColor: theme.colors.feedback.info.background,
          borderBottomColor: theme.colors.feedback.info.accent,
        },
        success: {
          backgroundColor: theme.colors.feedback.success.background,
          borderBottomColor: theme.colors.feedback.success.accent,
        },
        warning: {
          backgroundColor: theme.colors.feedback.warning.background,
          borderBottomColor: theme.colors.feedback.warning.accent,
        },
        error: {
          backgroundColor: theme.colors.feedback.error.background,
          borderBottomColor: theme.colors.feedback.error.accent,
        },
      },
      safeAreaTop: {
        true: { paddingTop: rt.insets.top + theme.gap(3) },
        false: {},
      },
    },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.gap(3),
  },
  body: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    variants: {
      variant: {
        info: { color: theme.colors.feedback.info.foreground },
        success: { color: theme.colors.feedback.success.foreground },
        warning: { color: theme.colors.feedback.warning.foreground },
        error: { color: theme.colors.feedback.error.foreground },
      },
    },
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    variants: {
      variant: {
        info: { color: theme.colors.feedback.info.foreground },
        success: { color: theme.colors.feedback.success.foreground },
        warning: { color: theme.colors.feedback.warning.foreground },
        error: { color: theme.colors.feedback.error.foreground },
      },
    },
  },
  close: {
    padding: theme.gap(0.5),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.gap(2),
  },
  action: {
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(3),
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    variants: {
      variant: {
        info: { color: theme.colors.feedback.info.accent },
        success: { color: theme.colors.feedback.success.accent },
        warning: { color: theme.colors.feedback.warning.accent },
        error: { color: theme.colors.feedback.error.accent },
      },
    },
  },
  pressed: {
    opacity: 0.6,
  },
}));
