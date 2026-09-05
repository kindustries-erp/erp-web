import React, { useState, useMemo } from "react";
import {
  getActiveSystemLanguages,
  DEFAULT_LANGUAGE_CODE,
  SystemLanguage,
} from "@/core/config/languages";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { cn } from "@/shared/utils";
import { Globe, Check } from "lucide-react";

export interface MultilingualInputProps {
  /** Map of language code to value (e.g. { vi: "Tiếng Việt", en: "English" }) */
  values?: Record<string, string | undefined>;
  /** Callback fired when any language value changes */
  onChange?: (
    values: Record<string, string>,
    currentLang: string,
    currentText: string,
  ) => void;
  /** Active system languages to support. Defaults to getActiveSystemLanguages() */
  languages?: SystemLanguage[];
  /** Default active language. Defaults to 'vi' */
  defaultLanguage?: string;
  /** Placeholder string or function returning placeholder per language */
  placeholder?: string | ((lang: SystemLanguage) => string);
  /** Display mode variant */
  variant?: "default" | "compact";
  /** UI presentation mode: 'popover' (sleek single input with suffix config button) or 'tabs' (traditional pill tab header) */
  mode?: "popover" | "tabs";
  /** Allow user to expand all languages into a stacked list in tabs mode */
  allowExpandAll?: boolean;
  /** Initial expanded state for tabs mode */
  initialExpanded?: boolean;
  /** Disabled input state */
  disabled?: boolean;
  /** Read-only input state */
  readOnly?: boolean;
  /** Error message string */
  error?: string;
  /** Is the primary language required */
  required?: boolean;
  /** Additional container CSS class */
  className?: string;
  /** Additional input element CSS class */
  inputClassName?: string;
  /** Form input name prefix */
  name?: string;
  /** Popover align */
  popoverAlign?: "start" | "center" | "end";
}

export function MultilingualInput({
  values = {},
  onChange,
  languages,
  defaultLanguage = DEFAULT_LANGUAGE_CODE,
  placeholder,
  variant = "default",
  mode = "popover",
  allowExpandAll = true,
  initialExpanded = false,
  disabled = false,
  readOnly = false,
  error,
  required = false,
  className,
  inputClassName,
  name,
  popoverAlign = "end",
}: MultilingualInputProps) {
  const t = useT();
  const activeLanguages = useMemo(
    () =>
      languages && languages.length > 0
        ? languages
        : getActiveSystemLanguages(),
    [languages],
  );

  const [activeLang, setActiveLang] = useState<string>(() => {
    if (activeLanguages.some((l) => l.code === defaultLanguage)) {
      return defaultLanguage;
    }
    return activeLanguages[0]?.code || DEFAULT_LANGUAGE_CODE;
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Calculate count of filled languages
  const filledCount = useMemo(() => {
    return activeLanguages.filter((l) => {
      const val = values[l.code];
      return typeof val === "string" && val.trim().length > 0;
    }).length;
  }, [activeLanguages, values]);

  const handleInputChange = (langCode: string, text: string) => {
    if (disabled || readOnly) return;
    const nextValues: Record<string, string> = {
      ...(values as Record<string, string>),
      [langCode]: text,
    };
    onChange?.(nextValues, langCode, text);
  };

  const getPlaceholder = (lang: SystemLanguage) => {
    if (typeof placeholder === "function") {
      return placeholder(lang);
    }
    if (placeholder) {
      return `${placeholder} (${lang.nativeName})`;
    }
    if (lang.code === "vi") return "Nhập tên Tiếng Việt...";
    if (lang.code === "en") return "Enter English name...";
    return `Enter name (${lang.nativeName})...`;
  };

  const primaryLang =
    activeLanguages.find((l) => l.isDefault) ||
    activeLanguages.find((l) => l.code === defaultLanguage) ||
    activeLanguages[0];

  const primaryValue = values[primaryLang?.code || DEFAULT_LANGUAGE_CODE] || "";

  // --------------------------------------------------------------------------
  // 1. Compact Variant (e.g. for small inline badges or quick inline table editing)
  // --------------------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div className={cn("inline-flex flex-col gap-1 w-full", className)}>
        <div className="flex items-center justify-between gap-1">
          {/* Mini Language Switcher Tabs */}
          <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-0.5 rounded-md">
            {activeLanguages.map((lang) => {
              const hasVal = Boolean(values[lang.code]?.trim());
              const isSelected = activeLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-medium rounded transition-all flex items-center gap-1 border-none cursor-pointer",
                    isSelected
                      ? "bg-white dark:bg-gray-800 text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground bg-transparent",
                  )}
                  title={`${lang.nativeName} (${lang.shortLabel})`}
                >
                  <span className="text-[11px]">{lang.flag}</span>
                  <span>{lang.shortLabel}</span>
                  {hasVal && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            name={name ? `${name}_${activeLang}` : undefined}
            disabled={disabled}
            readOnly={readOnly}
            value={values[activeLang] || ""}
            onChange={(e) => handleInputChange(activeLang, e.target.value)}
            placeholder={
              activeLanguages.find((l) => l.code === activeLang)
                ? getPlaceholder(
                    activeLanguages.find((l) => l.code === activeLang)!,
                  )
                : ""
            }
            className={cn(
              "w-full text-xs px-2 py-1 rounded-md border border-input bg-background text-foreground transition-all",
              "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
              error && "border-destructive focus:ring-destructive",
              disabled && "opacity-60 cursor-not-allowed bg-muted/40",
              inputClassName,
            )}
          />
        </div>
        {error && <span className="text-[10px] text-destructive">{error}</span>}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. Popover Mode (Default: Sleek, compact single-line input with Popover trigger)
  // --------------------------------------------------------------------------
  if (mode === "popover") {
    const popoverContent = (
      <div className="w-72 sm:w-80 p-3 flex flex-col gap-3">
        {/* Popover Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {t("common.multilingual.title", "Cấu hình đa ngôn ngữ")}
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full font-mono",
              filledCount === activeLanguages.length
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "bg-muted text-muted-foreground",
            )}
          >
            {filledCount}/{activeLanguages.length}{" "}
            {t("common.multilingual.languages", "ngôn ngữ")}
          </span>
        </div>

        {/* Stacked Language Inputs */}
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-0.5">
          {activeLanguages.map((lang) => {
            const hasVal = Boolean(values[lang.code]?.trim());
            return (
              <div key={lang.code} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({lang.shortLabel})
                    </span>
                    {lang.isDefault && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                        {t("common.multilingual.default", "Mặc định")}
                      </span>
                    )}
                  </span>
                  {hasVal && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={disabled}
                  readOnly={readOnly}
                  value={values[lang.code] || ""}
                  onChange={(e) => handleInputChange(lang.code, e.target.value)}
                  placeholder={getPlaceholder(lang)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            );
          })}
        </div>

        {/* Popover Footer */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {t("common.multilingual.autoSyncHint", "Tự động đồng bộ")}
          </span>
          <button
            type="button"
            onClick={() => setPopoverOpen(false)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-fg hover:bg-primary/90 transition-colors border-none cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>{t("common.done", "Xong")}</span>
          </button>
        </div>
      </div>
    );

    return (
      <div className={cn("relative flex flex-col gap-1 w-full", className)}>
        <div className="relative flex items-center">
          <input
            type="text"
            name={
              name
                ? `${name}_${primaryLang?.code || DEFAULT_LANGUAGE_CODE}`
                : undefined
            }
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            value={primaryValue}
            onChange={(e) =>
              handleInputChange(
                primaryLang?.code || DEFAULT_LANGUAGE_CODE,
                e.target.value,
              )
            }
            placeholder={
              typeof placeholder === "string"
                ? placeholder
                : primaryLang
                  ? getPlaceholder(primaryLang)
                  : ""
            }
            className={cn(
              "w-full text-xs pl-3 pr-14 py-2 rounded-lg border border-input bg-background text-foreground transition-all",
              "focus:outline-none focus:ring-1.5 focus:ring-primary/40 focus:border-primary",
              error && "border-destructive focus:ring-destructive",
              disabled && "opacity-60 cursor-not-allowed bg-muted/40",
              inputClassName,
            )}
          />

          {/* Suffix Popover Trigger Button */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            <Popover
              content={popoverContent}
              side="bottom"
              align={popoverAlign}
              sideOffset={6}
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              glass
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setPopoverOpen((prev) => !prev)}
                className={cn(
                  "px-1.5 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1 border cursor-pointer select-none",
                  popoverOpen
                    ? "bg-primary text-primary-fg border-primary shadow-xs"
                    : filledCount > 1
                      ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20"
                      : "bg-black/5 dark:bg-white/5 text-muted-foreground border-transparent hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                title={t(
                  "common.multilingual.configTooltip",
                  "Cấu hình tên đa ngôn ngữ (VI, EN...)",
                )}
              >
                <Globe className="w-3 h-3" />
                <span className="font-mono text-[10px] font-semibold">
                  {filledCount}/{activeLanguages.length}
                </span>
              </button>
            </Popover>
          </div>
        </div>

        {error && (
          <span className="text-xs text-destructive mt-0.5">{error}</span>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. Traditional Tabs Mode (Pill tab header with optional Stacked view)
  // --------------------------------------------------------------------------
  const activeLangObj =
    activeLanguages.find((l) => l.code === activeLang) || activeLanguages[0];

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {/* Header bar: Language tabs + Status count + Expand All Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {activeLanguages.map((lang) => {
            const hasVal = Boolean(values[lang.code]?.trim());
            const isSelected = !isExpanded && activeLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setActiveLang(lang.code);
                  if (isExpanded) setIsExpanded(false);
                }}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1.5 border border-transparent cursor-pointer select-none",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border-primary/20 shadow-2xs"
                    : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                title={`${lang.nativeName} (${lang.name})`}
              >
                <span className="text-sm leading-none">{lang.flag}</span>
                <span className="text-[11px] font-mono tracking-tight font-medium">
                  {lang.shortLabel}
                </span>
                {hasVal ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ring-1 ring-emerald-500/20"
                    title={t("common.multilingual.filled", "Đã có nội dung")}
                  />
                ) : (
                  lang.isDefault && (
                    <span
                      className="w-1 h-1 rounded-full bg-amber-400 shrink-0"
                      title={t(
                        "common.multilingual.defaultRequired",
                        "Mặc định",
                      )}
                    />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Right tools: Filled status badge & Expand toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              filledCount === activeLanguages.length
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : filledCount > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
            title={t(
              "common.multilingual.progressTooltip",
              "Tiến độ dịch thuật",
            )}
          >
            {filledCount}/{activeLanguages.length}
          </span>

          {allowExpandAll && activeLanguages.length > 1 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsExpanded((prev) => !prev)}
              className={cn(
                "p-1 text-[11px] text-muted-foreground hover:text-foreground rounded transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1",
                isExpanded && "text-primary font-medium bg-primary/5",
              )}
              title={
                isExpanded
                  ? t("common.multilingual.collapseTabs", "Thu gọn theo tab")
                  : t(
                      "common.multilingual.expandAll",
                      "Mở rộng tất cả ngôn ngữ",
                    )
              }
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isExpanded ? (
                  <>
                    <polyline points="4 14 12 6 20 14" />
                    <polyline points="4 18 12 10 20 18" />
                  </>
                ) : (
                  <>
                    <polyline points="4 6 12 14 20 6" />
                    <polyline points="4 10 12 18 20 10" />
                  </>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Input Form Body */}
      {isExpanded ? (
        // Stacked inputs for all active languages
        <div className="flex flex-col gap-2 p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-border/60">
          {activeLanguages.map((lang) => (
            <div key={lang.code} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-muted-foreground/70">
                    ({lang.shortLabel})
                  </span>
                  {lang.isDefault && (
                    <span className="text-[9px] text-amber-500 font-semibold uppercase tracking-wider ml-1">
                      {t("common.multilingual.primary", "Chính")}
                    </span>
                  )}
                </span>
                {values[lang.code]?.trim() && (
                  <span className="text-[9px] text-emerald-600 font-medium">
                    ✓
                  </span>
                )}
              </div>
              <input
                type="text"
                name={name ? `${name}_${lang.code}` : undefined}
                disabled={disabled}
                readOnly={readOnly}
                value={values[lang.code] || ""}
                onChange={(e) => handleInputChange(lang.code, e.target.value)}
                placeholder={getPlaceholder(lang)}
                className={cn(
                  "w-full text-xs px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground transition-all",
                  "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                  error && lang.isDefault && "border-destructive",
                  disabled && "opacity-60 cursor-not-allowed bg-muted/40",
                  inputClassName,
                )}
              />
            </div>
          ))}
        </div>
      ) : (
        // Single active language input
        <div className="relative flex items-center">
          <input
            type="text"
            name={name ? `${name}_${activeLang}` : undefined}
            disabled={disabled}
            readOnly={readOnly}
            required={required && activeLangObj?.isDefault}
            value={values[activeLang] || ""}
            onChange={(e) => handleInputChange(activeLang, e.target.value)}
            placeholder={activeLangObj ? getPlaceholder(activeLangObj) : ""}
            className={cn(
              "w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-foreground transition-all",
              "focus:outline-none focus:ring-1.5 focus:ring-primary/40 focus:border-primary",
              error && "border-destructive focus:ring-destructive",
              disabled && "opacity-60 cursor-not-allowed bg-muted/40",
              inputClassName,
            )}
          />
          {/* Flag prefix inside input */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center select-none">
            <span className="text-sm">{activeLangObj?.flag}</span>
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs text-destructive mt-0.5">{error}</span>
      )}
    </div>
  );
}
