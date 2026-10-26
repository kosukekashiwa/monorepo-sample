import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

export const CHROME_ANIMATION_DURATION = 200;

export type AppChrome = {
  /** 0 = header and footer shown, 1 = hidden. Animated on the UI thread. */
  progress: SharedValue<number>;
  /** Whether the chrome is (being) hidden. Used to avoid restarting the animation on every scroll event. */
  hidden: SharedValue<boolean>;
  /** Height of the header bar without the status bar inset. The header slides up by this much when hidden. */
  headerBarHeight: SharedValue<number>;
  /** Height of the footer including the bottom inset. The footer slides down by this much when hidden. */
  footerHeight: SharedValue<number>;
  /** Total height overlaid at the top (status bar inset + header bar + banner). Use as content top padding. */
  topInset: number;
  /** Total height overlaid at the bottom (footer + bottom inset). Use as content bottom padding. */
  bottomInset: number;
  setTopInset: (height: number) => void;
  setBottomInset: (height: number) => void;
  /** Shows the header and footer. */
  show: () => void;
};

export const AppChromeContext = createContext<AppChrome | null>(null);

type AppChromeProviderProps = {
  children: ReactNode;
};

/** Shares the show/hide state of `AppHeader` and `TabBar` with the scroll views that drive it. */
export function AppChromeProvider({ children }: AppChromeProviderProps) {
  const progress = useSharedValue(0);
  const hidden = useSharedValue(false);
  const headerBarHeight = useSharedValue(0);
  const footerHeight = useSharedValue(0);
  const [topInset, setTopInset] = useState(0);
  const [bottomInset, setBottomInset] = useState(0);

  const show = useCallback(() => {
    hidden.value = false;
    progress.value = withTiming(0, { duration: CHROME_ANIMATION_DURATION });
  }, [hidden, progress]);

  const value = useMemo(
    () => ({
      progress,
      hidden,
      headerBarHeight,
      footerHeight,
      topInset,
      bottomInset,
      setTopInset,
      setBottomInset,
      show,
    }),
    [progress, hidden, headerBarHeight, footerHeight, topInset, bottomInset, show],
  );

  return <AppChromeContext.Provider value={value}>{children}</AppChromeContext.Provider>;
}
