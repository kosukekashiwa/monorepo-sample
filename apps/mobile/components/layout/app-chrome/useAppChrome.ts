import { useContext } from 'react';

import { AppChromeContext, type AppChrome } from './AppChromeProvider';

export function useAppChrome(): AppChrome {
  const context = useContext(AppChromeContext);
  if (!context) {
    throw new Error('useAppChrome must be used within an AppChromeProvider.');
  }
  return context;
}
