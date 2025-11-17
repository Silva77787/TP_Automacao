import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? tintColor : '#fff'}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  default: {
    backgroundColor: 'white',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#ececf0',
  },
  destructive: {
    backgroundColor: '#d4183d',
  },
  size_default: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  size_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  size_lg: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  size_icon: {
    width: 40,
    height: 40,
    padding: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
  },
  text_default: {
    color: '#030213',
  },
  text_outline: {
    color: '#fff',
  },
  text_ghost: {
    color: '#030213',
  },
  text_secondary: {
    color: '#030213',
  },
  text_destructive: {
    color: '#fff',
  },
  textSize_default: {
    fontSize: 14,
  },
  textSize_sm: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textSize_icon: {
    fontSize: 16,
  },
});

