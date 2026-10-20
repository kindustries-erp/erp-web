import { useState, useEffect } from "react";

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<{ width: number; height: number }>(
    () => {
      if (typeof window !== "undefined") {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      return { width: 1280, height: 800 };
    },
  );

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = viewport.width;
  return {
    width,
    height: viewport.height,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}
