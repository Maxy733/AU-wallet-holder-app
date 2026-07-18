import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type HeaderProps = {
  eyebrow: string;
  title: string;
};

export function Header({ eyebrow, title }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.eyebrow, !title.includes(' ') && { marginTop: 10 }]}>{eyebrow}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {title.includes(' ') && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EC</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: Move header, eyebrow, headerTitle, avatar, and avatarText styles here
  header: {},
  eyebrow: {},
  headerTitle: {},
  avatar: {},
  avatarText: {},
});