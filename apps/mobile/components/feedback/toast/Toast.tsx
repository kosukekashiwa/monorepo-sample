import { X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { FeedbackIcon } from '../FeedbackIcon';
import type { FeedbackAction, FeedbackVariant } from '../types';

export const DEFAULT_TOAST_DURATION = 3000;

export type ToastOptions = {
  message: string;
  title?: string;
  /** Defaults to 'info'. */
  variant?: FeedbackVariant;
  /** Milliseconds until the toast hides itself. `null` keeps it until closed. Defaults to 3000. */
  duration?: number | null;
  /** Pressing the action calls `onPress` and hides the toast. */
  action?: FeedbackAction;
  /** Defaults to true when `duration` is null, false otherwise. */
  showCloseButton?: boolean;
};

export type ToastProps = ToastOptions & {
  onHide: () => void;
};

export function Toast({
  message,
  title,
  variant = 'info',
  duration = DEFAULT_TOAST_DURATION,
  action,
  showCloseButton = duration === null,
  onHide,
}: ToastProps) {
  const { theme } = useUnistyles();
  const onHideRef = useRef(onHide);

  useEffect(() => {
    onHideRef.current = onHide;
  }, [onHide]);

  useEffect(() => {
    if (duration === null) {
      return;
    }
    const timer = setTimeout(() => onHideRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  styles.useVariants({ variant });

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      layout={LinearTransition}
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <FeedbackIcon variant={variant} />
      <View style={styles.body}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
      {action ? (
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={() => {
            action.onPress();
            onHide();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      ) : null}
      {showCloseButton ? (
        <Pressable
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          onPress={onHide}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={18} color={theme.colors.feedback[variant].foreground} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(3),
    width: '100%',
    maxWidth: 480,
    paddingVertical: theme.gap(3),
    paddingHorizontal: theme.gap(4),
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    variants: {
      variant: {
        info: {
          backgroundColor: theme.colors.feedback.info.background,
          borderLeftColor: theme.colors.feedback.info.accent,
        },
        success: {
          backgroundColor: theme.colors.feedback.success.background,
          borderLeftColor: theme.colors.feedback.success.accent,
        },
        warning: {
          backgroundColor: theme.colors.feedback.warning.background,
          borderLeftColor: theme.colors.feedback.warning.accent,
        },
        error: {
          backgroundColor: theme.colors.feedback.error.background,
          borderLeftColor: theme.colors.feedback.error.accent,
        },
      },
    },
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
  action: {
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
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
  close: {
    padding: theme.gap(1),
  },
  pressed: {
    opacity: 0.6,
  },
}));
