import * as React from "react";
import {
  User,
  Settings,
  Palette,
  Globe,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { cn, getBuildVersionLabel } from "@/shared/utils";
import {
  getActiveSystemLanguages,
  getSystemLanguage,
} from "@/core/config/languages";
import { THEMES } from "./V2UserMenu.theme-lang";
import type { V2UserMenuProps } from "./V2UserMenu.type";

export const V2UserMenuDesktop: React.FC<V2UserMenuProps> = ({
  children,
  onOpenProfile,
  onOpenSettings,
  onOpenChangelog,
  side = "top",
  align = "start",
}) => {
  const { appTheme, setAppTheme, locale, setLocale } = useAppStore();
  const { logoutAction, employee } = useAuthStore();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [subMenu, setSubMenu] = React.useState<
    "appearance" | "language" | null
  >(null);

  const displayName = employee?.full_name ?? t("nav.bottom.userFallback");
  const email = employee?.email ?? "";
  const isAdmin = email === "admin@liouni.com";
  const themes = THEMES.filter(
    (o) => isAdmin || (o.value !== "shell" && o.value !== "orcaq"),
  );
  const curThemeLabel =
    THEMES.find((o) => o.value === appTheme)?.labelKey ?? "";
  const langObj = getSystemLanguage(locale);
  const curLangLabel = langObj
    ? `${langObj.flag} ${langObj.nativeName}`
    : locale.toUpperCase();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const content = (
    <div className="flex flex-row max-h-[85vh] overflow-y-auto">
      <div className="w-56 p-1.5">
        <div className="px-2.5 py-2.5 flex items-center gap-2.5 border-b border-[color:var(--border)] mb-1">
          <div className="w-8 h-8 min-w-[32px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[10px] font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground dark:text-zinc-100 truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[10px] text-muted-fg truncate">{email}</p>
            )}
          </div>
        </div>

        {onOpenProfile && (
          <button
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground/80 hover:bg-accent/60 hover:text-foreground rounded-lg cursor-pointer text-left transition-colors"
          >
            <User className="w-3.5 h-3.5 opacity-75" />
            <span>{t("topbar.userMenu.profile")}</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground/80 hover:bg-accent/60 hover:text-foreground rounded-lg cursor-pointer text-left transition-colors"
          >
            <Settings className="w-3.5 h-3.5 opacity-75" />
            <span>{t("nav.bottom.settings")}</span>
          </button>
        )}

        <div className="my-1 border-t border-[color:var(--border)]" />

        <button
          onClick={() =>
            setSubMenu(subMenu === "appearance" ? null : "appearance")
          }
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer text-left transition-colors",
            subMenu === "appearance"
              ? "bg-accent/80 text-foreground font-medium"
              : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2.5">
            <Palette className="w-3.5 h-3.5 opacity-75" />
            <span>{t("nav.bottom.themeStyle")}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-fg">
            <span>{t(curThemeLabel)}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </span>
        </button>

        <button
          onClick={() => setSubMenu(subMenu === "language" ? null : "language")}
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer text-left transition-colors",
            subMenu === "language"
              ? "bg-accent/80 text-foreground font-medium"
              : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2.5">
            <Globe className="w-3.5 h-3.5 opacity-75" />
            <span>{t("nav.bottom.languageLabel")}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-fg">
            <span>{curLangLabel}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </span>
        </button>

        <div className="my-1 border-t border-[color:var(--border)]" />
        <button
          onClick={logoutAction}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer text-left transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("nav.bottom.logout")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onOpenChangelog?.();
          }}
          className="w-full mt-2 py-1 px-2 rounded-md hover:bg-accent/50 transition-all flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-fg hover:text-primary tracking-wider uppercase cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">{getBuildVersionLabel()}</span>
        </button>
      </div>

      {subMenu && (
        <div className="w-44 p-1.5 border-l border-[color:var(--border)]">
          <p className="px-2.5 py-1.5 text-[10px] font-medium text-muted-fg uppercase tracking-wide">
            {subMenu === "appearance"
              ? t("nav.bottom.themeStyle")
              : t("nav.bottom.languageLabel")}
          </p>
          {subMenu === "appearance" &&
            themes.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAppTheme(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer text-left transition-colors",
                  appTheme === opt.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/80 hover:bg-accent/50",
                )}
              >
                <span>{t(opt.labelKey)}</span>
                {appTheme === opt.value && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </button>
            ))}
          {subMenu === "language" &&
            getActiveSystemLanguages().map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLocale(opt.code as "vi" | "en")}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer text-left transition-colors",
                  locale === opt.code
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/80 hover:bg-accent/50",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span>{opt.flag}</span>
                  <span>{opt.nativeName}</span>
                </span>
                {locale === opt.code && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      side={side}
      align={align}
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSubMenu(null);
      }}
      glass
    >
      {children}
    </Popover>
  );
};
V2UserMenuDesktop.displayName = "V2UserMenuDesktop";
