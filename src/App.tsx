import { useEffect, useRef } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Sidebar } from "@/core/components/layout/Sidebar";
import { Topbar } from "@/core/components/layout/Topbar";
import { TabBar } from "@/core/components/layout/TabBar";
import { SlidePanel } from "@/shared/components/SlidePanel";
import { ImportModal } from "@/shared/components/ImportModal";
import { Toast } from "@/shared/components/Toast";
import { AppContextMenu } from "@/shared/components/ContextMenu";
import { ReloadPrompt } from "@/ReloadPrompt";
import { pathToPage } from "@/shared/utils/pageUrl";
import { Dashboard } from "@/pages/Dashboard";
import { DongTien } from "@/pages/CashFlow";
import { CashflowVouchersPage } from "@/pages/CashflowVouchers";
import { TienMat } from "@/pages/CashFund";
import { TienGui } from "@/pages/BankDeposit";
import { DinhKemChungTu } from "@/pages/Attachments";
import { ThietLapQuy } from "@/pages/SettingsCashFund";
import { ThietLapNganHang } from "@/pages/SettingsBankAccount";
import { ThietLapTaiKhoan } from "@/pages/SettingsChartOfAccounts";
import { NhanSu } from "@/pages/Employees";
import { PhongBan } from "@/pages/Departments";
import { ChucVu } from "@/pages/Positions";
import { PhaiThu } from "@/pages/Receivables";
import { PhaiTra } from "@/pages/Payables";
import { BanHang } from "@/pages/Sales";
import { MuaHang } from "@/pages/Purchasing";
import { ChiPhiVanHanh } from "@/pages/OperatingExpenses";
import { Kho } from "@/pages/Inventory";
import { ComingSoon } from "@/pages/ComingSoon";
import { NhatKyChung } from "@/pages/GeneralJournal";
import { SettingsBranch } from "@/pages/SettingsBranch";
import { Login } from "@/pages/Login";
import { ActivityLog } from "@/pages/ActivityLog";
import { DoiTac } from "@/pages/Partners";
import { KhachHang } from "@/pages/Customers";
import { NhaCungCap } from "@/pages/Suppliers";
import { PhanQuyen } from "@/pages/Permissions";
import HoaDonDienTu from "@/pages/EInvoice";
import { NotFound } from "@/pages/NotFound";
import WorkflowCanvas from "@/pages/WorkflowCanvas";
import { ErrorPage } from "@/shared/components/ErrorPage";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl, forbidden } = useAppStore();
  const { bootstrapAction } = useAuthStore();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bootstrapAction();
  }, []);

  // Sync URL → store on mount and browser back/forward
  useEffect(() => {
    const sync = () => {
      const parsed = pathToPage(location.pathname, location.search);
      if (parsed) {
        syncFromUrl(parsed.page);
      } else {
        // Unknown path → redirect to dashboard
        history.replaceState(null, "", "/");
        syncFromUrl("dashboard");
      }
    };
    sync(); // initial read
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
        {/* Right panel: single rounded window — topbar + scrolling content + tabbar */}
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
                {currentPage === "cashflow" && <DongTien />}
                {currentPage === "cashflow-vouchers" && (
                  <CashflowVouchersPage />
                )}
                {currentPage === "cash-fund" && <TienMat />}
                {currentPage === "bank-deposit" && <TienGui />}
                {currentPage === "attachments" && <DinhKemChungTu />}
                {currentPage === "settings-cash-fund" && <ThietLapQuy />}
                {currentPage === "settings-bank" && <ThietLapNganHang />}
                {currentPage === "settings-accounts" && <ThietLapTaiKhoan />}
                {currentPage === "employees" && <NhanSu />}
                {currentPage === "departments" && <PhongBan />}
                {currentPage === "positions" && <ChucVu />}
                {currentPage === "receivables" && <PhaiThu />}
                {currentPage === "payables" && <PhaiTra />}
                {currentPage === "sales" && <BanHang />}
                {currentPage === "purchasing" && <MuaHang />}
                {currentPage === "operating-expenses" && <ChiPhiVanHanh />}
                {currentPage === "inventory" && <Kho />}
                {currentPage === "journal" && <NhatKyChung />}
                {currentPage === "settings-branch" && <SettingsBranch />}
                {currentPage === "ledger" && <ComingSoon />}
                {currentPage === "customers" && <KhachHang />}
                {currentPage === "suppliers" && <NhaCungCap />}
                {currentPage === "permissions" && <PhanQuyen />}
                {/* {currentPage === "permissions" && <ActivityLog />} */}
                {currentPage === "activity-log" && <ActivityLog />}
                {currentPage === "partners" && <DoiTac />}
                {currentPage === "e-invoice" && <HoaDonDienTu />}
                {currentPage === "workflow" && <WorkflowCanvas />}
                {/* Catch-all — unknown page keys (e.g. from stale persisted state) */}
                {![
                  "dashboard",
                  "cashflow",
                  "cashflow-vouchers",
                  "cash-fund",
                  "bank-deposit",
                  "attachments",
                  "settings-cash-fund",
                  "settings-bank",
                  "settings-accounts",
                  "employees",
                  "departments",
                  "positions",
                  "receivables",
                  "payables",
                  "ledger",
                  "journal",
                  "sales",
                  "customers",
                  "purchasing",
                  "operating-expenses",
                  "inventory",
                  "suppliers",
                  "permissions",
                  "activity-log",
                  "partners",
                  "e-invoice",
                  "workflow",
                  "settings-branch",
                ].includes(currentPage) && <NotFound />}
              </>
            )}
          </div>
          <TabBar />
        </div>
        <SlidePanel />
        <ImportModal />
        <Toast />
        <ReloadPrompt />
        <AppContextMenu />
      </div>
    </TooltipProvider>
  );
}
