import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Bell, ChevronsUpDown } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useT } from "@/core/i18n";
import type { PageKey } from "@/shared/types";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";
import {
  V2EnvStamp,
  type V2BreadcrumbItem,
  V2UniversalSearchModal,
  V2NotificationPopover,
  V2UserMenu,
  V2Button,
  V2Text,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { useV2AdaptedNavSections } from "./adapters/useV2AdaptedNavSections";
import { useV2AdaptedTabs } from "./adapters/useV2AdaptedTabs";
import { useEnsureValidCurrentBranch } from "./hooks/useEnsureValidCurrentBranch";
import { CompanyProfileDrawer } from "../CompanyProfileDrawer";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { GlobalSettingsDrawer } from "./GlobalSettingsDrawer";
import { useQuery } from "@tanstack/react-query";
import {
  notificationsApi,
  type CoreNotification,
} from "@/core/api/notifications";
import { resolveNotificationHref } from "@/v2/app/router/notificationTargetRoutes";
import { navigateV2Url } from "@/v2/shared/utils/v2Url";

interface V2ShellLayoutProps {
  children: React.ReactNode;
}

export function V2ShellLayout({ children }: V2ShellLayoutProps) {
  const {
    currentPage,
    sidebarCollapsed,
    toggleSidebar,
    navigate,
    companyProfileOpen,
    setCompanyProfileOpen,
    appTheme,
    setAppTheme,
  } = useAppStore();
  const { employee, profile } = useAuthStore();
  const { data: companyProfile } = useCompanyProfile();
  const t = useT();
  useEnsureValidCurrentBranch();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.findAll,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /** Bấm thông báo có đích được hỗ trợ thì mở đúng chứng từ; không thì chỉ đánh dấu đã đọc. */
  const handleNotificationClick = useCallback((notif: CoreNotification) => {
    const href = resolveNotificationHref(
      notif.target,
      window.location.pathname,
    );
    if (href) navigateV2Url(href);
  }, []);

  const sections = useV2AdaptedNavSections();
  const { tabs, activeTabId, handleTabSelect, handleTabClose } =
    useV2AdaptedTabs();

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayName =
    employee?.full_name ??
    employee?.email ??
    profile?.email ??
    t("nav.bottom.userFallback", "Quản trị viên");
  const branchName =
    companyProfile?.company_name ||
    t("v2.topbar.mainBranch", "Chi nhánh chính");
  const tenantName = companyProfile?.company_name || "Enterprise Ecosystem";

  const av = displayName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const handleNavigate = useCallback(
    (item: { id: string }) => {
      navigate(item.id as PageKey);
    },
    [navigate],
  );

  // Dynamic Breadcrumb resolver based on currentPage
  const breadcrumbs: V2BreadcrumbItem[] = useMemo(() => {
    switch (currentPage) {
      case "dashboard":
        return [{ label: t("nav.items.dashboard", "Tổng quan") }];
      case "sales-report-dashboard":
        return [
          { label: t("nav.sections.sales", "Bán hàng") },
          { label: t("nav.items.salesReportDashboard", "Báo cáo bán hàng") },
        ];
      case "erp-sales-orders":
        return [
          { label: t("nav.sections.sales", "Bán hàng") },
          { label: t("nav.items.erpSalesOrders", "Đơn bán hàng") },
        ];
      case "erp-customers":
        return [
          { label: t("nav.sections.sales", "Bán hàng") },
          { label: t("nav.items.customers", "Khách hàng") },
        ];
      case "after-sales":
        return [
          { label: t("nav.sections.sales", "Bán hàng") },
          { label: t("nav.items.afterSales", "Sau bán hàng") },
        ];
      case "purchasing":
        return [
          { label: t("nav.sections.purchasing", "Mua hàng") },
          { label: t("nav.items.purchasing", "Quản lý mua hàng") },
        ];
      case "erp-suppliers":
        return [
          { label: t("nav.sections.purchasing", "Mua hàng") },
          { label: t("nav.items.suppliers", "Nhà cung cấp") },
        ];
      case "inventory-dashboard":
        return [
          { label: t("nav.sections.inventory", "Kho") },
          { label: t("nav.items.inventoryDashboard", "Tổng quan kho") },
        ];
      case "erp-inventory-stock":
        return [
          { label: t("nav.sections.inventory", "Kho") },
          { label: t("nav.items.erpInventoryStock", "Tồn kho") },
        ];
      case "erp-inventory-vouchers":
        return [
          { label: t("nav.sections.inventory", "Kho") },
          { label: t("nav.items.erpInventoryVouchers", "Chứng từ kho") },
        ];
      case "erp-inventory-tracking":
        return [
          { label: t("nav.sections.inventory", "Kho") },
          {
            label: t(
              "nav.items.erpInventoryTrackingGroup",
              "Theo dõi hàng hoá",
            ),
          },
        ];
      case "erp-bom":
        return [
          { label: t("nav.sections.manufacturing", "Sản xuất") },
          { label: t("nav.items.erpBom", "Định mức BOM") },
        ];
      case "erp-production":
        return [
          { label: t("nav.sections.manufacturing", "Sản xuất") },
          { label: t("nav.items.erpProduction", "Lệnh sản xuất") },
        ];
      case "garage-dashboard":
      case "garage-cases":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageCases", "Hoạt động garage") },
        ];
      case "garage-stock-vouchers":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageStockVouchers", "Chứng từ kho Garage") },
        ];
      case "garage-stock-balances":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageStockBalances", "Tồn kho Garage") },
        ];
      case "garage-procurement":
        return [
          { label: t("nav.sections.garage", "Garage") },
          {
            label: t("nav.items.garageProcurement", "Mua hàng Garage"),
          },
        ];
      case "garage-cashflow":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageCashflow", "Thu chi garage") },
        ];
      case "garage-debts":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageDebts", "Công nợ garage") },
        ];
      case "garage-opex":
        return [
          { label: t("nav.sections.garage", "Garage") },
          { label: t("nav.items.garageOpex", "Chi phí vận hành") },
        ];
      case "vinfast-parts-stock":
        return [
          { label: t("nav.sections.vinfast", "Vinfast") },
          { label: t("nav.items.vinfastPartsGroup", "Phụ tùng Vinfast") },
        ];
      case "cashflow":
        return [
          { label: t("nav.sections.accounting", "Kế toán") },
          { label: t("nav.items.cashflow", "Dòng tiền") },
        ];
      case "erp-invoices":
        return [
          { label: t("nav.sections.accounting", "Kế toán") },
          { label: t("nav.items.invoices", "Hóa đơn") },
        ];
      case "invoice-debts":
        return [
          { label: t("nav.sections.accounting", "Kế toán") },
          { label: t("nav.items.debts", "Công nợ") },
        ];
      case "custom-fields":
        return [
          { label: t("nav.sections.settings", "Thiết lập") },
          { label: t("nav.items.customFields", "Trường tùy chỉnh") },
        ];
      case "settings-branch":
        return [
          { label: t("nav.sections.settings", "Thiết lập") },
          { label: t("thietlap.tabs.chi-nhanh", "Chi nhánh") },
        ];
      case "sys-tags":
        return [
          { label: t("nav.sections.settings", "Thiết lập") },
          { label: t("nav.items.sysTags", "Tags") },
        ];
      case "permission":
      case "erp-permissions-core":
        return [
          { label: t("breadcrumb.settings", "Hệ thống") },
          { label: t("breadcrumb.phanquyen", "Phân quyền & Vai trò") },
        ];
      case "erp-users":
        return [
          { label: t("breadcrumb.settings", "Hệ thống") },
          { label: t("breadcrumb.users", "Quản lý người dùng") },
        ];
      case "erp-activity-logs":
        return [
          { label: t("breadcrumb.settings", "Hệ thống") },
          { label: t("breadcrumb.activitylog", "Nhật ký hoạt động") },
        ];
      case "loans":
        return [
          { label: t("breadcrumb.tools", "Công cụ") },
          { label: t("nav.items.loans", "Khoản vay & Lãi suất") },
        ];
      default:
        return [
          { label: t("nav.items.dashboard", "Tổng quan") },
          { label: String(currentPage) },
        ];
    }
  }, [currentPage, t]);

  const userMenuNode = useCallback(
    ({ collapsed = false }: { collapsed?: boolean } = {}) => (
      <V2UserMenu
        onOpenProfile={() => setUserProfileOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-1 py-[7px] rounded-lg hover:bg-accent/50 cursor-pointer transition-colors",
            collapsed ? "justify-center w-full" : "flex-1 min-w-0",
          )}
        >
          <div className="w-[22px] h-[22px] min-w-[22px] bg-primary rounded-full flex items-center justify-center text-primary-foreground text-[8px] font-semibold flex-shrink-0">
            {av}
          </div>
          {!collapsed && (
            <>
              <V2Text
                as="span"
                variant="body-sm"
                truncate
                className="text-muted-fg font-medium flex-1 min-w-0 hidden sm:inline"
              >
                {displayName}
              </V2Text>
              <ChevronsUpDown className="w-3.5 h-3.5 text-faint flex-shrink-0 opacity-70 hidden sm:inline" />
            </>
          )}
        </div>
      </V2UserMenu>
    ),
    [av, displayName],
  );

  const notificationNode = (
    <V2NotificationPopover
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
    >
      <V2Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("v2.notifications.title", "Thông báo")}
        className="relative w-8 h-8 rounded-lg text-muted-fg hover:text-foreground hover:bg-accent/60 p-0"
      >
        <Bell className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-foreground/85 hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
        )}
      </V2Button>
    </V2NotificationPopover>
  );

  return (
    <>
      <V2EnvStamp />
      <V2AppLayout
        activeNavId={currentPage}
        sections={sections}
        tabs={tabs}
        activeTabId={activeTabId}
        onNavigate={handleNavigate}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        breadcrumbs={breadcrumbs}
        appName={t("nav.appName", "Hệ thống ERP")}
        logoUrl={companyProfile?.logo || undefined}
        branchName={branchName}
        tenantName={tenantName}
        contentClassName="pb-10"
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        userMenuNode={userMenuNode}
        notificationNode={notificationNode}
        currentTheme={appTheme}
        onThemeChange={setAppTheme}
        onClickLogo={() => setCompanyProfileOpen(true)}
        onSearchClick={() => setSearchModalOpen(true)}
        onBranchClick={() => setCompanyProfileOpen(true)}
      >
        {children}
      </V2AppLayout>

      {/* Global Modals */}
      <V2UniversalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelect={(item) => {
          navigate(item.id as PageKey);
          setSearchModalOpen(false);
        }}
      />

      <CompanyProfileDrawer
        open={companyProfileOpen}
        onClose={() => setCompanyProfileOpen(false)}
      />

      <UserProfileModal
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />

      <GlobalSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
