import React, { createContext, useContext, useState, useEffect } from "react";

const defaultSettings = {
  appearance: {
    theme: "system", // "light", "dark", or "system"
    fontSize: 14,
    previewHeight: 400,
  },
  layout: {
    previewLayout: "side-by-side",
  },
  shortcuts: {
    toggleSettings: "K",
  },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateSettings = (category, updates) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  useEffect(() => {
    const applyTheme = (mode) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(mode);
    };

    const handleSystemThemeChange = (e) => {
      if (settings.appearance.theme === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    if (settings.appearance.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(isDark ? "dark" : "light");
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handleSystemThemeChange);
    } else {
      applyTheme(settings.appearance.theme);
    }

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleSystemThemeChange);
    };
  }, [settings.appearance.theme]);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        e.key.toUpperCase() === settings.shortcuts.toggleSettings
      ) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.shortcuts.toggleSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
