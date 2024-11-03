import React, { createContext, useContext, useState, useEffect } from "react";

const defaultSettings = {
  appearance: {
    theme: "system",
    fontSize: 14,
    previewHeight: 400,
  },
  editor: {
    lineNumbers: true,
    wordWrap: true,
    minimap: false,
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
  const [settings, setSettings] = useState(defaultSettings);
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

  React.useEffect(() => {
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
