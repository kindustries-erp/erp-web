import React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useT } from "@/core/i18n";
import {
  useGarageCashflowPaymentQr,
  type UseGarageCashflowPaymentQrParams,
} from "./useGarageCashflowPaymentQr";
import { GarageCashflowDrawerPaymentQrPreview } from "./GarageCashflowDrawerPaymentQrPreview";
import { GarageCashflowDrawerPaymentQrFields } from "./GarageCashflowDrawerPaymentQrFields";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

export interface GarageCashflowDrawerPaymentQrSectionProps extends UseGarageCashflowPaymentQrParams {
  onPrint?: (
    voucher: GarageCashflowVoucher,
    options?: { qrCodeDataUrl?: string | null; qrBankHint?: string | null },
  ) => void;
}

export const GarageCashflowDrawerPaymentQrSection: React.FC<
  GarageCashflowDrawerPaymentQrSectionProps
> = ({ voucher, formData, onPrint }) => {
  const t = useT();
  const paymentQr = useGarageCashflowPaymentQr({ voucher, formData });
  const { bankCode, accountNumber, content, qrDataUrl, qrBankHint } = paymentQr;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${bankCode || "BANK"}_${accountNumber || "acc"}.png`;
    a.click();
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Insecure context fallback
    }
  };

  const handlePrintWithQr = () => {
    if (!voucher || !onPrint) return;
    onPrint(voucher, { qrCodeDataUrl: qrDataUrl, qrBankHint });
  };

  return (
    <DrawerSection
      title={t(
        "garage:cashflowDrawer.paymentQrTitle",
        "THÔNG TIN THANH TOÁN & MÃ QR",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <GarageCashflowDrawerPaymentQrFields paymentQr={paymentQr} />
        <GarageCashflowDrawerPaymentQrPreview
          qrDataUrl={qrDataUrl}
          qrBankHint={qrBankHint}
          accountNumber={accountNumber}
          content={content}
          onDownloadQr={handleDownloadQr}
          onCopy={handleCopy}
          onPrintWithQr={handlePrintWithQr}
          canPrint={Boolean(onPrint && voucher)}
        />
      </div>
    </DrawerSection>
  );
};
