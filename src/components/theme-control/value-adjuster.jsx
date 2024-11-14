import { motion } from "framer-motion";
import { Tooltip } from "./tooltip";
import { Info } from "lucide-react";

export const ValueAdjuster = ({
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
