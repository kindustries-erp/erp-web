import { useCallback, useEffect, useState } from "react";

export function useV2TableFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggle = useCallback(() => setIsFullscreen((v) => !v), []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  return { isFullscreen, toggle };
}
