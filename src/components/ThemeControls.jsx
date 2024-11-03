import React, { memo, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  Loader2,
  RefreshCw,
  Copy,
  Zap,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Upload,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

const ValueAdjuster = ({ value, onChange, label, icon: Icon }) => {
  const steps = [5, 2];

  return (
    <motion.div
      className="flex flex-col gap-2 min-w-[140px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {value === 0 ? "Default" : `${value > 0 ? "+" : ""}${value}%`}
        </span>
      </div>
      <div className="flex gap-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(0)}
          className={cn(
            "px-2 py-1 rounded text-xs",
            value === 0
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <RotateCcw className="w-3 h-3" />
        </motion.button>
        <div className="flex flex-col gap-1">
          {steps.map((step) => (
            <div key={step} className="flex gap-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange(Math.max(-100, value - step))}
                className="px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs"
              >
                -{step}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange(Math.min(100, value + step))}
                className="px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs"
              >
                +{step}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Button = ({
  onClick,
  disabled,
  variant = "default",
  children,
  icon: Icon,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

const ThemeControls = memo(function ThemeControls() {
  const {
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
  } = useTheme();

  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      await addCustomTheme(themeData, file.name.replace(/\.json$/, ""));
    } catch (error) {
      toast.error(`Error loading theme: ${error.message}`);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                {isLoading && <LoadingSpinner />}
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  icon={Upload}
                >
                  Upload Theme
                </Button>
                {isCustomTheme(selectedTheme) && (
                  <Button
                    onClick={() => removeCustomTheme(selectedTheme)}
                    variant="destructive"
                    icon={Trash2}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <ValueAdjuster
              value={brightness}
              onChange={handleBrightnessChange}
              label="Brightness"
            />
            <ValueAdjuster
              value={luminance}
              onChange={handleLuminanceChange}
              label="Luminance"
            />
            <ValueAdjuster
              value={contrast}
              onChange={handleContrastChange}
              label="Contrast"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleWCAG("AA")} icon={Zap}>
            WCAG AA
          </Button>
          <Button onClick={() => handleWCAG("AAA")} icon={Zap}>
            WCAG AAA
          </Button>
          <Button onClick={handleReset} variant="secondary" icon={RefreshCw}>
            Reset
          </Button>
          <Button onClick={handleCopy} variant="secondary" icon={Copy}>
            Copy Theme
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

export default ThemeControls;
