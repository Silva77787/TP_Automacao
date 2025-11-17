import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
  onLoginPress?: () => void;
  setShowLogin: (login: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  setShowLogin,
}) => {
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

          <Button
            variant="secondary"
            size="sm"
            onPress={() => setShowLogin(true)}
            style={styles.loginButton}
          >
            Login
          </Button>
        </View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

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
  }
});

export default SideMenu;
