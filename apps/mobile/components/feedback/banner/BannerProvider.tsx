import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import type { BannerProps } from './Banner';

export type BannerOptions = Omit<BannerProps, 'show' | 'safeAreaTop'>;

export type BannerApi = {
  /** Shows a banner, replacing the current one, and returns its id. */
  show: (options: BannerOptions) => string;
  /** Hides the banner. With an id, hides it only if that banner is still shown. */
  hide: (id?: string) => void;
};

export type BannerItem = BannerOptions & { id: string };

export const BannerContext = createContext<BannerApi | null>(null);

/** The banner currently shown. Read by `BannerOutlet`; kept separate so `useBanner` callers don't re-render. */
export const BannerStateContext = createContext<BannerItem | null>(null);

type BannerProviderProps = {
  children: ReactNode;
};

/** Holds the banner state. The banner itself is rendered wherever `BannerOutlet` is placed. */
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
      <BannerStateContext.Provider value={banner}>{children}</BannerStateContext.Provider>
    </BannerContext.Provider>
  );
}
