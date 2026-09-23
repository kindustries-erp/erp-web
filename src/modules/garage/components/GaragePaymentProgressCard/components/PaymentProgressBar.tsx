import React from "react";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import {
  getBadgeVariant,
  getProgressColor,
} from "../utils/paymentProgressHelpers";

interface PaymentProgressBarProps {
  isReceipt: boolean;
  currentRate: number;
  currentPaid: number;
  currentTotal: number;
  loading?: boolean;
}

export function PaymentProgressBar({
  isReceipt,
  currentRate,
  currentPaid,
  currentTotal,
  loading = false,
}: PaymentProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {isReceipt
              ? "Tỷ lệ hoàn tất thu tiền dịch vụ"
              : "Tỷ lệ hoàn tất chi trả chi phí / NCC"}
          </span>
          <Badge
            variant="outline"
            className={`font-semibold px-2 py-0.5 text-xs border ${getBadgeVariant(currentRate, isReceipt)}`}
          >
            {currentRate.toFixed(1)}% Hoàn tất
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {isReceipt ? "Đã thu" : "Đã trả"}{" "}
          <strong className="text-foreground font-bold font-mono">
            {money(currentPaid)}
          </strong>{" "}
          <span className="text-muted-foreground/75 font-normal font-mono">
            / Tổng {money(currentTotal)}
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(currentRate, isReceipt)}`}
          style={{
            width: `${loading ? 0 : Math.min(100, Math.max(0, currentRate))}%`,
          }}
        />
      </div>
    </div>
  );
}
