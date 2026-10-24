import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { FeedbackAction } from '../types';

export type DialogProps = {
  open: boolean;
  /** Called on backdrop press (when `dismissible`) and on the Android back button. */
  onClose: () => void;
  title: string;
  description?: string;
  primaryAction?: FeedbackAction;
  secondaryAction?: FeedbackAction;
  /** When false, pressing the backdrop does not close the dialog. Defaults to true. */
  dismissible?: boolean;
  /** Custom content rendered below the title, instead of `description`. */
  children?: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  dismissible = true,
  children,
}: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissible ? onClose : undefined}
          accessibilityLabel="Close dialog"
          accessible={dismissible}
        />
        <View style={styles.container} accessibilityRole="alert" accessibilityViewIsModal>
          <Text style={styles.title}>{title}</Text>
          {children ?? (description ? <Text style={styles.description}>{description}</Text> : null)}
          {primaryAction || secondaryAction ? (
            <View style={styles.actions}>
              {secondaryAction ? (
                <Pressable
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                  onPress={secondaryAction.onPress}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryLabel}>{secondaryAction.label}</Text>
                </Pressable>
              ) : null}
              {primaryAction ? (
                <Pressable
                  style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
                  onPress={primaryAction.onPress}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryLabel}>{primaryAction.label}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.gap(6),
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.overlay,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    gap: theme.gap(3),
    padding: theme.gap(6),
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.gap(2),
    marginTop: theme.gap(2),
  },
  button: {
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(4),
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.link,
  },
  pressed: {
    opacity: 0.7,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.link,
  },
}));
