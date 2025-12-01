// components/SearchBar.tsx
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type SortOption =
  | "default"
  | "rating_desc"
  | "rating_asc"
  | "year_desc"
  | "year_asc";

interface SearchBarProps {
  searchQuery: string;
  onChangeSearch: (text: string) => void;

  genres: string[];
  selectedGenre: string;
  onChangeGenre: (genre: string) => void;

  sortOption: SortOption;
  onChangeSort: (opt: SortOption) => void;

  placeholder?: string;
  style?: ViewStyle;
  isSearching?: boolean;

  inputRef?: React.RefObject<TextInput | null>;
}

export function SearchBar({
  searchQuery,
  onChangeSearch,
  genres,
  selectedGenre,
  onChangeGenre,
  sortOption,
  onChangeSort,
  placeholder = "Pesquisar filmes ou realizadores...",
  style,
  isSearching,
  inputRef,
}: SearchBarProps) {
  const { isDark } = useTheme();

  // --- Drag horizontal no web (para géneros) ---
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
          onMouseUp: () => setIsDragging(false),
          onMouseLeave: () => setIsDragging(false),
        }
      : {};

  const genresToShow = useMemo(() => genres, [genres]);

  // --- SORT BUTTON (ciclo: default → rating↓ → rating↑ → ano↓ → ano↑ → default) ---
  const handleCycleSort = () => {
    let next: SortOption;
    switch (sortOption) {
      case "default":
        next = "rating_desc";
        break;
      case "rating_desc":
        next = "rating_asc";
        break;
      case "rating_asc":
        next = "year_desc";
        break;
      case "year_desc":
        next = "year_asc";
        break;
      case "year_asc":
      default:
        next = "default";
        break;
    }
    onChangeSort(next);
  };

  const sortLabel = useMemo(() => {
    switch (sortOption) {
      case "rating_desc":
        return "Rating ↓";
      case "rating_asc":
        return "Rating ↑";
      case "year_desc":
        return "Ano ↓";
      case "year_asc":
        return "Ano ↑";
      default:
        return "Padrão";
    }
  }, [sortOption]);

  return (
    <View style={[styles.filters, isDark && styles.filtersDark, style]}>
      {/* Search + loading + botão de ordenação */}
      <View style={[styles.searchRow, { marginHorizontal: 16 }]}>
        <View
          style={[styles.searchContainer, isDark && styles.searchContainerDark]}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#9BA1A6" : "#687076"}
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder={placeholder}
            placeholderTextColor={isDark ? "#9BA1A6" : "#687076"}
            value={searchQuery}
            onChangeText={onChangeSearch}
            underlineColorAndroid="transparent"
            selectionColor={isDark ? "#fff" : "#000"}
            blurOnSubmit={false}
          />

          {isSearching && (
            <ActivityIndicator
              size="small"
              color={isDark ? "#fff" : "#11181C"}
              style={styles.searchSpinner}
            />
          )}
        </View>

        {/* Botão de sort */}
        <TouchableOpacity
          style={[styles.sortButton, isDark && styles.sortButtonDark]}
          onPress={handleCycleSort}
          activeOpacity={0.7}
        >
          <Ionicons
            name="swap-vertical"
            size={16}
            color={isDark ? "#E5E7EB" : "#11181C"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.sortButtonText,
              { color: isDark ? "#E5E7EB" : "#11181C" },
            ]}
          >
            {sortLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Géneros com scroll + drag no web */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={Platform.OS !== "web"}
        style={styles.genreScroll}
        contentContainerStyle={styles.genreContainer}
        onScroll={
          Platform.OS === "web"
            ? (e) => setCurrentScrollX(e.nativeEvent.contentOffset.x)
            : undefined
        }
        scrollEventThrottle={16}
        {...webDragHandlers}
      >
        {genresToShow.map((genre) => (
          <TouchableOpacity
            key={genre}
            onPress={() => onChangeGenre(genre)}
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
                isDark && styles.genreTextDark, 
                selectedGenre === genre && styles.genreTextActive, 
                selectedGenre === genre && isDark && styles.genreTextActiveDark, 
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  filtersDark: {},
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
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
  searchSpinner: {
    marginLeft: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonDark: {
    backgroundColor: "#2a2a2a",
    borderColor: "#4b5563",
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  genreScroll: {
    marginTop: 8,
    paddingLeft: 16,
    ...(Platform.OS === "web" ? ({ userSelect: "none" } as any) : null),
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
    marginBottom: 8,
  },
  genreChipDark: {
    backgroundColor: "#2a2a2a",
  },
  genreChipActive: {
    backgroundColor: "#000",
  },
  genreChipActiveDark: {
    backgroundColor: "#fff",
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
  genreTextActiveDark: {
    color: "#000",
  },
});
