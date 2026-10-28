import * as React from "react";
import { Globe } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface V2AuthLocaleToggleProps {
  className?: string;
}

export const V2AuthLocaleToggle: React.FC<V2AuthLocaleToggleProps> = ({
  className = "",
}) => {
  const { locale, setLocale, t } = useV2Translation();

  const handleToggle = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  const title =
    locale === "vi"
      ? t("v2.auth.switchLanguageEn")
      : t("v2.auth.switchLanguageVi");

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={title}
      aria-label={title}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{locale === "vi" ? "VI" : "EN"}</span>
    </button>
  );
};

V2AuthLocaleToggle.displayName = "V2AuthLocaleToggle";
