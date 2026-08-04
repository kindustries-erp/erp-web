import React, { useEffect, useState } from "react";
import axiosInstance from "@/core/api/axiosInstance";

export function SerialGenerationProgress() {
  const [progress, setProgress] = useState({
    pendingLines: 0,
    pendingSerials: 0,
    isRunning: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchProgress = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/api/v1/goods-receipts/serial-generation/progress",
        );
        setProgress(data);
      } catch (err) {
        console.error("Failed to fetch serial generation progress", err);
      }

      timeoutId = setTimeout(fetchProgress, 10000); // Poll every 10 seconds
    };

    fetchProgress();

    return () => clearTimeout(timeoutId);
  }, []);

  if (progress.pendingSerials === 0 && !progress.isRunning) {
    return null; // Ẩn hoàn toàn nếu không có việc gì
  }

  return (
    <div className="fixed bottom-20 right-8 z-[9999]">
      <div className="relative">
        {/* Bubble */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800 text-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg hover:bg-slate-900 transition-colors relative border border-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${progress.isRunning ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full h-5 px-1.5 flex items-center justify-center">
            {progress.pendingLines}
          </span>
        </button>

        {/* Popover */}
        {isOpen && (
          <div className="absolute bottom-14 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 mb-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Đang sinh số Serial nền
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Hệ thống đang chạy ngầm để sinh mã Serial phụ tùng cho các phiếu
              nhập kho mới. Bạn có thể tiếp tục sử dụng hệ thống bình thường.
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Dòng đang chờ:</span>
                <span className="font-medium text-slate-800">
                  {progress.pendingLines}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng mã đang sinh:</span>
                <span className="font-medium text-slate-800">
                  {progress.pendingSerials}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái máy chủ:</span>
                <span
                  className={
                    progress.isRunning
                      ? "text-green-600 font-medium"
                      : "text-orange-500"
                  }
                >
                  {progress.isRunning ? "Đang chạy" : "Đang nghỉ"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
