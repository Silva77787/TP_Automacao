import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface MovieHistoryItemProps {
  title: string;
  timeAgo: string;
  rating: number;
}

export default function MovieHistoryItem({
  title,
  timeAgo,
  rating,
}: MovieHistoryItemProps) {
  const { isDark } = useTheme();

  // 🎨 Cores baseadas no tema
  const textMain = isDark ? "#f9fafb" : "#111827";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const borderColor = isDark ? "#9BA1A6" + "50" : "#D1D5DB";
  const starColor = "#facc15"; 

  const stars = Array.from({ length: 5 });

  return (
    <View style={[styles.historyItem, { borderBottomColor: borderColor }]}>
      <View>
        <Text style={[styles.historyTitle, { color: textMain }]}>{title}</Text>
        <Text style={[styles.historyTime, { color: textMuted }]}>
          {timeAgo}
        </Text>
      </View>

      <View style={styles.historyRight}>
        <View style={styles.starRow}>
          {stars.map((_, index) => (
            <MaterialIcons
              key={index}
              name={index < rating ? "star" : "star-border"}
              size={18}
              color={starColor}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  historyTime: {
    fontSize: 12,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
});