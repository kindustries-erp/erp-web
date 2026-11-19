import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";

export interface TransferQrBatchActionsProps {
  validCount: number;
  totalCount: number;
  totalAmount?: number;
}

/** Khung tổng hợp số lệnh hợp lệ và tổng tiền. */
export function TransferQrBatchActions({
  validCount,
  totalCount,
  totalAmount = 0,
}: TransferQrBatchActionsProps) {
  const { t } = useV2Translation();

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-card border border-border text-card-foreground shadow-2xs">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">
          {t("v2.transferQr.batch.summaryValid")}
        </span>
        <span className="font-bold text-foreground">
          {validCount}/{totalCount} {t("v2.transferQr.batch.orderCount")}
        </span>
      </div>
      {totalAmount > 0 && (
        <div className="flex items-center justify-between gap-2 text-xs border-t border-border/60 pt-1.5">
          <span className="font-medium text-muted-foreground">
            {t("v2.transferQr.batch.totalBatchAmount")}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫
          </span>
        </div>
      )}
    </div>
  );
}
