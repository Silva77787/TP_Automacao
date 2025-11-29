import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRateMovie } from "@/hooks/useMovies";
import { Movie } from "@/types/movie";

interface MovieDetailsProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
  onRated?: (movieId: number, newAverage: number, newTotal: number, userRating: number) => void;
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
  const [ratingInput, setRatingInput] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingDescription, setRatingDescription] = useState("");

  useEffect(() => {
    if (movie?.user_rating && movie.user_rating > 0) {
      setRatingInput(movie.user_rating.toString());
      setUserRating(movie.user_rating);
    } else {
      setRatingInput("");
      setUserRating(null);
      
    }
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
  console.log("Movie image path:", movie.image);
  console.log("Final image URI:", imageUri);
  const handleRateMovie = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to rate movies");
      return;
    }

    const rating = parseFloat(ratingInput);
    
    // Validation
    if (isNaN(rating) || rating < 1 || rating > 10) {
      Alert.alert("Invalid Rating", "Please enter a number between 1 and 10.");
      return;
    }
    
    const result = await rateMovie(movie.id, rating, ratingDescription);
    if (result) {
      setUserRating(rating);
      movie.user_description = ratingDescription;
      if(onRated && movie){
        onRated(movie.id,result.movieAverageRating, result.movieTotalRatings, rating);
      }
      Alert.alert("Success", "Movie rated successfully!");
    }
  };
  //Filter to remove user own rating from the list
    const otherReviews =
    movie.reviews?.filter(
      (rev: any) => rev.username !== user?.username
    ) || [];

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
                  <Ionicons name="calendar-outline" size={16} color={textSecondary} />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {year}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={16} color={textSecondary} />
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
                <Text style={[styles.sectionText, { color: textSecondary }]}>
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
                <View style={styles.ratingInputContainer}>
                  <Text style={[styles.ratingLabel, { color: textPrimary }]}>
                    Sua classificação (1-10):
                  </Text>
                  {/* Show either the input box OR the "not evaluated" message - INLINE */}
                  {userRating && userRating > 0 ? (
                    <View>
                      <View style={styles.ratingInputRow}>
                        <Text style={[styles.ratingLabel,{color: textPrimary,marginLeft:8}]}>
                          {userRating}
                        </Text>
                      </View>
                      <Text style={[styles.sectionText, {color : textPrimary, marginTop :4}]}>
                        Descrição : {movie.user_description || ""}
                      </Text>
                    </View>
                  ) : (
                    <Text style = {[styles.ratingLabel, {color : textSecondary,marginLeft: 8, fontStyle:'italic'}]}>
                      Ainda não avaliou este Filme
                    </Text>
                  )}
                </View>
                  {/* Input row - always show for typing new rating */}
                  <View style = {styles.ratingInputRow}>
                    <TextInput
                      value={ratingInput}
                      onChangeText={setRatingInput}
                      placeholder="-"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      maxLength={4}
                      selectTextOnFocus
                      style={[styles.ratingInput,{color : textPrimary, borderBottomColor : textSecondary}]}/>
                  <Text style={[styles.ratingMax, {color : textPrimary}]}>/10</Text>
                </View>
              </View>

              {/*Description Input*/}
              <View style={{marginTop : 8}}>
                <Text style={[styles.sectionText, {color: textSecondary, marginBottom: 4}]}>
                  Sua Descrição (Opcional):
                </Text>
                <TextInput
                  value={ratingDescription}
                  onChangeText={setRatingDescription}
                  placeholder="Escreva o que pensa acerca do filme"
                  placeholderTextColor={textSecondary}
                  multiline
                  style={{
                    borderWidth:1,
                    borderColor: textSecondary,
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    color : textPrimary,
                    minHeight: 60,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.actions}>
                <Button
                  style={styles.actionButton}
                  size="lg"
                  onPress={handleRateMovie}
                  loading={ratingLoading}
                  disabled={ratingLoading || !user}
                >
                  {user ? "Classificar Filme" : "Faça login para classificar"}
                </Button>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: textSecondary}]}>
                  Ratings
                </Text>
                {otherReviews.length > 0 ? (
                  otherReviews.map((rev: any) =>(
                    <View key={rev.id} style={{ marginBottom: 8 }}>
                      <Text style={[styles.sectionText, { color: textPrimary }]}>
                        Username: {rev.username}  Rating: {rev.rating}
                      </Text>
                      <Text style={[styles.sectionText, { color: textSecondary }]}>
                        Descrição: {rev.description || ""}
                      </Text>
                      </View>
                  ))
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
    flexDirection: 'row', 
    gap: 8,
    marginBottom: 24,
  },
  genreBadge: {
    alignSelf: 'flex-start'
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
  ratingInputContainer: {
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight : "500",
    marginBottom: 8,
  },
  ratingLabelRow: {
    flexDirection :"row",
    alignItems : "center",
    marginBottom : 12,
  }, 
  ratingInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  ratingInput: {
    fontSize: 14,
    fontWeight: "500",
    borderBottomWidth: 1,
    minWidth: 50,
    textAlign: 'center',
    paddingBottom: 4,
    paddingTop : 4,
  },
  ratingMax: {
    fontSize: 14,
    marginBottom: 0,
    fontWeight :"500",
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