import React, { useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { AppHeader } from './AppHeader';
import { SideDrawer } from './SideDrawer';

interface Props {
  title: string;
  children: ReactNode;
  noPadding?: boolean;
}

export function ScreenShell({ title, children, noPadding = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title={title} onMenuPress={() => setDrawerOpen(true)} />
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </SafeAreaView>

      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: { flex: 1 },
  content: { flex: 1 },
  noPadding: {},
});
