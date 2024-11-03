// Import all theme JSON files dynamically
const themeFiles = import.meta.glob("./*.json", { eager: true });
import defaultWorkbench from "../../workbench-color.json";

// Helper function to convert filename to camelCase
const toCamelCase = (str) => {
  return str
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
};

// Process theme files automatically and merge workbench colors
export const themes = Object.entries(themeFiles).reduce(
  (acc, [path, module]) => {
    const fileName = path.split("/").pop().replace(".json", "");
    const key = toCamelCase(fileName);

    // Create a deep copy of the theme and merge workbench colors
    const themeWithWorkbench = {
      ...module,
      colors: {
        ...module.colors,
        ...defaultWorkbench.colors,
      },
    };

    acc[key] = {
      name: module.name,
      theme: themeWithWorkbench,
    };

    return acc;
  },
  {}
);
