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
import { pathToPage } from "@/shared/utils/pageUrl";
import { Dashboard } from "@/pages/Dashboard";
import { DongTien } from "@/pages/DongTien";
import { TienMat } from "@/pages/TienMat";
import { TienGui } from "@/pages/TienGui";
import { DinhKemChungTu } from "@/pages/DinhKemChungTu";
import { ThietLapQuy } from "@/pages/ThietLapQuy";
import { ThietLapNganHang } from "@/pages/ThietLapNganHang";
import { ThietLapTaiKhoan } from "@/pages/ThietLapTaiKhoan";
import { NhanSu } from "@/pages/NhanSu";
import { PhongBan } from "@/pages/PhongBan";
import { ChucVu } from "@/pages/ChucVu";
import { PhaiThu } from "@/pages/PhaiThu";
import { PhaiTra } from "@/pages/PhaiTra";
import { ComingSoon } from "@/pages/ComingSoon";
import { NhatKyChung } from "@/pages/NhatKyChung";
import { Login } from "@/pages/Login";
import { ActivityLog } from "@/pages/ActivityLog";
import { DoiTac } from "@/pages/DoiTac";
import { PhanQuyen } from "@/pages/PhanQuyen";
import { NotFound } from "@/pages/NotFound";
import WorkflowCanvas from "@/pages/WorkflowCanvas";
import { ErrorPage } from "@/shared/components/ErrorPage";

/**
 * Wrap a page with an optional access guard.
 * When `allowed` is false the 403 ErrorPage is rendered in-place —
 * the tab and URL still show the real page key, no separate 403 tab is created.
 */
function GuardedPage({
  allowed = true,
  children,
}: {
  allowed?: boolean;
  children: React.ReactNode;
}) {
  if (!allowed) return <ErrorPage code="403" />;
  return <>{children}</>;
}

export default function App() {
  const { currentPage, isLoggedIn, syncFromUrl, forbidden } = useAppStore();
  const { bootstrapAction } = useAuthStore();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bootstrapAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="app-shell flex h-screen w-full overflow-hidden text-foreground">
      <Sidebar />
      {/* Right panel: single rounded window — topbar + scrolling content + tabbar */}
      <div className="right-panel">
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
      <AppContextMenu />
    </div>
  );
}
