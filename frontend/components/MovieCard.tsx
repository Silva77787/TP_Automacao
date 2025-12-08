import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useTheme } from "@/context/ThemeContext";

interface MovieCardProps {
  id: number;
  title: string;
  description: string;
  release_date: string;
  rating: number;
  total_ratings: number;
  genres: Array<{ id: number; gerne_name: string }>;
  directors: Array<{ id: number; name: string; biography: string }>;
  image?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MovieCard({
  id,
  title,
  release_date,
  rating,
  genres,
  image,
  onPress,
  style,
}: MovieCardProps) {
  const { isDark } = useTheme();

  // Extract year from release_date
  const year = new Date(release_date).getFullYear();

  // Get first genre
  const genreName = genres?.[0]?.gerne_name || "Unknown";

  // Fallback image
  const imageUri = image
    ? `https://image.tmdb.org/t/p/w300${image}` 
    : "https://via.placeholder.com/300x450?text=No+Image";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, style, isDark && styles.darkCard]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder="L2~BS0os00oy00_3t757R%hh00"
            cachePolicy="disk"
          />
          <View style={styles.overlay}>
            <Badge variant="primary" style={styles.badge}>
              {genreName}
            </Badge>
          </View>
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.title, isDark && styles.darkText]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.year}>{year}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, isDark && styles.darkText]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#fff"
  },
  darkCard: {
    backgroundColor: "#111"
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
  },
  badge: {
    alignSelf: "flex-start",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  year: {
    fontSize: 12,
    color: "#687076",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  darkText:{
    color: "#fff"
  }
});
