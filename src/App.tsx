import { useEffect, useRef } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Sidebar } from "@/core/components/layout/Sidebar";
import { Topbar } from "@/core/components/layout/Topbar";
import { TabBar } from "@/core/components/layout/TabBar";
import { SlidePanel } from "@/shared/components/SlidePanel";
import { Toast } from "@/shared/components/Toast";
import { AppContextMenu } from "@/shared/components/ContextMenu";
import { ReloadPrompt } from "@/ReloadPrompt";
import { pathToPage } from "@/shared/utils/pageUrl";
import { Dashboard } from "@/pages/Dashboard";
import { BanHang } from "@/pages/Sales";
import { MuaHang } from "@/pages/Purchasing";
import { Kho } from "@/pages/Inventory";
import { MfgItems } from "@/pages/MfgItems";
import { MfgVehicles } from "@/pages/MfgVehicles";
import { ErpBomPage } from "@/pages/ErpBomPage";
import { ErpWarehousePage } from "@/pages/ErpWarehousePage";
import { ErpGoodsReceiptsPage } from "@/pages/ErpGoodsReceiptsPage";
import { ErpProductionPage } from "@/pages/ErpProductionPage";
import { ErpSalesOrdersPage } from "@/pages/ErpSalesOrdersPage";
import { ErpGoodsIssuesPage } from "@/pages/ErpGoodsIssuesPage";
import { InventoryMasterPage } from "@/pages/InventoryMasterPage";
import {
  ErpCustomersPage,
  ErpSuppliersPage,
} from "@/pages/ErpBusinessPartnersPage";
import { ErpUsersPage } from "@/pages/ErpUsersPage";
import { ErpActivityLogsPage } from "@/pages/ErpActivityLogsPage";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

const CORE_PAGES = [
  "dashboard",
  "sales",
  "purchasing",
  "inventory",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
  "erp-bom",
  "erp-warehouse",
  "erp-goods-receipts",
  "erp-production",
  "erp-sales-orders",
  "erp-goods-issues",
  "erp-inventory-masters",
  "erp-suppliers",
  "erp-customers",
  "erp-users",
  "erp-activity-logs",
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
              {openTabs.includes("sales") && (
                <div
                  className={
                    currentPage === "sales" ? "block h-full" : "hidden"
                  }
                >
                  <BanHang />
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
              {openTabs.includes("erp-goods-receipts") && (
                <div
                  className={
                    currentPage === "erp-goods-receipts"
                      ? "block h-full"
                      : "hidden"
                  }
                >
                  <ErpGoodsReceiptsPage />
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
      </div>
    </TooltipProvider>
  );
}
