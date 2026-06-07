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
import { MfgPurchaseOrders } from "@/pages/MfgPurchaseOrders";
import { MfgVehicles } from "@/pages/MfgVehicles";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { ErrorPage } from "@/shared/components/ErrorPage";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

const CORE_PAGES = [
  "dashboard",
  "sales",
  "purchasing",
  "inventory",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
] as const;

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl, forbidden } = useAppStore();
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
            {forbidden ? (
              <ErrorPage code="403" />
            ) : (
              <>
                {currentPage === "dashboard" && <Dashboard />}
                {currentPage === "sales" && <BanHang />}
                {currentPage === "purchasing" && <MuaHang />}
                {currentPage === "inventory" && <Kho />}
                {currentPage === "mfg-items" && <MfgItems />}
                {currentPage === "mfg-purchase-orders" && <MfgPurchaseOrders />}
                {currentPage === "mfg-vehicles" && <MfgVehicles />}
                {!(CORE_PAGES as readonly string[]).includes(currentPage) && (
                  <NotFound />
                )}
              </>
            )}
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
