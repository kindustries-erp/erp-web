import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2LanguageSwitcherProps } from "./V2LanguageSwitcher.type";

export const V2LanguageSwitcher: React.FC<V2LanguageSwitcherProps> = ({
  className,
  size = "default",
}) => {
  const { locale, setLocale, t } = useV2Translation();

  return (
    <div
      role="group"
      aria-label={t(
        "v2.topbar.languageSwitchAria",
        "Chuyển đổi ngôn ngữ hiển thị",
      )}
      className={cn(
        "v2-language-switcher inline-flex items-center p-0.5 rounded-md border border-border bg-muted/50 select-none",
        size === "sm" ? "h-5 text-[10px]" : "h-6 text-[11px]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLocale("vi")}
        aria-pressed={locale === "vi"}
        title={t("v2.topbar.languageVi", "Tiếng Việt")}
        className={cn(
          "px-1.5 h-full rounded-[4px] transition-all cursor-pointer font-medium border-none",
          locale === "vi"
            ? "bg-background text-foreground font-semibold shadow-2xs"
            : "text-muted-foreground hover:text-foreground bg-transparent",
        )}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        title={t("v2.topbar.languageEn", "English")}
        className={cn(
          "px-1.5 h-full rounded-[4px] transition-all cursor-pointer font-medium border-none",
          locale === "en"
            ? "bg-background text-foreground font-semibold shadow-2xs"
            : "text-muted-foreground hover:text-foreground bg-transparent",
        )}
      >
        EN
      </button>
    </div>
  );
};
