import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Toast, type ToastOptions } from './Toast';

const MAX_TOASTS = 3;

export type ToastApi = {
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
};

type ToastItem = ToastOptions & { id: string };

export const ToastContext = createContext<ToastApi | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    const id = `toast-${nextId.current++}`;
    // Newest first; drop the oldest ones beyond the limit.
    setToasts((current) => [{ ...options, id }, ...current].slice(0, MAX_TOASTS));
    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const api = useMemo(() => ({ show, hide, hideAll }), [show, hide, hideAll]);

  return (
    <ToastContext.Provider value={api}>
      <View style={styles.root}>
        {children}
        <View style={styles.viewport}>
          {toasts.map(({ id, ...options }) => (
            <Toast key={id} {...options} onHide={() => hide(id)} />
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
  },
  viewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: theme.gap(2),
    paddingTop: rt.insets.top + theme.gap(2),
    paddingHorizontal: theme.gap(4),
    pointerEvents: 'box-none',
  },
}));
