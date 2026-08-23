"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type Theme = "light" | "dark" | "system";

export type ColorMode =
  | "Amber"
  | "Blue"
  | "Pink"
  | "Rose"
  | "Emerald"
  | "Black";

type ThemeContextType = {
  theme: Theme;
  colorMode: ColorMode;
  setTheme: (theme: Theme) => void;
  setColorMode: (colorMode: ColorMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

const colorModes: Record<ColorMode, string> = {
  Amber: "#D97706",
  Blue: "#9333EA",
  Pink: "#DB2777",
  Rose: "#E11D48",
  Emerald: "#059669",
  Black: "#171717",
};

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [colorMode, setColorModeState] =
    useState<ColorMode>("Blue");

  const applyTheme = useCallback(
    (selectedTheme: Theme, selectedColor: ColorMode) => {
      const root = document.documentElement;

      let resolvedTheme = selectedTheme;

      if (selectedTheme === "system") {
        resolvedTheme = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches
          ? "dark"
          : "light";
      }

      root.setAttribute("data-theme", resolvedTheme);
      root.style.setProperty(
        "--accent-color",
        colorModes[selectedColor],
      );
    },
    [],
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "theme",
    ) as Theme | null;

    const savedColor = localStorage.getItem(
      "colorMode",
    ) as ColorMode | null;

    const initialTheme = savedTheme || "light";
    const initialColor = savedColor || "Blue";

    setThemeState(initialTheme);
    setColorModeState(initialColor);

    applyTheme(initialTheme, initialColor);
  }, [applyTheme]);

  const setTheme = (value: Theme) => {
    setThemeState(value);
    localStorage.setItem("theme", value);
    applyTheme(value, colorMode);
  };

  const setColorMode = (value: ColorMode) => {
    setColorModeState(value);
    localStorage.setItem("colorMode", value);
    applyTheme(theme, value);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        setTheme,
        setColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}