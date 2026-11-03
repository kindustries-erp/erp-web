import { V2Theme, V2ThemeOption } from "./v2Theme.type";

export const V2_THEMES: V2ThemeOption[] = [
  {
    id: "default",
    name: "Mặc định (Light / Shell)",
    nameEn: "Default (Light / Shell)",
    isDark: false,
  },
  {
    id: "classic-light",
    name: "Cổ điển sáng (Light Classic)",
    nameEn: "Light Classic",
    isDark: false,
  },
  {
    id: "classic-dark",
    name: "Cổ điển tối (Dark Classic)",
    nameEn: "Dark Classic",
    isDark: true,
  },
  {
    id: "orcaq",
    name: "OrcaQ",
    nameEn: "OrcaQ",
    isDark: false,
  },
  {
    id: "midnight",
    name: "Midnight (Dark)",
    nameEn: "Midnight (Dark)",
    isDark: true,
  },
];

export function applyV2Theme(theme: V2Theme): void {
  const root = document.documentElement;

  const isClassicFamily =
    theme === "classic" ||
    theme === "classic-light" ||
    theme === "classic-dark";

  let isDark = false;
  let isClassicDark = false;

  if (theme === "midnight") {
    isDark = true;
  } else if (theme === "classic-dark") {
    isDark = true;
    isClassicDark = true;
  } else if (theme === "classic-light") {
    isDark = false;
    isClassicDark = false;
  } else if (theme === "classic") {
    const isSystemDark =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    isDark = isSystemDark;
    isClassicDark = isSystemDark;
  }

  root.classList.toggle("theme-classic", isClassicFamily);
  root.classList.toggle("theme-classic-dark", isClassicDark);
  root.classList.toggle("theme-orcaq", theme === "orcaq");
  root.classList.toggle("theme-midnight", theme === "midnight");
  root.classList.toggle("dark", isDark);
}
