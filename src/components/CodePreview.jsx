import React, { memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

const CodePreview = ({
  code,
  lang,
  highlighter,
  defaultHighlighter,
  themeName = "custom-theme",
  defaultThemeName = "default-theme",
}) => {
  const modifiedRef = useRef(null);
  const defaultRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!highlighter || !defaultHighlighter) return null;

  try {
    const modifiedHtml = highlighter.codeToHtml(code, {
      theme: themeName,
      lang,
    });
    const defaultHtml = defaultHighlighter.codeToHtml(code, {
      theme: defaultThemeName,
      lang,
    });

    const codeStyle = {
      fontSize: "14px",
      maxHeight: "400px", // Fixed height for better consistency
      minHeight: "200px",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
          <h3 className="text-sm font-medium capitalize">{lang}</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-accent-foreground"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="overflow-hidden">
            <div className="sticky top-0 z-10 text-xs text-center py-1 bg-muted/80 backdrop-blur-sm text-muted-foreground">
              Default
            </div>
            <div
              ref={defaultRef}
              dangerouslySetInnerHTML={{ __html: defaultHtml }}
              className="overflow-auto [&_pre]:m-0 [&_pre]:p-4 [&_pre]:font-mono"
              style={codeStyle}
            />
          </div>
          <div className="overflow-hidden">
            <div className="sticky top-0 z-10 text-xs text-center py-1 bg-muted/80 backdrop-blur-sm text-muted-foreground">
              Modified
            </div>
            <div
              ref={modifiedRef}
              dangerouslySetInnerHTML={{ __html: modifiedHtml }}
              className="overflow-auto [&_pre]:m-0 [&_pre]:p-4 [&_pre]:font-mono"
              style={codeStyle}
            />
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-destructive bg-destructive/10 p-4"
      >
        <h3 className="text-sm font-medium capitalize text-destructive">
          {lang}
        </h3>
        <p className="text-sm text-destructive-foreground mt-2">
          Error highlighting code: {error.message}
        </p>
      </motion.div>
    );
  }
};

export default CodePreview;
