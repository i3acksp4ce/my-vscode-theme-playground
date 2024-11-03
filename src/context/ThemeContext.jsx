import React, { createContext, useContext, useState, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import {
  adjustBrightnessForTheme,
  adjustLuminanceForTheme,
  adjustContrastForTheme,
  improveWCAG,
} from "../utils/themeUtils";
import { themes } from "../themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children, defaultTheme }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [brightness, setBrightness] = useState(0);
  const [luminance, setLuminance] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [originalTheme, setOriginalTheme] = useState(defaultTheme);

  const updateBrightness = useCallback(
    (value) => {
      setBrightness(value);
      if (value === 0) {
        setTheme(JSON.parse(JSON.stringify(originalTheme)));
        return;
      }
      // Always adjust from original theme to prevent compounding effects
      const newTheme = adjustBrightnessForTheme(originalTheme, value);
      setTheme(newTheme);
    },
    [originalTheme]
  );

  const updateLuminance = useCallback(
    (value) => {
      setLuminance(value);
      if (value === 0) {
        setTheme(JSON.parse(JSON.stringify(originalTheme)));
        return;
      }
      // Always adjust from original theme to prevent compounding effects
      const newTheme = adjustLuminanceForTheme(originalTheme, value);
      setTheme(newTheme);
    },
    [originalTheme]
  );

  const updateContrast = useCallback(
    (value) => {
      setContrast(value);
      if (value === 0) {
        setTheme(JSON.parse(JSON.stringify(originalTheme)));
        return;
      }
      // Always adjust from original theme to prevent compounding effects
      const newTheme = adjustContrastForTheme(originalTheme, value);
      setTheme(newTheme);
    },
    [originalTheme]
  );

  const handleBrightnessChange = useDebounce(updateBrightness, 100);
  const handleLuminanceChange = useDebounce(updateLuminance, 100);
  const handleContrastChange = useDebounce(updateContrast, 100);

  const handleWCAG = useCallback(
    (level) => {
      const newTheme = improveWCAG(theme, level);
      setTheme(newTheme);
    },
    [theme]
  );

  const handleReset = useCallback(() => {
    setTheme(defaultTheme);
    setBrightness(0);
    setLuminance(0);
    setContrast(0);
  }, [defaultTheme]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
  }, [theme]);

  const handleThemeChange = useCallback((themeId) => {
    setIsLoading(true);
    const newTheme = themes[themeId].theme;
    setSelectedTheme(themeId);
    setTheme(newTheme);
    setOriginalTheme(newTheme);
    setBrightness(0);
    setLuminance(0);
    setContrast(0);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        brightness,
        luminance,
        contrast,
        selectedTheme,
        availableThemes: themes,
        handleThemeChange,
        handleBrightnessChange,
        handleLuminanceChange,
        handleContrastChange,
        handleWCAG,
        handleReset,
        handleCopy,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
