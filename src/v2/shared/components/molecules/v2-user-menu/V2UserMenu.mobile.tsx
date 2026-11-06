import * as React from "react";
import {
  User,
  Settings,
  Palette,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn, getBuildVersionLabel } from "@/shared/utils";
import { getSystemLanguage } from "@/core/config/languages";
import {
  THEMES,
  V2UserMenuThemeList,
  V2UserMenuLangList,
} from "./V2UserMenu.theme-lang";
import type { V2UserMenuProps } from "./V2UserMenu.type";

export const V2UserMenuMobile: React.FC<V2UserMenuProps> = ({
  children,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { appTheme, locale } = useAppStore();
  const { logoutAction, employee } = useAuthStore();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [subMenu, setSubMenu] = React.useState<"theme" | "lang" | null>(null);

  const displayName = employee?.full_name ?? t("nav.bottom.userFallback");
  const email = employee?.email ?? "";
  const isAdmin = email === "admin@liouni.com";
  const themes = THEMES.filter(
    (opt) => isAdmin || (opt.value !== "shell" && opt.value !== "orcaq"),
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

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
        className="cursor-pointer inline-flex items-center"
        data-testid="v2-user-menu-mobile-trigger"
      >
        {children}
      </div>

      <V2BottomSheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSubMenu(null);
        }}
        maxHeightClass="max-h-[85dvh] h-auto"
        bodyClassName="p-0 overflow-y-auto"
        hideCloseButton
      >
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border/60 dark:border-white/[0.08] bg-surface/50 dark:bg-card/40">
          <div className="w-10 h-10 min-w-[40px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-xs font-bold shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <V2Text as="p" variant="body-sm" weight="semibold" truncate>
              {displayName}
            </V2Text>
            {email && (
              <V2Text as="p" variant="caption" color="muted" truncate>
                {email}
              </V2Text>
            )}
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1">
          {onOpenProfile && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent/70 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer text-left"
            >
              <User className="w-4.5 h-4.5 text-muted-fg shrink-0" />
              <span>{t("topbar.userMenu.profile")}</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent/70 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer text-left"
            >
              <Settings className="w-4.5 h-4.5 text-muted-fg shrink-0" />
              <span>{t("nav.bottom.settings")}</span>
            </button>
          )}

          <div className="my-1 border-t border-border/50 dark:border-white/[0.06]" />

          <button
            type="button"
            onClick={() => setSubMenu(subMenu === "theme" ? null : "theme")}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent/70 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-3">
              <Palette className="w-4.5 h-4.5 text-muted-fg shrink-0" />
              <span>{t("nav.bottom.themeStyle")}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-fg">
              <span>{t(curThemeLabel)}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  subMenu === "theme" && "rotate-180",
                )}
              />
            </span>
          </button>
          {subMenu === "theme" && <V2UserMenuThemeList themes={themes} />}

          <button
            type="button"
            onClick={() => setSubMenu(subMenu === "lang" ? null : "lang")}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent/70 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-3">
              <Globe className="w-4.5 h-4.5 text-muted-fg shrink-0" />
              <span>{t("nav.bottom.languageLabel")}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-fg">
              <span>{curLangLabel}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  subMenu === "lang" && "rotate-180",
                )}
              />
            </span>
          </button>
          {subMenu === "lang" && <V2UserMenuLangList />}

          <div className="my-1 border-t border-border/50 dark:border-white/[0.06]" />

          <button
            type="button"
            onClick={logoutAction}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4.5 h-4.5 text-destructive shrink-0" />
            <span>{t("nav.bottom.logout")}</span>
          </button>

          <div className="mt-3 mb-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-fg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-mono">{getBuildVersionLabel()}</span>
          </div>
        </div>
      </V2BottomSheet>
    </>
  );
};
V2UserMenuMobile.displayName = "V2UserMenuMobile";
