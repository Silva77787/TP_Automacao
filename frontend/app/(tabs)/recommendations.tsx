import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailsWrapper } from "@/components/MovieDetailsWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";

import { useTheme } from "@/context/ThemeContext";

import { useRecommendations } from "@/hooks/useRecommendations";


import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecommendationsScreen() {
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

  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [mode, setMode] = useState<"forYou" | "popular" | "collaborative">(
    "forYou"
  );

  const rows = 4;
  const limit = numColumns * rows;

  const {
    movies: recommendedMovies,
    loading,
    error,
    message,
    refetch,
  } = useRecommendations(mode, {
    limit,
    days: 60, 
  });

  const bgScreen = isDark ? "#151718" : "#F3F4F6";
  const textMain = isDark ? "#f9fafb" : "#020617";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const notLoggedIcon = isDark ? "#e5e7eb" : "#1f2022";

  return (
    <ProtectedRoute
      fallback={
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: bgScreen }]}
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
              color={notLoggedIcon}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.notLoggedTextlg, { color: textMain }]}>
              Não está autenticado
            </Text>
            <Text style={[styles.notLoggedTextsm, { color: textMuted }]}>
              Para ver as recomendações de filmes, por favor inicie sessão ou
              crie uma conta.
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
        style={[styles.safeArea, { backgroundColor: bgScreen }]}
        edges={["top"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Header
          isLargeScreen={isLargeScreen}
          onOpenMenu={() => setIsMenuOpen(true)}
          onLogin={() => {
            setIsLogin(true);
            setShowLogin(true);
          }}
        />

        {/* Selector de modo */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
              color: textMain,
            }}
          >
            Recomendações
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: textMuted,
              marginBottom: 12,
            }}
          >
            {mode === "forYou" &&
              "Baseadas nos seus géneros e filmes bem avaliados."}
            {mode === "popular" &&
              "Filmes populares recentes com boas avaliações."}
            {mode === "collaborative" &&
              "Utilizadores com gostos semelhantes também gostaram destes filmes."}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Button
              variant={mode === "forYou" ? "default" : "secondary"}
              size="sm"
              onPress={() => setMode("forYou")}
              style={{ flex: 1 }}
            >
              Para si
            </Button>
            <Button
              variant={mode === "collaborative" ? "default" : "secondary"}
              size="sm"
              onPress={() => setMode("collaborative")}
              style={{ flex: 1 }}
            >
              Colaborativas
            </Button>
            <Button
              variant={mode === "popular" ? "default" : "secondary"}
              size="sm"
              onPress={() => setMode("popular")}
              style={{ flex: 1 }}
            >
              Populares
            </Button>
          </View>
          {message && !loading && !error && (
            <Text
              style={{
                fontSize: 11,
                color: textMuted,
                marginTop: 2,
              }}
            >
              {message}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={textMuted} />
            <Text
              style={[styles.emptyText, { color: textMuted, marginTop: 8 }]}
            >
              A carregar recomendações...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="warning"
              size={48}
              color="tomato"
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              {error}
            </Text>
          </View>
        ) : recommendedMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="star-outline"
              size={64}
              color={textMuted}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyTitle, { color: textMain }]}>
              Nenhuma recomendação disponível
            </Text>
            <Text style={[styles.emptyText, { color: textMuted }]}>
              Explore o catálogo e avalie filmes para melhorar as
              recomendações.
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
            <View style={[styles.moviesSection, { paddingHorizontal: 16 }]}>
              <View style={styles.moviesGrid}>
                {recommendedMovies.map((movie, index) => (
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
                      onPress={() => {
                        setSelectedMovieId(movie.id);
                        setDetailsVisible(true);
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        <MovieDetailsWrapper
          movieID={selectedMovieId}
          visible={detailsVisible}
          onClose={() => {
            setDetailsVisible(false);
            setSelectedMovieId(null);
            refetch();
          }}
        />

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
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Not logged (igual MyList)
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
  },
});
