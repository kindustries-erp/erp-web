import { useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import {
  buildGarageCashflowPrintData,
  type GarageCashflowPrintData,
} from "@/shared/components/print-templates/garage-cashflow-print-template";
import type { GarageCashflowVoucher } from "../api/garageCashflowApi";
import { useGarageCompanyAccounts } from "../components/organisms/garage-cashflow-drawer/useGarageCashflowPaymentQr";
import { buildVoucherPrintQr } from "../components/organisms/garage-cashflow-drawer/useGarageCashflowPaymentQr.helper";

export interface GarageCashflowPrintOptions {
  qrCodeDataUrl?: string | null;
  qrBankHint?: string | null;
}

/**
 * In phiếu thu chi. Có `options.qrCodeDataUrl` (in từ phần QR của drawer) thì dùng nguyên; không thì
 * dựng QR từ thông tin thanh toán đã lưu trên phiếu (phiếu thu cũ dùng tài khoản công ty mặc định).
 */
export function useGarageCashflowPrint() {
  const { data: companyProfile } = useCompanyProfile();
  const companyAccounts = useGarageCompanyAccounts();

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<GarageCashflowPrintData | null>(
    null,
  );
  const [printTargetId, setPrintTargetId] = useState<string | null>(null);

  const documentTitle = `${
    printData?.variant === "PAYMENT" ? "PhieuChi" : "PhieuThu"
  }_${printData?.voucherCode || ""}`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    onAfterPrint: () => setPrintTargetId(null),
  });

  useEffect(() => {
    if (printTargetId && printData) {
      handlePrint();
    }
  }, [printTargetId, printData, handlePrint]);

  const printVoucher = useCallback(
    async (
      voucher: GarageCashflowVoucher,
      options?: GarageCashflowPrintOptions,
    ) => {
      const qr = options?.qrCodeDataUrl
        ? options
        : await buildVoucherPrintQr(
            voucher,
            companyAccounts,
            companyProfile?.company_name,
          );
      setPrintData(buildGarageCashflowPrintData(voucher, qr));
      setPrintTargetId(voucher.id);
    },
    [companyAccounts, companyProfile?.company_name],
  );

  return { companyProfile, printRef, printData, printVoucher };
}
