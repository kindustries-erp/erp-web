import React from "react";
import { useSystemOperationLock } from "@/shared/hooks/useSystemOperationLock";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/utils";

export function GlobalSystemOperationIndicator() {
  const { isBlocked, activeOperation } = useSystemOperationLock({
    pollingInterval: 3000,
  });

  if (!isBlocked || !activeOperation) {
    return null;
  }

  const tooltipContent = (
    <div className="flex flex-col gap-1.5 p-1 max-w-[280px] text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-amber-500">
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Hệ Thống Đang Xử Lý Giao Dịch</span>
      </div>
      <div className="text-[11px] text-foreground/90">
        <span className="font-medium">{activeOperation.operationName}</span>
        {activeOperation.targetNo && (
          <span className="ml-1 text-muted-foreground">
            ({activeOperation.targetNo})
          </span>
        )}
      </div>
      {activeOperation.userName && (
        <div className="text-[10px] text-muted-foreground">
          Thực hiện bởi:{" "}
          <span className="text-foreground">{activeOperation.userName}</span>
        </div>
      )}
      {activeOperation.progressMessage && (
        <div className="text-[10px] text-muted-foreground italic">
          {activeOperation.progressMessage}
        </div>
      )}
      <div className="mt-1 pt-1 border-t border-border/50 text-[10px] text-amber-600 dark:text-amber-400">
        ⚡ Các nút Nhập/Xuất kho & Sản xuất tạm thời khóa để chống xung đột dữ
        liệu.
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side="bottom">
      <div
        className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium cursor-default select-none transition-all duration-300",
          "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm animate-pulse",
        )}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-amber-500" />
        <span className="max-w-[160px] truncate text-[11px]">
          {activeOperation.targetNo || activeOperation.operationName}
        </span>
        {activeOperation.progressPercent > 0 && (
          <span className="text-[10px] opacity-80">
            {activeOperation.progressPercent}%
          </span>
        )}
      </div>
    </Tooltip>
  );
}
