import { useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import {
  buildGarageCashflowPrintData,
  type GarageCashflowPrintData,
} from "@/shared/components/print-templates/garage-cashflow-print-template";
import type { GarageCashflowVoucher } from "../api/garageCashflowApi";

export function useGarageCashflowPrint() {
  const { data: companyProfile } = useCompanyProfile();

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

  const printVoucher = useCallback((voucher: GarageCashflowVoucher) => {
    setPrintTargetId(voucher.id);
    setPrintData(buildGarageCashflowPrintData(voucher));
  }, []);

  return { companyProfile, printRef, printData, printVoucher };
}
