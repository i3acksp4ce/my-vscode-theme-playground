import React, { memo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  Loader2,
  RefreshCw,
  Copy,
  Zap,
  RotateCcw,
  Upload,
  Trash2,
  Info,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

const Tooltip = ({ children, content }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {content}
    </div>
  </div>
);

const ValueAdjuster = ({ value, onChange, label, icon: Icon, description }) => {
  const steps = [5, 2];

  return (
    <motion.div
      className="flex flex-col gap-2 min-w-[160px] bg-card/50 p-4 rounded-lg border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between text-sm font-medium">
        <Tooltip content={description}>
          <span className="flex items-center gap-2 cursor-help">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            <Info className="w-3 h-3 text-muted-foreground" />
          </span>
        </Tooltip>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary">
          {value === 0 ? "Default" : `${value > 0 ? "+" : ""}${value}%`}
        </span>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(0)}
          className={cn(
            "p-2 rounded-md text-xs transition-colors",
            value === 0
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <RotateCcw className="w-3 h-3" />
        </motion.button>
        <div className="flex flex-1 flex-col gap-1">
          {steps.map((step) => (
            <div key={step} className="flex gap-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange(Math.max(-100, value - step))}
                className="flex-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium"
              >
                -{step}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange(Math.min(100, value + step))}
                className="flex-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium"
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

const DropZone = ({ onFileDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file?.type === "application/json") {
      onFileDrop(file);
    } else {
      toast.error("Please drop a JSON file");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-primary/50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 cursor-pointer"
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop theme file here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">Supports JSON files</p>
        </div>
      </div>
    </motion.div>
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

  const handleFileDrop = async (file) => {
    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      await addCustomTheme(themeData, file.name.replace(/\.json$/, ""));
    } catch (error) {
      toast.error(`Error loading theme: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-gradient-to-b from-background to-card p-6 shadow-lg"
    >
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-[300px,1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Active Theme</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full bg-card text-foreground px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
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
            </div>

            <DropZone onFileDrop={handleFileDrop} />

            {isCustomTheme(selectedTheme) && (
              <Button
                onClick={() => removeCustomTheme(selectedTheme)}
                variant="destructive"
                icon={Trash2}
                className="w-full"
              >
                Remove Custom Theme
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ValueAdjuster
              value={brightness}
              onChange={handleBrightnessChange}
              label="Brightness"
              description="Adjust the overall brightness of the theme"
            />
            <ValueAdjuster
              value={luminance}
              onChange={handleLuminanceChange}
              label="Luminance"
              description="Fine-tune the perceived brightness"
            />
            <ValueAdjuster
              value={contrast}
              onChange={handleContrastChange}
              label="Contrast"
              description="Modify the difference between light and dark colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          <Tooltip content="Adjust colors to meet WCAG AA accessibility standards">
            <Button onClick={() => handleWCAG("AA")} icon={Zap}>
              WCAG AA
            </Button>
          </Tooltip>
          <Tooltip content="Adjust colors to meet WCAG AAA accessibility standards">
            <Button onClick={() => handleWCAG("AAA")} icon={Zap}>
              WCAG AAA
            </Button>
          </Tooltip>
          <Button onClick={handleReset} variant="secondary" icon={RefreshCw}>
            Reset All
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
