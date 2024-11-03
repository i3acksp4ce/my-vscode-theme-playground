import React, { useState, useEffect, useMemo } from "react";
import { createHighlighter } from "shiki";
import { themes } from "./themes";
import { SAMPLE_CODES } from "./data/sampleCodes";
import { convertThemeToShikiFormat } from "./utils/themeUtils";
import ThemeControls from "./components/ThemeControls";
import CodePreview from "./components/CodePreview";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Remove manual theme merging
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
  const { theme, selectedTheme } = useTheme();
  const [highlighter, setHighlighter] = useState(null);
  const [defaultHighlighter, setDefaultHighlighter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initHighlighters() {
      try {
        // Modified theme
        const modifiedTheme = {
          ...convertThemeToShikiFormat(theme),
          name: "custom-theme",
        };

        // Default theme for the current selection
        const defaultTheme = {
          ...convertThemeToShikiFormat(themes[selectedTheme].theme),
          name: "default-theme",
        };

        // Initialize modified highlighter
        const hl = await createHighlighter({
          themes: [modifiedTheme],
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
        await hl.loadTheme(modifiedTheme);
        setHighlighter(hl);

        // Initialize/Update default highlighter
        const defaultHl = await createHighlighter({
          themes: [defaultTheme],
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
        await defaultHl.loadTheme(defaultTheme);
        setDefaultHighlighter(defaultHl);

        setError(null);
      } catch (err) {
        console.error("Highlighter initialization error:", err);
        setError(err.message);
      }
    }
    initHighlighters();
  }, [theme, selectedTheme]); // Add selectedTheme to dependencies

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
