import { motion } from "framer-motion";
import { Copy, RefreshCw, Trash2, Zap } from "lucide-react";
import React, { memo, useCallback, useState } from "react";
import { useSidebar } from "../context/SidebarContext"; // Import the sidebar context hook
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";
import { boostThemeContrast } from "../utils/themeUtils";
import { Button } from "./theme-control/button";
import { ColorInput } from "./theme-control/color-input";
import { DropZone } from "./theme-control/drop-zone";
import { Tooltip } from "./theme-control/tooltip";
import { ValueAdjuster } from "./theme-control/value-adjuster";

const ThemeControls = memo(function ThemeControls() {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const {
    theme,
    brightness,
    luminance,
    contrast,
    selectedTheme,
    availableThemes,
    handleThemeChange,
    handleBrightnessChange,
    handleLuminanceChange,
    handleContrastChange,
    handleWCAG,
    handleReset,
    handleCopy,
    isLoading,
    addCustomTheme,
    removeCustomTheme,
    isCustomTheme,
    setTheme,
  } = useTheme();

  const handleFileDrop = async (file) => {
    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      await addCustomTheme(themeData, file.name.replace(/\.json$/, ""));
    } catch (error) {
      console.error(`Error loading theme: ${error.message}`);
    }
  };

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
        // Handle both string and object values
        const colorValue =
          typeof value === "object" ? value.foreground || value.color : value;
        if (colorValue) {
          colors.semantic[key] = colorValue;
        }
      });
    }

    // Extract token colors
    if (theme.tokenColors) {
      theme.tokenColors.forEach((token, index) => {
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

  const handleBoostContrast = useCallback(() => {
    const boostedTheme = boostThemeContrast(theme);
    setTheme(boostedTheme);
  }, [theme, setTheme]);

  // Inside ThemeControls component, add this new state and function
  const [editorBackground, setEditorBackground] = useState(
    theme.colors?.["editor.background"] || "#0d1117"
  );

  const handleBackgroundChange = useCallback(
    (color) => {
      const updatedTheme = {
        ...theme,
        colors: {
          ...theme.colors,
          "editor.background": color,
        },
      };
      setTheme(updatedTheme);
      setEditorBackground(color);
    },
    [theme, setTheme]
  );

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? (isMobileOpen ? "100%" : "60px") : "360px",
          x: isCollapsed && !isMobileOpen ? "-300px" : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500, // Increased from 300
          damping: 40, // Increased from 30
          mass: 0.8, // Added for snappier animation
        }}
        className="fixed left-0 top-16 bottom-0 z-[60] bg-card border-r border-border shadow-lg will-change-transform" // Added will-change-transform
      >
        <div className="h-full flex flex-col relative">
          <div className="p-4 border-b border-border">
            <h3
              className={cn(
                "text-lg font-semibold transition-opacity duration-200",
                isCollapsed && !isMobileOpen && "opacity-0"
              )}
            >
              Theme Settings
            </h3>
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Active Theme
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTheme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="w-full bg-card text-foreground px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <optgroup label="Built-in Themes">
                        {Object.entries(availableThemes)
                          .filter(([id]) => !isCustomTheme(id))
                          .map(([id, { name }]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                      </optgroup>
                      {Object.keys(availableThemes).some((id) =>
                        isCustomTheme(id)
                      ) && (
                        <optgroup label="Custom Themes">
                          {Object.entries(availableThemes)
                            .filter(([id]) => isCustomTheme(id))
                            .map(([id, { name }]) => (
                              <option key={id} value={id}>
                                {name}
                                {isCustomTheme(id) && " (Custom)"}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <DropZone onFileDrop={handleFileDrop} />

                {isCustomTheme(selectedTheme) && (
                  <Button
                    onClick={() => removeCustomTheme(selectedTheme)}
                    variant="destructive"
                    icon={Trash2}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Remove Custom Theme
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <ColorInput
                  label="Editor Background"
                  value={editorBackground}
                  onApply={handleBackgroundChange}
                  description="Change the editor background color"
                />
                <ValueAdjuster
                  value={contrast}
                  onChange={handleContrastChange}
                  label="Contrast"
                  description="Modify the difference between light and dark colors"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Tooltip content="Automatically optimize contrast ratio">
                  <Button
                    onClick={handleBoostContrast}
                    icon={Zap}
                    disabled={isLoading}
                  >
                    Boost Contrast
                  </Button>
                </Tooltip>
                <Tooltip content="Adjust colors to meet WCAG AA accessibility standards">
                  <Button
                    onClick={() => handleWCAG("AA")}
                    icon={Zap}
                    disabled={isLoading}
                  >
                    WCAG AA
                  </Button>
                </Tooltip>
                <Tooltip content="Adjust colors to meet WCAG AAA accessibility standards">
                  <Button
                    onClick={() => handleWCAG("AAA")}
                    icon={Zap}
                    disabled={isLoading}
                  >
                    WCAG AAA
                  </Button>
                </Tooltip>
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  icon={RefreshCw}
                  disabled={isLoading}
                >
                  Reset All
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  icon={Copy}
                  disabled={isLoading}
                >
                  Copy Theme
                </Button>
              </div>

              <div className="grid gap-4 border-t border-border pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Additional Adjustments
                </h4>
                <ValueAdjuster
                  value={brightness}
                  onChange={handleBrightnessChange}
                  label="Brightness"
                  description="Adjust the overall brightness of the theme"
                  disabled={isLoading}
                />
                <ValueAdjuster
                  value={luminance}
                  onChange={handleLuminanceChange}
                  label="Luminance"
                  description="Fine-tune the perceived brightness"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[59]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
});

export default ThemeControls;
