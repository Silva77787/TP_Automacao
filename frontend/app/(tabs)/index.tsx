import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetails } from "@/components/MovieDetails";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useMovieDetails, useMovies } from "@/hooks/useMovies";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "TV Movie",
  "Thriller",
  "War",
  "Western",
];

interface MovieDetailsWrapperProps {
  movieID: number | null;
  visible: boolean;
  onClose: () => void;
}

function MovieDetailsWrapper({
  movieID,
  visible,
  onClose,
}: MovieDetailsWrapperProps) {
  const { movie } = useMovieDetails(visible ? movieID : null);

  if (!movie || !visible) {
    return null;
  }

  return <MovieDetails movie={movie} visible={visible} onClose={onClose} />;
}

/** Header da lista (hero + search + géneros + título) */
interface MoviesHeaderProps {
  isDark: boolean;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  filteredCount: number;
}

const MoviesHeader = ({
  isDark,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  filteredCount,
}: MoviesHeaderProps) => {
  return (
    <>
      {/* Hero Section */}
      <View style={{ marginHorizontal: -16 }}>
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=50",
            }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="disk"
            transition={0}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Discover Your Next Favorite Movie
              </Text>
              <Text style={styles.heroSubtitle}>
                Explore thousands of movies across all genres. From blockbuster
                hits to hidden gems, find what to watch tonight.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={[styles.filters, isDark && styles.filtersDark]}>
        <View
          style={[styles.searchContainer, isDark && styles.searchContainerDark]}
        >
          <Ionicons
            name="search"
            size={20}
            color="#687076"
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search movies..."
            placeholderTextColor="#687076"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
            selectionColor={isDark ? "#fff" : "#000"}
            blurOnSubmit={false}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.genreScroll}
          contentContainerStyle={styles.genreContainer}
        >
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              onPress={() => setSelectedGenre(genre)}
              style={[
                styles.genreChip,
                selectedGenre === genre && styles.genreChipActive,
                isDark && styles.genreChipDark,
                selectedGenre === genre && isDark && styles.genreChipActiveDark,
              ]}
            >
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === genre && styles.genreTextActive,
                  isDark && styles.genreTextDark,
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section header */}
      <View style={styles.moviesSection}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            {selectedGenre === "All" ? "All Movies" : `${selectedGenre} Movies`}
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              isDark && styles.sectionSubtitleDark,
            ]}
          >
            {filteredCount} {filteredCount === 1 ? "movie" : "movies"} found
          </Text>
        </View>
      </View>
    </>
  );
};

export default function HomeScreen() {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { user } = useAuth();
  const router = useRouter();

  const { movies: backendMovies, loading, error, refetch } = useMovies();
  const [initialLoading, setInitialLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      refetch();
      return () => {};
    }, [refetch])
  );

  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

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

  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showLogin, setShowLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isLargeScreen && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isLargeScreen, isMenuOpen]);

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return backendMovies.filter((movie) => {
      const matchesSearch = query
        ? movie.title.toLowerCase().includes(query)
        : true;

      const movieGenre = movie.genres?.[0]?.gerne_name || "Unknown";
      const matchesGenre =
        selectedGenre === "All" || movieGenre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [backendMovies, searchQuery, selectedGenre]);

  const renderMovieItem = ({
    item,
    index,
  }: {
    item: (typeof backendMovies)[number];
    index: number;
  }) => (
    <View
      style={{
        width: cardWidth,
        marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
        marginBottom: 16,
      }}
    >
      <MovieCard {...item} onPress={() => setSelectedMovie(item.id)} />
    </View>
  );

  return (
    <ProtectedRoute
      fallback={
        <SafeAreaView
          style={[styles.container, isDark && styles.containerDark]}
          edges={["top"]}
        >
          <StatusBar style={isDark ? "light" : "dark"} />
          <Header
            isLargeScreen={isLargeScreen}
            onOpenMenu={() => setIsMenuOpen(true)}
            onLogin={() => setShowLogin(true)}
          />

          <View style={styles.notLoggedContainer}>
            <Ionicons
              name="person-circle-outline"
              size={72}
              color={isDark ? "#e5e7eb" : "#1f2022ff"}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={[
                styles.notLoggedTextlg,
                { color: isDark ? "#f9fafb" : "#020617" },
              ]}
            >
              Não está autenticado
            </Text>
            <Text
              style={[
                styles.notLoggedTextsm,
                { color: isDark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              Para aceder ao catálogo de filmes, por favor inicie sessão ou crie
              uma conta.
            </Text>

            <View style={styles.notLoggedButtons}>
              <Button
                style={{ flex: 1 }}
                onPress={() => {
                  setIsLogin(true);
                  setShowLogin(true);
                }}
                variant="default"
              >
                Login
              </Button>
              <Button
                style={{ flex: 1 }}
                onPress={() => {
                  setIsLogin(false);
                  setShowLogin(true);
                }}
                variant="outline"
              >
                Criar conta
              </Button>
            </View>
          </View>

          <Login
            visible={showLogin}
            onClose={() => setShowLogin(false)}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
          />

          {!isLargeScreen && (
            <SideMenu
              visible={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              setShowLogin={setShowLogin}
              onPressProfile={() => router.push("/(tabs)/profile")}
              setIsLogin={setIsLogin}
            />
          )}
        </SafeAreaView>
      }
    >
      <SafeAreaView
        style={[styles.container, isDark && styles.containerDark]}
        edges={["top"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <Header
          isLargeScreen={isLargeScreen}
          onOpenMenu={() => setIsMenuOpen(true)}
          onLogin={() => {
            setIsLogin(true);
            setShowLogin(true);
          }}
        />

        {/* Loading / Error / Content */}
        {initialLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12, color: isDark ? "#fff" : "#000" }}>
              Loading movies...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Ionicons name="warning" size={48} color="#FF6B6B" />
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                color: isDark ? "#fff" : "#000",
                textAlign: "center",
              }}
            >
              {error}
            </Text>
            <Button
              size="lg"
              style={{ marginTop: 20 }}
              onPress={() => router.replace("/(tabs)")}
            >
              Go Back
            </Button>
          </View>
        ) : (
          <FlatList
            key={`cols-${numColumns}`}
            data={filteredMovies}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            renderItem={renderMovieItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingBottom: 16,
            }}
            columnWrapperStyle={
              numColumns > 1
                ? {
                    marginBottom: 0,
                  }
                : undefined
            }
            ListHeaderComponent={
              <MoviesHeader
                isDark={isDark}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                filteredCount={filteredMovies.length}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyText, isDark && styles.emptyTextDark]}
                >
                  No movies found matching your criteria.
                </Text>
              </View>
            }
          />
        )}

        {/* Movie Details Modal */}
        <MovieDetailsWrapper
          movieID={selectedMovie}
          visible={!!selectedMovie}
          onClose={async () => {
            setSelectedMovie(null);
            refetch();
          }}
        />

        {/* Login Modal */}
        <Login
          visible={showLogin}
          onClose={() => setShowLogin(false)}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
        />

        {/* Side Menu */}
        {!isLargeScreen && (
          <SideMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            setShowLogin={setShowLogin}
            onPressProfile={() => router.push("/(tabs)/profile")}
            setIsLogin={setIsLogin}
          />
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#151718",
  },

  // --- NOT LOGGED (igual ao profile) ---
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

  hero: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 16,
  },
  heroContent: {
    maxWidth: width - 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 24,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 12,
  },
  heroButton: {
    flex: 1,
  },
  filters: {
    backgroundColor: "#f3f3f5",
    paddingVertical: 16,
    marginHorizontal: -16,
  },
  filtersDark: {
    backgroundColor: "#202020ff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  genreScroll: {
    marginTop: 8,
    paddingLeft: 16,
  },
  genreContainer: {
    paddingRight: 16,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  genreChipDark: {
    backgroundColor: "#2a2a2a",
  },
  genreChipActive: {
    backgroundColor: "#030213",
  },
  genreChipActiveDark: {
    backgroundColor: "#030213",
  },
  genreText: {
    fontSize: 14,
    color: "#11181C",
    fontWeight: "500",
  },
  genreTextDark: {
    color: "#fff",
  },
  genreTextActive: {
    color: "#fff",
  },
  moviesSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#687076",
  },
  emptyTextDark: {
    color: "#9BA1A6",
  },
});
