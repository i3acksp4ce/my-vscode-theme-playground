import React, { memo, useRef, useEffect } from "react";

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
      <div className="bg-gray-800 rounded-lg p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 capitalize">{lang}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded overflow-hidden">
            <div className="text-sm text-center py-1 bg-gray-700">Default</div>
            <div
              ref={defaultRef}
              dangerouslySetInnerHTML={{ __html: defaultHtml }}
              className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:overflow-x-auto  overflow-y-auto"
            />
          </div>
          <div className="bg-gray-900 rounded overflow-hidden">
            <div className="text-sm text-center py-1 bg-gray-700">Modified</div>
            <div
              ref={modifiedRef}
              dangerouslySetInnerHTML={{ __html: modifiedHtml }}
              className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:overflow-x-auto  overflow-y-auto"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 capitalize">{lang}</h3>
        <div className="bg-red-900/50 p-4 rounded">
          <p>Error highlighting code: {error.message}</p>
        </div>
      </div>
    );
  }
});

export default CodePreview;
