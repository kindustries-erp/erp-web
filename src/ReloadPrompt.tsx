import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "react-hot-toast";

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
            <button
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
              onClick={() => updateServiceWorker(true)}
            >
              Cập nhật
            </button>
            <button
              className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
              onClick={() => close()}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}
    </>
  );
}
