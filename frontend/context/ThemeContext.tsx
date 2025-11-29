import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // usa o tema do sistema como valor inicial
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<Theme>(colorScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setTheme(colorScheme === "dark" ? "dark" : "light");
      }
    });

    return () => sub.remove();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
};