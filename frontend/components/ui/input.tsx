import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, TextInput, TextInputProps, ViewStyle } from "react-native";

interface InputProps extends TextInputProps {
  style?: ViewStyle;
}

export function Input({ style, ...props }: InputProps) {
  const { isDark } = useTheme();

  const backgroundColor = isDark ? "#0a0a0aff" : "#FFFFFF";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const borderColor = isDark ? "#9BA1A6" + "50" : "#D1D5DB";
  const placeholderColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor,
          color: textColor,
          borderColor,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
});
