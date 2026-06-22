import { useState } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { ChangePasswordModal } from "@/modules/auth/components/ChangePasswordModal";
import { CompanyProfileDrawer } from "../CompanyProfileDrawer";
import { useCompanyProfile } from "../../api/companyProfileApi";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { NavItem } from "./SidebarPrimitives";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Car,
  Network,
  Factory,
  Shield,
  History,
  Key,
  Receipt,
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
  const [companyProfileOpen, setCompanyProfileOpen] = useState(false);

  const { data: companyProfile } = useCompanyProfile();

  const t = useT();
  const displayName =
    employee?.full_name ?? employee?.email ?? t("nav.bottom.userFallback");
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
            <div
              className="sidebar-logo-wrap flex items-center gap-2 overflow-hidden flex-1 min-w-0 transition-all duration-[220ms] cursor-pointer hover:opacity-80"
              onClick={() => setCompanyProfileOpen(true)}
              title={t("Hồ sơ công ty")}
            >
              <div className="w-8 h-8 min-w-[32px] bg-primary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {companyProfile?.logo ? (
                  <img
                    src={companyProfile.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-[18px] h-[18px] fill-primary-fg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-semibold text-sm leading-tight whitespace-nowrap text-foreground overflow-hidden text-ellipsis">
                  {companyProfile?.company_name || t("nav.appName")}
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
            {/* <div className="sidebar-nav-section py-2">
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
            </div> */}

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

            {__APP_ENV__ !== "klotus-production" && (
              <>
                {/* Manufacturing / BOM / Production */}
                <div className="sidebar-nav-section py-2">
                  <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                    {t("nav.sections.manufacturing")}
                  </div>
                  {/* <NavItem
                collapsed={c}
                icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.mfgVehicles")}
                active={currentPage === "mfg-vehicles"}
                onClick={() => navTo("mfg-vehicles")}
                contextPage="mfg-vehicles"
              /> */}
                  <NavItem
                    collapsed={c}
                    icon={
                      <Network className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label={t("nav.items.erpBom")}
                    active={currentPage === "erp-bom"}
                    onClick={() => navTo("erp-bom")}
                    contextPage="erp-bom"
                  />
                  <NavItem
                    collapsed={c}
                    icon={
                      <Factory className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label={t("nav.items.erpProduction")}
                    active={currentPage === "erp-production"}
                    onClick={() => navTo("erp-production")}
                    contextPage="erp-production"
                  />
                </div>
                {/* Kế toán */}
                <div className="sidebar-nav-section py-2">
                  <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                    Kế toán
                  </div>
                  <NavItem
                    collapsed={c}
                    icon={
                      <Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label="Hóa đơn"
                    active={currentPage === "erp-invoices"}
                    onClick={() => navTo("erp-invoices")}
                    contextPage="erp-invoices"
                  />
                </div>
                {/* Hệ thống / Admin */}
                <div className="sidebar-nav-section py-2">
                  <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                    Hệ thống
                  </div>
                  <NavItem
                    collapsed={c}
                    icon={
                      <Users className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label={t("nav.items.erpEmployees")}
                    active={currentPage === "erp-employees"}
                    onClick={() => navTo("erp-employees")}
                    contextPage="erp-employees"
                  />
                  <NavItem
                    collapsed={c}
                    icon={
                      <Shield className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label="Quản lý người dùng"
                    active={currentPage === "erp-users"}
                    onClick={() => navTo("erp-users")}
                    contextPage="erp-users"
                  />
                  <NavItem
                    collapsed={c}
                    icon={<Key className="w-4 h-4 opacity-65 flex-shrink-0" />}
                    label="Phân quyền (Core)"
                    active={currentPage === "erp-permissions-core"}
                    onClick={() => navTo("erp-permissions-core")}
                    contextPage="erp-permissions-core"
                  />
                  <NavItem
                    collapsed={c}
                    icon={
                      <History className="w-4 h-4 opacity-65 flex-shrink-0" />
                    }
                    label="Nhật ký hoạt động"
                    active={currentPage === "erp-activity-logs"}
                    onClick={() => navTo("erp-activity-logs")}
                    contextPage="erp-activity-logs"
                  />
                </div>
              </>
            )}
          </div>

          {/* Bottom: user menu */}
          <div className="sidebar-bottom flex flex-col flex-shrink-0 border-t border-border p-[10px]">
            <div
              className={cn(
                "overflow-hidden",
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
      <CompanyProfileDrawer
        open={companyProfileOpen}
        onClose={() => setCompanyProfileOpen(false)}
      />
    </TooltipProvider>
  );
}
