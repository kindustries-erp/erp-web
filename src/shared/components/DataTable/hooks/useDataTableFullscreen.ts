import { useState, useCallback, useEffect } from "react";

interface UseDataTableFullscreenParams {
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export function useDataTableFullscreen({
  onFullscreenChange,
}: UseDataTableFullscreenParams) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      onFullscreenChange?.(next);
      return next;
    });
  }, [onFullscreenChange]);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    onFullscreenChange?.(false);
  }, [onFullscreenChange]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Don't close fullscreen if an open drawer, dialog, or popover is currently active
        const hasActiveOverlay = Boolean(
          document.querySelector(
            ".slide-panel-overlay.open, [role='dialog'], [data-radix-popper-content-wrapper]",
          ),
        );
        if (hasActiveOverlay) return;
        closeFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, closeFullscreen]);

  return {
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    closeFullscreen,
  };
}
