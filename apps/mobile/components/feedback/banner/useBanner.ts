import { useContext } from 'react';

import { BannerContext, type BannerApi } from './BannerProvider';

export function useBanner(): BannerApi {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider.');
  }
  return context;
}
