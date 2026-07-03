import { useEffect, useRef } from "react";
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
import { Dashboard } from "@/pages/Dashboard";
import { EnvStamp } from "@/core/components/EnvStamp";

import { MuaHang } from "@/pages/Purchasing";
import { InventoryStockPage } from "@/pages/inventory/InventoryStockPage";
import { InventoryTrackingPage } from "@/pages/inventory/InventoryTrackingPage";
import { InventoryVouchersPage } from "@/pages/inventory/InventoryVouchersPage";
import { MfgItems } from "@/pages/MfgItems";
import { MfgVehicles } from "@/pages/MfgVehicles";
import { ErpBomPage } from "@/pages/ErpBomPage";
import { ErpProductionPage } from "@/pages/ErpProductionPage";
import { ErpSalesOrdersPage } from "@/pages/ErpSalesOrdersPage";
import { ErpGoodsIssuesPage } from "@/pages/ErpGoodsIssuesPage";
import { InventoryUomPage } from "@/pages/inventory/InventoryUomPage";
import { InventoryItemTypesPage } from "@/pages/inventory/InventoryItemTypesPage";
import { InventoryTrackingCategoriesPage } from "@/pages/inventory/InventoryTrackingCategoriesPage";
import {
  ErpCustomersPage,
  ErpSuppliersPage,
} from "@/pages/ErpBusinessPartnersPage";
import { ErpUsersPage } from "@/pages/ErpUsersPage";
import { ErpEmployeesPage } from "@/pages/ErpEmployeesPage";
import { ErpActivityLogsPage } from "@/pages/ErpActivityLogsPage";
import { ErpPermissionsCorePage } from "@/pages/ErpPermissionsCorePage";
import { ErpInvoicesInPage } from "@/pages/ErpInvoicesInPage";
import { ErpInvoicesOutPage } from "@/pages/ErpInvoicesOutPage";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { SysTagsPage } from "@/pages/SysTagsPage";
import { BankStatementPage } from "@/pages/BankStatementPage";
import { GeneralJournalPage } from "@/pages/finance/GeneralJournalPage";
import { ChartOfAccountsPage } from "@/pages/finance/ChartOfAccountsPage";
import { ThietLapNganHang } from "@/pages/SettingsBankAccount";
import { ThietLapQuy } from "@/pages/SettingsCashFund";
import { SettingsBranch } from "@/pages/SettingsBranch";
import { CashflowDashboard } from "@/pages/CashflowDashboard";
import { GarageDashboard } from "@/modules/garage/pages/GarageDashboard";
import { GarageCases } from "@/modules/garage/pages/GarageCases";
import { GarageReceivables } from "@/modules/garage/pages/GarageReceivables";
import { GaragePayables } from "@/modules/garage/pages/GaragePayables";

import { PageKey } from "@/shared/types";

const PAGE_COMPONENTS: Partial<Record<PageKey, React.ElementType>> = {
  dashboard: Dashboard,
  "cashflow-dashboard": CashflowDashboard,
  purchasing: MuaHang,
  "erp-inventory-stock": InventoryStockPage,
  "erp-inventory-tracking": InventoryTrackingPage,
  "erp-inventory-vouchers": InventoryVouchersPage,
  "mfg-items": MfgItems,
  "mfg-vehicles": MfgVehicles,
  "erp-bom": ErpBomPage,
  "erp-production": ErpProductionPage,
  "erp-sales-orders": ErpSalesOrdersPage,
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
};

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl, openTabs } = useAppStore();
  const { bootstrapAction } = useAuthStore();
  const contentRef = useRef<HTMLDivElement | null>(null);

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
                    <Component />
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
      </div>
    </TooltipProvider>
  );
}
