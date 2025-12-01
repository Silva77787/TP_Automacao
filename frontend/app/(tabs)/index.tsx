import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailsWrapper } from "@/components/MovieDetailsWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SearchBar, SortOption } from "@/components/SearchBar";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useMovies } from "@/hooks/useMovies";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

/** Header da lista (hero + search + géneros + título) */
interface MoviesHeaderProps {
  isDark: boolean;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  filteredCount: number;
  recommendedMovies: any[];
  cardWidth: number;
  gap: number;
  onOpenMovie: (movieId: number) => void;
  onSeeAllRecommendations: () => void;
  isSmallScreen: boolean;
  searchInputRef?: React.RefObject<TextInput | null>;
  setSortOption: (opt: SortOption) => void;
  sortOption: SortOption;
}

const MoviesHeader = ({
  isDark,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  filteredCount,
  recommendedMovies,
  cardWidth,
  gap,
  onOpenMovie,
  onSeeAllRecommendations,
  isSmallScreen,
  searchInputRef,
  sortOption,
  setSortOption,
}: MoviesHeaderProps) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragData = useRef({ startX: 0, startScrollX: 0 });
  const [currentScrollX, setCurrentScrollX] = useState(0);

  const webDragHandlers: any =
    Platform.OS === "web"
      ? {
          onMouseDown: (e: any) => {
            setIsDragging(true);
            dragData.current.startX = e.nativeEvent.pageX;
            dragData.current.startScrollX = currentScrollX;
          },
          onMouseMove: (e: any) => {
            if (!isDragging) return;
            const walk = e.nativeEvent.pageX - dragData.current.startX;
            const targetX = dragData.current.startScrollX - walk;

            scrollRef.current?.scrollTo({
              x: targetX,
              animated: false,
            });
          },
          onMouseUp: () => {
            setIsDragging(false);
          },
          onMouseLeave: () => {
            setIsDragging(false);
          },
        }
      : {};

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

      {recommendedMovies.length > 0 && (
        <View style={styles.recommendedSection}>
          <View
            style={[
              styles.recommendedHeader,
              isSmallScreen && styles.recommendedHeaderSmall,
            ]}
          >
            <View style={styles.recommendedHeader2}>
              <Ionicons
                name="sparkles-outline"
                size={30}
                color={isDark ? "#fff" : "#000"}
              />
              <View style={styles.recommendedHeader3}>
                <Text
                  style={[
                    styles.recommendedTitle,
                    isDark && styles.recommendedTitleDark,
                  ]}
                >
                  Recomendado para Ti
                </Text>
                <Text
                  style={[
                    styles.recommendedText,
                    isDark && styles.recommendedTextDark,
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Selecionados especialmente baseado nos teus gostos
                </Text>
              </View>
            </View>

            <Button
              size="default"
              variant="outline"
              onPress={onSeeAllRecommendations}
              style={
                isSmallScreen
                  ? { alignSelf: "stretch", marginTop: 8 }
                  : undefined
              }
            >
              Ver Mais
            </Button>
          </View>

          {/* como o número de filmes <= numColumns, não precisamos de ScrollView */}
          <View style={styles.recommendedRow}>
            {recommendedMovies.map((movie, index) => (
              <View
                key={movie.id}
                style={{
                  width: cardWidth,
                  marginRight: index === recommendedMovies.length - 1 ? 0 : gap,
                }}
              >
                <MovieCard {...movie} onPress={() => onOpenMovie(movie.id)} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Search and Filters */}
      <View style={{ marginHorizontal: -16 }}>
        <SearchBar
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          genres={GENRES}
          selectedGenre={selectedGenre}
          onChangeGenre={setSelectedGenre}
          sortOption={sortOption}
          onChangeSort={setSortOption}
          inputRef={searchInputRef}
        />
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
  const { focusSearch } = useLocalSearchParams<{ focusSearch?: string }>();

  const { movies: backendMovies, loading, error, refetch } = useMovies();
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showLogin, setShowLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("default");

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
  } else if (width >= 1024 && width < 1400) {
    numColumns = 4;
  } else if (width >= 1400) {
    numColumns = 5;
  }

  const horizontalPadding = 16;
  const gap = 12;
  const cardWidth =
    (width - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns;

  const isSmallScreen = width < 400;

  const top10Recommended = useMemo(() => {
    if (!backendMovies || backendMovies.length === 0) return [];
    return backendMovies.slice(0, 10);
  }, [backendMovies]);

  const recommendedMovies = useMemo(() => {
    if (!top10Recommended.length) return [];
    const max = Math.min(numColumns, top10Recommended.length);
    return top10Recommended.slice(0, max);
  }, [top10Recommended, numColumns]);

  const searchInputRef = useRef<TextInput | null>(null);

  const handleSearchFocus = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);
    });
  };

  useEffect(() => {
    if (focusSearch === "1" || focusSearch === "true") {
      router.push("/")
      handleSearchFocus();
    }
  }, [focusSearch]);

  useEffect(() => {
    if (isLargeScreen && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isLargeScreen, isMenuOpen]);

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1) Filtrar
    const filtered = backendMovies.filter((movie) => {
      const matchesSearch = query
        ? movie.title.toLowerCase().includes(query)
        : true;

      const movieGenre = movie.genres?.[0]?.gerne_name || "Unknown";
      const matchesGenre =
        selectedGenre === "All" || movieGenre === selectedGenre;

      return matchesSearch && matchesGenre;
    });

    // 2) Ordenar
    const sorted = [...filtered];

    sorted.sort((a, b) => {
      const yearA = a.release_date ? Number(a.release_date.slice(0, 4)) : 0;
      const yearB = b.release_date ? Number(b.release_date.slice(0, 4)) : 0;

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
  }, [backendMovies, searchQuery, selectedGenre, sortOption]);

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
          onSearch={handleSearchFocus}
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
                recommendedMovies={recommendedMovies}
                searchInputRef={searchInputRef}
                cardWidth={cardWidth}
                gap={gap}
                onOpenMovie={(id) => setSelectedMovie(id)}
                onSeeAllRecommendations={() => router.push("/recommendations")}
                isSmallScreen={isSmallScreen}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyText, isDark && styles.emptyTextDark]}
                >
                  Nenhum filme encontrado que corresponda aos seus critérios.
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
            onSearch={handleSearchFocus}
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
  moviesSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {},
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
  recommendedSection: {
    marginHorizontal: -16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  recommendedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 20,
  },
  recommendedHeaderSmall: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  recommendedHeader2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  recommendedHeader3: {
    flexDirection: "column",
    flexShrink: 1,
  },
  recommendedList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    paddingRight: 16,
  },
  recommendedRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#11181C",
  },
  recommendedTitleDark: {
    color: "#fff",
  },
  recommendedText: {
    fontSize: 14,
    color: "#687076",
  },
  recommendedTextDark: {
    color: "#9BA1A6",
  },
});
