import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';
import { Screen } from '../types';

export function BottomNav({ active, go }: { active: 'wallet' | 'history' | 'settings'; go: (screen: Screen) => void }) {
  const item = (key: 'wallet' | 'history' | 'settings', icon: string, label: string, screen: Screen) => {
    const isActive = active === key;
    return (
      <Pressable style={styles.navItem} onPress={() => go(screen)}>
        <Text style={[styles.navIcon, isActive && styles.navActive]}>{icon}</Text>
        <Text style={[styles.navText, isActive && styles.navActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.bottomNav}>
      {item('wallet', '■', 'Wallet', 'wallet')}
      {item('history', '◷', 'History', 'history')}
      {item('settings', '⚙', 'Settings', 'settings')}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: colors.muted,
  },
  navText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  navActive: {
    color: colors.red,
  },
});