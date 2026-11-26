import * as React from "react";
import { Download } from "lucide-react";
import {
  V2Badge,
  V2Button,
  V2Icon,
  V2Image,
  V2Text,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrBatchRowView } from "../../../hooks/useTransferQrBatchController";
import "../../../transferQr.locale";

export interface TransferQrBatchGridProps {
  /** Chỉ các dòng hợp lệ đã có ảnh QR */
  views: readonly (TransferQrBatchRowView & { qrDataUrl: string })[];
  onDownloadRow: (view: TransferQrBatchRowView) => void;
}

/** Danh sách thẻ QR thanh toán dạng cuộn dọc, gọn gàng, độ tương phản cao */
export function TransferQrBatchGrid({
  views,
  onDownloadRow,
}: TransferQrBatchGridProps) {
  const { t } = useV2Translation();

  if (views.length === 0) {
    return (
      <V2Text
        variant="body-sm"
        className="text-muted-foreground italic text-center py-4"
      >
        {t("v2.transferQr.batch.emptyGrid")}
      </V2Text>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
      {views.map((view) => (
        <div
          key={view.row.id}
          className="rounded-xl border border-border bg-card p-3 shadow-2xs text-card-foreground select-none flex flex-col gap-2.5 transition-all hover:border-border/80"
        >
          {/* Header thẻ: Số thứ tự lệnh & Tên người nhận */}
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border/50">
            <V2Badge
              variant="warning"
              size="xs"
              className="px-1.5 py-0.5 text-[10px] font-bold border-amber-300 dark:border-amber-700 shrink-0 whitespace-nowrap"
            >
              #{view.index} {t("v2.transferQr.batch.badgePay")}
            </V2Badge>
            <V2Text
              variant="body-sm"
              weight="bold"
              className="uppercase truncate max-w-[150px]"
            >
              {view.row.accountName || "-"}
            </V2Text>
          </div>

          {/* Body thẻ: QR bên trái (nền trắng chuẩn quét), thông tin ngân hàng/tài khoản/tiền bên phải */}
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 shrink-0 rounded-lg bg-white p-1 border border-border/40 shadow-2xs flex items-center justify-center">
              <V2Image
                src={view.qrDataUrl}
                alt={view.fileName}
                className="h-18 w-18 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5 text-xs">
              <V2Text
                variant="caption"
                weight="semibold"
                color="muted"
                className="truncate block"
              >
                {view.row.bankCode}
              </V2Text>
              <V2Text
                variant="numeric"
                weight="bold"
                className="truncate block tracking-tight"
              >
                {view.row.accountNumber}
              </V2Text>
              {view.row.amount != null && view.row.amount > 0 && (
                <V2Text
                  variant="currency"
                  weight="bold"
                  className="text-emerald-600 dark:text-emerald-400 block"
                >
                  {`${new Intl.NumberFormat("vi-VN").format(view.row.amount)} ₫`}
                </V2Text>
              )}
              {view.caption.content && (
                <V2Text
                  variant="caption"
                  color="muted"
                  className="font-mono truncate block"
                  title={view.caption.content}
                >
                  {view.caption.content}
                </V2Text>
              )}
            </div>
          </div>

          {/* Footer thẻ: Nút tải ảnh PNG chuẩn V2Button */}
          <V2Button
            variant="outline"
            size="xs"
            fullWidth
            onClick={() => onDownloadRow(view)}
            leftIcon={
              <V2Icon
                icon={Download}
                size={12}
                className="text-muted-foreground"
              />
            }
          >
            {t("v2.transferQr.batch.downloadRow")}
          </V2Button>
        </div>
      ))}
    </div>
  );
}
