import * as React from "react";
import { VIETQR_BANKS } from "../../../domain/constants/vietQrBanks";
import { getBankLogoUrl } from "../../../domain/constants/defaultBankOptions";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";
import { TransferQrMode } from "../../../transferQr.enum";
import type {
  TransferQrCompanyInfo,
  TransferQrAccountOption,
} from "../../../transferQr.types";
import { VIETQR_V_CENTER_ICON } from "../../../assets/vietQrBrandAssets";
import { TransferQrPaymentCardHeader } from "./TransferQrPaymentCardHeader";
import { TransferQrPaymentCardDetails } from "./TransferQrPaymentCardDetails";
import { TransferQrPaymentCardQrBlock } from "./TransferQrPaymentCardQrBlock";

export interface TransferQrPaymentCardProps {
  qrDataUrl: string;
  companyInfo?: TransferQrCompanyInfo;
  target: Pick<
    TransferQrAccountOption,
    "bin" | "bankCode" | "accountNumber" | "accountName" | "logoUrl"
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
  const [imgFailed, setImgFailed] = React.useState(false);
  const [companyLogoFailed, setCompanyLogoFailed] = React.useState(false);
  const isReceive = mode === TransferQrMode.RECEIVE_FROM_CUSTOMER;

  const bankInfo = React.useMemo(() => {
    if (!target) return null;
    return VIETQR_BANKS.find(
      (b) => b.bin === target.bin || b.code === target.bankCode,
    );
  }, [target]);

  const bankLogoUrl =
    target?.logoUrl ||
    bankInfo?.logoUrl ||
    (bankInfo?.code
      ? getBankLogoUrl(bankInfo.code)
      : target?.bankCode
        ? getBankLogoUrl(target.bankCode)
        : null);

  React.useEffect(() => {
    setImgFailed(false);
  }, [bankLogoUrl]);

  React.useEffect(() => {
    setCompanyLogoFailed(false);
  }, [companyInfo?.logo]);

  const centerLogoSrc =
    isReceive && companyInfo?.logo && !companyLogoFailed
      ? companyInfo.logo
      : VIETQR_V_CENTER_ICON;

  const handleCenterLogoError = () => {
    if (isReceive && companyInfo?.logo) {
      setCompanyLogoFailed(true);
    }
  };

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

      <TransferQrPaymentCardQrBlock
        qrDataUrl={qrDataUrl}
        centerLogoSrc={centerLogoSrc}
        onCenterLogoError={handleCenterLogoError}
        bankLogoUrl={bankLogoUrl}
        imgFailed={imgFailed}
        onBankLogoError={() => setImgFailed(true)}
        bankInfo={bankInfo}
        targetBankCode={target?.bankCode}
      />

      <TransferQrPaymentCardDetails
        isReceive={isReceive}
        displayAccountName={displayAccountName}
        accountNumber={target?.accountNumber}
        formattedAmount={formattedAmount}
        content={content}
      />
    </div>
  );
}
