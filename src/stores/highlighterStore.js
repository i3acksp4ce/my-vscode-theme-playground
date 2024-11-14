import { proxy } from "valtio";
import { createHighlighter } from "shiki";
import { themeStore } from "./themeStore";
import { convertThemeToShikiFormat } from "../utils/themeUtils";

let highlighterInstance = null;
let defaultHighlighterInstance = null;

const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "css",
  "jsx",
  "tsx",
  "php",
  "json",
  "vue",
];

export const highlighterStore = proxy({
  highlighter: null,
  defaultHighlighter: null,
  error: null,
  isLoading: false,

  async getHighlighter(theme, isDefault = false) {
    try {
      if (isDefault) {
        defaultHighlighterInstance = await createHighlighter({
          themes: [theme],
          langs: supportedLanguages,
        });
        return defaultHighlighterInstance;
      } else {
        highlighterInstance = await createHighlighter({
          themes: [theme],
          langs: supportedLanguages,
        });
        return highlighterInstance;
      }
    } catch (error) {
      console.error("Error creating/updating highlighter:", error);
      throw error;
    }
  },

  async initializeHighlighters() {
    try {
      this.isLoading = true;
      this.error = null;

      const modifiedTheme = {
        ...convertThemeToShikiFormat(themeStore.theme),
        name: "custom-theme",
      };

      const defaultTheme = {
        ...convertThemeToShikiFormat(
          themeStore.availableThemes[themeStore.selectedTheme].theme
        ),
        name: "default-theme",
      };

      const hl = await this.getHighlighter(modifiedTheme);
      const defaultHl = await this.getHighlighter(defaultTheme, true);

      this.highlighter = hl;
      this.defaultHighlighter = defaultHl;
    } catch (err) {
      console.error("Highlighter initialization error:", err);
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  },

  async resetHighlighters() {
    // First dispose existing highlighters
    this.dispose();

    // Reset the instances
    highlighterInstance = null;
    defaultHighlighterInstance = null;

    // Reinitialize with fresh instances
    await this.initializeHighlighters();
  },

  dispose() {
    if (highlighterInstance) {
      highlighterInstance = null;
    }
    if (defaultHighlighterInstance) {
      defaultHighlighterInstance = null;
    }
    this.highlighter = null;
    this.defaultHighlighter = null;
  },
});
