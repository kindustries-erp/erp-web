import { useState } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { ChangePasswordModal } from "@/modules/auth/components/ChangePasswordModal";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { NavItem } from "./SidebarPrimitives";
import {
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Car,
  ClipboardList,
  Network,
  Factory,
} from "lucide-react";
import { IconChevronLeft, IconPin } from "./sidebarIcons";
import { UserMenuPopover } from "./UserMenuPopover";
import { NotificationPopover } from "./NotificationPopover";

export function Sidebar() {
  const {
    currentPage,
    sidebarCollapsed,
    mobileSidebarOpen,
    navigate,
    toggleSidebar,
    setMobileSidebarOpen,
  } = useAppStore();
  const { employee } = useAuthStore();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const t = useT();
  const displayName =
    employee?.full_name ?? employee?.email ?? t("nav.bottom.userFallback");
  const buildVersion = __APP_BUILD_VERSION__;
  const buildVersionLabel = (() => {
    const rawIso = buildVersion.split("-").slice(0, 3).join("-");
    const parsed = new Date(rawIso);
    if (Number.isNaN(parsed.getTime())) return buildVersion;
    const utcMs = parsed.getTime() + parsed.getTimezoneOffset() * 60 * 1000;
    const gmt7 = new Date(utcMs + 7 * 60 * 60 * 1000);
    const yyyy = gmt7.getFullYear();
    const mm = String(gmt7.getMonth() + 1).padStart(2, "0");
    const dd = String(gmt7.getDate()).padStart(2, "0");
    const hh = String(gmt7.getHours()).padStart(2, "0");
    const min = String(gmt7.getMinutes()).padStart(2, "0");
    const ss = String(gmt7.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}.${hh}${min}${ss}`;
  })();
  const av = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const navTo = (p: PageKey) => {
    navigate(p);
    setMobileSidebarOpen(false);
  };
  const c = mobileSidebarOpen ? false : sidebarCollapsed && !hoverExpanded;

  return (
    <TooltipProvider>
      <>
        {mobileSidebarOpen && (
          <div
            className="mobile-sidebar-overlay fixed inset-0 bg-black/35 z-[299]"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "sidebar",
            c && "collapsed",
            mobileSidebarOpen && "mobile-open",
          )}
          onMouseEnter={() => {
            if (sidebarCollapsed) setHoverExpanded(true);
          }}
          onMouseLeave={() => setHoverExpanded(false)}
        >
          {/* Header */}
          <div className="sidebar-header h-12 px-[10px] border-b border-border flex items-center gap-2 flex-shrink-0 transition-all duration-[220ms]">
            <div className="sidebar-logo-wrap flex items-center gap-2 overflow-hidden flex-1 min-w-0 transition-all duration-[220ms]">
              <div className="w-8 h-8 min-w-[32px] bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-[18px] h-[18px] fill-primary-fg"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-semibold text-sm leading-tight whitespace-nowrap text-foreground">
                  {t("nav.appName")}
                </p>
                <p className="text-[10px] text-[color:var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis">
                  {buildVersionLabel}
                </p>
              </div>
            </div>
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
                className={cn(
                  "transition-transform duration-200",
                  c && "rotate-180",
                )}
              >
                {sidebarCollapsed && hoverExpanded ? (
                  <IconPin />
                ) : (
                  <IconChevronLeft />
                )}
              </span>
            </button>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Dashboard */}
            <div className="sidebar-nav-section py-2">
              <NavItem
                collapsed={c}
                icon={
                  <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.dashboard")}
                active={currentPage === "dashboard"}
                onClick={() => navTo("dashboard")}
                contextPage="dashboard"
              />
            </div>

            {/* Sales */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.sales")}
              </div>
              <NavItem
                collapsed={c}
                icon={<Boxes className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpSalesOrders")}
                active={currentPage === "erp-sales-orders"}
                onClick={() => navTo("erp-sales-orders")}
                contextPage="erp-sales-orders"
              />
              <NavItem
                collapsed={c}
                icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.customers")}
                active={currentPage === "erp-customers"}
                onClick={() => navTo("erp-customers")}
                contextPage="erp-customers"
              />
            </div>

            {/* Purchasing */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.purchasing")}
              </div>
              <NavItem
                collapsed={c}
                icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.purchasing")}
                active={currentPage === "purchasing"}
                onClick={() => navTo("purchasing")}
                contextPage="purchasing"
              />
              <NavItem
                collapsed={c}
                icon={
                  <Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.suppliers")}
                active={currentPage === "erp-suppliers"}
                onClick={() => navTo("erp-suppliers")}
                contextPage="erp-suppliers"
              />
            </div>

            {/* Kho */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.inventory")}
              </div>
              <NavItem
                collapsed={c}
                icon={
                  <ClipboardList className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.erpWarehouse")}
                active={currentPage === "erp-warehouse"}
                onClick={() => navTo("erp-warehouse")}
                contextPage="erp-warehouse"
              />
              <NavItem
                collapsed={c}
                icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.inventory")}
                active={currentPage === "inventory"}
                onClick={() => navTo("inventory")}
                contextPage="inventory"
              />
              <NavItem
                collapsed={c}
                icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInventoryMasters")}
                active={currentPage === "erp-inventory-masters"}
                onClick={() => navTo("erp-inventory-masters")}
                contextPage="erp-inventory-masters"
              />
            </div>

            {/* Manufacturing / BOM / Production */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.manufacturing")}
              </div>
              <NavItem
                collapsed={c}
                icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.mfgVehicles")}
                active={currentPage === "mfg-vehicles"}
                onClick={() => navTo("mfg-vehicles")}
                contextPage="mfg-vehicles"
              />
              <NavItem
                collapsed={c}
                icon={<Network className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpBom")}
                active={currentPage === "erp-bom"}
                onClick={() => navTo("erp-bom")}
                contextPage="erp-bom"
              />
              <NavItem
                collapsed={c}
                icon={<Factory className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpProduction")}
                active={currentPage === "erp-production"}
                onClick={() => navTo("erp-production")}
                contextPage="erp-production"
              />
            </div>
          </div>

          {/* Bottom: user menu */}
          <div
            className={cn(
              "sidebar-bottom border-t border-border p-[10px] flex-shrink-0 overflow-hidden",
              c
                ? "flex flex-col items-center gap-[6px]"
                : "flex items-center gap-[6px]",
            )}
          >
            <UserMenuPopover
              onOpenProfile={() => setProfileOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            >
              <div
                className={cn(
                  "flex items-center gap-2 px-1 py-[7px] rounded-lg hover:bg-surface-hover cursor-pointer",
                  c ? "justify-center" : "flex-1 min-w-0",
                )}
              >
                <div className="w-[22px] h-[22px] min-w-[22px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[8px] font-semibold flex-shrink-0">
                  {av}
                </div>
                <span className="hide-on-collapse text-xs font-medium text-[color:var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
                  {displayName}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="hide-on-collapse text-[color:var(--faint)] flex-shrink-0"
                >
                  <polyline points="7 10 12 5 17 10" />
                  <polyline points="7 14 12 19 17 14" />
                </svg>
              </div>
            </UserMenuPopover>

            <NotificationPopover>
              <button className="flex items-center justify-center w-[26px] h-[26px] min-w-[26px] rounded-md text-[color:var(--faint)] hover:text-foreground hover:bg-surface-hover border-none bg-transparent cursor-pointer flex-shrink-0">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
            </NotificationPopover>
          </div>
        </aside>
      </>
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <ChangePasswordModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </TooltipProvider>
  );
}
