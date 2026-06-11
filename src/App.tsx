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
import { ErpInventoryItemsPage } from "@/pages/ErpInventoryItemsPage";
import {
  ErpCustomersPage,
  ErpSuppliersPage,
} from "@/pages/ErpBusinessPartnersPage";
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
  "erp-inventory-items",
  "erp-suppliers",
  "erp-customers",
] as const;

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl } = useAppStore();
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
            className="app-content flex-1 overflow-x-hidden overflow-y-auto"
          >
            <>
              {currentPage === "dashboard" && <Dashboard />}
              {currentPage === "sales" && <BanHang />}
              {currentPage === "purchasing" && <MuaHang />}
              {currentPage === "inventory" && <Kho />}
              {currentPage === "mfg-items" && <MfgItems />}
              {currentPage === "mfg-vehicles" && <MfgVehicles />}
              {currentPage === "erp-bom" && <ErpBomPage />}
              {currentPage === "erp-warehouse" && <ErpWarehousePage />}
              {currentPage === "erp-goods-receipts" && <ErpGoodsReceiptsPage />}
              {currentPage === "erp-production" && <ErpProductionPage />}
              {currentPage === "erp-sales-orders" && <ErpSalesOrdersPage />}
              {currentPage === "erp-goods-issues" && <ErpGoodsIssuesPage />}
              {currentPage === "erp-inventory-items" && (
                <ErpInventoryItemsPage />
              )}
              {currentPage === "erp-suppliers" && <ErpSuppliersPage />}
              {currentPage === "erp-customers" && <ErpCustomersPage />}
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
