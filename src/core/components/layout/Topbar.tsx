import { useAppStore, BREADCRUMBS } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";
import { PageKey } from "@/shared/types";
import { triggerContextMenu } from "@/shared/components/ContextMenu";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { ThemePopover } from "./ThemePopover";
import { NotificationPopover } from "./NotificationPopover";

export function Topbar() {
  const {
    currentPage,
    navigate,
    setMobileSidebarOpen,
    locale,
    toggleLocale,
    customBreadcrumbs,
  } = useAppStore();
  const impersonation = useAuthStore((s) => s.impersonation);
  const stopImpersonationAction = useAuthStore(
    (s) => s.stopImpersonationAction,
  );
  const employee = useAuthStore((s) => s.employee);
  const t = useT();
  const crumbs = customBreadcrumbs ??
    BREADCRUMBS[currentPage] ?? [[currentPage]];

  return (
    <div className="topbar h-12 flex items-center gap-[10px] flex-shrink-0">
      {/* Hamburger (mobile) */}
      <Button
        variant="secondary"
        size="icon"
        className="mobile-hamburger hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-[5px] text-xs text-[color:var(--muted-fg)] min-w-0 overflow-hidden">
        {crumbs.map(([label, link], i) => {
          const isLast = i === crumbs.length - 1;
          const page = (link ?? currentPage) as PageKey;
          return (
            <span key={i} className="flex items-center gap-[5px]">
              {link ? (
                <span
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => navigate(link as PageKey)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    triggerContextMenu(e.clientX, e.clientY, page, t(label));
                  }}
                >
                  {t(label)}
                </span>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? "text-foreground font-medium whitespace-nowrap"
                      : "",
                    "select-none",
                  )}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    triggerContextMenu(e.clientX, e.clientY, page, t(label));
                  }}
                >
                  {t(label)}
                </span>
              )}
              {!isLast && <span className="text-[color:var(--faint)]">›</span>}
            </span>
          );
        })}
      </div>

      {/* Impersonation banner */}
      {impersonation?.active && (
        <div className="flex items-center gap-2 px-3 py-[5px] rounded-lg bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/40 text-[color:var(--warn-fg)] text-xs flex-shrink-0 max-[768px]:hidden">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-medium">
            {employee?.full_name ??
              impersonation.actor?.email ??
              t("topbar.impersonation.unknownUser")}
          </span>
          <span className="text-[color:var(--warn-fg)]/70">
            ({t("topbar.impersonation.actorLabel")}:{" "}
            {impersonation.actor?.email ?? "—"})
          </span>
          <button
            onClick={() => stopImpersonationAction("manual")}
            className="ml-1 px-2 py-[2px] rounded text-[11px] font-medium border border-[color:var(--warn-fg)]/50 hover:bg-[color:var(--warn-fg)]/10 transition-colors whitespace-nowrap"
          >
            {t("topbar.impersonation.stopButton")}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="ml-auto flex items-center gap-2 bg-[color:var(--muted)] border border-border rounded-lg px-3 py-[6px] w-64 flex-shrink-0 max-[900px]:w-44 max-[640px]:hidden">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[color:var(--faint)] flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={t("topbar.search")}
          className="border-none bg-transparent outline-none text-xs text-foreground w-full placeholder:text-[color:var(--faint)]"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 max-[640px]:ml-auto flex-shrink-0">
        {/* Language toggle — show language code */}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleLocale}
          title={t("nav.bottom.language")}
          className="h-8 px-3"
        >
          <span className="text-[11px] font-semibold text-[color:var(--muted-fg)]">
            {locale === "vi" ? "VI" : "EN"}
          </span>
        </Button>

        {/* App theme switch */}
        <ThemePopover>
          <Button
            variant="secondary"
            size="icon"
            title={t("nav.bottom.themeStyle")}
          >
            <svg
              className="w-[14px] h-[14px] text-[color:var(--muted-fg)] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.1 2 11.2c0 3.7 2.8 6.8 6.5 6.8h1.2c1 0 1.7.8 1.7 1.7 0 1.2.9 2.1 2.1 2.1 4.7 0 8.5-4.4 8.5-9.8C22 6.5 17.5 2 12 2z" />
            </svg>
          </Button>
        </ThemePopover>

        {/* Bell */}
        <NotificationPopover>
          <Button variant="secondary" size="icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[color:var(--muted-fg)]"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Button>
        </NotificationPopover>
      </div>
    </div>
  );
}
