import { useState } from "react";
import { Tooltip } from "./tooltip";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useEffect } from "react";
import { Eye } from "lucide-react";
import { Info } from "lucide-react";
import { RotateCcw } from "lucide-react";

export const ColorInput = ({
  label,
  value,
  onChange,
  onApply,
  description,
}) => {
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
      console.error("Please enter a valid hex color (e.g., #000000)");
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
