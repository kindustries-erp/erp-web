import * as React from "react";
import { Check } from "lucide-react";
import { useAppStore, type AppTheme } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { cn } from "@/v2/shared/utils/cn";
import { getActiveSystemLanguages } from "@/core/config/languages";

export const THEMES: { value: AppTheme; labelKey: string }[] = [
  { value: "classic-light", labelKey: "nav.bottom.themeClassicLight" },
  { value: "classic-dark", labelKey: "nav.bottom.themeClassicDark" },
  { value: "shell", labelKey: "nav.bottom.themeShell" },
  { value: "orcaq", labelKey: "nav.bottom.themeOrca" },
  { value: "midnight", labelKey: "nav.bottom.themeMidnight" },
];

export const V2UserMenuThemeList: React.FC<{
  themes: typeof THEMES;
}> = ({ themes }) => {
  const { appTheme, setAppTheme } = useAppStore();
  const t = useT();

  return (
    <div className="ml-7 mr-1 my-1 flex flex-col gap-1 p-1 rounded-xl bg-muted/40 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04]">
      {themes.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setAppTheme(opt.value)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
            appTheme === opt.value
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-accent/50",
          )}
        >
          <span>{t(opt.labelKey)}</span>
          {appTheme === opt.value && (
            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
};

export const V2UserMenuLangList: React.FC = () => {
  const { locale, setLocale } = useAppStore();

  return (
    <div className="ml-7 mr-1 my-1 flex flex-col gap-1 p-1 rounded-xl bg-muted/40 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04]">
      {getActiveSystemLanguages().map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLocale(opt.code as "vi" | "en")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
            locale === opt.code
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-accent/50",
          )}
        >
          <span className="flex items-center gap-2">
            <span>{opt.flag}</span>
            <span>{opt.nativeName}</span>
          </span>
          {locale === opt.code && (
            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
};
