import React from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

function MobileToggle({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
    >
      <Menu className="w-6 h-6" />
    </motion.button>
  );
}

export default MobileToggle;
