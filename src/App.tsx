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
import { ComingSoon } from "@/pages/ComingSoon";
import { NhatKyChung } from "@/pages/GeneralJournal";
import { Login } from "@/pages/Login";
import { ActivityLog } from "@/pages/ActivityLog";
import { DoiTac } from "@/pages/Partners";
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
                {currentPage === "dongtien" && <DongTien />}
                {currentPage === "tienmat" && <TienMat />}
                {currentPage === "tiengui" && <TienGui />}
                {currentPage === "dinhkem" && <DinhKemChungTu />}
                {currentPage === "thietlap-quy" && <ThietLapQuy />}
                {currentPage === "thietlap-nh" && <ThietLapNganHang />}
                {currentPage === "thietlap-tk" && <ThietLapTaiKhoan />}
                {currentPage === "nhansu" && <NhanSu />}
                {currentPage === "phongban" && <PhongBan />}
                {currentPage === "chucvu" && <ChucVu />}
                {currentPage === "phaithu" && <PhaiThu />}
                {currentPage === "phaittra" && <PhaiTra />}
                {currentPage === "nhatkyechung" && <NhatKyChung />}
                {(currentPage === "socat" ||
                  currentPage === "banhang" ||
                  currentPage === "khachhang" ||
                  currentPage === "muahang" ||
                  currentPage === "nhacungcap") && <ComingSoon />}
                {currentPage === "phanquyen" && <PhanQuyen />}
                {/* {currentPage === "phanquyen" && <ActivityLog />} */}
                {currentPage === "activitylog" && <ActivityLog />}
                {currentPage === "doitac" && <DoiTac />}
                {currentPage === "hoadondientu" && <HoaDonDienTu />}
                {currentPage === "workflowcanvas" && <WorkflowCanvas />}
                {/* Catch-all — unknown page keys (e.g. from stale persisted state) */}
                {![
                  "dashboard",
                  "dongtien",
                  "tienmat",
                  "tiengui",
                  "dinhkem",
                  "thietlap-quy",
                  "thietlap-nh",
                  "thietlap-tk",
                  "nhansu",
                  "phongban",
                  "chucvu",
                  "phaithu",
                  "phaittra",
                  "socat",
                  "nhatkyechung",
                  "banhang",
                  "khachhang",
                  "muahang",
                  "nhacungcap",
                  "phanquyen",
                  "activitylog",
                  "doitac",
                  "hoadondientu",
                  "workflowcanvas",
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
