export interface V2MobileAppearanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
  className?: string;
}
