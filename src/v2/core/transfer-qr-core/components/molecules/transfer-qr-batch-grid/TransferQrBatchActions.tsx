import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
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
      <div className="flex items-center justify-between gap-2">
        <V2Text variant="body-sm" color="muted" weight="medium">
          {t("v2.transferQr.batch.summaryValid")}
        </V2Text>
        <V2Text variant="body-sm" weight="bold">
          {validCount}/{totalCount} {t("v2.transferQr.batch.orderCount")}
        </V2Text>
      </div>
      {totalAmount > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5">
          <V2Text variant="body-sm" color="muted" weight="medium">
            {t("v2.transferQr.batch.totalBatchAmount")}
          </V2Text>
          <V2Text
            variant="currency"
            weight="bold"
            className="text-emerald-600 dark:text-emerald-400"
          >
            {new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫
          </V2Text>
        </div>
      )}
    </div>
  );
}
