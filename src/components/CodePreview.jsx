import React, { memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

const CodePreview = memo(function CodePreview({
  code,
  lang,
  highlighter,
  defaultHighlighter,
  themeName = "custom-theme",
  defaultThemeName = "default-theme",
}) {
  const modifiedRef = useRef(null);
  const defaultRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const modified = modifiedRef.current;
    const defaultView = defaultRef.current;

    if (!modified || !defaultView) return;

    const handleScroll = (scrolling, other) => {
      other.scrollTop = scrolling.scrollTop;
    };

    const handleModifiedScroll = () => handleScroll(modified, defaultView);
    const handleDefaultScroll = () => handleScroll(defaultView, modified);

    modified.addEventListener("scroll", handleModifiedScroll);
    defaultView.addEventListener("scroll", handleDefaultScroll);

    return () => {
      modified.removeEventListener("scroll", handleModifiedScroll);
      defaultView.removeEventListener("scroll", handleDefaultScroll);
    };
  }, []);

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

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
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
            <div className="text-xs text-center py-1 bg-muted text-muted-foreground">
              Default
            </div>
            <div
              ref={defaultRef}
              dangerouslySetInnerHTML={{ __html: defaultHtml }}
              className="max-h-[400px] overflow-auto [&_pre]:m-0 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono"
            />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs text-center py-1 bg-muted text-muted-foreground">
              Modified
            </div>
            <div
              ref={modifiedRef}
              dangerouslySetInnerHTML={{ __html: modifiedHtml }}
              className="max-h-[400px] overflow-auto [&_pre]:m-0 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono"
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
});

export default CodePreview;
