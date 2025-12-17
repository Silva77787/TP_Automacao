import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "./ThemeContext";

type ToastType = "success" | "error" | "info";

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextValue {
  showToast: (opts: {
    type?: ToastType;
    title: string;
    message: string;
  }) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();

  let toastWidth = width * 0.9;
  let toastPadding = 10;
  if (width >= 600 && width < 1024) {
    toastWidth = 500;
    toastPadding = 12;
  } else if (width >= 1024) {
    toastWidth = 380;
    toastPadding = 14;
  }

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const anim = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearHideTimer();

    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [anim, clearHideTimer]);

  const showToast = useCallback(
    ({
      type = "info",
      title,
      message,
    }: {
      type?: ToastType;
      title: string;
      message: string;
    }) => {
      clearHideTimer();

      setToast({ visible: true, type, title, message });

      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      hideTimerRef.current = setTimeout(() => {
        hideToast();
      }, 3500);
    },
    [anim, hideToast, clearHideTimer]
  );

  useEffect(() => {
    return () => clearHideTimer(); // cleanup ao desmontar provider
  }, [clearHideTimer]);

  const backgroundBase = isDark ? "#151718" : "#F9FAFB";
  const borderBase = isDark ? "#374151" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";

  let accent = "#3B82F6";
  if (toast.type === "success") accent = "#10B981";
  if (toast.type === "error") accent = "#EF4444";

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Mantém sempre montado; só muda interação/visibilidade */}
      <Animated.View
        pointerEvents={toast.visible ? "auto" : "none"}
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity: anim,
          },
        ]}
      >
        <View
          style={[
            styles.toast,
            {
              backgroundColor: backgroundBase,
              borderColor: borderBase,
              minWidth: toastWidth,
              maxWidth: toastWidth,
              paddingVertical: toastPadding,
              paddingHorizontal: toastPadding,
            },
          ]}
        >
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <View style={styles.iconContainer}>
            <Ionicons
              name={
                toast.type === "success"
                  ? "checkmark-circle"
                  : toast.type === "error"
                  ? "alert-circle"
                  : "information-circle"
              }
              size={22}
              color={accent}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textMain }]} numberOfLines={1}>
              {toast.title}
            </Text>
            <Text
              style={[styles.message, { color: textMuted }]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          </View>

          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <Ionicons name="close" size={18} color={textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  accentBar: { width: 3, alignSelf: "stretch", borderRadius: 999 },
  iconContainer: { paddingHorizontal: 8 },
  textContainer: { flex: 1, paddingRight: 8 },
  title: { fontSize: 13, fontWeight: "600" },
  message: { fontSize: 11, marginTop: 2 },
  closeButton: { paddingHorizontal: 4, paddingVertical: 2 },
});
