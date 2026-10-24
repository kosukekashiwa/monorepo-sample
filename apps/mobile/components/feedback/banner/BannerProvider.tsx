import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Banner, type BannerProps } from './Banner';

export type BannerOptions = Omit<BannerProps, 'show' | 'safeAreaTop'>;

export type BannerApi = {
  /** Shows a banner, replacing the current one, and returns its id. */
  show: (options: BannerOptions) => string;
  /** Hides the banner. With an id, hides it only if that banner is still shown. */
  hide: (id?: string) => void;
};

type BannerItem = BannerOptions & { id: string };

export const BannerContext = createContext<BannerApi | null>(null);

type BannerProviderProps = {
  children: ReactNode;
};

export function BannerProvider({ children }: BannerProviderProps) {
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const nextId = useRef(0);

  const show = useCallback((options: BannerOptions) => {
    const id = `banner-${nextId.current++}`;
    setBanner({ ...options, id });
    return id;
  }, []);

  const hide = useCallback((id?: string) => {
    setBanner((current) => (id === undefined || current?.id === id ? null : current));
  }, []);

  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <BannerContext.Provider value={api}>
      <Animated.View style={styles.root} layout={LinearTransition}>
        {banner ? <CurrentBanner banner={banner} hide={hide} key={banner.id} /> : null}
        {/*
          A nested provider measures insets from its own frame, so screens (and the
          navigation header) below the banner don't add the status bar inset again.
        */}
        <Animated.View style={styles.content} layout={LinearTransition}>
          <SafeAreaProvider>{children}</SafeAreaProvider>
        </Animated.View>
      </Animated.View>
    </BannerContext.Provider>
  );
}

function CurrentBanner({ banner, hide }: { banner: BannerItem; hide: (id: string) => void }) {
  const { id, onDismiss, ...options } = banner;

  return (
    <Banner
      {...options}
      show
      safeAreaTop
      onDismiss={() => {
        hide(id);
        onDismiss?.();
      }}
    />
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
