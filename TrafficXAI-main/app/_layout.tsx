import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { TrafficProvider } from '@/contexts/TrafficContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <TrafficProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </TrafficProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
