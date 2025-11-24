import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Movie } from "@/types/movie";
import { useTheme } from "@/context/ThemeContext";

interface MovieDetailsProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
}

export function MovieDetails({ movie, visible, onClose }: MovieDetailsProps) {
  const { isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  if (!movie) return null;

  // 📱 Responsividade (agora correta)
  const isLargeScreen = width >= 768;
  const modalWidth = isLargeScreen ? width * 0.6 : width * 1; // <-- RESPONSIVO
  const modalHeight = height;                                   // <-- ALTURA COMPLETA

  const bg = isDark ? "#000" : "#FFF";
  const titleColor = isDark ? "#FFFFFF" : "#000000";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#9BA1A6" : "#687076";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>

        {/* CLICK FORA PARA FECHAR */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* MODAL RESPONSIVO */}
        <View
          style={[
            styles.container,
            {
              width: modalWidth,
              height: modalHeight,
              backgroundColor: bg,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* IMAGEM */}
            <View style={[styles.imageContainer, { height: height * 0.5 }]}>
              <Image
                source={{ uri: movie.image }}
                style={styles.image}
                contentFit="cover"
              />

              {/* Botão de fechar */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* CONTEÚDO */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: titleColor }]}>
                {movie.title}
              </Text>

              {/* META */}
              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.metaText, { color: textPrimary }]}>
                    {movie.rating.toFixed(1)}/10
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={textSecondary}
                  />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {movie.year}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={textSecondary}
                  />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {movie.runtime} min
                  </Text>
                </View>
              </View>

              <View style={styles.badgeContainer}>
                <Badge>{movie.genre}</Badge>
              </View>

              {/* OVERVIEW */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Overview
                </Text>
                <Text style={[styles.sectionText, { color: textSecondary }]}>
                  {movie.description}
                </Text>
              </View>

              {/* DIRECTOR */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Director
                </Text>
                <Text style={[styles.sectionText, { color: textPrimary }]}>
                  {movie.director}
                </Text>
              </View>

              {/* CAST */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Cast
                </Text>
                <Text style={[styles.sectionText, { color: textPrimary }]}>
                  {movie.cast.join(", ")}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <Button style={styles.actionButton} size="lg">
                  Watch Trailer
                </Button>
                <Button variant="outline" style={styles.actionButton} size="lg">
                  Add to Watchlist
                </Button>
              </View>

            </View>
          </ScrollView>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)", // zona escura envolvente
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    // ❌ SEM ARREDONDAMENTO
    borderRadius: 0,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  meta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
});
