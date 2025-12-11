import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailsWrapper } from "@/components/MovieDetailsWrapper";
import { MoviesHeader } from "@/components/MoviesHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SortOption } from "@/components/SearchBar";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

import { useMovies } from "@/hooks/useMovies";
import { useRecommendations } from "@/hooks/useRecommendations";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";
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
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { isDark } = useTheme();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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

  const {
    movies: forYouMovies,
    loading: recLoading,
    error: recError,
  } = useRecommendations("forYou", {
    limit: numColumns,
  });

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

  const recommendedMovies = useMemo(() => {
    const source =
      forYouMovies && forYouMovies.length > 0 ? forYouMovies : backendMovies;
    console.log(forYouMovies);
    if (!source || source.length === 0) return [];

    const max = Math.min(numColumns, source.length);
    return source.slice(0, max);
  }, [forYouMovies, backendMovies, numColumns]);

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
      router.push("/");
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

    const filtered = backendMovies.filter((movie) => {
      const matchesSearch = query
        ? movie.title.toLowerCase().includes(query) ||
          movie.directors?.some((d) => d.name.toLowerCase().includes(query))
        : true;

      const movieGenre = movie.genres?.[0]?.gerne_name || "Unknown";
      const matchesGenre =
        selectedGenre === "All" || movieGenre === selectedGenre;

      return matchesSearch && matchesGenre;
    });

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
