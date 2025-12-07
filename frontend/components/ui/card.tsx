import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { isDark } = useTheme();

  const backgroundColor = isDark ? "#151718" : "#FFFFFF";
  const borderColor = isDark ? "#2a2c30ff" : "#E5E7EB";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
