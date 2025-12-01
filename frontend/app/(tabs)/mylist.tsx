import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailsWrapper } from "@/components/MovieDetailsWrapper";
import { SearchBar, SortOption } from "@/components/SearchBar";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useMovies } from "@/hooks/useMovies";
import type { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
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
  const { movies: catalogMovies } = useMovies();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [modalIsLogin, setModalIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const bgScreen = isDark ? "#151718" : "#f3f3f5";
  const cardBg = isDark ? "#151718" : "#FFFFFF";
  const cardBorder = isDark ? "#2b2c2e" : "#E5E7EB";
  const textMain = isDark ? "#f9fafb" : "#020617";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const notLoggedIcon = isDark ? "#e5e7eb" : "#1f2022";

  let numColumns = 2;
  if (width >= 768 && width < 1024) {
    numColumns = 3;
  } else if (width >= 1024 && width < 1400) {
    numColumns = 4;
  } else if (width >= 1400) {
    numColumns = 5;
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
    setSelectedMovieId(movieId);
    setDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
    setDetailsVisible(false);
  };

  const handleMovieRated = (
    movieId: number,
    newAverage: number,
    newTotal: number,
    userRating: number
  ) => {
    // atualizar apenas a grelha da MyList
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
  };

  const allGenres = useMemo(() => {
    const set = new Set<string>();

    ratedMovies.forEach((movie) => {
      movie.genres?.forEach((g) => set.add(g.gerne_name));
    });

    return ["All", ...Array.from(set).sort()];
  }, [ratedMovies]);

  const filteredRatedMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = ratedMovies.filter((movie) => {
      const matchesSearch = query
        ? movie.title.toLowerCase().includes(query) ||
          movie.directors?.some((d) => d.name.toLowerCase().includes(query))
        : true;

      const matchesGenre =
        selectedGenre === "All" ||
        movie.genres?.some((g) => g.gerne_name === selectedGenre);

      return matchesSearch && matchesGenre;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const yearA = new Date(a.release_date).getFullYear() || 0;
      const yearB = new Date(b.release_date).getFullYear() || 0;

      switch (sortOption) {
        case "rating_desc":
          return b.rating - a.rating;
        case "rating_asc":
          return a.rating - b.rating;
        case "year_desc":
          return yearB - yearA;
        case "year_asc":
          return yearA - yearB;
        default:
          return 0;
      }
    });

    return sorted;
  }, [ratedMovies, searchQuery, selectedGenre, sortOption]);

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
          onSearch={() =>
            router.push({
              pathname: "/",
              params: { focusSearch: "1" },
            })
          }
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
              Criar Conta
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
            onSearch={() =>
              router.push({
                pathname: "/",
                params: { focusSearch: "1" },
              })
            }
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
        onSearch={() =>
          router.push({
            pathname: "/",
            params: { focusSearch: "1" },
          })
        }
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
          {/* 🔍 Search + Géneros reutilizados */}
          <SearchBar
            searchQuery={searchQuery}
            onChangeSearch={setSearchQuery}
            genres={allGenres}
            selectedGenre={selectedGenre}
            onChangeGenre={setSelectedGenre}
            sortOption={sortOption}
            onChangeSort={setSortOption}
            placeholder="Pesquisar por título ou realizador..."
          />

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
                {filteredRatedMovies.length}{" "}
                {filteredRatedMovies.length === 1 ? "filme" : "filmes"}
              </Text>
            </View>

            <View style={styles.moviesGrid}>
              {filteredRatedMovies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyText, isDark && styles.emptyTextDark]}
                  >
                    Nenhum filme encontrado que corresponda aos seus critérios.
                  </Text>
                </View>
              ) : (
                filteredRatedMovies.map((movie, index) => (
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
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
      <MovieDetailsWrapper
        movieID={selectedMovieId}
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
    fontSize: 18,
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
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    height: 44,
    marginHorizontal: 16,
  },
  searchContainerDark: {
    backgroundColor: "#2a2a2a",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#11181C",
    padding: 0,
  },
  searchInputDark: {
    color: "#fff",
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyTextDark: {
    color: "#9BA1A6",
  },
});
