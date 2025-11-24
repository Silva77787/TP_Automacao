import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
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
  const stars = Array.from({ length: 5 });

  return (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historyTime}>{timeAgo}</Text>
      </View>

      <View style={styles.historyRight}>
        <View style={styles.starRow}>
          {stars.map((_, index) => (
            <MaterialIcons
              key={index}
              name={index < rating ? "star" : "star-border"}
              size={18}
              color="#facc15"
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
    borderBottomColor: "#9BA1A6" + 50,
  },
  historyTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "500",
  },
  historyTime: {
    color: "#9ca3af",
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
