import { useState, useCallback, useEffect, useRef } from "react";

interface UseDataTableFullscreenParams {
  onFullscreenChange?: (isFullscreen: boolean) => void;
  exitDurationMs?: number;
}

export function useDataTableFullscreen({
  onFullscreenChange,
  exitDurationMs = 160,
}: UseDataTableFullscreenParams) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const openFullscreen = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setIsExiting(false);
    setIsFullscreen(true);
    onFullscreenChange?.(true);
  }, [onFullscreenChange]);

  const closeFullscreen = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = setTimeout(() => {
      setIsFullscreen(false);
      setIsExiting(false);
      onFullscreenChange?.(false);
      exitTimerRef.current = null;
    }, exitDurationMs);
  }, [isExiting, exitDurationMs, onFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      closeFullscreen();
    } else {
      openFullscreen();
    }
  }, [isFullscreen, closeFullscreen, openFullscreen]);

  useEffect(() => {
    if (!isFullscreen || isExiting) return;
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
  }, [isFullscreen, isExiting, closeFullscreen]);

  return {
    isFullscreen,
    isExiting,
    setIsFullscreen,
    openFullscreen,
    toggleFullscreen,
    closeFullscreen,
  };
}
