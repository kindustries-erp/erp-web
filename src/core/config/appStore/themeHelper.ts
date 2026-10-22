import { AppTheme } from "./types";

let currentAppTheme: AppTheme = "classic";
let systemDarkMedia: MediaQueryList | null = null;
let systemDarkListener: ((e: MediaQueryListEvent) => void) | null = null;

export function isSystemDarkMode(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function initSystemThemeSync(): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  if (!systemDarkMedia) {
    try {
      systemDarkMedia = window.matchMedia("(prefers-color-scheme: dark)");
      systemDarkListener = () => {
        applyDocumentTheme(currentAppTheme);
      };
      if (systemDarkMedia.addEventListener) {
        systemDarkMedia.addEventListener("change", systemDarkListener);
      } else if ("addListener" in systemDarkMedia) {
        (systemDarkMedia as any).addListener(systemDarkListener);
      }
    } catch {
      // Ignore if matchMedia unsupported
    }
  }

  return () => {
    if (systemDarkMedia && systemDarkListener) {
      try {
        if (systemDarkMedia.removeEventListener) {
          systemDarkMedia.removeEventListener("change", systemDarkListener);
        } else if ("removeListener" in systemDarkMedia) {
          (systemDarkMedia as any).removeListener(systemDarkListener);
        }
      } catch {
        // Ignore
      }
      systemDarkMedia = null;
      systemDarkListener = null;
    }
  };
}

export function applyDocumentTheme(appTheme: AppTheme): void {
  currentAppTheme = appTheme;
  const root = document.documentElement;

  root.classList.toggle("theme-classic", appTheme === "classic");
  root.classList.toggle("theme-orcaq", appTheme === "orcaq");
  root.classList.toggle("theme-midnight", appTheme === "midnight");

  const isDark = appTheme === "midnight" || isSystemDarkMode();
  root.classList.toggle("dark", isDark);

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !systemDarkMedia
  ) {
    initSystemThemeSync();
  }
}
