import { Tabs } from 'expo-router';

// Navigation: Dashboard, Map, Emergency, Incidents, Profile
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="live-traffic" />
      <Tabs.Screen name="emergency" />
      <Tabs.Screen name="incidents" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
