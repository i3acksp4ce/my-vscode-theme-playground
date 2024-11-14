import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

export const Button = ({
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
