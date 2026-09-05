import React from "react";
import {
  getActiveSystemLanguages,
  SystemLanguage,
} from "@/core/config/languages";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { Globe } from "lucide-react";

export interface MultilingualBadgeProps {
  /** Map of language code to translation string */
  labels?: Record<string, string | undefined>;
  /** Default label (typically Vietnamese or primary system language) */
  fallbackText?: string;
  /** English label fallback if labels.en is not set */
  fallbackEnText?: string;
  /** Optional header title for the preview tooltip */
  title?: string;
  /** Optional key or code identifier (e.g. 'PO', 'SALE') */
  itemKey?: string;
  /** Show count badge number next to Globe icon */
  showCount?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Custom active languages list */
  languages?: SystemLanguage[];
}

/**
 * Reusable Multilingual Translations Preview Badge with Tooltip
 * Standard component for displaying multilingual status & all translation variants across ERP modules.
 */
export function MultilingualBadge({
  labels,
  fallbackText,
  fallbackEnText,
  title,
  itemKey,
  showCount = true,
  className,
  languages,
}: MultilingualBadgeProps) {
  const t = useT();
  const activeLangs =
    languages && languages.length > 0 ? languages : getActiveSystemLanguages();

  // Count how many languages are configured
  const configuredCount = activeLangs.filter((lang) => {
    const text =
      labels?.[lang.code] ||
      (lang.code === "vi"
        ? fallbackText
        : lang.code === "en"
          ? fallbackEnText
          : "");
    return Boolean(text?.trim());
  }).length;

  const tooltipContent = (
    <div className="flex flex-col gap-1 p-1 text-[11px] min-w-[160px]">
      <div className="font-semibold text-xs border-b border-border/40 pb-1 flex items-center justify-between gap-2">
        <span>
          {title ||
            t("common.multilingual.translationsTitle", "Bản dịch đa ngôn ngữ")}
        </span>
        {itemKey && (
          <span className="font-mono text-[10px] text-muted-foreground">
            ({itemKey})
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        {activeLangs.map((lang) => {
          const text =
            labels?.[lang.code] ||
            (lang.code === "vi"
              ? fallbackText
              : lang.code === "en"
                ? fallbackEnText
                : "");
          return (
            <div
              key={lang.code}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-xs">{lang.flag}</span>
                <span>{lang.nativeName}:</span>
              </span>
              <span className="font-medium text-foreground">
                {text?.trim() ? (
                  text
                ) : (
                  <span className="italic text-muted-foreground/50 font-normal">
                    —
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors select-none",
          className,
        )}
      >
        <Globe className="w-2.5 h-2.5 shrink-0" />
        {showCount && <span className="font-mono">{configuredCount}</span>}
      </span>
    </Tooltip>
  );
}
