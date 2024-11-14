import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import CodePreview from "./components/CodePreview";
import ThemeControls from "./components/ThemeControls";
import { SAMPLE_CODES } from "./data/sampleCodes";
import { themeStore } from "./stores/themeStore";
import { highlighterStore } from "./stores/highlighterStore";

function Sidebar() {
  return <ThemeControls />;
}

function CodePreviews() {
  const { highlighter, defaultHighlighter } = useSnapshot(highlighterStore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col gap-6 max-w-[1200px] mx-auto"
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

function App() {
  const store = useSnapshot(themeStore);
  const { error } = useSnapshot(highlighterStore);

  useEffect(() => {
    highlighterStore.initializeHighlighters();
    return () => highlighterStore.dispose();
  }, [store.theme, store.selectedTheme]);

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
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-[360px]">
        <div className="p-6 max-w-full">
          <CodePreviews />
        </div>
      </main>
    </div>
  );
}

export default App;
