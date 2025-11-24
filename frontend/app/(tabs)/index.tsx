import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetails } from "@/components/MovieDetails";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOVIES: Movie[] = [
  {
    id: 1,
    title: "Neon Shadows",
    year: 2024,
    rating: 8.7,
    genre: "Sci-Fi",
    image:
      "https://images.unsplash.com/photo-1644772310791-deb96e24ee65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2ktZmklMjBmdXR1cmlzdGljfGVufDF8fHx8MTc2MTUzMzAzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "In a dystopian future where memories can be traded like currency, a detective must navigate the neon-lit streets to solve a conspiracy that threatens the fabric of reality itself.",
    director: "Sarah Chen",
    runtime: 142,
    cast: ["Alex Rivera", "Maya Thompson", "James Park"],
  },
  {
    id: 2,
    title: "Thunder Strike",
    year: 2024,
    rating: 7.9,
    genre: "Action",
    image:
      "https://images.unsplash.com/photo-1755076347925-fe1e04401c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHNjZW5lfGVufDF8fHx8MTc2MTQ4NTE5NHww&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "An elite special forces operative must race against time to prevent a global catastrophe when a rogue faction threatens to unleash devastating weather-control technology.",
    director: "Michael Stone",
    runtime: 128,
    cast: ["Chris Hammond", "Elena Rodriguez", "Marcus Johnson"],
  },
  {
    id: 3,
    title: "Eternal Summer",
    year: 2024,
    rating: 8.2,
    genre: "Romance",
    image:
      "https://images.unsplash.com/photo-1609561026486-f5d4a3c4c660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMHN1bnNldHxlbnwxfHx8fDE3NjE0NTQ3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Two strangers meet during a magical summer in the Mediterranean, discovering that love transcends time, distance, and the boundaries they've built around their hearts.",
    director: "Isabella Rossi",
    runtime: 115,
    cast: ["Emma Laurent", "Lucas Martinez", "Sophie Anderson"],
  },
  {
    id: 4,
    title: "The Last Laugh",
    year: 2024,
    rating: 7.5,
    genre: "Comedy",
    image:
      "https://images.unsplash.com/photo-1758525862263-af89b090fb56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21lZHklMjBsYXVnaGluZyUyMHBlb3BsZXxlbnwxfHx8fDE3NjE1MjE2NzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "A struggling comedian gets one last chance at stardom when a viral video makes him an overnight sensation, but fame comes with unexpected hilarious challenges.",
    director: "Tom Baker",
    runtime: 105,
    cast: ["Ryan Cooper", "Jennifer Lee", "David Walsh"],
  },
  {
    id: 5,
    title: "Whispers in the Dark",
    year: 2024,
    rating: 8.0,
    genre: "Horror",
    image:
      "https://images.unsplash.com/photo-1662414712336-12cb34792ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBkYXJrJTIwc2Nhcnl8ZW58MXx8fHwxNzYxNTY2NjIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "A family moves into an old Victorian mansion, only to discover that the whispers they hear in the night are warnings from spirits trying to save them from an ancient evil.",
    director: "Amanda Cross",
    runtime: 118,
    cast: ["Rachel Morrison", "Tom Hardy", "Olivia Blake"],
  },
];

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

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showLogin, setShowLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const { user } = useAuth();
  const isLogged = !!user;

  const router = useRouter();

  useEffect(() => {
    if (isLargeScreen && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isLargeScreen, isMenuOpen]);

  const filteredMovies = MOVIES.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === "All" || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={["top"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <Header
        isLargeScreen={isLargeScreen}
        onOpenMenu={() => setIsMenuOpen(true)}
        onLogin={() => setShowLogin(true)}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzYxNTUwNTYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
            }}
            style={styles.heroImage}
            contentFit="cover"
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
              <View style={styles.heroButtons}>
                <Button size="lg" variant="defaultIndex" style={styles.heroButton}>
                  Browse Movies
                </Button>
                {isLogged ? (
                  <></>
                ) : (
                  <Button
                    variant="outlineIndex"
                    size="lg"
                    style={styles.heroButton}
                    onPress={() => {
                      setIsLogin(false);
                      setShowLogin(true);
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={[styles.filters, isDark && styles.filtersDark]}>
          <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
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
                  selectedGenre === genre &&
                    isDark &&
                    styles.genreChipActiveDark,
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

        {/* Movies Grid */}
        <View style={styles.moviesSection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              {selectedGenre === "All"
                ? "All Movies"
                : `${selectedGenre} Movies`}
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                isDark && styles.sectionSubtitleDark,
              ]}
            >
              {filteredMovies.length}{" "}
              {filteredMovies.length === 1 ? "movie" : "movies"} found
            </Text>
          </View>

          {filteredMovies.length > 0 ? (
            <View style={styles.moviesGrid}>
              {filteredMovies.map((movie, index) => (
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
                    onPress={() => setSelectedMovie(movie)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                No movies found matching your criteria.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Movie Details Modal */}
      <MovieDetails
        movie={selectedMovie}
        visible={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
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
  loginText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
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
    paddingHorizontal: 16,
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
    padding: 16,
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
