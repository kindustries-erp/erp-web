import { AppTheme } from "./types";

export function applyDocumentTheme(appTheme: AppTheme): void {
  document.documentElement.classList.toggle(
    "theme-classic",
    appTheme === "classic",
  );
  document.documentElement.classList.toggle(
    "theme-orcaq",
    appTheme === "orcaq",
  );
  document.documentElement.classList.toggle(
    "theme-midnight",
    appTheme === "midnight",
  );
}
