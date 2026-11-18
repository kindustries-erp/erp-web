import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrBatchRowView } from "../../../hooks/useTransferQrBatchController";

export interface TransferQrBatchGridProps {
  /** Chỉ các dòng hợp lệ đã có ảnh QR */
  views: readonly (TransferQrBatchRowView & { qrDataUrl: string })[];
  onDownloadRow: (view: TransferQrBatchRowView) => void;
}

/** Lưới thẻ QR: mỗi thẻ có ảnh, người nhận, số tiền, nội dung đã làm sạch và nút tải PNG. */
export function TransferQrBatchGrid({
  views,
  onDownloadRow,
}: TransferQrBatchGridProps) {
  const { t } = useV2Translation();

  if (views.length === 0) {
    return (
      <V2Text variant="body-sm">{t("v2.transferQr.batch.emptyGrid")}</V2Text>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {views.map((view) => (
        <div
          key={view.row.id}
          className="flex flex-col items-center gap-2 rounded-md border p-3"
        >
          <img
            src={view.qrDataUrl}
            alt={view.fileName}
            className="h-36 w-36 rounded-md bg-white p-1"
          />
          <V2Text variant="body-sm" className="line-clamp-1 w-full text-center">
            {view.row.accountName}
          </V2Text>
          <V2Text variant="body-sm" className="w-full text-center">
            {view.row.bankCode} - {view.row.accountNumber}
          </V2Text>
          <V2Text variant="body-sm" className="w-full text-center">
            {view.row.amount === null
              ? t("v2.transferQr.batch.amountFree")
              : view.row.amount.toLocaleString("vi-VN")}
          </V2Text>
          {view.caption.content && (
            <V2Text
              variant="body-sm"
              className="line-clamp-2 w-full text-center"
            >
              {view.caption.content}
            </V2Text>
          )}
          <V2Button variant="outline" onClick={() => onDownloadRow(view)}>
            {t("v2.transferQr.batch.downloadRow")}
          </V2Button>
        </div>
      ))}
    </div>
  );
}
