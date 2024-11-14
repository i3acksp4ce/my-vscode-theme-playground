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

  async updateBrightness(value) {
    themeStore.isLoading = true;
    try {
      themeStore.brightness = value;
      if (value === 0) {
        themeStore.theme = deepClone(themeStore.originalTheme);
      } else {
        themeStore.theme = adjustBrightnessForTheme(
          deepClone(themeStore.originalTheme),
          value
        );
      }
      await highlighterStore.resetHighlighters();
    } finally {
      themeStore.isLoading = false;
    }
  },

  async updateLuminance(value) {
    themeStore.isLoading = true;
    try {
      themeStore.luminance = value;
      if (value === 0) {
        themeStore.theme = deepClone(themeStore.originalTheme);
      } else {
        themeStore.theme = adjustLuminanceForTheme(
          deepClone(themeStore.originalTheme),
          value
        );
      }
      await highlighterStore.resetHighlighters();
    } finally {
      themeStore.isLoading = false;
    }
  },

  async updateContrast(value) {
    themeStore.isLoading = true;
    try {
      themeStore.contrast = value;
      if (value === 0) {
        themeStore.theme = deepClone(themeStore.originalTheme);
      } else {
        themeStore.theme = adjustContrastForTheme(
          deepClone(themeStore.originalTheme),
          value
        );
      }
      await highlighterStore.resetHighlighters();
    } finally {
      themeStore.isLoading = false;
    }
  },

  async handleWCAG(level) {
    themeStore.isLoading = true;
    try {
      themeStore.theme = improveWCAG(themeStore.theme, level);
      await highlighterStore.resetHighlighters();
    } catch (error) {
      console.error("WCAG adjustment error:", error);
    } finally {
      themeStore.isLoading = false;
    }
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

  async handleCopy() {
    themeStore.isLoading = true;
    try {
      const themeToExport = {
        semanticTokenColors: themeStore.theme.semanticTokenColors,
        tokenColors: themeStore.theme.tokenColors,
      };
      await navigator.clipboard.writeText(
        JSON.stringify(themeToExport, null, 2)
      );
    } catch (error) {
      console.error("Theme copy error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  },

  async handleThemeChange(themeId) {
    themeStore.isLoading = true;
    try {
      const newTheme = themeStore.availableThemes[themeId]?.theme;
      if (!newTheme) {
        throw new Error("Theme not found");
      }

      themeStore.selectedTheme = themeId;
      themeStore.theme = newTheme;
      themeStore.originalTheme = newTheme;
      themeStore.brightness = 0;
      themeStore.luminance = 0;
      themeStore.contrast = 0;

      await highlighterStore.resetHighlighters();
    } catch (error) {
      console.error("Theme change error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  },

  async addCustomTheme(themeData, fileName) {
    themeStore.isLoading = true;
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
      await themeStore.handleThemeChange(themeId);
      return themeId;
    } catch (error) {
      console.error("Custom theme error:", error);
      throw error;
    } finally {
      themeStore.isLoading = false;
    }
  },

  async removeCustomTheme(themeId) {
    if (!themeId.startsWith("custom-")) return;

    themeStore.isLoading = true;
    try {
      delete themeStore.customThemes[themeId];
      themeStore.updateAvailableThemes();
      if (themeStore.selectedTheme === themeId) {
        await themeStore.handleThemeChange("default");
      }
    } catch (error) {
      console.error("Remove theme error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  },

  async updateEditorBackground(color) {
    themeStore.isLoading = true;
    try {
      themeStore.theme = {
        ...themeStore.theme,
        colors: {
          ...themeStore.theme.colors,
          "editor.background": color,
        },
      };
      await highlighterStore.resetHighlighters();
    } catch (error) {
      console.error("Background update error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  },

  updateAvailableThemes() {
    themeStore.availableThemes = {
      ...themes,
      ...themeStore.customThemes,
    };
  },

  isCustomTheme(id) {
    return id.startsWith("custom-");
  },
});
