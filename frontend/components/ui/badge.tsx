import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const { isDark } = useTheme();

  const bgDefault = isDark ? "#313131ff" : "#E5E7EB";
  const textDefault = isDark ? "#f9fafb" : "#111827";

  const bgSecondary = isDark ? "#111827" : "#D1D5DB";
  const textSecondary = isDark ? "#f9fafb" : "#111827";

  const backgroundColor = variant === "secondary" ? bgSecondary : bgDefault;
  const textColor = variant === "secondary" ? textSecondary : textDefault;

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

