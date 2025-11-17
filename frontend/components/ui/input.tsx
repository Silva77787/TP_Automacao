import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputProps extends TextInputProps {
  style?: ViewStyle;
}

export function Input({ style, ...props }: InputProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: '#000000ff',
          color: "white",
          borderColor: borderColor + '40',
        },
        style,
      ]}
      placeholderTextColor={borderColor + '80'}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});

