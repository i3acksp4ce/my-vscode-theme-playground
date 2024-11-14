import { useEffect, useRef } from "react";

export const useEffectOnce = (effect) => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      effect();
    }
  }, []);
};
