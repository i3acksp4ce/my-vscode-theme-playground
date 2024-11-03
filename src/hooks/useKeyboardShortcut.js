import { useEffect } from "react";

export function useKeyboardShortcut(key, ctrlKey, callback) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === key && event.ctrlKey === ctrlKey) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, ctrlKey, callback]);
}
