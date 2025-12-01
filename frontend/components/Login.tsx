import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LoginProps {
  visible: boolean;
  onClose: () => void;
  isLogin: boolean;
  setIsLogin: (is: boolean) => void;
}

export function Login({ visible, onClose, isLogin, setIsLogin }: LoginProps) {
  const { showToast } = useToast();

  const { setUser, setTokens } = useAuth();
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const containerWidth = isLargeScreen ? "50%" : "85%";
  const containerHeight = isLargeScreen ? "80%" : "80%";

  const modalBg = isDark ? "#000000" : "#FFFFFF";
  const borderColor = isDark ? "#ececf0" : "#000000";
  const textPrimary = isDark ? "#FFFFFF" : "#000000";
  const textSecondary = isDark ? "#9BA1A6" : "#687076";

  const handleSubmit = async () => {
    if (isLogin) {
      // ========== LOGIN ==========
      if (!email || !password) {
        showToast({
          type: "error",
          title: "Campos em falta",
          message: "Por favor preencha email e password.",
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email, // pode ser username OU email
            password,
          }),
        });

        const data = await response.json();
        console.log("🔐 Login response:", data);

        if (response.ok) {
          console.log("✅ Login successful, saving tokens.");

          await setTokens(data.access, data.refresh);
          await setUser({
            username: data.username,
            email: data.email,
          });

          showToast({
            type: "success",
            title: "Sessão iniciada",
            message: "Login efetuado com sucesso.",
          });

          setTimeout(() => {
            onClose();
            setEmail("");
            setPassword("");
          }, 500);

        } else {
          const errorMessage =
            data.errors?.error?.[0] || data.error || "Login failed";

          console.error("❌ Login error:", errorMessage);

          showToast({
            type: "error",
            title: "Erro ao entrar",
            message: errorMessage,
          });
        }
      } catch (error: any) {
        console.error("❌ Login network error:", error);
        showToast({
          type: "error",
          title: "Erro de rede",
          message: "Não foi possível ligar ao servidor. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // ========== REGISTER ==========
      if (!name || !email || !password) {
        showToast({
          type: "error",
          title: "Campos em falta",
          message: "Preencha todos os campos para criar a conta.",
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.REGISTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: name,
            email,
            password,
            password_confirm: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showToast({
            type: "success",
            title: "Conta criada",
            message: "Conta criada com sucesso. Já pode iniciar sessão.",
          });

          setIsLogin(true);
          setName("");
          setEmail("");
          setPassword("");
        } else {
          const errorMessage =
            Object.values(data.errors || {})
              .flat()
              .join(", ") ||
            data.message ||
            "Registration failed";

          showToast({
            type: "error",
            title: "Erro no registo",
            message: errorMessage,
          });
        }
      } catch (error: any) {
        console.error("❌ Registration error:", error);
        showToast({
          type: "error",
          title: "Erro de rede",
          message: "Não foi possível criar a conta. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    onClose();
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* BACKDROP closes modal when clicked */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.container,
            {
              width: containerWidth,
              height: containerHeight,
              backgroundColor: modalBg,
              borderColor,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Ionicons name="film" size={22} color={textPrimary} />
                <Text style={[styles.logoText, { color: textPrimary }]}>
                  CineHub
                </Text>
              </View>

              <Text style={[styles.title, { color: textPrimary }]}>
                {isLogin ? "Bem-vindo de volta" : "Criar conta"}
              </Text>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                {isLogin
                  ? "Entre com suas credenciais para continuar"
                  : "Preencha os dados para criar sua conta"}
              </Text>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textPrimary }]}>
                    Username
                  </Text>
                  <Input
                    placeholder="Seu nome de usuário"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textPrimary }]}>
                  Email
                </Text>
                <Input
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textPrimary }]}>
                  Password
                </Text>
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                onPress={handleSubmit}
                size="sm"
                style={styles.submitButton}
                loading={loading}
                disabled={loading}
                variant="default"
              >
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>

              <View style={styles.switchContainer}>
                <Text style={[styles.switchText, { color: textSecondary }]}>
                  {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                >
                  <Text style={[styles.switchLink, { color: textPrimary }]}>
                    {isLogin ? "Criar conta" : "Entrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  container: {
    height: "80%",
    width: "85%",
    borderRadius: 16,
    borderWidth: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    alignSelf: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxText: {
    fontSize: 12,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    textTransform: "uppercase",
  },
  googleButton: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  terms: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "500",
  },
});
