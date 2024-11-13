import React, { memo, useRef, useState, useEffect, useCallback } from "react";
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
  ChevronRight,
  ChevronLeft,
  Eye, // Add this import
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import ColorPreview from "./ColorPreview";
import { useSidebar } from "../context/SidebarContext"; // Import the sidebar context hook
import { boostThemeContrast } from "../utils/themeUtils";

const LoadingSpinner = () => <Loader2 className="h-4 w-4 animate-spin" />;

const Tooltip = ({ children, content }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {content}
    </div>
  </div>
);

const ValueAdjuster = ({
  value,
  onChange,
  label,
  icon: Icon,
  description,
  disabled,
}) => {
  const steps = [5, 10, 15, 20]; // Updated step values

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
      <div className="flex flex-wrap gap-1">
        {steps.map((step) => (
          <div key={step} className="flex-1 min-w-[60px]">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(Math.max(-100, value - step))}
              disabled={disabled}
              className="w-full px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium disabled:opacity-50"
            >
              -{step}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(Math.min(100, value + step))}
              disabled={disabled}
              className="w-full mt-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium disabled:opacity-50"
            >
              +{step}
            </motion.button>
          </div>
        ))}
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

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">Loading theme...</span>
    </div>
  </div>
);

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
      toast.error(`Error loading theme: ${error.message}`);
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
      toast.success("Background color updated");
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

// Inside ThemeControls component, add this new component before the ValueAdjuster components
const ColorInput = ({ label, value, onChange, onApply, description }) => {
  const [tempColor, setTempColor] = useState(value);

  // Update tempColor when value prop changes
  useEffect(() => {
    setTempColor(value);
  }, [value]);

  const handleColorChange = (newColor) => {
    setTempColor(newColor);
  };

  const handleApply = () => {
    // Validate hex color format
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(tempColor);
    if (!isValidHex) {
      toast.error("Please enter a valid hex color (e.g., #000000)");
      return;
    }
    onApply(tempColor);
  };

  return (
    <motion.div
      className="flex flex-col gap-3 min-w-[160px] bg-card/50 p-4 rounded-lg border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between text-sm font-medium">
        <Tooltip content={description}>
          <span className="flex items-center gap-2 cursor-help">
            <Eye className="w-4 h-4" />
            {label}
            <Info className="w-3 h-3 text-muted-foreground" />
          </span>
        </Tooltip>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-border"
            style={{ backgroundColor: tempColor }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative flex gap-2">
          <div className="relative">
            <input
              type="color"
              value={tempColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded-md border border-border bg-muted"
            />
          </div>
          <input
            type="text"
            value={tempColor.toUpperCase()}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="#000000"
            maxLength={7}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleApply}
          disabled={tempColor === value}
          className={cn(
            "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors",
            tempColor === value
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {tempColor === value ? "Color Applied" : "Apply Color"}
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => handleColorChange("#0d1117")}
        className="w-full px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2"
      >
        <div className="flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Background
        </div>
      </motion.button>
    </motion.div>
  );
};

export default ThemeControls;
