import { useEffect, useRef } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Sidebar } from "@/core/components/layout/Sidebar";
import { Topbar } from "@/core/components/layout/Topbar";
import { TabBar } from "@/core/components/layout/TabBar";
import { SlidePanel } from "@/shared/components/SlidePanel";
import { Toast } from "@/shared/components/Toast";
import { AppContextMenu } from "@/shared/components/ContextMenu";
import { DocumentDependencyModal } from "@/core/components/DocumentDependencyModal";
import { ReloadPrompt } from "@/ReloadPrompt";
import { pathToPage } from "@/shared/utils/pageUrl";
import { Dashboard } from "@/pages/Dashboard";

import { MuaHang } from "@/pages/Purchasing";
import { Kho } from "@/pages/Inventory";
import { MfgItems } from "@/pages/MfgItems";
import { MfgVehicles } from "@/pages/MfgVehicles";
import { ErpBomPage } from "@/pages/ErpBomPage";
import { ErpWarehousePage } from "@/pages/ErpWarehousePage";
import { ErpProductionPage } from "@/pages/ErpProductionPage";
import { ErpSalesOrdersPage } from "@/pages/ErpSalesOrdersPage";
import { ErpGoodsIssuesPage } from "@/pages/ErpGoodsIssuesPage";
import { InventoryMasterPage } from "@/pages/InventoryMasterPage";
import {
  ErpCustomersPage,
  ErpSuppliersPage,
} from "@/pages/ErpBusinessPartnersPage";
import { ErpUsersPage } from "@/pages/ErpUsersPage";
import { ErpEmployeesPage } from "@/pages/ErpEmployeesPage";
import { ErpActivityLogsPage } from "@/pages/ErpActivityLogsPage";
import { ErpPermissionsCorePage } from "@/pages/ErpPermissionsCorePage";
import { ErpInvoicePage } from "@/pages/ErpInvoicePage";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

const CORE_PAGES = [
  "dashboard",

  "purchasing",
  "inventory",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
  "erp-bom",
  "erp-warehouse",
  "erp-production",
  "erp-sales-orders",
  "erp-goods-issues",
  "erp-inventory-masters",
  "erp-suppliers",
  "erp-customers",
  "erp-employees",
  "erp-users",
  "erp-activity-logs",
  "erp-permissions-core",
  "erp-invoices",
] as const;

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
        syncFromUrl("purchasing");
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
        <Sidebar />
        <div className="right-panel relative">
          <Topbar />
          <div
            ref={contentRef}
            onScroll={keepContentXLocked}
            className="app-content flex-1 overflow-x-hidden overflow-y-auto pb-10"
          >
            <>
              {openTabs.includes("dashboard") && (
                <div
                  className={
                    currentPage === "dashboard" ? "block h-full" : "hidden"
                  }
                >
                  <Dashboard />
                </div>
              )}

              {openTabs.includes("purchasing") && (
                <div
                  className={
                    currentPage === "purchasing" ? "block h-full" : "hidden"
                  }
                >
                  <MuaHang />
                </div>
              )}
              {openTabs.includes("inventory") && (
                <div
                  className={
                    currentPage === "inventory" ? "block h-full" : "hidden"
                  }
                >
                  <Kho />
                </div>
              )}
              {openTabs.includes("mfg-items") && (
                <div
                  className={
                    currentPage === "mfg-items" ? "block h-full" : "hidden"
                  }
                >
                  <MfgItems />
                </div>
              )}
              {openTabs.includes("mfg-vehicles") && (
                <div
                  className={
                    currentPage === "mfg-vehicles" ? "block h-full" : "hidden"
                  }
                >
                  <MfgVehicles />
                </div>
              )}
              {openTabs.includes("erp-bom") && (
                <div
                  className={
                    currentPage === "erp-bom" ? "block h-full" : "hidden"
                  }
                >
                  <ErpBomPage />
                </div>
              )}
              {openTabs.includes("erp-warehouse") && (
                <div
                  className={
                    currentPage === "erp-warehouse" ? "block h-full" : "hidden"
                  }
                >
                  <ErpWarehousePage />
                </div>
              )}

              {openTabs.includes("erp-production") && (
                <div
                  className={
                    currentPage === "erp-production" ? "block h-full" : "hidden"
                  }
                >
                  <ErpProductionPage />
                </div>
              )}
              {openTabs.includes("erp-sales-orders") && (
                <div
                  className={
                    currentPage === "erp-sales-orders"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <ErpSalesOrdersPage />
                </div>
              )}
              {openTabs.includes("erp-goods-issues") && (
                <div
                  className={
                    currentPage === "erp-goods-issues"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <ErpGoodsIssuesPage />
                </div>
              )}

              {openTabs.includes("erp-inventory-masters") && (
                <div
                  className={
                    currentPage === "erp-inventory-masters"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <InventoryMasterPage />
                </div>
              )}
              {openTabs.includes("erp-suppliers") && (
                <div
                  className={
                    currentPage === "erp-suppliers" ? "block h-full" : "hidden"
                  }
                >
                  <ErpSuppliersPage />
                </div>
              )}
              {openTabs.includes("erp-customers") && (
                <div
                  className={
                    currentPage === "erp-customers" ? "block h-full" : "hidden"
                  }
                >
                  <ErpCustomersPage />
                </div>
              )}
              {openTabs.includes("erp-users") && (
                <div
                  className={
                    currentPage === "erp-users" ? "block h-full" : "hidden"
                  }
                >
                  <ErpUsersPage />
                </div>
              )}
              {openTabs.includes("erp-employees") && (
                <div
                  className={
                    currentPage === "erp-employees" ? "block h-full" : "hidden"
                  }
                >
                  <ErpEmployeesPage />
                </div>
              )}
              {openTabs.includes("erp-activity-logs") && (
                <div
                  className={
                    currentPage === "erp-activity-logs"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <ErpActivityLogsPage />
                </div>
              )}
              {openTabs.includes("erp-permissions-core") && (
                <div
                  className={
                    currentPage === "erp-permissions-core"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <ErpPermissionsCorePage />
                </div>
              )}
              {openTabs.includes("erp-invoices") && (
                <div
                  className={
                    currentPage === "erp-invoices" ? "block h-full" : "hidden"
                  }
                >
                  <ErpInvoicePage />
                </div>
              )}
              {!(CORE_PAGES as readonly string[]).includes(currentPage) && (
                <NotFound />
              )}
            </>
          </div>
          <TabBar />
        </div>
        <SlidePanel />
        <Toast />
        <ReloadPrompt />
        <AppContextMenu />
        <DocumentDependencyModal />
      </div>
    </TooltipProvider>
  );
}
