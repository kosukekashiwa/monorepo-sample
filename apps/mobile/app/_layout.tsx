import '@/styles/unistyles';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { BannerScreenLayout } from '@/components/feedback/banner/BannerOutlet';
import { BannerProvider } from '@/components/feedback/banner/BannerProvider';
import { ToastProvider } from '@/components/feedback/toast/ToastProvider';
import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before the app is ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <BannerProvider>
          <Stack
            screenLayout={({ children, options, route }) =>
              // The tabs render the banner below their own AppHeader.
              route.name === '(tabs)' ? (
                children
              ) : (
                <BannerScreenLayout headerShown={options.headerShown !== false}>
                  {children}
                </BannerScreenLayout>
              )
            }
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </BannerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
