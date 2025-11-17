import { API_ENDPOINTS } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
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
}

export function Login({ visible, onClose }: LoginProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; 
  const containerWidth = isLargeScreen ? "50%" : "85%";
  const containerHeight = isLargeScreen ? "80%" : "80%";

  const handleSubmit = async () => {
    if (isLogin) {
      // LOGIN
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Login successful", data);
          Alert.alert("Success", "Login successful!");
          onClose();
          setEmail("");
          setPassword("");
        } else {
          Alert.alert("Error", data.error || "Login failed");
        }
      } catch (error) {
        Alert.alert("Error", "Network error. Try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      // REGISTER
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.REGISTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          Alert.alert(
            "Success",
            "Account created successfully. You may now log in."
          );
          setIsLogin(true);
          setName("");
        } else {
          Alert.alert("Error", data.error || "Registration failed");
        }
      } catch (error) {
        Alert.alert("Error", "Network error. Try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* BACKDROP que fecha ao clicar fora */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Ionicons name="film" size={22} color="white" />
                <Text style={styles.logoText}>CineHub</Text>
              </View>

              <Text style={styles.title}>
                {isLogin ? "Bem-vindo de volta" : "Criar conta"}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Entre com suas credenciais para continuar"
                  : "Preencha os dados para criar sua conta"}
              </Text>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome completo</Text>
                  <Input
                    placeholder="Seu nome"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
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
                <Text style={styles.label}>Senha</Text>
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {isLogin && (
                <View style={styles.options}>
                  <View style={styles.checkboxContainer}>
                    <Ionicons name="square-outline" size={20} color="#687076" />
                    <Text style={styles.checkboxText}>Lembrar de mim</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Button
                onPress={handleSubmit}
                size="sm"
                style={styles.submitButton}
                loading={loading}
                disabled={loading}
                variant="secondary"
              >
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button variant="outline" size="sm" style={styles.googleButton}>
                Continuar com Google
              </Button>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.switchLink}>
                    {isLogin ? "Criar conta" : "Entrar"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.terms}>
                Ao criar uma conta, você concorda com nossos{" "}
                <Text style={styles.termsLink}>Termos de Serviço</Text> e{" "}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
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
    backgroundColor: "#000",
    height: "80%",
    width: "85%",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#ececf0",
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
    color: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#687076",
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
    color: "#fff",
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
    color: "#687076",
  },
  linkText: {
    fontSize: 12,
    color: "#fff",
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
    backgroundColor: "#ececf0",
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: "#687076",
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
    color: "#687076",
  },
  switchLink: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  terms: {
    fontSize: 12,
    color: "#687076",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#fff",
    fontWeight: "500",
  },
});
