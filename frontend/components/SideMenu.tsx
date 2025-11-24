import { useAuth } from "@/context/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  Alert,
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
}

export default function SideMenu({
  visible,
  onClose,
  setShowLogin,
  onPressProfile,
  isLogged,
  setIsLogged,setIsLogin,
}: SideMenuProps) {
  const { user, logout } = useAuth();
  const computedIsLogged = typeof isLogged === "boolean" ? isLogged : !!user;

  const handleLogout = () => {
    logout(); // limpa o user no contexto
    setIsLogged?.(false); // atualiza estado local se vier das props
    Alert.alert("Success", "You have been signed out.");
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
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AntDesign name="close" size={12} color="#687076" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="home" size={18} color="#687076" />
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="film" size={18} color="#687076" />
            <Text style={styles.menuItemText}>Movies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="tv" size={18} color="#687076" />
            <Text style={styles.menuItemText}>TV Shows</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome5 name="list-ul" size={18} color="#687076" />
            <Text style={styles.menuItemText}>My List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onPressProfile();
            }}
          >
            <MaterialIcons name="person-outline" size={18} color="#687076" />
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>

          {!computedIsLogged ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleLoginPress}
                style={styles.actionButton}
              >
                Login
              </Button>

              <Button
                variant="outline"
                size="sm"
                onPress={handleCreateAccountPress}
                style={styles.actionButton}
              >
                Create Account
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
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
    width: "60%", // 40% da tela
    backgroundColor: "#050505",
    paddingTop: 10,
    paddingHorizontal: 20,
    borderLeftWidth: 0.2,
    borderLeftColor: "#ececf0",
  },
  menuItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 10,
    margin: 4,
  },
  menuItemText: {
    color: "#687076",
    fontSize: 14,
  },
  backdrop: {
    flex: 1, // ocupa os outros 60%
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
