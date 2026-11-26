import React from "react";
import { Copy, Download, Printer } from "lucide-react";
import { V2Button, V2Image, V2Text } from "@/v2/shared/components/atoms";
import { useT } from "@/core/i18n";

export interface GarageCashflowDrawerPaymentQrPreviewProps {
  qrDataUrl: string | null;
  qrBankHint: string | null;
  accountNumber: string;
  content: string;
  onCopy: (text: string) => void;
  onDownloadQr: () => void;
  onPrintWithQr?: () => void;
  canPrint?: boolean;
}

export const GarageCashflowDrawerPaymentQrPreview: React.FC<
  GarageCashflowDrawerPaymentQrPreviewProps
> = ({
  qrDataUrl,
  qrBankHint,
  accountNumber,
  content,
  onCopy,
  onDownloadQr,
  onPrintWithQr,
  canPrint,
}) => {
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[220px]">
      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-200">
            <V2Image
              src={qrDataUrl}
              alt="VietQR"
              className="h-36 w-36 object-contain"
            />
          </div>
          <V2Text
            variant="caption"
            className="text-[11px] font-semibold text-slate-700 text-center"
          >
            {qrBankHint || "VietQR Napas 247"}
          </V2Text>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
            {accountNumber && (
              <V2Button
                variant="outline"
                size="xs"
                onClick={() => onCopy(accountNumber)}
                className="gap-1 text-[11px]"
                title="Sao chép STK"
              >
                <Copy className="h-3 w-3" />
                STK
              </V2Button>
            )}
            {content && (
              <V2Button
                variant="outline"
                size="xs"
                onClick={() => onCopy(content)}
                className="gap-1 text-[11px]"
                title="Sao chép nội dung"
              >
                <Copy className="h-3 w-3" />
                Nội dung
              </V2Button>
            )}
            <V2Button
              variant="outline"
              size="xs"
              onClick={onDownloadQr}
              className="gap-1 text-[11px]"
              title="Tải ảnh QR"
            >
              <Download className="h-3 w-3" />
              Tải QR
            </V2Button>
            {canPrint && onPrintWithQr && (
              <V2Button
                variant="primary"
                size="xs"
                onClick={onPrintWithQr}
                className="gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                title="In phiếu kèm mã QR"
              >
                <Printer className="h-3 w-3" />
                In phiếu QR
              </V2Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-4">
          <V2Text variant="caption" className="text-slate-400">
            {t(
              "garage:cashflowDrawer.qrEmptyHint",
              "Chọn tài khoản hoặc nhập đủ ngân hàng & số tài khoản để tạo mã QR.",
            )}
          </V2Text>
        </div>
      )}
    </div>
  );
};
