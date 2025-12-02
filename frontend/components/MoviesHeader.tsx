import { MovieCard } from "@/components/MovieCard";
import { SearchBar, SortOption } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import React from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";

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

export function MoviesHeader({
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
}: MoviesHeaderProps) {
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
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
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
