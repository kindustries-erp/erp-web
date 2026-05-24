import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/components/ui/Button";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
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
      toast.success("Ứng dụng đã sẵn sàng chạy offline.", {
        duration: 4000,
      });
      close();
    }
  }, [offlineReady]);

  return (
    <>
      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Có phiên bản mới. Vui lòng tải lại trang để cập nhật.
          </div>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateServiceWorker(true)}
            >
              Cập nhật
            </Button>
            <Button variant="secondary" size="sm" onClick={() => close()}>
              Bỏ qua
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
