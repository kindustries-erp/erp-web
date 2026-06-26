import { useState } from "react";
import { useAppStore, AppTheme } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { cn, getBuildVersionLabel } from "@/shared/utils";

const THEME_OPTIONS: { value: AppTheme; labelKey: string }[] = [
  { value: "classic", labelKey: "nav.bottom.themeClassic" },
  { value: "shell", labelKey: "nav.bottom.themeShell" },
  { value: "orcaq", labelKey: "nav.bottom.themeOrca" },
];

const LOCALE_OPTIONS: { value: "vi" | "en"; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export function UserMenuPopover({
  children,
  onOpenProfile,
  onOpenSettings,
}: {
  children: React.ReactNode;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}) {
  const { appTheme, setAppTheme, locale, setLocale } = useAppStore();
  const { logoutAction, employee } = useAuthStore();
  const t = useT();
  const [subMenu, setSubMenu] = useState<"appearance" | "language" | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  const displayName = employee?.full_name ?? t("nav.bottom.userFallback");
  const email = employee?.email ?? "";

  const currentThemeLabel =
    THEME_OPTIONS.find((o) => o.value === appTheme)?.labelKey ?? "";
  const currentLocaleLabel =
    LOCALE_OPTIONS.find((o) => o.value === locale)?.label ?? "";

  const buildVersionLabel = getBuildVersionLabel();

  const content = (
    <div className="flex">
      {/* Main menu */}
      <div className="w-56 p-1.5">
        {/* User info header */}
        <div className="px-2.5 py-2.5 flex items-center gap-2.5 border-b border-black/5 mb-1">
          <div className="w-8 h-8 min-w-[32px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[10px] font-semibold flex-shrink-0">
            {displayName
              .split(" ")
              .filter(Boolean)
              .slice(-2)
              .map((w: string) => w[0].toUpperCase())
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[10px] text-[color:var(--muted-fg)] truncate">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* User Profile */}
        {onOpenProfile && (
          <button
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground rounded-lg border-none bg-transparent cursor-pointer text-left"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{t("topbar.userMenu.profile")}</span>
          </button>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground rounded-lg border-none bg-transparent cursor-pointer text-left"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{t("nav.bottom.settings")}</span>
          </button>
        )}

        <div className="my-1 border-t border-black/5" />

        {/* Appearance */}
        <button
          onClick={() =>
            setSubMenu(subMenu === "appearance" ? null : "appearance")
          }
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg border-none cursor-pointer bg-transparent text-left",
            subMenu === "appearance"
              ? "bg-black/5 text-foreground"
              : "text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span>{t("nav.bottom.themeStyle")}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[color:var(--faint)]">
            <span>{t(currentThemeLabel)}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </button>

        {/* Language */}
        <button
          onClick={() => setSubMenu(subMenu === "language" ? null : "language")}
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg border-none cursor-pointer bg-transparent text-left",
            subMenu === "language"
              ? "bg-black/5 text-foreground"
              : "text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
            </svg>
            <span>{t("nav.bottom.languageLabel")}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[color:var(--faint)]">
            <span>{currentLocaleLabel}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </button>

        {/* Divider + Sign out */}
        <div className="my-1 border-t border-black/5" />
        <button
          onClick={logoutAction}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground rounded-lg border-none bg-transparent cursor-pointer text-left"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{t("nav.bottom.logout")}</span>
        </button>

        <div className="mt-2 text-[9px] font-medium text-[color:var(--faint)] text-center tracking-widest uppercase">
          {buildVersionLabel}
        </div>
      </div>

      {/* Side sub-menu panel */}
      {subMenu && (
        <div className="w-44 p-1.5 border-l border-black/5">
          <p className="px-2.5 py-1.5 text-[10px] font-medium text-[color:var(--muted-fg)] uppercase tracking-wide">
            {subMenu === "appearance"
              ? t("nav.bottom.themeStyle")
              : t("nav.bottom.languageLabel")}
          </p>
          {subMenu === "appearance" &&
            THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAppTheme(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border-none cursor-pointer bg-transparent text-left",
                  appTheme === opt.value
                    ? "bg-black/5 text-foreground font-medium"
                    : "text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground",
                )}
              >
                <span>{t(opt.labelKey)}</span>
                {appTheme === opt.value && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[color:var(--up-fg)]"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          {subMenu === "language" &&
            LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocale(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border-none cursor-pointer bg-transparent text-left",
                  locale === opt.value
                    ? "bg-black/5 text-foreground font-medium"
                    : "text-[color:var(--muted-fg)] hover:bg-black/5 hover:text-foreground",
                )}
              >
                <span>{opt.label}</span>
                {locale === opt.value && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[color:var(--up-fg)]"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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
      side="top"
      align="start"
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
}
