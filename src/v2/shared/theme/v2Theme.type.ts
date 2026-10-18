export type V2Theme = "default" | "classic" | "orcaq" | "midnight";

export interface V2ThemeOption {
  id: V2Theme;
  name: string;
  nameEn: string;
  isDark: boolean;
}
