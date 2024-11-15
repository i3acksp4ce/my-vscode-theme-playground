import { motion } from "framer-motion";
import { Copy, RefreshCw, Trash2, Zap, Rotate3D } from "lucide-react";
import React, { memo, useCallback, useState } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../lib/utils";
import { themeStore } from "../stores/themeStore";
import { boostThemeContrast, rotateColorsForTheme } from "../utils/themeUtils";
import { Button } from "./theme-control/button";
import { ColorInput } from "./theme-control/color-input";
import { DropZone } from "./theme-control/drop-zone";
import { Tooltip } from "./theme-control/tooltip";
import { ValueAdjuster } from "./theme-control/value-adjuster";
import { highlighterStore } from "../stores/highlighterStore";

const ThemeControls = memo(function ThemeControls() {
  const store = useSnapshot(themeStore);

  const [editorBackground, setEditorBackground] = useState(
    store.theme.colors?.["editor.background"] || "#0d1117"
  );

  const [rotationValue, setRotationValue] = useState(15); // Default 15 degrees

  const handleBackgroundChange = useCallback(async (color) => {
    await themeStore.updateEditorBackground(color);
    setEditorBackground(color);
  }, []);

  const handleFileDrop = async (files) => {
    for (const file of files) {
      try {
        const text = await file.text();
        const themeData = JSON.parse(text);
        await themeStore.addCustomTheme(
          themeData,
          file.name.replace(/\.json$/, "")
        );
      } catch (error) {
        console.error(`Error loading theme ${file.name}: ${error.message}`);
      }
    }
  };

  const handleBoostContrast = async () => {
    themeStore.isLoading = true;
    try {
      const boostedTheme = boostThemeContrast(store.theme);
      themeStore.theme = boostedTheme;
      await highlighterStore.resetHighlighters();
    } catch (error) {
      console.error("Boost contrast error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  };

  const handleRotateColors = async () => {
    themeStore.isLoading = true;
    try {
      const rotatedTheme = rotateColorsForTheme(store.theme, rotationValue);
      themeStore.theme = rotatedTheme;
      await highlighterStore.resetHighlighters();
    } catch (error) {
      console.error("Rotate colors error:", error);
    } finally {
      themeStore.isLoading = false;
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: "360px" }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border shadow-lg w-[360px]"
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Theme Settings</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Active Theme</label>
              <div className="flex items-center gap-2">
                <select
                  value={store.selectedTheme}
                  onChange={(e) => themeStore.handleThemeChange(e.target.value)}
                  className="w-full bg-card text-foreground px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border disabled:opacity-50"
                  disabled={store.isLoading}
                >
                  <optgroup label="Built-in Themes">
                    {Object.entries(store.availableThemes)
                      .filter(([id]) => !store.isCustomTheme(id))
                      .map(([id, { name }]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                  </optgroup>
                  {Object.keys(store.availableThemes).some((id) =>
                    store.isCustomTheme(id)
                  ) && (
                    <optgroup label="Custom Themes">
                      {Object.entries(store.availableThemes)
                        .filter(([id]) => store.isCustomTheme(id))
                        .map(([id, { name }]) => (
                          <option key={id} value={id}>
                            {name}
                            {store.isCustomTheme(id) && " (Custom)"}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            <DropZone onFileDrop={handleFileDrop} />

            {store.isCustomTheme(store.selectedTheme) && (
              <Button
                onClick={() =>
                  themeStore.removeCustomTheme(store.selectedTheme)
                }
                variant="destructive"
                icon={Trash2}
                className="w-full"
                disabled={store.isLoading}
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
              value={store.contrast}
              onChange={themeStore.updateContrast}
              label="Contrast"
              description="Modify the difference between light and dark colors"
              disabled={store.isLoading}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Tooltip content="Automatically optimize contrast ratio">
              <Button
                onClick={handleBoostContrast}
                icon={Zap}
                disabled={store.isLoading}
              >
                Boost Contrast
              </Button>
            </Tooltip>
            <Tooltip content="Adjust colors to meet WCAG AA accessibility standards">
              <Button
                onClick={() => themeStore.handleWCAG("AA")}
                icon={Zap}
                disabled={store.isLoading}
              >
                WCAG AA
              </Button>
            </Tooltip>
            <Tooltip content="Adjust colors to meet WCAG AAA accessibility standards">
              <Button
                onClick={() => themeStore.handleWCAG("AAA")}
                icon={Zap}
                disabled={store.isLoading}
              >
                WCAG AAA
              </Button>
            </Tooltip>
            <Button
              onClick={themeStore.handleReset}
              variant="secondary"
              icon={RefreshCw}
              disabled={store.isLoading}
            >
              Reset All
            </Button>
            <Button
              onClick={themeStore.handleCopy}
              variant="secondary"
              icon={Copy}
              disabled={store.isLoading}
            >
              Copy Theme
            </Button>
          </div>

          <div className="grid gap-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Additional Adjustments
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <ValueAdjuster
                  value={rotationValue}
                  onChange={setRotationValue}
                  label="Rotation Angle"
                  description="Set the angle for color rotation (degrees)"
                  min={1}
                  max={360}
                  disabled={store.isLoading}
                />
                <Tooltip content="Rotate colors clockwise">
                  <Button
                    onClick={handleRotateColors}
                    icon={Rotate3D}
                    disabled={store.isLoading}
                  >
                    Rotate Colors
                  </Button>
                </Tooltip>
              </div>
            </div>
            <ValueAdjuster
              value={store.brightness}
              onChange={themeStore.updateBrightness}
              label="Brightness"
              description="Adjust the overall brightness of the theme"
              disabled={store.isLoading}
            />
            <ValueAdjuster
              value={store.luminance}
              onChange={themeStore.updateLuminance}
              label="Luminance"
              description="Fine-tune the perceived brightness"
              disabled={store.isLoading}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ThemeControls;
