import { Suspense, useEffect, useRef } from "react";
import { lazyWithRetry as lazy } from "@/shared/utils/lazyWithRetry";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Sidebar } from "@/core/components/layout/sidebar";
import { Topbar } from "@/core/components/layout/Topbar";
import { TabBar } from "@/core/components/layout/TabBar";
import { SlidePanel } from "@/shared/components/SlidePanel";
import { SerialGenerationProgress } from "@/shared/components/SerialGenerationProgress";
import { useSerialGenerationProgress } from "@/modules/goods-receipts-core/hooks/useSerialGenerationProgress";
import { Toast } from "@/shared/components/Toast";
import { TopProgressBar } from "@/shared/components/TopProgressBar";
import { AppContextMenu } from "@/shared/components/ContextMenu";
import { DocumentDependencyModal } from "@/core/components/DocumentDependencyModal";
import { ReloadPrompt } from "@/ReloadPrompt";
import { pathToPage, pageToPath } from "@/shared/utils/pageUrl";
import { EnvStamp } from "@/core/components/EnvStamp";
import { useEnvStore } from "@/core/store/useEnvStore";
import { GlobalErpDocumentOpener } from "@/core/components/GlobalErpDocumentOpener";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { VinfastPartsTrackingPage } from "@/pages/VinfastPartsTrackingPage";
import { VinfastPartsStockPage } from "@/pages/VinfastPartsStockPage";
import { VinfastPartsOtoStockPage } from "@/pages/VinfastPartsOtoStockPage";
import { VinfastPartsMotoStockPage } from "@/pages/VinfastPartsMotoStockPage";

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

const InventoryTrackingPage = lazy(() =>
  import("@/pages/inventory/InventoryTrackingPage").then((m) => ({
    default: m.InventoryTrackingPage,
  })),
);
const InventoryTrackingPartsPage = lazy(() =>
  import("@/pages/inventory/InventoryTrackingPartsPage").then((m) => ({
    default: m.InventoryTrackingPartsPage,
  })),
);
const InventoryTrackingLotPage = lazy(() =>
  import("@/pages/inventory/InventoryTrackingLotPage").then((m) => ({
    default: m.InventoryTrackingLotPage,
  })),
);
const InventoryTrackingCustomPage = lazy(() =>
  import("@/pages/inventory/InventoryTrackingCustomPage").then((m) => ({
    default: m.InventoryTrackingCustomPage,
  })),
);

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
const EmailInboxPage = lazy(() =>
  import("@/pages/EmailInboxPage").then((m) => ({
    default: m.EmailInboxPage,
  })),
);
const ErpPermissionsCorePage = lazy(() =>
  import("@/pages/ErpPermissionsCorePage").then((m) => ({
    default: m.ErpPermissionsCorePage,
  })),
);
const ErpInvoicesPage = lazy(() =>
  import("@/pages/ErpInvoicesPage").then((m) => ({
    default: m.ErpInvoicesPage,
  })),
);
const ErpInvoicesInPage = lazy(() =>
  import("@/pages/ErpInvoicesInPage").then((m) => ({
    default: m.ErpInvoicesInPage,
  })),
);
const ErpInvoicesDraftPage = lazy(() =>
  import("@/pages/ErpInvoicesDraftPage").then((m) => ({
    default: m.ErpInvoicesDraftPage,
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
const AttachmentsPage = lazy(() =>
  import("@/pages/Attachments").then((m) => ({ default: m.DinhKemChungTu })),
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
const GarageCases = lazy(() =>
  import("@/modules/garage/pages/GarageCases").then((m) => ({
    default: m.GarageCases,
  })),
);
const GarageOpex = lazy(() =>
  import("@/modules/garage/pages/GarageOpex").then((m) => ({
    default: m.GarageOpex,
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
const GaragePartners = lazy(() =>
  import("@/modules/garage/pages/GaragePartners").then((m) => ({
    default: m.GaragePartners,
  })),
);
const FinishedGoodsPage = lazy(() =>
  import("@/pages/manufacturing/FinishedGoodsPage").then((m) => ({
    default: m.FinishedGoodsPage,
  })),
);
const AfterSalesPage = lazy(() =>
  import("@/modules/after-sales/components/AfterSalesPage").then((m) => ({
    default: m.AfterSalesPage,
  })),
);
const OpexPage = lazy(() =>
  import("@/pages/OpexPage").then((m) => ({
    default: m.OpexPage,
  })),
);

const PAGE_COMPONENTS: Partial<Record<PageKey, React.ElementType>> = {
  dashboard: Dashboard,
  opex: OpexPage,
  "inventory-dashboard": InventoryDashboard,
  "cashflow-dashboard": CashflowDashboard,
  purchasing: MuaHang,
  "erp-inventory-stock": InventoryStockPage,
  "erp-inventory-tracking": InventoryTrackingPage,
  "erp-inventory-tracking-parts": InventoryTrackingPartsPage,
  "erp-inventory-tracking-lot": InventoryTrackingLotPage,
  "erp-inventory-tracking-custom": InventoryTrackingCustomPage,
  "erp-inventory-vouchers": InventoryVouchersPage,
  "mfg-items": MfgItems,
  "mfg-vehicles": MfgVehicles,
  "erp-bom": ErpBomPage,
  "erp-production": ErpProductionPage,
  "erp-finished-goods": FinishedGoodsPage,
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
  "email-inbox": EmailInboxPage,
  "erp-permissions-core": ErpPermissionsCorePage,
  "erp-invoices": ErpInvoicesPage,
  "erp-invoices-in": ErpInvoicesInPage,
  "erp-invoices-out": ErpInvoicesOutPage,
  "erp-invoices-draft": ErpInvoicesDraftPage,
  "invoice-dashboard": InvoiceDashboard,
  "sys-tags": SysTagsPage,
  attachments: AttachmentsPage,
  "bank-statement": () => <BankStatementPage type="bank" />,
  "cash-statement": () => <BankStatementPage type="cash" />,
  "journal-entry": GeneralJournalPage,
  "settings-accounts": ChartOfAccountsPage,
  "settings-bank": ThietLapNganHang,
  "settings-cash-fund": ThietLapQuy,
  "settings-branch": SettingsBranch,
  "garage-dashboard": GarageDashboard,
  "garage-cases": GarageCases,
  "garage-opex": GarageOpex,
  "garage-receivables": GarageReceivables,
  "garage-payables": GaragePayables,
  "garage-customers": GaragePartners,
  "garage-partners": GaragePartners,
  "after-sales": AfterSalesPage,
  "vinfast-parts": VinfastPartsTrackingPage,
  "vinfast-parts-dashboard": () => (
    <VinfastPartsStockPage initialTab="dashboard" />
  ),
  "vinfast-parts-oto": () => <VinfastPartsTrackingPage vehicleType="CAR" />,
  "vinfast-parts-xemay": () => (
    <VinfastPartsTrackingPage vehicleType="MOTORBIKE" />
  ),
  "vinfast-parts-stock": VinfastPartsStockPage,
  "vinfast-parts-oto-stock": VinfastPartsOtoStockPage,
  "vinfast-parts-xemay-stock": VinfastPartsMotoStockPage,
  "purchasing-report-dashboard": PurchasingReportDashboardPage,
};

const PAGE_PRELOADERS: Partial<Record<PageKey, PageLoader>> = {
  dashboard: loadDashboard,
  "inventory-dashboard": loadInventoryDashboard,
  purchasing: loadMuaHang,
  "erp-inventory-stock": loadInventoryStockPage,
  "erp-inventory-tracking": () =>
    import("@/pages/inventory/InventoryTrackingPage"),
  "erp-inventory-tracking-parts": () =>
    import("@/pages/inventory/InventoryTrackingPartsPage"),
  "erp-finished-goods": () => import("@/pages/manufacturing/FinishedGoodsPage"),
  "garage-partners": () => import("@/modules/garage/pages/GaragePartners"),
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
  const { currentPage, currentInstanceId, isLoggedIn, syncFromUrl, openTabs } =
    useAppStore();
  const { bootstrapAction } = useAuthStore();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openTabsKey = openTabs.map((t) => t.instanceId).join("|");

  useSerialGenerationProgress();

  useEffect(() => {
    useEnvStore.getState().fetchAppConfig();
    bootstrapAction();
  }, []);

  useEffect(() => {
    const sync = () => {
      const parsed = pathToPage(location.pathname, location.search);
      if (parsed) {
        if (
          parsed.page === "erp-invoices" &&
          !location.search.includes("tab=")
        ) {
          const canonicalPath = pageToPath(
            "erp-invoices",
            parsed.tab || "in",
            parsed.instanceIndex === 2 ? { _i: "2" } : undefined,
          );
          window.history.replaceState(null, "", canonicalPath);
        }
        syncFromUrl(parsed.page, parsed.tab, parsed.instanceIndex);
      } else {
        history.replaceState(null, "", "/");
        syncFromUrl("dashboard", undefined, 1);
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
  }, [currentInstanceId]);

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
    const tabsToWarm = [
      ...new Set(openTabs.map((t) => t.pageKey)),
    ] as PageKey[];

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
              {(() => {
                const activeTab = openTabs.find(
                  (tab) => tab.instanceId === currentInstanceId,
                );
                if (!activeTab) return <NotFound />;
                const Component = PAGE_COMPONENTS[activeTab.pageKey];
                if (!Component) return <NotFound />;
                return (
                  <div key={activeTab.instanceId} className="block h-full">
                    <Suspense fallback={PAGE_FALLBACK}>
                      <Component instanceIndex={activeTab.instanceIndex} />
                    </Suspense>
                  </div>
                );
              })()}
              <SerialGenerationProgress />
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
