import { lazy, Suspense, useEffect, useRef } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Sidebar } from "@/core/components/layout/sidebar";
import { Topbar } from "@/core/components/layout/Topbar";
import { TabBar } from "@/core/components/layout/TabBar";
import { SlidePanel } from "@/shared/components/SlidePanel";
import { Toast } from "@/shared/components/Toast";
import { TopProgressBar } from "@/shared/components/TopProgressBar";
import { AppContextMenu } from "@/shared/components/ContextMenu";
import { DocumentDependencyModal } from "@/core/components/DocumentDependencyModal";
import { ReloadPrompt } from "@/ReloadPrompt";
import { pathToPage } from "@/shared/utils/pageUrl";
import { EnvStamp } from "@/core/components/EnvStamp";
import { GlobalErpDocumentOpener } from "@/core/components/GlobalErpDocumentOpener";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

import { PageKey } from "@/shared/types";

type PageLoader = () => Promise<unknown>;

const loadDashboard = () =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard }));
const Dashboard = lazy(loadDashboard);

const loadInventoryDashboard = () =>
  import("@/pages/InventoryDashboard").then((m) => ({
    default: m.InventoryDashboard,
  }));
const InventoryDashboard = lazy(loadInventoryDashboard);

const CashflowDashboard = lazy(() =>
  import("@/pages/CashflowDashboard").then((m) => ({
    default: m.CashflowDashboard,
  })),
);

const loadMuaHang = () =>
  import("@/pages/Purchasing").then((m) => ({ default: m.MuaHang }));
const MuaHang = lazy(loadMuaHang);

const loadInventoryStockPage = () =>
  import("@/pages/inventory/InventoryStockPage").then((m) => ({
    default: m.InventoryStockPage,
  }));
const InventoryStockPage = lazy(loadInventoryStockPage);

const loadInventoryTrackingPage = () =>
  import("@/pages/inventory/InventoryTrackingPage").then((m) => ({
    default: m.InventoryTrackingPage,
  }));
const InventoryTrackingPage = lazy(loadInventoryTrackingPage);

const loadInventoryVouchersPage = () =>
  import("@/pages/inventory/InventoryVouchersPage").then((m) => ({
    default: m.InventoryVouchersPage,
  }));
const InventoryVouchersPage = lazy(loadInventoryVouchersPage);
const MfgItems = lazy(() =>
  import("@/pages/MfgItems").then((m) => ({ default: m.MfgItems })),
);
const MfgVehicles = lazy(() =>
  import("@/pages/MfgVehicles").then((m) => ({ default: m.MfgVehicles })),
);
const ErpBomPage = lazy(() =>
  import("@/pages/ErpBomPage").then((m) => ({ default: m.ErpBomPage })),
);
const ErpProductionPage = lazy(() =>
  import("@/pages/ErpProductionPage").then((m) => ({
    default: m.ErpProductionPage,
  })),
);
const loadErpSalesOrdersPage = () =>
  import("@/pages/ErpSalesOrdersPage").then((m) => ({
    default: m.ErpSalesOrdersPage,
  }));
const ErpSalesOrdersPage = lazy(loadErpSalesOrdersPage);

const loadErpGoodsIssuesPage = () =>
  import("@/pages/ErpGoodsIssuesPage").then((m) => ({
    default: m.ErpGoodsIssuesPage,
  }));
const ErpGoodsIssuesPage = lazy(loadErpGoodsIssuesPage);
const InventoryUomPage = lazy(() =>
  import("@/pages/inventory/InventoryUomPage").then((m) => ({
    default: m.InventoryUomPage,
  })),
);
const InventoryItemTypesPage = lazy(() =>
  import("@/pages/inventory/InventoryItemTypesPage").then((m) => ({
    default: m.InventoryItemTypesPage,
  })),
);
const InventoryTrackingCategoriesPage = lazy(() =>
  import("@/pages/inventory/InventoryTrackingCategoriesPage").then((m) => ({
    default: m.InventoryTrackingCategoriesPage,
  })),
);
const ErpCustomersPage = lazy(() =>
  import("@/pages/ErpBusinessPartnersPage").then((m) => ({
    default: m.ErpCustomersPage,
  })),
);
const ErpSuppliersPage = lazy(() =>
  import("@/pages/ErpBusinessPartnersPage").then((m) => ({
    default: m.ErpSuppliersPage,
  })),
);
const ErpUsersPage = lazy(() =>
  import("@/pages/ErpUsersPage").then((m) => ({ default: m.ErpUsersPage })),
);
const ErpEmployeesPage = lazy(() =>
  import("@/pages/ErpEmployeesPage").then((m) => ({
    default: m.ErpEmployeesPage,
  })),
);
const ErpActivityLogsPage = lazy(() =>
  import("@/pages/ErpActivityLogsPage").then((m) => ({
    default: m.ErpActivityLogsPage,
  })),
);
const ErpPermissionsCorePage = lazy(() =>
  import("@/pages/ErpPermissionsCorePage").then((m) => ({
    default: m.ErpPermissionsCorePage,
  })),
);
const ErpInvoicesInPage = lazy(() =>
  import("@/pages/ErpInvoicesInPage").then((m) => ({
    default: m.ErpInvoicesInPage,
  })),
);
const ErpInvoicesOutPage = lazy(() =>
  import("@/pages/ErpInvoicesOutPage").then((m) => ({
    default: m.ErpInvoicesOutPage,
  })),
);
const InvoiceDashboard = lazy(() =>
  import("@/pages/InvoiceDashboard").then((m) => ({
    default: m.InvoiceDashboard,
  })),
);
const SysTagsPage = lazy(() =>
  import("@/pages/SysTagsPage").then((m) => ({ default: m.SysTagsPage })),
);
const BankStatementPage = lazy(() =>
  import("@/pages/BankStatementPage").then((m) => ({
    default: m.BankStatementPage,
  })),
);
const GeneralJournalPage = lazy(() =>
  import("@/pages/finance/GeneralJournalPage").then((m) => ({
    default: m.GeneralJournalPage,
  })),
);
const ChartOfAccountsPage = lazy(() =>
  import("@/pages/finance/ChartOfAccountsPage").then((m) => ({
    default: m.ChartOfAccountsPage,
  })),
);
const VinfastPartsTrackingPage = lazy(() =>
  import("@/pages/VinfastPartsTrackingPage").then((m) => ({
    default: m.VinfastPartsTrackingPage,
  })),
);
const VinfastPartsDashboardPage = lazy(() =>
  import("@/pages/VinfastPartsDashboardPage").then((m) => ({
    default: m.VinfastPartsDashboardPage,
  })),
);
const ThietLapNganHang = lazy(() =>
  import("@/pages/SettingsBankAccount").then((m) => ({
    default: m.ThietLapNganHang,
  })),
);
const ThietLapQuy = lazy(() =>
  import("@/pages/SettingsCashFund").then((m) => ({
    default: m.ThietLapQuy,
  })),
);
const SettingsBranch = lazy(() =>
  import("@/pages/SettingsBranch").then((m) => ({
    default: m.SettingsBranch,
  })),
);
const SalesReportDashboardPage = lazy(() =>
  import("@/pages/SalesReportDashboardPage").then((m) => ({
    default: m.SalesReportDashboardPage,
  })),
);
const PurchasingReportDashboardPage = lazy(() =>
  import("@/pages/PurchasingReportDashboardPage").then((m) => ({
    default: m.PurchasingReportDashboardPage,
  })),
);
const GarageDashboard = lazy(() =>
  import("@/modules/garage/pages/GarageDashboard").then((m) => ({
    default: m.GarageDashboard,
  })),
);
const GarageGrossProfit = lazy(() =>
  import("@/modules/garage/pages/GarageGrossProfit").then((m) => ({
    default: m.GarageGrossProfit,
  })),
);
const GarageCases = lazy(() =>
  import("@/modules/garage/pages/GarageCases").then((m) => ({
    default: m.GarageCases,
  })),
);
const GarageReceivables = lazy(() =>
  import("@/modules/garage/pages/GarageReceivables").then((m) => ({
    default: m.GarageReceivables,
  })),
);
const GaragePayables = lazy(() =>
  import("@/modules/garage/pages/GaragePayables").then((m) => ({
    default: m.GaragePayables,
  })),
);
const AfterSalesPage = lazy(() =>
  import("@/modules/after-sales/components/AfterSalesPage").then((m) => ({
    default: m.AfterSalesPage,
  })),
);

const PAGE_COMPONENTS: Partial<Record<PageKey, React.ElementType>> = {
  dashboard: Dashboard,
  "inventory-dashboard": InventoryDashboard,
  "cashflow-dashboard": CashflowDashboard,
  purchasing: MuaHang,
  "erp-inventory-stock": InventoryStockPage,
  "erp-inventory-tracking": InventoryTrackingPage,
  "erp-inventory-tracking-parts": () => (
    <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
      Tính năng Quản lý Serial Phụ tùng đang được phát triển...
    </div>
  ),
  "erp-inventory-vouchers": InventoryVouchersPage,
  "mfg-items": MfgItems,
  "mfg-vehicles": MfgVehicles,
  "erp-bom": ErpBomPage,
  "erp-production": ErpProductionPage,
  "erp-sales-orders": ErpSalesOrdersPage,
  "sales-report-dashboard": SalesReportDashboardPage,
  "erp-goods-issues": ErpGoodsIssuesPage,
  "erp-inventory-uom": InventoryUomPage,
  "erp-inventory-item-types": InventoryItemTypesPage,
  "erp-inventory-tracking-categories": InventoryTrackingCategoriesPage,
  "erp-suppliers": ErpSuppliersPage,
  "erp-customers": ErpCustomersPage,
  "erp-employees": ErpEmployeesPage,
  "erp-users": ErpUsersPage,
  "erp-activity-logs": ErpActivityLogsPage,
  "erp-permissions-core": ErpPermissionsCorePage,
  "erp-invoices-in": ErpInvoicesInPage,
  "erp-invoices-out": ErpInvoicesOutPage,
  "invoice-dashboard": InvoiceDashboard,
  "sys-tags": SysTagsPage,
  "bank-statement": () => <BankStatementPage type="bank" />,
  "cash-statement": () => <BankStatementPage type="cash" />,
  "journal-entry": GeneralJournalPage,
  "settings-accounts": ChartOfAccountsPage,
  "settings-bank": ThietLapNganHang,
  "settings-cash-fund": ThietLapQuy,
  "settings-branch": SettingsBranch,
  "garage-dashboard": GarageDashboard,
  "garage-cases": GarageCases,
  "garage-receivables": GarageReceivables,
  "garage-payables": GaragePayables,
  "garage-gross-profit": GarageGrossProfit,
  "after-sales": AfterSalesPage,
  "vinfast-parts": VinfastPartsTrackingPage,
  "vinfast-parts-dashboard": VinfastPartsDashboardPage,
  "vinfast-parts-oto": () => <VinfastPartsTrackingPage vehicleType="CAR" />,
  "vinfast-parts-xemay": () => (
    <VinfastPartsTrackingPage vehicleType="MOTORBIKE" />
  ),
  "purchasing-report-dashboard": PurchasingReportDashboardPage,
};

const PAGE_PRELOADERS: Partial<Record<PageKey, PageLoader>> = {
  dashboard: loadDashboard,
  "inventory-dashboard": loadInventoryDashboard,
  purchasing: loadMuaHang,
  "erp-inventory-stock": loadInventoryStockPage,
  "erp-inventory-tracking": loadInventoryTrackingPage,
  "erp-inventory-vouchers": loadInventoryVouchersPage,
  "erp-sales-orders": loadErpSalesOrdersPage,
  "erp-goods-issues": loadErpGoodsIssuesPage,
};

const HIGH_PRIORITY_PAGES: PageKey[] = [
  "dashboard",
  "purchasing",
  "erp-inventory-vouchers",
  "erp-sales-orders",
  "erp-goods-issues",
  "inventory-dashboard",
];

function preloadPage(page: PageKey) {
  const loader = PAGE_PRELOADERS[page];
  if (!loader) return Promise.resolve();
  return loader()
    .then(() => undefined)
    .catch(() => undefined);
}

function scheduleOnIdle(task: () => void) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = globalThis.setTimeout(task, 250);
  return () => globalThis.clearTimeout(timer);
}

const PAGE_FALLBACK = (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    Đang tải trang...
  </div>
);

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl, openTabs } = useAppStore();
  const { bootstrapAction } = useAuthStore();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openTabsKey = openTabs.join("|");

  useEffect(() => {
    bootstrapAction();
  }, []);

  useEffect(() => {
    const sync = () => {
      const parsed = pathToPage(location.pathname, location.search);
      if (parsed) {
        syncFromUrl(parsed.page);
      } else {
        history.replaceState(null, "", "/");
        syncFromUrl("dashboard");
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    el.scrollTop = 0;
  }, [currentPage]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const activePage = currentPage as PageKey;
    void preloadPage(activePage);

    return scheduleOnIdle(() => {
      const queue = HIGH_PRIORITY_PAGES.filter((p) => p !== activePage);
      void Promise.all(queue.map((p) => preloadPage(p)));
    });
  }, [isLoggedIn, currentPage]);

  useEffect(() => {
    if (!isLoggedIn || openTabs.length === 0) return;
    const tabsToWarm = [...new Set(openTabs)] as PageKey[];

    return scheduleOnIdle(() => {
      void Promise.all(tabsToWarm.map((page) => preloadPage(page)));
    });
  }, [isLoggedIn, openTabsKey]);

  function keepContentXLocked() {
    const el = contentRef.current;
    if (el && el.scrollLeft !== 0) el.scrollLeft = 0;
  }

  if (!isLoggedIn) return <Login />;

  return (
    <TooltipProvider>
      <div className="app-shell flex h-screen w-full overflow-hidden text-foreground">
        <EnvStamp />
        <Sidebar />
        <div className="right-panel relative">
          <Topbar />
          <div
            ref={contentRef}
            onScroll={keepContentXLocked}
            className="app-content flex-1 overflow-x-hidden overflow-y-auto pb-10"
          >
            <>
              {openTabs.map((tab) => {
                const Component = PAGE_COMPONENTS[tab as PageKey];
                if (!Component) return null;
                return (
                  <div
                    key={tab}
                    className={currentPage === tab ? "block h-full" : "hidden"}
                  >
                    <Suspense fallback={PAGE_FALLBACK}>
                      <Component />
                    </Suspense>
                  </div>
                );
              })}
              {!PAGE_COMPONENTS[currentPage as PageKey] && <NotFound />}
            </>
          </div>
          <TabBar />
        </div>
        <SlidePanel />
        <TopProgressBar />
        <Toast />
        <ReloadPrompt />
        <AppContextMenu />
        <DocumentDependencyModal />
        <GlobalErpDocumentOpener />
      </div>
    </TooltipProvider>
  );
}
