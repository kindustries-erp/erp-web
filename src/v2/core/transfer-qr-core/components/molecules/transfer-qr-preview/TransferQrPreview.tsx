import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";
import { TransferQrPaymentCard } from "../transfer-qr-payment-card";
import {
  TransferQrMode,
  type TransferQrCompanyInfo,
  type TransferQrAccountOption,
} from "../../../transferQr.types";

export interface TransferQrPreviewProps {
  qrDataUrl: string | null;
  companyInfo?: TransferQrCompanyInfo;
  target?: Pick<
    TransferQrAccountOption,
    "bin" | "bankCode" | "accountNumber" | "accountName"
  > | null;
  amount?: number | null;
  content?: string;
  mode?: TransferQrMode;
  cardRef?: React.Ref<HTMLDivElement>;
}

/** Xem trước Thẻ mã QR chuyển khoản thương hiệu (cột phải). */
export function TransferQrPreview({
  qrDataUrl,
  companyInfo,
  target = null,
  amount,
  content,
  mode,
  cardRef,
}: TransferQrPreviewProps) {
  const { t } = useV2Translation();

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {qrDataUrl ? (
        <TransferQrPaymentCard
          qrDataUrl={qrDataUrl}
          companyInfo={companyInfo}
          target={target}
          amount={amount}
          content={content}
          mode={mode}
          cardRef={cardRef}
        />
      ) : (
        <div className="flex h-64 w-full max-w-[340px] items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20">
          <V2Text variant="body-sm" color="muted">
            {t("v2.transferQr.preview.empty")}
          </V2Text>
        </div>
      )}
    </div>
  );
}
