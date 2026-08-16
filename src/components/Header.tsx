import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

type HeaderProps = {
  eyebrow: string;
  title: string;
  showAvatar?: boolean;
  avatarUri?: string | null;
};

export function Header({ eyebrow, title, showAvatar = true, avatarUri }: HeaderProps) {
  const avatarInitials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={themeStyles.header}>
      <View>
        <Text style={[themeStyles.eyebrow, !title.includes(' ') && { marginTop: 10 }]}>{eyebrow}</Text>
        <Text style={themeStyles.headerTitle}>{title}</Text>
      </View>
      {showAvatar && (avatarUri || title.includes(' ')) && (
        <View style={[themeStyles.avatar, avatarUri ? styles.photoAvatar : null]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={themeStyles.avatarText}>{avatarInitials}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoAvatar: { overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
});
