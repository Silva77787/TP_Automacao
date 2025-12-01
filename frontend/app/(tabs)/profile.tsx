import Header from "@/components/Header";
import { Login } from "@/components/Login";
import MovieHistoryItem from "@/components/MovieHistoryItem";
import SideMenu from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
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
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { showToast } = useToast();

  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const { user, accessToken } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [modalIsLogin, setModalIsLogin] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type UserReview = {
    id: number;
    rating: number;
    description?: string | null;
    created_at: string;
    movie?: { id: number; title: string };
  };

  const [allReviews, setAllReviews] = useState<UserReview[]>([]);
  const [recentReviews, setRecentReviews] = useState<UserReview[]>([]);

  const bgScreen = isDark ? "#151718" : "#F3F4F6";
  const cardBg = isDark ? "#151718" : "#FFFFFF";
  const cardBorder = isDark ? "#2b2c2eff" : "#E5E7EB";
  const textMain = isDark ? "#f9fafb" : "#020617";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const statLabel = textMuted;
  const statValue = textMain;
  const badgeBg = isDark ? "#313131ff" : "#E5E7EB";
  const badgeBorder = isDark ? "#9BA1A6" + "50" : "#D1D5DB";
  const inputBg = isDark ? "#313131ff" : "#FFFFFF";
  const inputBorder = isDark ? "#9BA1A6" + "50" : "#D1D5DB";
  const notLoggedIcon = isDark ? "#e5e7eb" : "#1f2022ff";

  const handleSave = async () => {
    if (!user || !accessToken) return;

    const trimmedOldPassword = oldPassword.trim();
    const trimmedEmail = editEmail.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedNewPasswordConfirm = newPasswordConfirm.trim();

    if (!trimmedOldPassword) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Introduza a password atual para guardar alterações.",
      });
      return;
    }

    const body: {
      email?: string;
      old_password: string;
      password?: string;
      password_confirm?: string;
    } = {
      old_password: trimmedOldPassword,
    };

    if (trimmedEmail && trimmedEmail !== email) {
      body.email = trimmedEmail;
    }

    if (trimmedNewPassword || trimmedNewPasswordConfirm) {
      if (!trimmedNewPassword || !trimmedNewPasswordConfirm) {
        showToast({
          type: "error",
          title: "Erro",
          message:
            "Para alterar a password preencha os dois campos da nova password.",
        });
        return;
      }
      body.password = trimmedNewPassword;
      body.password_confirm = trimmedNewPasswordConfirm;
    }

    // nada para alterar → sai do modo edição sem toast
    if (!body.email && !body.password) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(API_ENDPOINTS.UPDATE_USER(user.username), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("UPDATE_USER status:", res.status, data);

      if (!res.ok || data.success === false) {
        const msg =
          data.errors?.old_password?.[0] ||
          data.errors?.email?.[0] ||
          data.errors?.password?.[0] ||
          data.error ||
          "Falha ao atualizar utilizador.";

        showToast({
          type: "error",
          title: "Erro ao atualizar",
          message: msg,
        });
        return;
      }

      if (data.user?.email) {
        setEmail(data.user.email);
        setEditEmail(data.user.email);
      }

      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setIsEditing(false);

      showToast({
        type: "success",
        title: "Sucesso",
        message: "Dados atualizados com sucesso.",
      });
    } catch (err) {
      console.log("Erro update_user:", err);
      showToast({
        type: "error",
        title: "Erro de rede",
        message: "Erro de rede ao atualizar utilizador.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditEmail(email ?? "");
    setOldPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const fetchUserData = useCallback(async () => {
    if (!user || !accessToken) return;

    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.GET_USER(user.username), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log("GET_USER status:", res.status, data);

      if (res.ok && data.success !== false && data.user) {
        setEmail(data.user.email || "");
        setEditEmail(data.user.email || "");
        setUsername(data.user.username || user.username);
        setError(null);
      } else {
        console.log("Erro ao carregar utilizador:", data);
        setError(data.error || "Erro ao carregar dados do utilizador.");
      }
    } catch (err) {
      console.log("Erro de rede ao carregar utilizador:", err);
      setError("Erro de rede ao carregar utilizador.");
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  const fetchRecentReviews = useCallback(async () => {
    if (!user || !accessToken) return;

    try {
      const res = await fetch(API_ENDPOINTS.GET_USER_REVIEWS(user.username), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log("GET_USER_REVIEWS (profile) status:", res.status, data);

      if (!res.ok || data.success === false) {
        console.log("Erro ao carregar reviews:", data);
        return;
      }

      const reviews: UserReview[] = data.reviews || [];

      const sorted = [...reviews].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentReviews(sorted.slice(0, 3));
    } catch (err) {
      console.log("Erro de rede ao carregar reviews:", err);
    }
  }, [user, accessToken]);

  const fetchUserReviews = useCallback(async () => {
    if (!user || !accessToken) return;

    try {
      const res = await fetch(API_ENDPOINTS.GET_USER_REVIEWS(user.username), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log("GET_USER_REVIEWS (Profile):", data);

      if (!res.ok || data.success === false) {
        console.log("Erro ao obter reviews:", data);
        return;
      }

      const reviews: UserReview[] = data.reviews || [];
      setAllReviews(reviews);

      // Ordenar por data desc → pegar apenas 3
      const sorted = [...reviews].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentReviews(sorted.slice(0, 3));
    } catch (err) {
      console.log("Erro de rede ao buscar reviews:", err);
    }
  }, [user, accessToken]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchUserReviews();
      return () => {};
    }, [fetchUserData, fetchUserReviews])
  );

  const totalRatings = allReviews.length;

  const averageRating =
    totalRatings > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

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
            Para aceder à página de perfil, por favor inicie sessão ou crie uma
            conta.
          </Text>

          <View style={styles.notLoggedButtons}>
            <Button
              style={{ flex: 1 }}
              onPress={() => {
                setModalIsLogin(true);
                setAuthVisible(true);
              }}
              loading={loading}
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
              loading={loading}
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
            onSearch={undefined}
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

      {loading && (
        <ActivityIndicator
          size="large"
          color={textMuted}
          style={{ marginVertical: 16 }}
        />
      )}

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile card */}
        <View
          style={[
            styles.profileCard,
            styles.box,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <View style={styles.profileRow}>
            {/* AVATAR DO UTILIZADOR */}
            <View
              style={[styles.profileAvatar, isDark && styles.profileAvatarDark]}
            >
              <Text
                style={[
                  styles.profileAvatarText,
                  isDark && styles.profileAvatarTextDark,
                ]}
              >
                {user?.username?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textMain }]}>
                {username ?? "Utilizador"}
              </Text>
              <Text style={[styles.profileEmail, { color: textMuted }]}>
                {email ?? "email@exemplo.com"}
              </Text>

              <View style={styles.badgeRow}>
                {/* Média de rating */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeBg, borderColor: badgeBorder },
                  ]}
                >
                  <Ionicons name="star" size={14} color={textMain} />
                  <Text style={[styles.badgeText, { color: textMain }]}>
                    {totalRatings > 0
                      ? `${averageRating.toFixed(1)}/10 média`
                      : "Sem avaliações"}
                  </Text>
                </View>

                {/* Nº de ratings */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeBg, borderColor: badgeBorder },
                  ]}
                >
                  <Ionicons name="list" size={14} color={textMain} />
                  <Text style={[styles.badgeText, { color: textMain }]}>
                    {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
                  </Text>
                </View>

                {/* Data Registro */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeBg, borderColor: badgeBorder },
                  ]}
                >
                  <Ionicons name="calendar" size={14} color={textMain} />
                  <Text style={[styles.badgeText, { color: textMain }]}>
                    Membro desde 2024
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main content: Conta + Histórico */}
        <View
          style={[
            styles.mainRow,
            !isLargeScreen && { flexDirection: "column" },
          ]}
        >
          {/* Conta */}
          <View
            style={[
              styles.card,
              styles.box,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: textMain }]}>Conta</Text>
            <Text style={[styles.cardSubtitle, { color: textMuted }]}>
              Informações da sua conta
            </Text>

            {/* Email */}
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: textMuted }]}>
                Email
              </Text>

              {isEditing ? (
                <Input
                  placeholder="o.seu@email.com"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={[styles.infoValue, { color: textMain }]}>
                  {email || "Sem email definido"}
                </Text>
              )}
            </View>

            {/* Password atual (obrigatória para qualquer alteração) */}
            <View style={styles.infoBlock}>
              {isEditing ? (
                <>
                  <Text style={[styles.infoLabel, { color: textMuted }]}>
                    Password atual
                  </Text>
                  <Input
                    placeholder="Introduza a sua password atual"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.infoLabel, { color: textMuted }]}>
                    Password
                  </Text>
                  <Text style={[styles.infoValue, { color: textMain }]}>
                    **********
                  </Text>
                </>
              )}
            </View>

            {/* Nova password + confirmação */}
            {isEditing && (
              <View style={styles.infoBlock}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>
                  Nova password
                </Text>
                <Input
                  placeholder="Deiexe em branco se não quiser alterar"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text
                  style={[styles.infoLabel, { color: textMuted, marginTop: 8 }]}
                >
                  Confirmar nova password
                </Text>
                <Input
                  placeholder="Repita a nova password"
                  value={newPasswordConfirm}
                  onChangeText={setNewPasswordConfirm}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Botões de edição */}
            {isEditing ? (
              <View style={styles.buttonRow}>
                <Button
                  variant="secondary"
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? "A guardar..." : "Salvar"}
                </Button>

                <Button
                  variant="secondary"
                  onPress={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </View>
            ) : (
              <Button
                style={styles.editButton}
                variant="secondary"
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  style={styles.editText}
                  name="pencil"
                  size={16}
                  color={isDark ? "#fff" : "#030213"}
                />
                Editar conta
              </Button>
            )}
          </View>

          {/* Histórico Recente */}
          <View
            style={[
              styles.card,
              styles.box,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: textMain }]}>
              Histórico Recente
            </Text>
            <Text style={[styles.cardSubtitle, { color: textMuted }]}>
              Seus últimos filmes avaliados
            </Text>

            {recentReviews.length > 0 ? (
              recentReviews.map((rev) => (
                <MovieHistoryItem
                  key={rev.id}
                  title={rev.movie?.title ?? "Filme desconhecido"}
                  timeAgo={formatTimeAgo(rev.created_at)}
                  rating={mapRatingToStars(rev.rating)}
                />
              ))
            ) : (
              <Text style={[styles.infoValue, { color: textMuted }]}>
                Ainda não avaliou qualquer filme.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {!isLargeScreen && (
        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          setShowLogin={setAuthVisible}
          onPressProfile={() => router.push("/(tabs)/profile")}
          setIsLogin={setModalIsLogin}
          onSearch={undefined}
        />
      )}
    </SafeAreaView>
  );
}

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Agora mesmo";

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Agora mesmo";
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Há 1 dia";
  if (diffDays < 7) return `Há ${diffDays} dias`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Há 1 semana";

  return `Há ${diffWeeks} semanas`;
}

function mapRatingToStars(rating: number): number {
  const stars = Math.round(rating / 2);
  return Math.min(Math.max(stars, 0), 5);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 16,
  },
  box: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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

  // Profile card
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB", // Light
    marginBottom: 12,
  },
  profileAvatarDark: {
    backgroundColor: "#111827",
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  profileAvatarTextDark: {
    color: "#F9FAFB",
  },

  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
  },

  // Main two cards
  mainRow: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },

  infoBlock: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  editButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  editText: {
    marginRight: 10,
  },

  buttonRow: {
    width: "40%",
    flexDirection: "row",
    gap: 8,
    marginTop: 1,
  },

  // Estatísticas
  statsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  statsItem: {
    flex: 1,
    minWidth: 80,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statsLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
