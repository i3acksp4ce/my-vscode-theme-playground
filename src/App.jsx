import React, { useState, useEffect, useMemo } from "react";
import { createHighlighter } from "shiki";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Settings2, Copy, RefreshCw } from "lucide-react";
import { themes } from "./themes";
import { SAMPLE_CODES } from "./data/sampleCodes";
import { convertThemeToShikiFormat } from "./utils/themeUtils";
import ThemeControls from "./components/ThemeControls";
import CodePreview from "./components/CodePreview";
import ColorPreview from "./components/ColorPreview"; // Add this line
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { cn } from "./lib/utils";
import SettingsPanel from "./components/SettingsPanel";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { Toaster } from "sonner";

// Create singleton highlighter instances
let highlighterInstance = null;
let defaultHighlighterInstance = null;

async function getHighlighter(theme, isDefault = false) {
  try {
    if (isDefault) {
      if (!defaultHighlighterInstance) {
        defaultHighlighterInstance = await createHighlighter({
          themes: [theme],
          langs: [
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
          ],
        });
      } else {
        await defaultHighlighterInstance.loadTheme(theme);
        defaultHighlighterInstance.setTheme(theme.name);
      }
      return defaultHighlighterInstance;
    } else {
      if (!highlighterInstance) {
        highlighterInstance = await createHighlighter({
          themes: [theme],
          langs: [
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
          ],
        });
      } else {
        await highlighterInstance.loadTheme(theme);
        highlighterInstance.setTheme(theme.name);
      }
      return highlighterInstance;
    }
  } catch (error) {
    console.error("Error creating/updating highlighter:", error);
    throw error;
  }
}

const defaultTheme = themes.default.theme;

// Add this utility function
const getThemeColors = (theme) => {
  if (!theme) return {};

  const colors = {
    workbench: {},
    semantic: {},
    tokens: {},
  };

  // Extract workbench colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      colors.workbench[key] = value;
    });
  }

  // Extract semantic token colors
  if (theme.semanticTokenColors) {
    Object.entries(theme.semanticTokenColors).forEach(([key, value]) => {
      const colorValue =
        typeof value === "object" ? value.foreground || value.color : value;
      if (colorValue) {
        colors.semantic[key] = colorValue;
      }
    });
  }

  // Extract token colors
  if (theme.tokenColors) {
    theme.tokenColors.forEach((token) => {
      if (token.settings?.foreground) {
        const scope = Array.isArray(token.scope)
          ? token.scope.join(", ")
          : token.scope || "default";
        colors.tokens[`${scope}`] = token.settings.foreground;
      }
    });
  }

  return colors;
};

function Navbar() {
  const { isSettingsOpen, setIsSettingsOpen, settings } = useSettings();
  const shortcutKey = settings?.shortcuts?.toggleSettings || "K";

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-[97]"
      >
        <div className="px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.h1
                className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                VSCode Theme Playground
              </motion.h1>
            </div>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-accent"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-accent group relative"
              >
                <Settings2 className="w-5 h-5" />
                <span className="absolute hidden group-hover:block right-0 top-full mt-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                  Settings (Ctrl+{shortcutKey})
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

function CodePreviews({ highlighter, defaultHighlighter }) {
  const { theme, selectedTheme } = useTheme();
  const themeObject = useMemo(() => convertThemeToShikiFormat(theme), [theme]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 2xl:grid-cols-2 gap-6 p-4" // Removed ml-[360px]
    >
      {Object.entries(SAMPLE_CODES).map(([lang, code], index) => (
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CodePreview
            code={code}
            lang={lang}
            highlighter={highlighter}
            defaultHighlighter={defaultHighlighter}
            themeName="custom-theme"
            defaultThemeName="default-theme"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function AppContent() {
  const { theme, selectedTheme, setIsLoading, availableThemes } = useTheme();
  const [highlighter, setHighlighter] = useState(null);
  const [defaultHighlighter, setDefaultHighlighter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initHighlighters() {
      try {
        setIsLoading(true);
        const modifiedTheme = {
          ...convertThemeToShikiFormat(theme),
          name: "custom-theme",
        };

        // Get the default theme from availableThemes instead of themes
        const defaultTheme = {
          ...convertThemeToShikiFormat(availableThemes[selectedTheme].theme),
          name: "default-theme",
        };

        const hl = await getHighlighter(modifiedTheme);
        const defaultHl = await getHighlighter(defaultTheme, true);

        setHighlighter(hl);
        setDefaultHighlighter(defaultHl);
        setError(null);
      } catch (err) {
        console.error("Highlighter initialization error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    initHighlighters();

    // Cleanup function
    return () => {
      if (highlighterInstance) {
        highlighterInstance.dispose();
        highlighterInstance = null;
      }
      if (defaultHighlighterInstance) {
        defaultHighlighterInstance.dispose();
        defaultHighlighterInstance = null;
      }
    };
  }, [theme, selectedTheme, setIsLoading, availableThemes]); // Add availableThemes to dependencies

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div className="bg-destructive/20 border border-destructive p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2 text-destructive">
            Error Initializing Highlighter
          </h2>
          <p className="text-destructive-foreground">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <ThemeControls />
        <div className="pl-[360px]">
          {" "}
          {/* Add left padding for sidebar */}
          <ColorPreview
            defaultTheme={getThemeColors(availableThemes[selectedTheme]?.theme)}
            modifiedTheme={getThemeColors(theme)}
          />
          <CodePreviews
            highlighter={highlighter}
            defaultHighlighter={defaultHighlighter}
          />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider defaultTheme={defaultTheme}>
        <AppContent />
        <Toaster position="top-right" />
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
