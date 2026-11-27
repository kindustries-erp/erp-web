import React from "react";
import { Download, Printer } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import {
  TransferQrPreview,
  type TransferQrPreviewProps,
} from "@/v2/core/transfer-qr-core";
import { useT } from "@/core/i18n";

export interface GarageCashflowDrawerPaymentQrPreviewProps extends TransferQrPreviewProps {
  onDownloadQr: () => void;
  isExporting?: boolean;
  onPrintWithQr?: () => void;
  canPrint?: boolean;
}

export const GarageCashflowDrawerPaymentQrPreview: React.FC<
  GarageCashflowDrawerPaymentQrPreviewProps
> = ({
  qrDataUrl,
  companyInfo,
  target,
  amount,
  content,
  mode,
  cardRef,
  onDownloadQr,
  isExporting = false,
  onPrintWithQr,
  canPrint,
}) => {
  const t = useT();

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <TransferQrPreview
        qrDataUrl={qrDataUrl}
        companyInfo={companyInfo}
        target={target}
        amount={amount}
        content={content}
        mode={mode}
        cardRef={cardRef}
      />

      {qrDataUrl && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <V2Button
            variant="outline"
            size="xs"
            onClick={onDownloadQr}
            disabled={isExporting}
            className="gap-1.5 text-xs"
            title={t("garage:cashflowDrawer.downloadQrTitle", "Tải ảnh QR")}
          >
            <Download className="h-3.5 w-3.5" />
            {t("garage:cashflowDrawer.downloadQr", "Tải QR")}
          </V2Button>
          {canPrint && onPrintWithQr && (
            <V2Button
              variant="primary"
              size="xs"
              onClick={onPrintWithQr}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              title={t(
                "garage:cashflowDrawer.printWithQrTitle",
                "In phiếu kèm mã QR",
              )}
            >
              <Printer className="h-3.5 w-3.5" />
              {t("garage:cashflowDrawer.printWithQr", "In phiếu QR")}
            </V2Button>
          )}
        </div>
      )}
    </div>
  );
};
