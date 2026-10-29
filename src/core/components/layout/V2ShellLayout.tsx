import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  V2Text,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { useV2AdaptedNavSections } from "./adapters/useV2AdaptedNavSections";
import { useV2AdaptedTabs } from "./adapters/useV2AdaptedTabs";
import { useEnsureValidCurrentBranch } from "./hooks/useEnsureValidCurrentBranch";
import { CompanyProfileDrawer } from "../CompanyProfileDrawer";
import { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
import { GlobalSettingsDrawer } from "./GlobalSettingsDrawer";
import { UserMenuPopover } from "./sidebar/components/UserMenuPopover";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/core/api/notifications";

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
      default:
        return [
          { label: t("nav.items.dashboard", "Tổng quan") },
          { label: String(currentPage) },
        ];
    }
  }, [currentPage, t]);

  const userMenuNode = useCallback(
    ({ collapsed = false }: { collapsed?: boolean } = {}) => (
      <UserMenuPopover
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
                className="text-muted-fg font-medium flex-1 min-w-0"
              >
                {displayName}
              </V2Text>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-faint flex-shrink-0 opacity-70"
                aria-hidden="true"
              >
                <polyline points="7 10 12 5 17 10" />
                <polyline points="7 14 12 19 17 14" />
              </svg>
            </>
          )}
        </div>
      </UserMenuPopover>
    ),
    [av, displayName],
  );

  const notificationNode = (
    <V2NotificationPopover notifications={notifications}>
      <div className="relative flex items-center justify-center w-[26px] h-[26px] min-w-[26px] rounded-md text-faint hover:text-foreground hover:bg-accent/50 cursor-pointer flex-shrink-0 transition-colors p-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-[2px] right-[2px] w-[6px] h-[6px] bg-destructive rounded-full" />
        )}
      </div>
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
