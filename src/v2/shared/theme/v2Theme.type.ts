export type V2Theme =
  | "default"
  | "shell"
  | "classic"
  | "classic-light"
  | "classic-dark"
  | "orcaq"
  | "midnight";

export interface V2ThemeOption {
  id: V2Theme;
  name: string;
  nameEn: string;
  isDark: boolean;
}
