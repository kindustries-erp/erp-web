import React, { useEffect, useRef, useState } from "react";
import { useSerialProgressStore } from "@/shared/stores/useSerialProgressStore";

const BUBBLE_SIZE = 48;
const MARGIN = 16;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function SerialGenerationProgress() {
  const progress = useSerialProgressStore();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragState = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  useEffect(() => {
    // Initialize to bottom-right but above pagination area
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    setPosition({
      x: viewportWidth - BUBBLE_SIZE - MARGIN,
      y: viewportHeight - BUBBLE_SIZE - MARGIN - 80,
    });

    const handleResize = () => {
      setPosition((prev) => ({
        x: clamp(prev.x, MARGIN, window.innerWidth - BUBBLE_SIZE - MARGIN),
        y: clamp(prev.y, MARGIN, window.innerHeight - BUBBLE_SIZE - MARGIN),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragState.current = {
      isDragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragState.current.hasMoved = true;
    }

    setPosition({
      x: clamp(
        dragState.current.initialX + dx,
        MARGIN,
        window.innerWidth - BUBBLE_SIZE - MARGIN,
      ),
      y: clamp(
        dragState.current.initialY + dy,
        MARGIN,
        window.innerHeight - BUBBLE_SIZE - MARGIN,
      ),
    });
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleClick = () => {
    if (!dragState.current.hasMoved) {
      setIsOpen((prev) => !prev);
    }
  };

  if (progress.pendingSerials === 0 && !progress.isRunning) {
    return null; // Ẩn hoàn toàn nếu không có việc gì
  }

  return (
    <div
      className="fixed z-[9999]"
      style={{
        left: position.x,
        top: position.y,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
      }}
    >
      <div className="relative">
        {/* Bubble */}
        <button
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          className="bg-slate-800 text-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg hover:bg-slate-900 transition-colors relative border border-slate-700 cursor-move"
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
