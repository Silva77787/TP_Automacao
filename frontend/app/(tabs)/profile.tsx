import Header from "@/components/Header";
import { Login } from "@/components/Login";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const router = useRouter();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [authVisible, setAuthVisible] = useState(false);
  const [modalIsLogin, setModalIsLogin] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;

    const body: { email?: string; password?: string } = {};
    const trimmedEmail = editEmail.trim();
    const trimmedPassword = editPassword.trim();

    if (trimmedEmail && trimmedEmail !== email) {
      body.email = trimmedEmail;
    }
    if (trimmedPassword) {
      body.password = trimmedPassword;
    }

    if (!body.email && !body.password) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(API_ENDPOINTS.UPDATE_USER(user.username), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Erro", data.error || "Falha ao atualizar utilizador.");
        return;
      }

      // Atualizar estado local depois de sucesso
      if (body.email) {
        setEmail(trimmedEmail);
      }
      setEditPassword(""); // limpa password do campo
      setIsEditing(false);
      Alert.alert("Sucesso", "Dados atualizados com sucesso.");
    } catch (err) {
      console.log("Erro update_user:", err);
      Alert.alert("Erro", "Erro de rede ao atualizar utilizador.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditEmail(email ?? "");
    setEditPassword("");
  };

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.USER(user.username));
        const data = await res.json();

        if (res.ok) {
          setEmail(data.email || "");
          setEditEmail(data.email || "");
        } else {
          console.log("Erro ao carregar utilizador:", data);
        }
      } catch (err) {
        console.log("Erro de rede ao carregar utilizador:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Header isDark={isDark} isLargeScreen={false} showFullMenu={false} />

        <View style={styles.notLoggedContainer}>
          <Ionicons
            name="person-circle-outline"
            size={72}
            color="#e5e7eb"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.notLoggedTextlg}>Não está autenticado</Text>
          <Text style={styles.notLoggedTextsm}>
            Para aceder à página de perfil, por favor inicie sessão ou crie uma
            conta.
          </Text>

          <View style={styles.notLoggedButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                setModalIsLogin(true); // modo LOGIN
                setAuthVisible(true);
              }}
            >
              <Text style={styles.buttonPrimaryText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={() => {
                setModalIsLogin(false); // modo REGISTO
                setAuthVisible(true);
              }}
            >
              <Text style={styles.buttonGhostText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Login
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
          setIsLogged={setIsLogged}
          isLogin={modalIsLogin}
          setIsLogin={setModalIsLogin}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Header isDark={isDark} isLargeScreen={false} showFullMenu={false} />
      {loading && (
        <ActivityIndicator
          size="large"
          color="#e5e7eb"
          style={{ marginVertical: 16 }}
        />
      )}

      {error && (
        <Text
          style={{ color: "tomato", textAlign: "center", marginVertical: 8 }}
        >
          {error}
        </Text>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, styles.box]}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require("@/assets/images/perfil.jpg")}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username ?? "Utilizador"}</Text>
              <Text style={styles.profileEmail}>
                {email ?? "email@exemplo.com"}
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Ionicons name="heart" size={14} color="#f5f5f5" />
                  <Text style={styles.badgeText}>3 Favoritos</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="eye" size={14} color="#f5f5f5" />
                  <Text style={styles.badgeText}>3 Assistidos</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="calendar" size={14} color="#f5f5f5" />
                  <Text style={styles.badgeText}>Membro desde 2024</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main content: Sobre + Histórico */}
        <View
          style={[
            styles.mainRow,
            !isLargeScreen && { flexDirection: "column" },
          ]}
        >
          {/*Sobre*/}
          <View style={[styles.card, styles.box]}>
            <Text style={styles.cardTitle}>Conta</Text>
            <Text style={styles.cardSubtitle}>Informações da sua conta</Text>

            {/* Email */}
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Email</Text>

              {isEditing ? (
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="o.seu@email.com"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {email || "Sem email definido"}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.infoBlock}>
              {isEditing ? (
                <>
                  <Text style={styles.infoLabel}>Nova Password</Text>
                  <TextInput
                    value={editPassword}
                    onChangeText={setEditPassword}
                    placeholder="Deixe em branco para não alterar"
                    placeholderTextColor="#6b7280"
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.infoLabel}>Password</Text>
                  <Text style={styles.infoValue}>********</Text>
                </>
              )}
            </View>

            {/* Botões */}
            {isEditing ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {saving ? "A guardar..." : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonGhost]}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.buttonGhostText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="#f9fafb" />
                <Text style={styles.editButtonText}>Editar conta</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Histórico Recente */}
          <View style={[styles.card, styles.box]}>
            <Text style={styles.cardTitle}>Histórico Recente</Text>
            <Text style={styles.cardSubtitle}>
              Seus últimos filmes assistidos
            </Text>

            <MovieHistoryItem
              title="Thunder Strike"
              timeAgo="Há 2 dias"
              rating={4}
            />
            <MovieHistoryItem
              title="Cyber Protocol"
              timeAgo="Há 5 dias"
              rating={5}
            />
            <MovieHistoryItem
              title="Velocity"
              timeAgo="Há 1 semana"
              rating={3}
            />
          </View>
        </View>

        {/* Estatísticas */}
        <View style={[styles.statsCard, styles.box]}>
          <Text style={styles.cardTitle}>Estatísticas</Text>
          <Text style={styles.cardSubtitle}>Sua atividade no CineHub</Text>

          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>24</Text>
              <Text style={styles.statsLabel}>Filmes assistidos</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>3</Text>
              <Text style={styles.statsLabel}>Favoritos</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>4.2</Text>
              <Text style={styles.statsLabel}>Avaliação média</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>36h</Text>
              <Text style={styles.statsLabel}>Tempo assistindo</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface MovieHistoryItemProps {
  title: string;
  timeAgo: string;
  rating: number;
}

const MovieHistoryItem = ({
  title,
  timeAgo,
  rating,
}: MovieHistoryItemProps) => {
  const stars = Array.from({ length: 5 });

  return (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historyTime}>{timeAgo}</Text>
      </View>

      <View style={styles.historyRight}>
        <View style={styles.starRow}>
          {stars.map((_, index) => (
            <MaterialIcons
              key={index}
              name={index < rating ? "star" : "star-border"}
              size={18}
              color="#facc15"
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#151718", // quase preto
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 16,
  },
  box: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#9BA1A6" + 50,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  //Not logged
  notLoggedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  notLoggedTextlg: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  notLoggedTextsm: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  notLoggedButtons: { flexDirection: "row", gap: 12, width: "60%" },
  // Profile card
  profileCard: {
    backgroundColor: "#151718",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 999,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#151718",
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },
  profileEmail: {
    color: "#9ca3af",
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
    borderColor: "#9BA1A6" + 50,
    borderRadius: 12,
    backgroundColor: "#313131ff",
  },
  badgeText: {
    color: "#e5e7eb",
    fontSize: 12,
  },

  // Main two cards
  mainRow: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#151718",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 16,
  },

  infoBlock: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#e5e7eb",
    fontSize: 14,
  },

  input: {
    backgroundColor: "#313131ff",
    borderWidth: 1,
    borderColor: "#9BA1A6" + 50,
    borderRadius: 12,
    color: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  editButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#313131ff",
    borderWidth: 1,
    borderColor: "#9BA1A6" + 50,
    borderRadius: 12,
  },
  editButtonText: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "500",
  },

  buttonRow: {
    width: "40%",
    flexDirection: "row",
    gap: 8,
    marginTop: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#f9fafb",
  },
  buttonPrimaryText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonGhost: {
    backgroundColor: "#313131ff",
    borderWidth: 1,
    borderColor: "#9BA1A6" + 50,
  },
  buttonGhostText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },

  // Histórico
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#9BA1A6" + 50,
  },
  historyTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "500",
  },
  historyTime: {
    color: "#9ca3af",
    fontSize: 12,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },

  // Estatísticas
  statsCard: {
    backgroundColor: "#151718",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#111827",
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
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },
  statsLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
});
