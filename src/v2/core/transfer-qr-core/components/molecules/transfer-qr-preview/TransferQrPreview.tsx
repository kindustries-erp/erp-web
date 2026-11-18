import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface TransferQrPreviewProps {
  qrDataUrl: string | null;
}

/** Xem trước mã QR một lệnh (cột phải). Nút tải nằm ở footer của drawer. */
export function TransferQrPreview({ qrDataUrl }: TransferQrPreviewProps) {
  const { t } = useV2Translation();

  return (
    <div className="flex flex-col items-center gap-3">
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt={t("v2.transferQr.preview.title")}
          className="h-56 w-56 rounded-md bg-white p-2"
        />
      ) : (
        <div className="flex h-56 w-56 items-center justify-center rounded-md border border-dashed p-4 text-center">
          <V2Text variant="body-sm">{t("v2.transferQr.preview.empty")}</V2Text>
        </div>
      )}
    </div>
  );
}
