import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
import Toast from "react-native-toast-message";
import { Button } from "./ui/button";
interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  setShowLogin: (login: boolean) => void;
  onPressProfile: () => void;
  isLogged?: boolean;
  setIsLogged?: (isLogged: boolean) => void;
  setIsLogin?: (value: boolean) => void;
}

export default function SideMenu({
  visible,
  onClose,
  setShowLogin,
  onPressProfile,
  setIsLogin,
}: SideMenuProps) {
  const { user, logout } = useAuth();
  const isLogged = !!user;

  const router = useRouter();

  const { isDark } = useTheme();

  const menuBg = isDark ? "#050505" : "#FFFFFF";
  const borderColor = isDark ? "#ececf0" : "#000000";
  const iconColor = isDark ? "#9BA1A6" : "#687076";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const textMuted = isDark ? "#9BA1A6" : "#687076";

  const handleLogout = () => {
    logout();
    Toast.show({
      type: "success",
      text1: "Sessão terminada",
      text2: "Saiu da conta com sucesso",
    });
    onClose();
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

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="search" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome5 name="list-ul" size={18} color={iconColor} />
            <Text style={[styles.menuItemText, { color: textMuted }]}>
              My List
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
