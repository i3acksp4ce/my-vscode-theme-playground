import React, { useState, useEffect, useMemo } from "react";
import { createHighlighter } from "shiki";
import { themes } from "./themes";
import { SAMPLE_CODES } from "./data/sampleCodes";
import { convertThemeToShikiFormat } from "./utils/themeUtils";
import ThemeControls from "./components/ThemeControls";
import CodePreview from "./components/CodePreview";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

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

function CodePreviews({ highlighter, defaultHighlighter }) {
  const { theme, selectedTheme } = useTheme();
  const themeObject = useMemo(() => convertThemeToShikiFormat(theme), [theme]);

  return useMemo(
    () => (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(1000px,1fr))] gap-6">
        {Object.entries(SAMPLE_CODES).map(([lang, code]) => (
          <div key={lang}>
            <CodePreview
              code={code}
              lang={lang}
              highlighter={highlighter}
              defaultHighlighter={defaultHighlighter}
              themeName="custom-theme"
              defaultThemeName="default-theme"
            />
          </div>
        ))}
      </div>
    ),
    [highlighter, defaultHighlighter, themeObject]
  );
}

function AppContent() {
  const { theme, selectedTheme, setIsLoading } = useTheme();
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
        const defaultTheme = {
          ...convertThemeToShikiFormat(themes[selectedTheme].theme),
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
  }, [theme, selectedTheme, setIsLoading]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 pt-28 flex items-center justify-center">
        <div className="bg-red-900/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">
            Error Initializing Highlighter
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" bg-gray-900 text-white h-auto">
        <div className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between"></div>
            <h1 className="text-2xl font-bold">VSCode Theme Playground</h1>
            <ThemeControls />
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6 pt-28">
        <CodePreviews
          highlighter={highlighter}
          defaultHighlighter={defaultHighlighter}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
