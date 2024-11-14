import { proxy } from "valtio";
import { deepClone } from "valtio/utils";
import { themes } from "../themes";
import {
  adjustBrightnessForTheme,
  adjustLuminanceForTheme,
  adjustContrastForTheme,
  improveWCAG,
} from "../utils/themeUtils";
import { highlighterStore } from "./highlighterStore"; // Add this import at the top

export const themeStore = proxy({
  theme: themes.default.theme,
  selectedTheme: "default",
  brightness: 0,
  luminance: 0,
  contrast: 0,
  isLoading: false,
  originalTheme: themes.default.theme,
  customThemes: {},
  availableThemes: {
    ...themes,
  },

  updateBrightness(value) {
    themeStore.brightness = value;
    if (value === 0) {
      themeStore.theme = deepClone(themeStore.originalTheme);
      return;
    }
    themeStore.theme = adjustBrightnessForTheme(
      themeStore.originalTheme,
      value
    );
  },

  updateLuminance(value) {
    themeStore.luminance = value;
    if (value === 0) {
      themeStore.theme = deepClone(themeStore.originalTheme);
      return;
    }
    themeStore.theme = adjustLuminanceForTheme(themeStore.originalTheme, value);
  },

  updateContrast(value) {
    themeStore.contrast = value;
    if (value === 0) {
      // Use deepClone for complete isolation
      themeStore.theme = deepClone(themeStore.originalTheme);
      return;
    }
    // Create new theme instance for contrast adjustment
    themeStore.theme = adjustContrastForTheme(
      deepClone(themeStore.originalTheme),
      value
    );
  },

  handleWCAG(level) {
    themeStore.theme = improveWCAG(themeStore.theme, level);
  },

  async handleReset() {
    // Clear any cached state
    themeStore.isLoading = true;

    // Get fresh copy of theme from source
    let currentTheme = null;
    const selectedThemeId = themeStore.selectedTheme;

    // Create completely new theme instance
    if (themes[selectedThemeId]) {
      // For built-in themes
      currentTheme = deepClone(themes[selectedThemeId].theme);
    } else if (themeStore.customThemes[selectedThemeId]) {
      // For custom themes
      currentTheme = deepClone(themeStore.customThemes[selectedThemeId].theme);
    } else {
      // Fallback to default
      currentTheme = deepClone(themes.default.theme);
    }

    // Reset all state with new references
    themeStore.theme = currentTheme;
    themeStore.originalTheme = deepClone(currentTheme);

    // Reset all adjustments
    themeStore.brightness = 0;
    themeStore.luminance = 0;
    themeStore.contrast = 0;

    // Force theme update
    themeStore.updateAvailableThemes();

    // Reset highlighters to ensure clean state
    await highlighterStore.resetHighlighters();

    themeStore.isLoading = false;
  },

  handleCopy() {
    const themeToExport = {
      semanticTokenColors: themeStore.theme.semanticTokenColors,
      tokenColors: themeStore.theme.tokenColors,
    };
    navigator.clipboard.writeText(JSON.stringify(themeToExport, null, 2));
  },

  handleThemeChange(themeId) {
    themeStore.isLoading = true;
    const newTheme = themeStore.availableThemes[themeId]?.theme;

    if (!newTheme) {
      console.error("Theme not found");
      themeStore.isLoading = false;
      return;
    }

    themeStore.selectedTheme = themeId;
    themeStore.theme = newTheme;
    themeStore.originalTheme = newTheme;
    themeStore.brightness = 0;
    themeStore.luminance = 0;
    themeStore.contrast = 0;
    themeStore.isLoading = false;
  },

  addCustomTheme(themeData, fileName) {
    try {
      if (!themeData.tokenColors) {
        throw new Error(
          "Invalid theme structure: missing tokenColors property"
        );
      }

      const themeName = themeData.name || fileName;
      const newThemeData = {
        ...themeData,
        name: themeName,
        colors: themeData.colors || themeStore.theme.colors,
      };

      const themeId = `custom-${Date.now()}`;
      const newTheme = {
        id: themeId,
        name: fileName,
        theme: newThemeData,
      };

      themeStore.customThemes[themeId] = newTheme;
      themeStore.updateAvailableThemes();
      themeStore.handleThemeChange(themeId);
      return themeId;
    } catch (error) {
      console.error(`Failed to add theme: ${error.message}`);
      throw error;
    }
  },

  removeCustomTheme(themeId) {
    if (!themeId.startsWith("custom-")) return;

    delete themeStore.customThemes[themeId];
    themeStore.updateAvailableThemes();
    if (themeStore.selectedTheme === themeId) {
      themeStore.handleThemeChange("default");
    }
  },

  updateAvailableThemes() {
    themeStore.availableThemes = {
      ...themes,
      ...themeStore.customThemes,
    };
  },

  updateEditorBackground(color) {
    themeStore.theme = {
      ...themeStore.theme,
      colors: {
        ...themeStore.theme.colors,
        "editor.background": color,
      },
    };
  },

  isCustomTheme(id) {
    return id.startsWith("custom-");
  },
});
