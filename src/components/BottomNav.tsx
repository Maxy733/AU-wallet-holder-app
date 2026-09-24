import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';
import { Screen } from '../types';

export function BottomNav({
  active,
  go,
  hasUnreadNotifications = false,
}: {
  active: 'wallet' | 'camera' | 'history' | 'settings';
  go: (screen: Screen) => void;
  hasUnreadNotifications?: boolean;
}) {
  const item = (
    key: 'wallet' | 'camera' | 'history' | 'settings',
    activeIcon: React.ComponentProps<typeof Ionicons>['name'],
    inactiveIcon: React.ComponentProps<typeof Ionicons>['name'],
    label: string,
    screen: Screen,
  ) => {
    const isActive = active === key;
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={key === 'history' && hasUnreadNotifications ? `${label}, unread` : label}
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
        onPress={() => go(screen)}
      >
        <View style={styles.iconFrame}>
          <Ionicons name={isActive ? activeIcon : inactiveIcon} size={24} color={isActive ? colors.red : colors.muted} />
          {key === 'history' && hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
        </View>
        <Text style={[styles.navText, isActive && styles.navActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.bottomNav}>
      {item('wallet', 'wallet', 'wallet-outline', 'Wallet', 'wallet')}
      {item('camera', 'camera', 'camera-outline', 'Camera', 'camera')}
      {item('history', 'notifications', 'notifications-outline', 'Notifications', 'history')}
      {item('settings', 'settings', 'settings-outline', 'Settings', 'settings')}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navItemPressed: { opacity: 0.62 },
  iconFrame: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bg,
    backgroundColor: colors.red,
  },
  navText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.muted,
    marginTop: 2,
  },
  navActive: {
    color: colors.red,
    fontWeight: '700',
  },
});
