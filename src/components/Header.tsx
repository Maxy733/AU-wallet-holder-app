import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

type HeaderProps = {
  eyebrow: string;
  title: string;
  showAvatar?: boolean;
  avatarUri?: string | null;
  onOpenNotifications?: () => void;
  hasUnreadNotifications?: boolean;
};

export function Header({ eyebrow, title, showAvatar = true, avatarUri, onOpenNotifications, hasUnreadNotifications = false }: HeaderProps) {
  const avatarInitials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={themeStyles.header}>
      <View style={styles.titleGroup}>
        <Text style={[themeStyles.eyebrow, !title.includes(' ') && { marginTop: 10 }]}>{eyebrow}</Text>
        <Text numberOfLines={1} style={themeStyles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {onOpenNotifications ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasUnreadNotifications ? 'Notifications, unread' : 'Notifications'}
            onPress={onOpenNotifications}
            style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
            {hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        ) : null}
      {showAvatar && (onOpenNotifications || avatarUri || title.includes(' ')) && (
        <View style={[themeStyles.avatar, avatarUri ? styles.photoAvatar : null]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={themeStyles.avatarText}>{avatarInitials}</Text>
          )}
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleGroup: { flex: 1, minWidth: 0, paddingRight: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
  notificationDot: { position: 'absolute', top: 6, right: 7, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.bg },
  photoAvatar: { overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
});
