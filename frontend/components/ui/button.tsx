import { useTheme } from "@/context/ThemeContext";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "defaultIndex"
    | "outlineIndex";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { isDark } = useTheme();

  const primaryBg = isDark ? "#FFFFFF" : "#000000";
  const primaryText = isDark ? "#000000" : "#FFFFFF";

  const secondaryBg = isDark ? "#313131ff" : "#E5E7EB";
  const secondaryText = isDark ? "#f9fafb" : "#111827";

  const destructiveBg = "#d4183d";
  const destructiveText = "#ffffff";

  const ghostText = primaryText;
  const outlineText = isDark ? "#FFFFFF" : "#000000";
  const outlineBorder = isDark ? "#FFFFFF" : "#000000";

  let backgroundColor: string | "transparent" = primaryBg;
  let textColor: string = primaryText;
  let borderColor: string | undefined;

  switch (variant) {
    case "default":
      backgroundColor = primaryBg;
      textColor = primaryText;
      break;

    case "outline":
      backgroundColor = "transparent";
      borderColor = outlineBorder;
      textColor = outlineText;
      break;

    case "defaultIndex":
      backgroundColor = "#FFFFFF";
      textColor = "#000000";
      break;

    case "outlineIndex":
      backgroundColor = "transparent";
      borderColor = "#FFFFFF";
      textColor = "#FFFFFF";
      break;

    case "ghost":
      backgroundColor = "transparent";
      textColor = ghostText;
      break;

    case "secondary":
      backgroundColor = secondaryBg;
      textColor = secondaryText;
      break;

    case "destructive":
      backgroundColor = destructiveBg;
      textColor = destructiveText;
      break;
  }

  const buttonStyles = [
    styles.base,
    styles[`size_${size}`],
    {
      backgroundColor,
      borderColor,
      borderWidth: borderColor ? 1 : 0,
    },
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`textSize_${size}`],
    { color: textColor },
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
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
    fontWeight: "500",
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
