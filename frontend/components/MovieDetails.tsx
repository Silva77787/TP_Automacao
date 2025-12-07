import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRateMovie } from "@/hooks/useMovies";
import { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface MovieDetailsProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
  onRated?: (
    movieId: number,
    newAverage: number,
    newTotal: number,
    userRating: number
  ) => void;
}

export function MovieDetails({
  movie,
  visible,
  onClose,
  onRated,
}: MovieDetailsProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { rateMovie, loading: ratingLoading } = useRateMovie();
  const { width, height } = useWindowDimensions();

  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingDescription, setRatingDescription] = useState("");
  const [isRatingMode, setIsRatingMode] = useState(false);
  const [initialUserRating, setInitialUserRating] = useState<number | null>(
    null
  );
  const [initialDescription, setInitialDescription] = useState<string>("");

  useEffect(() => {
    if (movie?.user_rating && movie.user_rating > 0) {
      setUserRating(movie.user_rating);
      setInitialUserRating(movie.user_rating);
      setRatingDescription(movie.user_description || "");
      setInitialDescription(movie.user_description || "");
    } else {
      setUserRating(null);
      setInitialUserRating(null);
      setRatingDescription("");
      setInitialDescription("");
    }
    setIsRatingMode(false);
  }, [movie]);

  if (!movie) return null;

  const isLargeScreen = width >= 768;
  const modalWidth = isLargeScreen ? width * 0.6 : width * 1;
  const modalHeight = height;
  const bg = isDark ? "#000" : "#FFF";
  const titleColor = isDark ? "#FFFFFF" : "#000000";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#9BA1A6" : "#687076";

  const year = new Date(movie.release_date).getFullYear();
  const imageUri = movie.image
    ? `https://image.tmdb.org/t/p/w500${movie.image}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const handleStartRating = () => {
    if (!user) {
      return;
    }
    setIsRatingMode(true);
    setUserRating(initialUserRating ?? null);
    setRatingDescription(initialDescription ?? "");
  };

  const handleCancelRating = () => {
    setUserRating(initialUserRating);
    setRatingDescription(initialDescription);
    setIsRatingMode(false);
  };

  const handleSelectStar = (value: number) => {
    setUserRating(value);
  };

  const handleRateMovie = async () => {
    if (!user) {
      return;
    }

    if (!userRating || userRating < 1 || userRating > 10) {
      return;
    }

    const result = await rateMovie(movie.id, userRating, ratingDescription);

    if (result) {
      // guardar como estado inicial (para próximo edit)
      setInitialUserRating(userRating);
      setInitialDescription(ratingDescription);
      movie.user_description = ratingDescription;

      if (onRated && movie) {
        onRated(
          movie.id,
          result.movieAverageRating,
          result.movieTotalRatings,
          userRating
        );
      }

      setIsRatingMode(false);
    }
  };

  //Filter to remove user own rating from the list
  const otherReviews =
    movie.reviews?.filter((rev: any) => rev.username !== user?.username) || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

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
            {/* IMAGE HEADER */}
            <View style={[styles.imageContainer, { height: height * 0.5 }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="cover"
              />
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* CONTENT BODY */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: titleColor }]}>
                {movie.title}
              </Text>

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
                    {year}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={textSecondary}
                  />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {movie.total_ratings} ratings
                  </Text>
                </View>
              </View>

              <View style={styles.badgeContainer}>
                {movie.genres?.map((genre) => (
                  <Badge key={genre.id} style={styles.genreBadge}>
                    {genre.gerne_name}
                  </Badge>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Sinopse
                </Text>
                <Text style={[styles.sectionText, { color: textPrimary }]}>
                  {movie.description}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Diretor
                </Text>
                {movie.directors?.map((director) => (
                  <View key={director.id}>
                    <Text style={[styles.sectionText, { color: textPrimary }]}>
                      {director.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* RATING SECTION */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Classificação
                </Text>

                {/* Info da classificação atual do user (se existir) */}
                {!isRatingMode && initialUserRating && initialUserRating > 0 ? (
                  <View style={{ marginBottom: 8 }}>
                    <View style={styles.userRatingRow}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text
                        style={[
                          styles.sectionText,
                          { color: textPrimary, fontWeight: "500" },
                        ]}
                      >
                        A sua classificação: {initialUserRating}/10
                      </Text>
                    </View>

                    {initialDescription ? (
                      <Text
                        style={[
                          styles.sectionText,
                          { color: textSecondary, marginTop: 4 },
                        ]}
                      >
                        Descrição: {initialDescription}
                      </Text>
                    ) : null}
                  </View>
                ) : !isRatingMode ? (
                  <Text
                    style={[
                      styles.sectionText,
                      {
                        color: textSecondary,
                        fontStyle: "italic",
                        marginBottom: 8,
                      },
                    ]}
                  >
                    Ainda não avaliou este filme.
                  </Text>
                ) : null}

                {/* Botão que abre o modo de classificação */}
                {!isRatingMode && (
                  <Button
                    style={{ marginTop: 4 }}
                    size="lg"
                    onPress={handleStartRating}
                    disabled={ratingLoading}
                  >
                    {user
                      ? initialUserRating
                        ? "Editar classificação"
                        : "Classificar filme"
                      : "Faça login para classificar"}
                  </Button>
                )}

                {/* Zona de rating só aparece depois de clicar no botão */}
                {isRatingMode && (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={[
                        styles.sectionText,
                        { color: textPrimary, marginBottom: 4 },
                      ]}
                    >
                      Escolha uma classificação (1–10):
                    </Text>

                    {/* ESTRELAS 1–10 */}
                    <View style={styles.starsRow}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (value) => {
                          const filled =
                            (userRating ?? 0) >= value
                              ? "star"
                              : "star-outline";
                          return (
                            <TouchableOpacity
                              key={value}
                              onPress={() => handleSelectStar(value)}
                              style={styles.starButton}
                            >
                              <Ionicons
                                name={filled}
                                size={22}
                                color="#FFD700"
                              />
                            </TouchableOpacity>
                          );
                        }
                      )}
                    </View>

                    {/* Descrição */}
                    <Text
                      style={[
                        styles.sectionText,
                        {
                          color: textSecondary,
                          marginTop: 12,
                          marginBottom: 4,
                        },
                      ]}
                    >
                      A sua descrição (opcional):
                    </Text>
                    <TextInput
                      value={ratingDescription}
                      onChangeText={setRatingDescription}
                      placeholder="Escreva o que pensa acerca do filme"
                      placeholderTextColor={textSecondary}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: textSecondary,
                        borderRadius: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        color: textPrimary,
                        minHeight: 60,
                        textAlignVertical: "top",
                      }}
                    />

                    {/* BOTÕES GUARDAR / CANCELAR */}
                    <View style={styles.actions}>
                      <Button
                        style={styles.actionButton}
                        size="lg"
                        onPress={handleRateMovie}
                        loading={ratingLoading}
                        disabled={ratingLoading}
                      >
                        Guardar
                      </Button>
                      <Button
                        style={styles.actionButton}
                        size="lg"
                        variant="outline"
                        onPress={handleCancelRating}
                        disabled={ratingLoading}
                      >
                        Cancelar
                      </Button>
                    </View>
                  </View>
                )}
              </View>

              {/* OUTROS RATINGS */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                  Ratings
                </Text>

                {otherReviews.length > 0 ? (
                  otherReviews.map((rev: any, index: number) => {
                    const showDivider = index !== otherReviews.length - 1;

                    return (
                      <View
                        key={rev.id}
                        style={[
                          styles.reviewItem,
                          showDivider && styles.reviewItemSeparator,
                          showDivider && { borderBottomColor: textSecondary },
                        ]}
                      >
                        {/* Linha com username + rating com estrela */}
                        <View style={styles.reviewRatingRow}>
                          <Text
                            style={[styles.sectionText, { color: textPrimary }]}
                          >
                            Username: {rev.username}
                          </Text>

                          <View style={styles.reviewRatingValue}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text
                              style={[
                                styles.sectionText,
                                { color: textPrimary, marginLeft: 4 },
                              ]}
                            >
                              Rating: {rev.rating}/10
                            </Text>
                          </View>
                        </View>

                        {/* Descrição só aparece se existir */}
                        {rev.description ? (
                          <Text
                            style={[
                              styles.sectionText,
                              { color: textSecondary, marginTop: 2 },
                            ]}
                          >
                            Descrição: {rev.description}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })
                ) : (
                  <Text style={[styles.sectionText, { color: textSecondary }]}>
                    No ratings yet.
                  </Text>
                )}
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
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
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
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  genreBadge: {
    alignSelf: "flex-start",
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
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  starButton: {
    padding: 2,
  },
  userRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewItem: {
    paddingVertical: 8,
  },
  reviewItemSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingBottom: 8,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewRatingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
});
