import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Entypo, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert} from "react-native";

interface Props {
  isDark?: boolean;
  isLargeScreen?: boolean;
  showFullMenu?: boolean;
  onOpenMenu?: () => void;
  onLogin?: () => void;
}

export default function Header({
  isDark,
  isLargeScreen,
  showFullMenu = true,
  onOpenMenu,
  onLogin
}: Props) {

  const router = useRouter();
  const { user, logout } = useAuth();
  const isLogged = !!user;

  const handleLogout = () => {
    logout(); 
    Alert.alert("Success", "You have been signed out.");
  };

  return (
    <View style={[styles.header, isDark && styles.headerDark]}>
      <View style={styles.headerContent}>
        <View style={styles.logo}>
          <Ionicons name="film" size={20} color={isDark ? "#fff" : "#030213"} />
          <Text style={[styles.logoText, isDark && styles.logoTextDark]}>
            CineHub
          </Text>
        </View>

        <View style={styles.headerActions}>
          {showFullMenu ? (
            isLargeScreen ? (
              <>
                <TouchableOpacity style={styles.navItem}>
                  <Text style={[styles.navText, isDark && styles.navTextDark]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                  <Text style={[styles.navText, isDark && styles.navTextDark]}>
                    Movies
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                  <Text style={[styles.navText, isDark && styles.navTextDark]}>
                    TV Shows
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                  <Text style={[styles.navText, isDark && styles.navTextDark]}>
                    My List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
                  <Ionicons
                    name={isDark ? "sunny" : "moon"}
                    size={20}
                    color={isDark ? "#fff" : "#030213"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => router.push("/(tabs)/profile")}
                >
                  <MaterialIcons name="person-outline" size={20} color="#fff" />
                </TouchableOpacity>

                {isLogged ? (
                  <Button variant="secondary" size="sm" onPress={handleLogout}>
                    Sign out
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onPress={onLogin}>
                    Login
                  </Button>
                )}
              </>
            ) : (
              <Button variant="ghost" size="sm" onPress={onOpenMenu}>
                <Entypo name="menu" size={24} color="white" />
              </Button>
            )
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#fff" : "#030213"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },

  headerDark: {
    backgroundColor: "#151718",
    borderBottomColor: "#2a2a2a",
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#030213",
  },

  logoTextDark: {
    color: "#fff",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  navItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  navText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#030213",
  },

  navTextDark: {
    color: "#ffffff",
  },

  iconButton: {
    padding: 6,
    borderRadius: 6,
  },
});
