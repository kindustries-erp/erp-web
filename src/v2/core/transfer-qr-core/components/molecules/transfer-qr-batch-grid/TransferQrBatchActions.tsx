import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface TransferQrBatchActionsProps {
  validCount: number;
  totalCount: number;
}

/** Dòng tổng hợp số lệnh hợp lệ. Nút ZIP/PDF nằm ở footer của drawer. */
export function TransferQrBatchActions({
  validCount,
  totalCount,
}: TransferQrBatchActionsProps) {
  const { t } = useV2Translation();

  return (
    <V2Text variant="body-sm">
      {t("v2.transferQr.batch.summaryValid")} {validCount}/{totalCount}
    </V2Text>
  );
}
