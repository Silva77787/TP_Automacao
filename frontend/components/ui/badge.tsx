import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const backgroundColor = variant === 'secondary' ? '#030213' : '#ececf0' ;
  const textColor = variant === 'secondary' ? '#fff' : '#030213' ;

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

