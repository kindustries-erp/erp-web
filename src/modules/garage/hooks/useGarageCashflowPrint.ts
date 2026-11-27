import { useEffect, useRef, useState } from "react";
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
 * `isPrinting` bật từ lúc bấm In đến khi hộp thoại in sẵn sàng (hoặc lỗi), để UI hiện loading.
 */
export function useGarageCashflowPrint() {
  const { data: companyProfile } = useCompanyProfile();
  const companyAccounts = useGarageCompanyAccounts();

  const printRef = useRef<HTMLDivElement>(null);
  const preparingRef = useRef(false);
  const pendingPrintRef = useRef(false);
  const [printData, setPrintData] = useState<GarageCashflowPrintData | null>(
    null,
  );
  const [isPrinting, setIsPrinting] = useState(false);

  const documentTitle = `${
    printData?.variant === "PAYMENT" ? "PhieuChi" : "PhieuThu"
  }_${printData?.voucherCode || ""}`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    onBeforePrint: async () => {
      preparingRef.current = false;
      pendingPrintRef.current = false;
      setIsPrinting(false);
    },
    onPrintError: () => {
      preparingRef.current = false;
      pendingPrintRef.current = false;
      setIsPrinting(false);
    },
  });

  useEffect(() => {
    // Chỉ in một lần cho mỗi lần bấm: đổi state/render lại không kích hoạt in thêm.
    if (pendingPrintRef.current && printData) {
      pendingPrintRef.current = false;
      handlePrint();
    }
  }, [printData, handlePrint]);

  const printVoucher = async (
    voucher: GarageCashflowVoucher,
    options?: GarageCashflowPrintOptions,
  ) => {
    if (preparingRef.current) return;
    preparingRef.current = true;
    setIsPrinting(true);
    try {
      const qr = options?.qrCodeDataUrl
        ? options
        : await buildVoucherPrintQr(
            voucher,
            companyAccounts,
            companyProfile?.company_name,
          );
      pendingPrintRef.current = true;
      setPrintData(buildGarageCashflowPrintData(voucher, qr));
    } catch {
      preparingRef.current = false;
      setIsPrinting(false);
    }
  };

  return { companyProfile, printRef, printData, printVoucher, isPrinting };
}
