// Static rendering on web loads routes before the root layout, so configure Unistyles here too.
import '@/styles/unistyles';

import { Tabs } from 'expo-router/js-tabs';
import { Bell, House, Search, SquarePlus, User } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BannerOutlet } from '@/components/feedback/banner/BannerOutlet';
import { AppChromeProvider } from '@/components/layout/app-chrome/AppChromeProvider';
import { AppHeader } from '@/components/layout/app-header/AppHeader';
import { TabBar } from '@/components/layout/tab-bar/TabBar';

export default function TabsLayout() {
  return (
    <AppChromeProvider>
      <View style={styles.root}>
        <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'ホーム',
              tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{ title: '検索', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
          />
          <Tabs.Screen
            name="post"
            options={{
              title: '投稿',
              tabBarIcon: ({ color, size }) => <SquarePlus color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{ title: '通知', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'マイページ',
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </Tabs>
        <AppHeader>
          <BannerOutlet />
        </AppHeader>
      </View>
    </AppChromeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
