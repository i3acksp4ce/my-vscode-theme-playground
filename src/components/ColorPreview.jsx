import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronUp, Search } from "lucide-react";

function ColorPreview({ defaultTheme, modifiedTheme }) {
  const [copiedColor, setCopiedColor] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["workbench"])
  );
  const [selectedType, setSelectedType] = useState("tokens");

  const colorTypes = {
    workbench: "Workbench Colors",
    semantic: "Semantic Tokens",
    tokens: "Token Colors",
  };

  const uniqueColors = useMemo(() => {
    const colors = new Map();
    const categories = new Map();

    const processTheme = (themeColors, isModified) => {
      if (!themeColors) return;

      // Process each color type
      Object.entries(themeColors).forEach(([type, colorSet]) => {
        Object.entries(colorSet).forEach(([key, value]) => {
          // Skip non-color values
          if (!value || typeof value !== "string") return;

          // Determine category based on key name
          let category = "other";
          if (key.includes("background")) category = "background";
          else if (key.includes("foreground")) category = "foreground";
          else if (key.includes("border")) category = "border";
          else if (key.includes("primary")) category = "primary";
          else if (key.includes("secondary")) category = "secondary";
          else if (key.includes("accent")) category = "accent";

          const fullKey = `${type}:${key}`;

          if (!colors.has(fullKey)) {
            colors.set(fullKey, {
              key,
              type,
              category,
              modified: isModified ? value : null,
              default: !isModified ? value : null,
            });
          } else {
            const existing = colors.get(fullKey);
            if (isModified) {
              existing.modified = value;
            } else {
              existing.default = value;
            }
          }
        });
      });
    };

    processTheme(defaultTheme, false);
    processTheme(modifiedTheme, true);

    // Group by type and category
    return Array.from(colors.values()).reduce((acc, color) => {
      if (!acc[color.type]) {
        acc[color.type] = {};
      }
      if (!acc[color.type][color.category]) {
        acc[color.type][color.category] = [];
      }
      acc[color.type][color.category].push(color);
      return acc;
    }, {});
  }, [defaultTheme, modifiedTheme]);

  const copyToClipboard = async (color) => {
    await navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card px-4 py-4" // Simplified padding
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Color Preview</h3>
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-muted text-sm rounded-md border-0 py-1.5 px-3"
            >
              {Object.entries(colorTypes).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search colors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {uniqueColors[selectedType] &&
            Object.entries(uniqueColors[selectedType])
              .filter(([category, colors]) =>
                colors.some((color) =>
                  color.key.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map(([category, colors]) => (
                <motion.div
                  key={category}
                  initial={false}
                  animate={{
                    height: expandedCategories.has(category) ? "auto" : 48,
                  }}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium capitalize">{category}</span>
                    {expandedCategories.has(category) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="p-4 grid gap-3">
                      {colors
                        .filter((color) =>
                          color.key
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((color, index) => (
                          <motion.div
                            key={color.key}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-[1fr,auto] md:grid-cols-[2fr,1fr,1fr] gap-2 md:gap-4 items-center"
                          >
                            <div className="text-sm break-all md:break-normal">
                              {color.key}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {color.default && (
                                <ColorButton
                                  color={color.default}
                                  copied={copiedColor === color.default}
                                  onClick={() => copyToClipboard(color.default)}
                                />
                              )}
                              {color.modified && (
                                <ColorButton
                                  color={color.modified}
                                  copied={copiedColor === color.modified}
                                  onClick={() =>
                                    copyToClipboard(color.modified)
                                  }
                                />
                              )}
                            </div>
                            <div className="hidden md:grid grid-cols-2 gap-2 text-xs font-mono">
                              {color.default && (
                                <div className="truncate" title={color.default}>
                                  {color.default}
                                </div>
                              )}
                              {color.modified && (
                                <div
                                  className="truncate"
                                  title={color.modified}
                                >
                                  {color.modified}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </motion.div>
              ))}
        </div>
      </div>
    </motion.div>
  );
}

function ColorButton({ color, copied, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative h-8 rounded-md overflow-hidden border border-border"
    >
      <div className="absolute inset-0" style={{ backgroundColor: color }} />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
        {copied ? (
          <Check className="w-3 h-3 text-white" />
        ) : (
          <Copy className="w-3 h-3 text-white" />
        )}
      </div>
    </button>
  );
}

export default ColorPreview;
