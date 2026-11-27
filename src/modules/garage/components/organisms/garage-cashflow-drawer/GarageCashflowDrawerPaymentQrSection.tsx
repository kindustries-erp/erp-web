import React, { useRef, useState } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  buildPaymentCardFileName,
  exportCardImage,
} from "@/v2/core/transfer-qr-core";
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
> = ({ voucher, formData, setFormData, readOnly, onPrint }) => {
  const t = useT();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const paymentQr = useGarageCashflowPaymentQr({
    voucher,
    formData,
    setFormData,
    readOnly,
  });
  const {
    bankCode,
    accountNumber,
    amount,
    content,
    qrDataUrl,
    companyInfo,
    target,
    mode,
  } = paymentQr;

  const downloadRawQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${bankCode || "BANK"}_${accountNumber || "acc"}.png`;
    a.click();
  };

  const handleDownloadQr = async () => {
    if (!qrDataUrl) return;
    if (cardRef.current) {
      setIsExporting(true);
      try {
        const fileName = buildPaymentCardFileName({
          bankCode: bankCode || target?.bin || "BANK",
          accountNumber: accountNumber || "acc",
          amount,
          mode,
        });
        const ok = await exportCardImage({
          cardElement: cardRef.current,
          fileName,
        });
        if (ok) return;
      } finally {
        setIsExporting(false);
      }
    }
    downloadRawQr();
  };

  const handlePrintWithQr = () => {
    if (!voucher || !onPrint) return;
    // In theo dữ liệu đã lưu, không dùng QR đang sửa chưa lưu.
    onPrint(voucher);
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
          companyInfo={companyInfo}
          target={target}
          amount={amount}
          content={content}
          mode={mode}
          cardRef={cardRef}
          onDownloadQr={handleDownloadQr}
          isExporting={isExporting}
          onPrintWithQr={handlePrintWithQr}
          canPrint={Boolean(onPrint && voucher)}
        />
      </div>
    </DrawerSection>
  );
};
