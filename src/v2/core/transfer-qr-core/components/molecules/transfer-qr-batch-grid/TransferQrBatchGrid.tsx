import * as React from "react";
import { Download } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms";
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
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 shrink-0 whitespace-nowrap">
              #{view.index} {t("v2.transferQr.batch.badgePay")}
            </span>
            <span className="font-bold text-xs uppercase text-foreground truncate max-w-[150px]">
              {view.row.accountName || "-"}
            </span>
          </div>

          {/* Body thẻ: QR bên trái (nền trắng chuẩn quét), thông tin ngân hàng/tài khoản/tiền bên phải */}
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 shrink-0 rounded-lg bg-white p-1 border border-border/40 shadow-2xs flex items-center justify-center">
              <img
                src={view.qrDataUrl}
                alt={view.fileName}
                className="h-18 w-18 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5 text-xs">
              <p className="text-[11px] font-semibold text-muted-foreground truncate">
                {view.row.bankCode}
              </p>
              <p className="font-mono font-bold text-foreground truncate tracking-tight">
                {view.row.accountNumber}
              </p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                {view.row.amount == null
                  ? t("v2.transferQr.batch.amountFree")
                  : `${new Intl.NumberFormat("vi-VN").format(view.row.amount)} ₫`}
              </p>
              {view.caption.content && (
                <p
                  className="text-[10px] font-mono text-muted-foreground truncate"
                  title={view.caption.content}
                >
                  {view.caption.content}
                </p>
              )}
            </div>
          </div>

          {/* Footer thẻ: Nút tải ảnh PNG chuẩn theme */}
          <button
            type="button"
            onClick={() => onDownloadRow(view)}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg border border-border bg-background hover:bg-muted active:bg-muted/80 text-[11px] font-semibold text-foreground transition-colors"
          >
            <Download className="h-3 w-3 text-muted-foreground" />
            <span>{t("v2.transferQr.batch.downloadRow")}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
