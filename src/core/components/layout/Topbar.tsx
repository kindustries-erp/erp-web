import { useAppStore, BREADCRUMBS } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { PageKey } from "@/shared/types";
import { triggerContextMenu } from "@/shared/components/ContextMenu";
import { Building2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";

export function Topbar() {
  const {
    currentPage,
    navigate,
    setMobileSidebarOpen,
    customBreadcrumbs,
    setCompanyProfileOpen,
  } = useAppStore();
  const impersonation = useAuthStore((s) => s.impersonation);
  const stopImpersonationAction = useAuthStore(
    (s) => s.stopImpersonationAction,
  );
  const employee = useAuthStore((s) => s.employee);
  const t = useT();
  const { data: companyProfile } = useCompanyProfile();
  const crumbs = customBreadcrumbs ??
    BREADCRUMBS[currentPage] ?? [[currentPage]];

  return (
    <div className="topbar flex items-center gap-[10px] flex-shrink-0">
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
        <div className="ml-auto flex items-center gap-2 px-3 py-[5px] rounded-lg bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/40 text-[color:var(--warn-fg)] text-xs flex-shrink-0 max-[768px]:hidden">
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

      {/* Company Name */}
      {!impersonation?.active && companyProfile?.company_name && (
        <Tooltip content={companyProfile.company_name} side="bottom">
          <button
            onClick={() => setCompanyProfileOpen(true)}
            className="ml-auto flex items-center gap-2 text-xs font-medium text-[color:var(--muted-fg)] hover:text-foreground transition-colors max-w-[400px]"
          >
            <Building2 className="w-[15px] h-[15px] flex-shrink-0" />
            <span className="truncate hidden md:block">
              {companyProfile.company_name}
            </span>
          </button>
        </Tooltip>
      )}
    </div>
  );
}
