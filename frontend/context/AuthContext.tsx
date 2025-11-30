import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  username: string;
  email?: string | null;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from AsyncStorage on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedAccessToken = await AsyncStorage.getItem("accessToken");
      const savedRefreshToken = await AsyncStorage.getItem("refreshToken");
      const savedUser = await AsyncStorage.getItem("user");

      console.log("🔍 Checking stored tokens on app start...");
      console.log("📦 Access token stored:", !!savedAccessToken);
      console.log("📦 User stored:", !!savedUser);

      if (savedAccessToken && savedUser) {
        console.log("✅ Restoring session from storage");
        setAccessTokenState(savedAccessToken);
        setRefreshTokenState(savedRefreshToken);
        setUserState(JSON.parse(savedUser));
      } else {
        console.log("⚠️ No stored session found");
      }
    } catch (e) {
      console.error("Failed to restore tokens:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (user: User | null) => {
    console.log("💾 Setting user:", user?.username);
    setUserState(user);
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("user");
    }
  };

  const setTokens = async (access: string, refresh: string) => {
    console.log("💾 Setting tokens (access and refresh)");
    
    const cleanAccess = access.trim(); 
    const cleanRefresh = refresh.trim();
    // ✅ UPDATE STATE IMMEDIATELY
    setAccessTokenState(access);
    setRefreshTokenState(refresh);
    
    // ✅ THEN save to storage
    await AsyncStorage.setItem("accessToken", access);
    await AsyncStorage.setItem("refreshToken", refresh);
    
    console.log("✅ Tokens updated in state and sanityzed");
  };

  const logout = async () => {
    console.log("🚪 Logging out user");
    setUserState(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("user");
    console.log("✅ Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        setUser,
        setTokens,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}