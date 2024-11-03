import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Loader2, RefreshCw, Copy, Zap, ZapOff } from "lucide-react";
import { cn } from "../lib/utils";

const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

const Slider = ({
  value,
  onChange,
  min = -100,
  max = 100,
  label,
  icon: Icon,
}) => {
  return (
    <motion.div
      className="flex flex-col gap-2 min-w-[200px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none bg-secondary rounded-full h-2 accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="mt-1 text-xs text-muted-foreground">
          {value === 0 ? "Default" : `${value > 0 ? "+" : ""}${value}%`}
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
  } = useTheme();

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
            <div className="flex items-center gap-2">
              <select
                value={selectedTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              >
                {Object.entries(availableThemes).map(([id, { name }]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {isLoading && <LoadingSpinner />}
            </div>
          </div>

          <div className="flex-1 flex flex-wrap gap-6">
            <Slider
              value={brightness}
              onChange={handleBrightnessChange}
              label="Brightness"
            />
            <Slider
              value={luminance}
              onChange={handleLuminanceChange}
              label="Luminance"
            />
            <Slider
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
