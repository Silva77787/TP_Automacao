import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "./ui/button";
interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  setShowLogin: (login: boolean) => void;
  onPressProfile: () => void;
  isLogged?: boolean;
  setIsLogged?: (isLogged: boolean) => void;
  setIsLogin?: (value: boolean) => void;
  onSearch?: () => void;
}

export default function SideMenu({
  visible,
  onClose,
  setShowLogin,
  onPressProfile,
  setIsLogin,
  onSearch,
}: SideMenuProps) {
  const { showToast } = useToast();

  const { user, logout } = useAuth();
  const isLogged = !!user;

  const router = useRouter();

  const { isDark } = useTheme();

  const menuBg = isDark ? "#151718" : "#ffffff";
  const borderColor = isDark ? "#2a2a2a" : "#e6e6e6";
  const iconColor = isDark ? "#fff" : "#030213";
  const textMuted = isDark ? "#fff" : "#030213";

  const handleLogout = () => {
    logout();
    onClose()
    showToast({
      type: "success",
      title: "Sessão terminada",
      message: "Saiu da sua conta com sucesso.",
    });
  };

  const handleLoginPress = () => {
    setIsLogin?.(true);
    setShowLogin(true);
    onClose();
  };

  const handleCreateAccountPress = () => {
    setIsLogin?.(false);
    setShowLogin(true);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.menuContainer,
            { backgroundColor: menuBg, borderLeftColor: borderColor },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AntDesign name="close" size={12} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/");
            }}
          >
            <Feather name="home" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (onSearch) {
                onSearch();
              } else {
                router.push({
                  pathname: "/",
                  params: { focusSearch: "1" },
                });
              }

              onClose?.();
            }}
          >
            <Ionicons name="search-outline" size={22} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/mylist");
            }}
          >
            <FontAwesome5 name="list-ul" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              My List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/recommendations");
            }}
          >
            <Ionicons name="sparkles-outline" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              Recomendações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onPressProfile();
            }}
          >
            <MaterialIcons name="person-outline" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              Profile
            </Text>
          </TouchableOpacity>

          {!isLogged ? (
            <>
              <Button
                variant="default"
                onPress={handleLoginPress}
                style={styles.actionButton}
              >
                Login
              </Button>

              <Button
                variant="outline"
                onPress={handleCreateAccountPress}
                style={styles.actionButton}
              >
                Create Account
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              onPress={handleLogout}
              style={styles.actionButton}
            >
              Sign out
            </Button>
          )}
        </View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row-reverse",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    width: "60%",
    paddingTop: 10,
    paddingHorizontal: 20,
    borderLeftWidth: 0.2,
  },
  menuItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 10,
    margin: 4,
  },
  menuItemText: {
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
  },
  loginButton: {
    marginTop: 10,
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginTop: 10,
  },
});
