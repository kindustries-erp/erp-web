import { AppTheme } from "./types";

let currentAppTheme: AppTheme = "classic-light";
let systemDarkMedia: MediaQueryList | null = null;
let systemDarkListener: ((e: MediaQueryListEvent) => void) | null = null;
let themeChangeCallback: ((theme: AppTheme) => void) | null = null;

export function registerThemeChangeCallback(
  cb: (theme: AppTheme) => void,
): () => void {
  themeChangeCallback = cb;
  return () => {
    if (themeChangeCallback === cb) {
      themeChangeCallback = null;
    }
  };
}

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
      systemDarkListener = (e: MediaQueryListEvent) => {
        const isClassicFamily =
          currentAppTheme === "classic" ||
          currentAppTheme === "classic-light" ||
          currentAppTheme === "classic-dark";

        // Tự động chuyển đổi giữa Light Classic và Dark Classic khi OS/Browser thay đổi
        if (isClassicFamily) {
          const nextTheme: AppTheme = e.matches
            ? "classic-dark"
            : "classic-light";
          applyDocumentTheme(nextTheme);
          if (themeChangeCallback) {
            themeChangeCallback(nextTheme);
          }
        }
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

  const isClassicFamily =
    appTheme === "classic" ||
    appTheme === "classic-light" ||
    appTheme === "classic-dark";

  let isDark = false;
  let isClassicDark = false;

  if (appTheme === "midnight") {
    isDark = true;
  } else if (appTheme === "classic-dark") {
    isDark = true;
    isClassicDark = true;
  } else if (appTheme === "classic-light") {
    isDark = false;
    isClassicDark = false;
  } else if (appTheme === "classic") {
    const systemDark = isSystemDarkMode();
    isDark = systemDark;
    isClassicDark = systemDark;
  }

  // Cập nhật class theme
  root.classList.toggle("theme-classic", isClassicFamily);
  root.classList.toggle("theme-classic-dark", isClassicDark);
  root.classList.toggle("theme-orcaq", appTheme === "orcaq");
  root.classList.toggle("theme-midnight", appTheme === "midnight");

  // Toggle class "dark" cho Tailwind dark:*
  root.classList.toggle("dark", isDark);

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !systemDarkMedia
  ) {
    initSystemThemeSync();
  }
}
