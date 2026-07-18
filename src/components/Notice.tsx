import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Notice({
  icon,
  tint,
  bg,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  tint: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.notice} onPress={onPress}>
      <View style={[styles.noticeIcon, { backgroundColor: bg }]}>
        <Text style={[styles.noticeIconText, { color: tint }]}>{icon}</Text>
      </View>
      <View style={styles.noticeText}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeSub}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notice: {},
  noticeIcon: {},
  noticeIconText: {},
  noticeText: {},
  noticeTitle: {},
  noticeSub: {},
  chevron: {},
});