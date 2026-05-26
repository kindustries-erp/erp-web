import { useState } from "react";
import { Paperclip, Book, Wallet } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { ChangePasswordModal } from "@/modules/auth/components/ChangePasswordModal";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  useHasAnyPermission,
  useHasPermission,
} from "@/shared/hooks/useHasPermission";
import { NavItem, NavGroup, NavGroupItem } from "./SidebarPrimitives";
import {
  IconActivity,
  IconBox,
  IconCart,
  IconChevronLeft,
  IconDollar,
  IconFileText,
  IconGitBranch,
  IconGrid,
  IconPeople,
  IconPin,
  IconPkg,
  IconShield,
  IconShop,
  IconUser,
} from "./sidebarIcons";
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
  const displayName = employee?.full_name ?? t("nav.bottom.userFallback");
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

  const isThietLapQuy = currentPage === "settings-cash-fund";
  const isThietLapNH = currentPage === "settings-bank";
  const isThietLapTK = currentPage === "settings-accounts";
  const isThietLapBranch = currentPage === "settings-branch";
  const isThietLapGroup =
    isThietLapQuy || isThietLapNH || isThietLapTK || isThietLapBranch;
  const isPartners = currentPage === "partners";
  const isInCongNoGroup = ["receivables", "payables"].includes(currentPage);
  const isInBaoCaoGroup = ["ledger", "journal"].includes(currentPage);
  const isHoaDonDienTu = currentPage === "e-invoice";
  // ── Permission gates (hide sections the current session cannot access) ──
  const canFinance = useHasAnyPermission([
    "payment_vouchers",
    "cash_funds",
    "company_bank_accounts",
    "erp_chart_of_accounts",
  ]);
  const canCongNo = useHasPermission("partner_ledger_items", "read");
  const canHR = useHasAnyPermission([
    "erp_employees",
    "erp_departments",
    "erp_positions",
  ]);
  const canPartners = useHasPermission("erp_business_partners");
  const canActivityLog = useHasPermission("directus_activity");
  const canRBAC = useHasPermission("directus_roles");

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

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="sidebar-nav-section py-2">
              <NavItem
                collapsed={c}
                icon={<IconGrid />}
                label={t("nav.items.dashboard")}
                active={currentPage === "dashboard"}
                onClick={() => navTo("dashboard")}
                contextPage="dashboard"
              />
            </div>

            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap transition-all duration-150">
                {t("nav.sections.accounting")}
              </div>

              {canFinance && (
                <NavGroup
                  icon={<IconDollar />}
                  label={t("nav.items.cashflow")}
                  active={[
                    "cashflow",
                    "cashflow-vouchers",
                    "cash-fund",
                    "bank-deposit",
                  ].includes(currentPage)}
                  collapsed={c}
                >
                  <NavGroupItem
                    label={t("nav.items.cashflowOverview")}
                    active={currentPage === "cashflow"}
                    onClick={() => navTo("cashflow")}
                    contextPage="cashflow"
                  />
                  <NavGroupItem
                    label={t("nav.items.cashflowVouchers")}
                    active={currentPage === "cashflow-vouchers"}
                    onClick={() => navTo("cashflow-vouchers")}
                    contextPage="cashflow-vouchers"
                  />
                  <NavGroupItem
                    label={t("nav.items.cashflowCash")}
                    active={currentPage === "cash-fund"}
                    onClick={() => navTo("cash-fund")}
                    contextPage="cash-fund"
                  />
                  <NavGroupItem
                    label={t("nav.items.cashflowBankShort")}
                    active={currentPage === "bank-deposit"}
                    onClick={() => navTo("bank-deposit")}
                    contextPage="bank-deposit"
                  />
                </NavGroup>
              )}

              {canCongNo && (
                <NavGroup
                  icon={<IconBox />}
                  label={t("nav.items.debt")}
                  active={isInCongNoGroup}
                  collapsed={c}
                >
                  <NavGroupItem
                    label={t("nav.items.debtReceivable")}
                    active={currentPage === "receivables"}
                    onClick={() => navTo("receivables")}
                    contextPage="receivables"
                  />
                  <NavGroupItem
                    label={t("nav.items.debtPayable")}
                    active={currentPage === "payables"}
                    onClick={() => navTo("payables")}
                    contextPage="payables"
                  />
                </NavGroup>
              )}

              {canFinance && (
                <NavItem
                  collapsed={c}
                  icon={<IconFileText />}
                  label={t("nav.items.hoadondientu")}
                  active={isHoaDonDienTu}
                  onClick={() => navTo("e-invoice")}
                  contextPage="e-invoice"
                />
              )}

              {canFinance && (
                <NavGroup
                  icon={<Book className="h-4 w-4" />}
                  label={t("nav.items.report")}
                  active={isInBaoCaoGroup}
                  collapsed={c}
                >
                  <NavGroupItem
                    label={t("nav.items.reportJournal")}
                    active={currentPage === "journal"}
                    onClick={() => navTo("journal")}
                    contextPage="journal"
                  />
                  <NavGroupItem
                    label={t("nav.items.reportLedger")}
                    active={currentPage === "ledger"}
                    onClick={() => navTo("ledger")}
                    contextPage="ledger"
                  />
                </NavGroup>
              )}

              {canPartners && (
                <NavItem
                  collapsed={c}
                  icon={<IconPeople />}
                  label={t("nav.items.partners")}
                  active={isPartners}
                  onClick={() => navTo("partners")}
                  contextPage="partners"
                />
              )}

              {canHR && (
                <NavGroup
                  icon={<IconUser />}
                  label={t("nav.items.hr")}
                  active={["employees", "departments", "positions"].includes(
                    currentPage,
                  )}
                  collapsed={c}
                >
                  <NavGroupItem
                    label={t("nav.items.hrStaff")}
                    active={currentPage === "employees"}
                    onClick={() => navTo("employees")}
                    contextPage="employees"
                  />
                  <NavGroupItem
                    label={t("nav.items.hrDepts")}
                    active={currentPage === "departments"}
                    onClick={() => navTo("departments")}
                    contextPage="departments"
                  />
                  <NavGroupItem
                    label={t("nav.items.hrPositions")}
                    active={currentPage === "positions"}
                    onClick={() => navTo("positions")}
                    contextPage="positions"
                  />
                </NavGroup>
              )}

              {canFinance && (
                <NavItem
                  collapsed={c}
                  icon={<Paperclip className="h-4 w-4" />}
                  label={t("nav.items.cashflowAttachments")}
                  active={currentPage === "attachments"}
                  onClick={() => navTo("attachments")}
                  contextPage="attachments"
                />
              )}

              {canFinance && (
                <NavGroup
                  icon={<Wallet className="h-4 w-4" />}
                  label={t("nav.items.catalog")}
                  active={isThietLapGroup}
                  collapsed={c}
                >
                  <NavGroupItem
                    label={t("thietlap.tabs.chi-nhanh")}
                    active={currentPage === "settings-branch"}
                    onClick={() => navTo("settings-branch")}
                    contextPage="settings-branch"
                  />
                  <NavGroupItem
                    label={t("nav.items.catalogFunds")}
                    active={isThietLapQuy}
                    onClick={() => navTo("settings-cash-fund")}
                    contextPage="settings-cash-fund"
                  />
                  <NavGroupItem
                    label={t("nav.items.catalogBank")}
                    active={isThietLapNH}
                    onClick={() => navTo("settings-bank")}
                    contextPage="settings-bank"
                  />
                  <NavGroupItem
                    label={t("nav.items.catalogAccounts")}
                    active={isThietLapTK}
                    onClick={() => navTo("settings-accounts")}
                    contextPage="settings-accounts"
                  />
                </NavGroup>
              )}
            </div>

            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.sales")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconCart />}
                label={t("nav.items.sales")}
                active={currentPage === "sales"}
                onClick={() => navTo("sales")}
                contextPage="sales"
              />
              <NavItem
                collapsed={c}
                icon={<IconPeople />}
                label={t("nav.items.customers")}
                active={currentPage === "customers"}
                onClick={() => navTo("customers")}
                contextPage="customers"
              />
            </div>

            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.purchasing")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconShop />}
                label={t("nav.items.purchasing")}
                active={currentPage === "purchasing"}
                onClick={() => navTo("purchasing")}
                contextPage="purchasing"
              />
              <NavItem
                collapsed={c}
                icon={<IconFileText />}
                label={t("nav.items.operatingExpenses")}
                active={currentPage === "operating-expenses"}
                onClick={() => navTo("operating-expenses")}
                contextPage="operating-expenses"
              />
              <NavItem
                collapsed={c}
                icon={<IconBox />}
                label={t("nav.items.inventory")}
                active={currentPage === "inventory"}
                onClick={() => navTo("inventory")}
                contextPage="inventory"
              />
              <NavItem
                collapsed={c}
                icon={<IconPkg />}
                label={t("nav.items.suppliers")}
                active={currentPage === "suppliers"}
                onClick={() => navTo("suppliers")}
                contextPage="suppliers"
              />
            </div>

            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.manufacturing")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconBox />}
                label={t("nav.items.mfgItems")}
                active={currentPage === "mfg-items"}
                onClick={() => navTo("mfg-items")}
                contextPage="mfg-items"
              />
              <NavItem
                collapsed={c}
                icon={<IconFileText />}
                label={t("nav.items.mfgPo")}
                active={currentPage === "mfg-purchase-orders"}
                onClick={() => navTo("mfg-purchase-orders")}
                contextPage="mfg-purchase-orders"
              />
              <NavItem
                collapsed={c}
                icon={<IconCart />}
                label={t("nav.items.mfgVehicles")}
                active={currentPage === "mfg-vehicles"}
                onClick={() => navTo("mfg-vehicles")}
                contextPage="mfg-vehicles"
              />
            </div>

            {(canActivityLog || canRBAC) && (
              <div className="sidebar-nav-section py-2">
                <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
                  {t("nav.sections.system")}
                </div>
                {canActivityLog && (
                  <NavItem
                    collapsed={c}
                    icon={<IconActivity />}
                    label={t("nav.items.activitylog")}
                    active={currentPage === "activity-log"}
                    onClick={() => navTo("activity-log")}
                    contextPage="activity-log"
                  />
                )}
                {canRBAC && (
                  <NavItem
                    collapsed={c}
                    icon={<IconShield />}
                    label={t("nav.items.phanquyen")}
                    active={currentPage === "permissions"}
                    onClick={() => navTo("permissions")}
                    contextPage="permissions"
                  />
                )}
                <NavItem
                  collapsed={c}
                  icon={<IconGitBranch />}
                  label={t("nav.items.workflowcanvas")}
                  active={currentPage === "workflow"}
                  onClick={() => navTo("workflow")}
                  contextPage="workflow"
                />
              </div>
            )}
          </div>

          <div
            className={cn(
              "sidebar-bottom border-t border-border p-[10px] flex-shrink-0 overflow-hidden",
              c
                ? "flex flex-col items-center gap-[6px]"
                : "flex items-center gap-[6px]",
            )}
          >
            {/* Avatar + Name → opens user menu popover */}
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

            {/* Notification bell */}
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
