import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
// Remove toast import
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
  const [customThemes, setCustomThemes] = useState({});

  // Move allThemes definition before handleThemeChange
  const allThemes = useMemo(
    () => ({
      ...themes,
      ...customThemes,
    }),
    [customThemes]
  );

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
    const currentTheme = allThemes[selectedTheme]?.theme;
    if (currentTheme) {
      setTheme(currentTheme);
      setOriginalTheme(currentTheme);
      setBrightness(0);
      setLuminance(0);
      setContrast(0);
    }
  }, [selectedTheme, allThemes]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
  }, [theme]);

  const handleThemeChange = useCallback(
    (themeId) => {
      setIsLoading(true);
      const newTheme = allThemes[themeId]?.theme;

      if (!newTheme) {
        console.error("Theme not found");
        setIsLoading(false);
        return;
      }

      setSelectedTheme(themeId);
      setTheme(newTheme);
      setOriginalTheme(newTheme);
      setBrightness(0);
      setLuminance(0);
      setContrast(0);
      setIsLoading(false);
    },
    [allThemes]
  );

  const addCustomTheme = useCallback(
    (themeData, fileName) => {
      try {
        // Only require tokenColors for syntax highlighting
        if (!themeData.tokenColors) {
          throw new Error(
            "Invalid theme structure: missing tokenColors property"
          );
        }

        // Ensure theme has a name
        const themeName = themeData.name || fileName;

        // Create a new theme object with workbench colors from the current theme
        const newThemeData = {
          ...themeData,
          name: themeName,
          colors: themeData.colors || theme.colors, // Use existing colors if none provided
        };

        const themeId = `custom-${Date.now()}`;
        const newTheme = {
          id: themeId,
          name: fileName,
          theme: newThemeData,
        };

        setCustomThemes((prev) => ({
          ...prev,
          [themeId]: newTheme,
        }));

        // Auto-select the new theme
        handleThemeChange(themeId);
        return themeId;
      } catch (error) {
        console.error(`Failed to add theme: ${error.message}`);
        throw error;
      }
    },
    [theme.colors, handleThemeChange]
  );

  const removeCustomTheme = useCallback(
    (themeId) => {
      if (!themeId.startsWith("custom-")) return;

      setCustomThemes((prev) => {
        const newThemes = { ...prev };
        delete newThemes[themeId];
        return newThemes;
      });

      if (selectedTheme === themeId) {
        handleThemeChange("default");
      }
    },
    [selectedTheme, handleThemeChange]
  );

  const handleEditorBackgroundChange = useCallback((color) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      colors: {
        ...prevTheme.colors,
        "editor.background": color,
      },
    }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme, // Add setTheme to the context
        brightness,
        luminance,
        contrast,
        selectedTheme,
        availableThemes: allThemes,
        handleThemeChange,
        handleBrightnessChange,
        handleLuminanceChange,
        handleContrastChange,
        handleWCAG,
        handleReset,
        handleCopy,
        addCustomTheme,
        removeCustomTheme,
        isCustomTheme: (id) => id.startsWith("custom-"),
        isLoading,
        setIsLoading,
        handleEditorBackgroundChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
