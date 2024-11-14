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
      // Always create new instance for theme changes
      const newHighlighter = await createHighlighter({
        themes: [theme],
        langs: supportedLanguages,
      });

      // Dispose old instance before assigning new one
      if (isDefault && defaultHighlighterInstance) {
        defaultHighlighterInstance.dispose?.();
      } else if (!isDefault && highlighterInstance) {
        highlighterInstance.dispose?.();
      }

      // Assign new instance
      if (isDefault) {
        defaultHighlighterInstance = newHighlighter;
      } else {
        highlighterInstance = newHighlighter;
      }

      return newHighlighter;
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

      const [hl, defaultHl] = await Promise.all([
        this.getHighlighter(modifiedTheme),
        this.getHighlighter(defaultTheme, true),
      ]);

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
    // Only dispose if we're switching themes completely
    await this.initializeHighlighters();
  },

  dispose() {
    if (highlighterInstance) {
      highlighterInstance.dispose?.();
      highlighterInstance = null;
    }
    if (defaultHighlighterInstance) {
      defaultHighlighterInstance.dispose?.();
      defaultHighlighterInstance = null;
    }
    this.highlighter = null;
    this.defaultHighlighter = null;
  },
});
