import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { IconChevronLeft, IconPin } from "./sidebarIcons";

export function SidebarHeader({
  c,
  sidebarCollapsed,
  hoverExpanded,
  toggleSidebar,
  setCompanyProfileOpen,
  companyProfile,
}: {
  c: boolean;
  sidebarCollapsed: boolean;
  hoverExpanded: boolean;
  toggleSidebar: () => void;
  setCompanyProfileOpen: (v: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companyProfile: any;
}) {
  const t = useT();
  return (
    <div className="sidebar-header h-12 px-[10px] border-b border-border flex items-center gap-2 flex-shrink-0 transition-all duration-[220ms]">
      <Tooltip
        content={companyProfile?.company_name || t("nav.appName")}
        side="bottom"
      >
        <div
          className="sidebar-logo-wrap flex items-center gap-2 overflow-hidden flex-1 min-w-0 transition-all duration-[220ms] cursor-pointer hover:opacity-80"
          onClick={() => setCompanyProfileOpen(true)}
        >
          <div
            className={cn(
              "w-7 h-7 min-w-[28px] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
              companyProfile?.logo ? "bg-white p-[2px]" : "bg-primary",
            )}
          >
            {companyProfile?.logo ? (
              <img
                src={companyProfile.logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-[6px]"
              />
            ) : (
              <svg
                className="w-[16px] h-[16px] fill-primary-fg"
                viewBox="0 0 24 24"
              >
                <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-semibold text-[13px] leading-[1.2] text-foreground line-clamp-2">
              {t("nav.appName")}
            </p>
          </div>
        </div>
      </Tooltip>
      <button
        className="sidebar-toggle-btn w-[26px] h-[26px] min-w-[26px] border border-border rounded-[7px] flex items-center justify-center cursor-pointer text-[color:var(--muted-fg)] bg-surface hover:bg-surface-hover flex-shrink-0"
        onClick={toggleSidebar}
        title={
          sidebarCollapsed && hoverExpanded
            ? t("nav.bottom.pinSidebar")
            : t("nav.bottom.toggleSidebar")
        }
      >
        <span
          className={cn("transition-transform duration-200", c && "rotate-180")}
        >
          {sidebarCollapsed && hoverExpanded ? (
            <IconPin />
          ) : (
            <IconChevronLeft />
          )}
        </span>
      </button>
    </div>
  );
}
