import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { RefreshCw, Sparkles, X } from "lucide-react";

const CHECK_INTERVAL_MS = 60 * 1000; // 60s

export function ReloadPrompt() {
  const t = useT();
  const [updating, setUpdating] = React.useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // 1. Check for SW updates periodically (every 60s when online)
      setInterval(async () => {
        if (!navigator.onLine) return;
        try {
          await registration.update();
        } catch (err) {
          console.debug("Periodic SW update check failed", err);
        }
      }, CHECK_INTERVAL_MS);

      // 2. Check for SW updates when user switches back to tab or window gains focus
      const handleVisibilityOrFocus = async () => {
        if (document.visibilityState === "visible" && navigator.onLine) {
          try {
            await registration.update();
          } catch (err) {
            console.debug("Tab focus SW update check failed", err);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityOrFocus);
      window.addEventListener("focus", handleVisibilityOrFocus);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  React.useEffect(() => {
    if (offlineReady) {
      toast.success(t("pwa.offlineReady"), {
        duration: 4000,
      });
      close();
    }
  }, [offlineReady]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch (e) {
      console.error("Failed to update SW:", e);
      window.location.reload();
    }
  };

  return (
    <>
      {needRefresh && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] max-w-sm rounded-xl border border-blue-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md dark:bg-slate-900/95 dark:border-blue-400/30 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                {t("pwa.newVersion") || "Đã có bản cập nhật mới!"}
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Hệ thống vừa có phiên bản mới. Vui lòng cập nhật để đảm bảo tính
                năng hoạt động chính xác.
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updating}
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-1.5 h-8 flex items-center gap-1.5"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${updating ? "animate-spin" : ""}`}
                  />
                  {updating
                    ? "Đang tải..."
                    : t("pwa.update") || "Cập nhật ngay"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={close}
                  className="text-xs px-2.5 py-1.5 h-8 text-slate-400 hover:text-white"
                >
                  {t("pwa.dismiss") || "Bỏ qua"}
                </Button>
              </div>
            </div>
            <button
              onClick={close}
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
