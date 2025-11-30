import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetails } from "@/components/MovieDetails";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import type { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserReview = {
  id: number;
  rating: number;
  description?: string | null;
  created_at: string;
  movie: Movie;
};

export default function MyList() {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const router = useRouter();
  const { user, accessToken } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [modalIsLogin, setModalIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const bgScreen = isDark ? "#151718" : "#F3F4F6";
  const cardBg = isDark ? "#151718" : "#FFFFFF";
  const cardBorder = isDark ? "#2b2c2e" : "#E5E7EB";
  const textMain = isDark ? "#f9fafb" : "#020617";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const notLoggedIcon = isDark ? "#e5e7eb" : "#1f2022";

  let numColumns = 2;
  if (width >= 768 && width < 1024) {
    numColumns = 3;
  } else if (width >= 1024) {
    numColumns = 4;
  }

  const horizontalPadding = 16;
  const gap = 12;
  const cardWidth =
    (width - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns;

  const fetchUserReviews = useCallback(async () => {
    if (!user || !accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_ENDPOINTS.GET_USER_REVIEWS(user.username), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log("GET_USER_REVIEWS (MyList):", res.status, data);

      if (!res.ok || data.success === false) {
        setError(data.error || "Erro ao carregar lista de filmes avaliados.");
        setReviews([]);
        setRatedMovies([]);
        return;
      }

      const revs: UserReview[] = data.reviews || [];
      setReviews(revs);

      // filmes distintos avaliados (movie vem no serializer)
      const moviesMap = new Map<number, Movie>();
      revs.forEach((rev) => {
        if (rev.movie) {
          moviesMap.set(rev.movie.id, rev.movie);
        }
      });

      setRatedMovies(Array.from(moviesMap.values()));
    } catch (err) {
      console.log("Erro MyList:", err);
      setError("Erro de rede ao carregar lista de filmes.");
      setReviews([]);
      setRatedMovies([]);
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  useFocusEffect(
    useCallback(() => {
      if (!user || !accessToken) return;

      fetchUserReviews();

      // opcional cleanup
      return () => {};
    }, [user, accessToken, fetchUserReviews])
  );

  const handleOpenDetails = (movieId: number) => {
    const baseMovie = ratedMovies.find((m) => m.id === movieId);
    if (!baseMovie) return;

    // enriquecer com o rating do user (se quiseres)
    const userReview = reviews.find((r) => r.movie?.id === movieId);
    const enriched: Movie = userReview
      ? ({
          ...baseMovie,
          user_rating: userReview.rating,
          user_description: userReview.description ?? "",
        } as Movie)
      : baseMovie;

    setSelectedMovie(enriched);
    setDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
    setDetailsVisible(false);
  };

  const handleMovieRated = (
    movieId: number,
    newAverage: number,
    newTotal: number,
    userRating: number
  ) => {
    // atualizar grelha
    setRatedMovies((current) =>
      current.map((m) =>
        m.id === movieId
          ? {
              ...m,
              rating: newAverage ?? m.rating,
              total_ratings: newTotal ?? m.total_ratings,
              user_rating: userRating,
            }
          : m
      )
    );

    // atualizar selectedMovie
    setSelectedMovie((current) =>
      current && current.id === movieId
        ? {
            ...current,
            rating: newAverage ?? current.rating,
            total_ratings: newTotal ?? current.total_ratings,
            user_rating: userRating,
          }
        : current
    );
  };

  // 🔒 Não autenticado
  if (!user) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: bgScreen }]}
        edges={["top"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Header
          isLargeScreen={isLargeScreen}
          onOpenMenu={() => setIsMenuOpen(true)}
          onLogin={() => setAuthVisible(true)}
        />

        <View style={styles.notLoggedContainer}>
          <Ionicons
            name="person-circle-outline"
            size={72}
            color={notLoggedIcon}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.notLoggedTextlg, { color: textMain }]}>
            Não está autenticado
          </Text>
          <Text style={[styles.notLoggedTextsm, { color: textMuted }]}>
            Para ver os seus filmes avaliados, por favor inicie sessão ou crie
            uma conta.
          </Text>

          <View style={styles.notLoggedButtons}>
            <Button
              style={{ flex: 1 }}
              onPress={() => {
                setModalIsLogin(true);
                setAuthVisible(true);
              }}
              disabled={loading}
              variant="default"
            >
              Login
            </Button>
            <Button
              style={{ flex: 1 }}
              onPress={() => {
                setModalIsLogin(false);
                setAuthVisible(true);
              }}
              disabled={loading}
              variant="outline"
            >
              Create Account
            </Button>
          </View>
        </View>

        <Login
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
          isLogin={modalIsLogin}
          setIsLogin={setModalIsLogin}
        />

        {!isLargeScreen && (
          <SideMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            setShowLogin={setAuthVisible}
            onPressProfile={() => router.push("/(tabs)/profile")}
            setIsLogin={setModalIsLogin}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: bgScreen }]}
      edges={["top"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Header
        isLargeScreen={isLargeScreen}
        onOpenMenu={() => setIsMenuOpen(true)}
        onLogin={() => setAuthVisible(true)}
      />

      {error && (
        <Text
          style={{
            color: "tomato",
            textAlign: "center",
            marginVertical: 8,
          }}
        >
          {error}
        </Text>
      )}

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="large"
            color={textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyText, { color: textMuted }]}>
            A carregar os seus filmes avaliados...
          </Text>
        </View>
      ) : ratedMovies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="star-outline"
            size={64}
            color={textMuted}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.emptyTitle, { color: textMain }]}>
            Nenhum filme avaliado
          </Text>
          <Text style={[styles.emptyText, { color: textMuted }]}>
            Comece a avaliar filmes para vê-los aparecer aqui.
          </Text>
          <Button style={{ marginTop: 16 }} onPress={() => router.push("/")}>
            Explorar filmes
          </Button>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.moviesSection, { backgroundColor: "transparent" }]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Os seus filmes avaliados
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  isDark && styles.sectionSubtitleDark,
                ]}
              >
                {ratedMovies.length}{" "}
                {ratedMovies.length === 1 ? "filme" : "filmes"}
              </Text>
            </View>

            <View style={styles.moviesGrid}>
              {ratedMovies.map((movie, index) => (
                <View
                  key={movie.id}
                  style={{
                    width: cardWidth,
                    marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
                    marginBottom: 16,
                  }}
                >
                  <MovieCard
                    {...movie}
                    onPress={() => handleOpenDetails(movie.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <MovieDetails
        movie={selectedMovie}
        visible={detailsVisible}
        onClose={handleCloseDetails}
        onRated={handleMovieRated}
      />

      {!isLargeScreen && (
        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          setShowLogin={setAuthVisible}
          onPressProfile={() => router.push("/(tabs)/profile")}
          setIsLogin={setModalIsLogin}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Not logged
  notLoggedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  notLoggedTextlg: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  notLoggedTextsm: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  notLoggedButtons: {
    flexDirection: "row",
    gap: 12,
    width: "70%",
    alignSelf: "center",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  // Secção de filmes (igual ao Home)
  moviesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#11181C",
  },
  sectionTitleDark: {
    color: "#fff",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#687076",
  },
  sectionSubtitleDark: {
    color: "#9BA1A6",
  },
  moviesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
