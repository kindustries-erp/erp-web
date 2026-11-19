import * as React from "react";
import { QrCode } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms";
import { VIETQR_BANKS } from "../../../domain/constants/vietQrBanks";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";
import {
  TransferQrMode,
  type TransferQrCompanyInfo,
  type TransferQrAccountOption,
} from "../../../transferQr.types";
import { TransferQrPaymentCardHeader } from "./TransferQrPaymentCardHeader";
import { TransferQrPaymentCardDetails } from "./TransferQrPaymentCardDetails";

export interface TransferQrPaymentCardProps {
  qrDataUrl: string;
  companyInfo?: TransferQrCompanyInfo;
  target: Pick<
    TransferQrAccountOption,
    "bin" | "bankCode" | "accountNumber" | "accountName"
  > | null;
  amount?: number | null;
  content?: string;
  mode?: TransferQrMode;
  cardRef?: React.Ref<HTMLDivElement>;
}

export function TransferQrPaymentCard({
  qrDataUrl,
  companyInfo,
  target,
  amount,
  content,
  mode = TransferQrMode.PAY_TO_SUPPLIER,
  cardRef,
}: TransferQrPaymentCardProps) {
  const { t } = useV2Translation();
  const isReceive = mode === TransferQrMode.RECEIVE_FROM_CUSTOMER;

  const bankInfo = React.useMemo(() => {
    if (!target) return null;
    return VIETQR_BANKS.find(
      (b) => b.bin === target.bin || b.code === target.bankCode,
    );
  }, [target]);

  const formattedAmount =
    amount != null && amount > 0
      ? `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`
      : t("v2.transferQr.card.amountFree");

  const displayAccountName = isReceive
    ? companyInfo?.companyName || target?.accountName || "CÔNG TY"
    : target?.accountName || "-";

  return (
    <div
      ref={cardRef}
      className="w-full max-w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg text-slate-900 select-none"
    >
      <TransferQrPaymentCardHeader
        isReceive={isReceive}
        companyInfo={companyInfo}
        displayAccountName={displayAccountName}
      />

      {/* QR Code Canvas */}
      <div className="my-3 flex flex-col items-center">
        <div className="relative rounded-xl bg-white p-2.5 shadow-sm border border-slate-200">
          <img
            src={qrDataUrl}
            alt="VietQR"
            className="h-44 w-44 object-contain"
          />
        </div>
        <V2Text
          variant="caption"
          weight="semibold"
          className="mt-1.5 text-center text-slate-600 block"
        >
          {bankInfo
            ? `${bankInfo.shortName} (${bankInfo.code})`
            : target?.bankCode || "NAPAS 247"}
        </V2Text>
      </div>

      <TransferQrPaymentCardDetails
        isReceive={isReceive}
        displayAccountName={displayAccountName}
        accountNumber={target?.accountNumber}
        formattedAmount={formattedAmount}
        content={content}
      />

      {/* Footer hint */}
      <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-slate-500">
        <QrCode className="h-3 w-3 text-emerald-600 shrink-0" />
        <V2Text
          variant="caption"
          className="truncate text-slate-500 text-[10px]"
        >
          {isReceive
            ? t("v2.transferQr.card.scanHintReceive")
            : t("v2.transferQr.card.scanHintPay")}
        </V2Text>
      </div>
    </div>
  );
}
