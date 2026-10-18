import { V2Theme, V2ThemeOption } from "./v2Theme.type";

export const V2_THEMES: V2ThemeOption[] = [
  {
    id: "default",
    name: "Mặc định (Light)",
    nameEn: "Default (Light)",
    isDark: false,
  },
  {
    id: "classic",
    name: "Cổ điển (Classic)",
    nameEn: "Classic",
    isDark: false,
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
  root.classList.toggle("theme-classic", theme === "classic");
  root.classList.toggle("theme-orcaq", theme === "orcaq");
  root.classList.toggle("theme-midnight", theme === "midnight");
  root.classList.toggle("dark", theme === "midnight");
}
