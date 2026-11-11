import { useCallback, useEffect, useState, type RefObject } from "react";

export type FullscreenAction = "enter" | "exit";

/** Quyết định bật hay tắt full screen dựa trên phần tử đang full screen. */
export function resolveFullscreenAction(
  fullscreenElement: Element | null,
  target: Element | null,
): FullscreenAction {
  return fullscreenElement !== null && fullscreenElement === target
    ? "exit"
    : "enter";
}

/** Full screen (Fullscreen API) cho đúng khung canvas, không phủ cả trang. */
export function useCanvasFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(
        document.fullscreenElement !== null &&
          document.fullscreenElement === ref.current,
      );
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [ref]);

  const toggle = useCallback(async () => {
    const element = ref.current;
    if (!element) return;
    const action = resolveFullscreenAction(document.fullscreenElement, element);
    if (action === "exit") {
      await document.exitFullscreen();
      return;
    }
    await element.requestFullscreen();
  }, [ref]);

  return { isFullscreen, toggle };
}
