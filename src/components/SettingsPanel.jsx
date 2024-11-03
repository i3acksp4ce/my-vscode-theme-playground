import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Eye,
  Palette,
  Layout,
  Code,
  RefreshCw,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const SettingsPanel = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [selectedTab, setSelectedTab] = React.useState("appearance");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "editor", label: "Editor", icon: Code },
    { id: "layout", label: "Layout", icon: Layout },
  ];

  const handleThemeModeChange = (mode) => {
    updateSettings("appearance", { theme: mode });
    toast.success(`Theme mode changed to ${mode}`);
  };

  const handleFontSizeChange = (e) => {
    updateSettings("appearance", { fontSize: Number(e.target.value) });
  };

  const handlePreviewHeightChange = (e) => {
    updateSettings("appearance", { previewHeight: Number(e.target.value) });
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-0 h-full w-[300px] bg-card border-l border-border shadow-lg"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Settings</h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="p-2 hover:bg-accent rounded-md"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-md"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                    selectedTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {selectedTab === "appearance" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Theme Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["light", "dark", "system"].map((mode) => (
                        <motion.button
                          key={mode}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleThemeModeChange(mode)}
                          className={cn(
                            "p-2 flex flex-col items-center gap-2 rounded-md text-xs transition-colors",
                            settings.appearance.theme === mode
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          )}
                        >
                          {mode === "light" && <Sun className="w-4 h-4" />}
                          {mode === "dark" && <Moon className="w-4 h-4" />}
                          {mode === "system" && <Monitor className="w-4 h-4" />}
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Font Size ({settings.appearance.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={settings.appearance.fontSize}
                      onChange={handleFontSizeChange}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Preview Height
                    </label>
                    <select
                      value={settings.appearance.previewHeight}
                      onChange={handlePreviewHeightChange}
                      className="w-full bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm"
                    >
                      {[300, 400, 500, 600].map((height) => (
                        <option key={height} value={height}>
                          {height}px
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {selectedTab === "editor" && (
                <div className="space-y-4">
                  {Object.entries(settings.editor).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSettings("editor", { [key]: e.target.checked })
                        }
                        className="rounded border-primary text-primary focus:ring-primary"
                      />
                      <span className="text-sm">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {selectedTab === "layout" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Preview Layout
                    </label>
                    <select
                      value={settings.layout.previewLayout}
                      onChange={(e) =>
                        updateSettings("layout", {
                          previewLayout: e.target.value,
                        })
                      }
                      className="w-full bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm"
                    >
                      <option value="side-by-side">Side by Side</option>
                      <option value="stacked">Stacked</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
