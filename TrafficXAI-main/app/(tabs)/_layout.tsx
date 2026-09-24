import { Tabs } from 'expo-router';

// All navigation is handled via SideDrawer — tabs use headerShown: false
// Tab bar hidden as SideDrawer replaces it for this command-center layout
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="live-traffic" />
      <Tabs.Screen name="ai-monitor" />
      <Tabs.Screen name="emergency" />
      <Tabs.Screen name="incidents" />
      <Tabs.Screen name="routes" />
      <Tabs.Screen name="signals" />
      <Tabs.Screen name="predictions" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
