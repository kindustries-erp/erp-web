import { useRef, useState } from "react";
import {
  useAppStore,
  SECTION_ROOTS,
  STATIC_TABS,
} from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { ChangePasswordModal } from "@/modules/auth/components/ChangePasswordModal";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { useHasAnyPermission, useHasPermission } from "@/shared/hooks/useHasPermission";

// ── Icons ──
const IconGrid = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconDollar = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconBox = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const IconFileText = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
  </svg>
);
const IconList = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
  </svg>
);
const IconUser = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCart = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconShop = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
  </svg>
);
const IconPkg = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8l-2 4h12z" />
  </svg>
);
const IconActivity = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconShield = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconPeople = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBuilding = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 22V12h6v10" />
    <path d="M8 7h1m3 0h1m-5 4h1m3 0h1" />
  </svg>
);
const IconBriefcase = () => (
  <svg
    className="w-4 h-4 opacity-65 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8l-2 4h12z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ display: "inline" }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 17v5" />
    <path d="M5 17h14" />
    <path d="M7 9v8h10V9" />
    <path d="M9 9V3h6v6" />
  </svg>
);
const IconGlobe = () => (
  <svg
    className="w-[18px] h-[18px] flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconSun = () => (
  <svg
    className="w-[18px] h-[18px] flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const IconMoon = () => (
  <svg
    className="w-[18px] h-[18px] flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSettings = () => (
  <svg
    className="w-[18px] h-[18px] flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ── Sub-nav row ──
function SubItem({
  label,
  pageKey,
  tabKey,
  active,
  onClick,
}: {
  label: string;
  pageKey?: PageKey;
  tabKey?: string;
  active: boolean;
  onClick?: () => void;
}) {
  const onContextMenu = usePageContextMenu(
    pageKey ?? "dashboard",
    label,
    tabKey,
  );
  return (
    <div
      className={cn(
        "py-[6px] pl-3 pr-4 cursor-pointer text-sm whitespace-nowrap overflow-hidden",
        "text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground",
        active && "!text-foreground font-medium",
      )}
      onClick={onClick}
      onContextMenu={pageKey ? onContextMenu : undefined}
    >
      {label}
    </div>
  );
}

// ── Collapsible sub-nav ──
function SubNav({
  id,
  children,
  expanded,
}: {
  id: string;
  children: React.ReactNode;
  expanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      id={id}
      className="sub-nav-el overflow-hidden"
      style={{ maxHeight: expanded ? (ref.current?.scrollHeight ?? 300) : 0 }}
    >
      {/* Vertical tree line aligned under parent icon center (px-[14px] + 8px half-icon = 22px) */}
      <div className="ml-[22px] border-l border-[color:var(--border)] py-[3px]">
        {children}
      </div>
    </div>
  );
}

// ── Nav item ──
function NavItem({
  icon,
  label,
  active,
  onClick,
  hasArrow,
  expanded,
  collapsed,
  contextPage,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasArrow?: boolean;
  expanded?: boolean;
  collapsed?: boolean;
  contextPage?: PageKey;
}) {
  const onContextMenu = usePageContextMenu(contextPage ?? "dashboard", label);
  return (
    <Tooltip content={label} disabled={!collapsed}>
      <div
        className={cn(
          "flex items-center gap-2 px-[14px] py-[7px] cursor-pointer whitespace-nowrap overflow-hidden min-h-[34px]",
          "text-[color:var(--muted-fg)] hover:bg-surface-hover",
          active && "bg-[color:var(--muted)] text-foreground font-medium",
        )}
        onClick={onClick}
        onContextMenu={contextPage ? onContextMenu : undefined}
      >
        <span className="nav-icon flex-shrink-0">{icon}</span>
        <span className="nav-label hide-on-collapse text-sm overflow-hidden whitespace-nowrap flex-1 transition-all duration-150">
          {label}
        </span>
        {hasArrow && (
          <span
            className={cn(
              "nav-arrow-el ml-auto text-[10px] text-[color:var(--faint)] flex-shrink-0 transition-transform duration-200",
              expanded && "rotate-90",
            )}
          >
            <IconChevronRight />
          </span>
        )}
      </div>
    </Tooltip>
  );
}

export function Sidebar() {
  const {
    currentPage,
    sidebarCollapsed,
    mobileSidebarOpen,
    navigate,
    toggleSidebar,
    setMobileSidebarOpen,
    settingsActiveTab,
  } = useAppStore();
  const { logoutAction, employee } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  const t = useT();
  const displayName = employee?.full_name ?? t("nav.bottom.userFallback");
  const av = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const isInDongTienGroup = [
    "dongtien",
    "tienmat",
    "tiengui",
    "dinhkem",
  ].includes(currentPage);
  const isThietLap = currentPage === "thietlap";
  const isPartners = currentPage === "doitac";
  const isInCongNoGroup = ["phaithu", "phaittra"].includes(currentPage);
  const isInBaoCaoGroup = ["socat", "nhatkyechung"].includes(currentPage);
  const [dongtienOpen, setDongtienOpen] = useState(isInDongTienGroup);
  const [thietlapOpen, setThietlapOpen] = useState(isThietLap);
  const [congnoOpen, setCongnoOpen] = useState(isInCongNoGroup);
  const [baocaoOpen, setBaocaoOpen] = useState(isInBaoCaoGroup);
  // ── Permission gates (hide sections the current session cannot access) ──
  const canFinance = useHasAnyPermission([
    "payment_vouchers",
    "cash_funds",
    "company_bank_accounts",
    "chart_of_accounts",
  ]);
  const canCongNo = useHasPermission("partner_ledger_items", "read");
  const canHR = useHasAnyPermission([
    "employees",
    "departments",
    "positions",
  ]);
  const canPartners = useHasPermission("business_partners");
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
        {/* Mobile overlay */}
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
          {/* Logo row */}
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
                <span className="text-xs text-[color:var(--muted-fg)] whitespace-nowrap">
                  {t("nav.appSubtitle")}
                </span>
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

          {/* Nav scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Kế toán */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.07em] mb-[2px] whitespace-nowrap transition-all duration-150">
                {t("nav.sections.accounting")}
              </div>

              <NavItem
                collapsed={c}
                icon={<IconGrid />}
                label={t("nav.items.dashboard")}
                active={currentPage === "dashboard"}
                onClick={() => navTo("dashboard")}
                contextPage="dashboard"
              />

              {canFinance && <>
              <NavItem
                collapsed={c}
                icon={<IconDollar />}
                label={t("nav.items.cashflow")}
                active={isInDongTienGroup}
                onClick={() => setDongtienOpen((o) => !o)}
                hasArrow
                expanded={dongtienOpen || isInDongTienGroup}
              />
              <SubNav
                id="sub-dongtien"
                expanded={dongtienOpen || isInDongTienGroup}
              >
                <SubItem
                  label={t("nav.items.cashflowOverview")}
                  pageKey="dongtien"
                  active={currentPage === "dongtien"}
                  onClick={() => navTo("dongtien")}
                />
                <SubItem
                  label={t("nav.items.cashflowCash")}
                  pageKey="tienmat"
                  active={currentPage === "tienmat"}
                  onClick={() => navTo("tienmat")}
                />
                <SubItem
                  label={t("nav.items.cashflowBank")}
                  pageKey="tiengui"
                  active={currentPage === "tiengui"}
                  onClick={() => navTo("tiengui")}
                />
                <SubItem
                  label={t("nav.items.cashflowAttachments")}
                  pageKey="dinhkem"
                  active={currentPage === "dinhkem"}
                  onClick={() => navTo("dinhkem")}
                />
              </SubNav>
              </>}

              {canCongNo && <>
              <NavItem
                collapsed={c}
                icon={<IconBox />}
                label={t("nav.items.debt")}
                hasArrow
                active={isInCongNoGroup}
                expanded={congnoOpen || isInCongNoGroup}
                onClick={() => setCongnoOpen((o) => !o)}
              />
              <SubNav id="sub-congno" expanded={congnoOpen || isInCongNoGroup}>
                <SubItem
                  label={t("nav.items.debtReceivable")}
                  pageKey="phaithu"
                  active={currentPage === "phaithu"}
                  onClick={() => navTo("phaithu")}
                />
                <SubItem
                  label={t("nav.items.debtPayable")}
                  pageKey="phaittra"
                  active={currentPage === "phaittra"}
                  onClick={() => navTo("phaittra")}
                />
              </SubNav>
              </>}

              {canFinance && <>
              <NavItem
                collapsed={c}
                icon={<IconFileText />}
                label={t("nav.items.report")}
                hasArrow
                active={isInBaoCaoGroup}
                expanded={baocaoOpen || isInBaoCaoGroup}
                onClick={() => setBaocaoOpen((o) => !o)}
              />
              <SubNav id="sub-baocao" expanded={baocaoOpen || isInBaoCaoGroup}>
                <SubItem
                  label={t("nav.items.reportLedger")}
                  pageKey="socat"
                  active={currentPage === "socat"}
                  onClick={() => navTo("socat")}
                />
                <SubItem
                  label={t("nav.items.reportJournal")}
                  pageKey="nhatkyechung"
                  active={currentPage === "nhatkyechung"}
                  onClick={() => navTo("nhatkyechung")}
                />
              </SubNav>

              <NavItem
                collapsed={c}
                icon={<IconList />}
                label={t("nav.items.catalog")}
                active={isThietLap}
                onClick={() => setThietlapOpen((o) => !o)}
                hasArrow
                expanded={thietlapOpen || isThietLap}
              />
              <SubNav id="sub-thietlap" expanded={thietlapOpen || isThietLap}>
                <SubItem
                  label={t("nav.items.catalogFunds")}
                  pageKey="thietlap"
                  tabKey="quy"
                  active={isThietLap && settingsActiveTab === "quy"}
                  onClick={() => {
                    navigate("thietlap", "quy");
                    setMobileSidebarOpen(false);
                  }}
                />
                <SubItem
                  label={t("nav.items.catalogBank")}
                  pageKey="thietlap"
                  tabKey="nh"
                  active={isThietLap && settingsActiveTab === "nh"}
                  onClick={() => {
                    navigate("thietlap", "nh");
                    setMobileSidebarOpen(false);
                  }}
                />
                <SubItem
                  label={t("nav.items.catalogAccounts")}
                  pageKey="thietlap"
                  tabKey="tk"
                  active={isThietLap && settingsActiveTab === "tk"}
                  onClick={() => {
                    navigate("thietlap", "tk");
                    setMobileSidebarOpen(false);
                  }}
                />
              </SubNav>
              </>}

              {canPartners && <NavItem
                collapsed={c}
                icon={<IconPeople />}
                label={t("nav.items.partners")}
                active={isPartners}
                onClick={() => navTo("doitac")}
                contextPage="doitac"
              />}
            </div>

            {/* Nhân sự */}
            {canHR && <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.07em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.hr")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconUser />}
                label={t("nav.items.hrStaff")}
                active={currentPage === "nhansu"}
                onClick={() => navTo("nhansu")}
                contextPage="nhansu"
              />
              <NavItem
                collapsed={c}
                icon={<IconBuilding />}
                label={t("nav.items.hrDepts")}
                active={currentPage === "phongban"}
                onClick={() => navTo("phongban")}
                contextPage="phongban"
              />
              <NavItem
                collapsed={c}
                icon={<IconBriefcase />}
                label={t("nav.items.hrPositions")}
                active={currentPage === "chucvu"}
                onClick={() => navTo("chucvu")}
                contextPage="chucvu"
              />
            </div>}

            {/* Bán hàng */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.07em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.sales")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconCart />}
                label={t("nav.items.sales")}
                active={currentPage === "banhang"}
                onClick={() => navTo("banhang")}
                contextPage="banhang"
              />
              <NavItem
                collapsed={c}
                icon={<IconPeople />}
                label={t("nav.items.customers")}
                active={currentPage === "khachhang"}
                onClick={() => navTo("khachhang")}
                contextPage="khachhang"
              />
            </div>

            {/* Mua hàng */}
            <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.07em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.purchasing")}
              </div>
              <NavItem
                collapsed={c}
                icon={<IconShop />}
                label={t("nav.items.purchasing")}
                active={currentPage === "muahang"}
                onClick={() => navTo("muahang")}
                contextPage="muahang"
              />
              <NavItem
                collapsed={c}
                icon={<IconPkg />}
                label={t("nav.items.suppliers")}
                active={currentPage === "nhacungcap"}
                onClick={() => navTo("nhacungcap")}
                contextPage="nhacungcap"
              />
            </div>

            {/* Hệ thống */}
            {(canActivityLog || canRBAC) && <div className="sidebar-nav-section py-2">
              <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.07em] mb-[2px] whitespace-nowrap">
                {t("nav.sections.system")}
              </div>
              {canActivityLog && <NavItem
                collapsed={c}
                icon={<IconActivity />}
                label={t("nav.items.activitylog")}
                active={currentPage === "activitylog"}
                onClick={() => navTo("activitylog")}
                contextPage="activitylog"
              />}
              {canRBAC && <NavItem
                collapsed={c}
                icon={<IconShield />}
                label={t("nav.items.phanquyen")}
                active={currentPage === "phanquyen"}
                onClick={() => navTo("phanquyen")}
                contextPage="phanquyen"
              />}
            </div>}
          </div>

          {/* Bottom */}
          <div className="sidebar-bottom border-t border-border p-[10px] flex-shrink-0 overflow-hidden flex flex-col gap-[2px]">
            {/* Settings row */}
            <Tooltip content={t("nav.bottom.settings")} disabled={!c}>
              <button
                onClick={() => setPwdOpen(true)}
                className="w-full flex items-center gap-2 px-1 py-[7px] cursor-pointer text-[color:var(--muted-fg)] text-xs font-medium rounded-lg border-none bg-transparent text-left hover:bg-surface-hover"
              >
                <IconSettings />
                <span className="hide-on-collapse whitespace-nowrap overflow-hidden transition-all duration-150">
                  {t("nav.bottom.settings")}
                </span>
              </button>
            </Tooltip>
            {/* User row */}
            {c ? (
              <>
                <Tooltip content={displayName} disabled={!c}>
                  <div
                    className="flex items-center px-1 py-[7px] rounded-lg hover:bg-surface-hover cursor-pointer"
                    onClick={() => setProfileOpen(true)}
                  >
                    <div className="w-[18px] h-[18px] min-w-[18px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[7px] font-semibold flex-shrink-0">
                      {av}
                    </div>
                  </div>
                </Tooltip>
                <Tooltip content={t("nav.bottom.logout")} disabled={!c}>
                  <button
                    onClick={logoutAction}
                    className="w-full flex items-center px-1 py-[7px] rounded-lg text-[color:var(--faint)] hover:text-foreground hover:bg-surface-hover border-none bg-transparent cursor-pointer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            ) : (
              <div
                className="flex flex-row items-center gap-2 px-1 py-[7px] rounded-lg hover:bg-surface-hover cursor-pointer"
                onClick={() => setProfileOpen(true)}
              >
                <div className="w-[18px] h-[18px] min-w-[18px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[7px] font-semibold flex-shrink-0">
                  {av}
                </div>
                <span className="text-xs font-medium text-[color:var(--muted-fg)] whitespace-nowrap overflow-hidden flex-1">
                  {displayName}
                </span>
                <button
                  className="flex items-center justify-center w-[18px] h-[18px] rounded-md text-[color:var(--faint)] hover:text-foreground hover:bg-[color:var(--muted)] border-none bg-transparent cursor-pointer flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    logoutAction();
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </aside>
      </>
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </TooltipProvider>
  );
}
