import React from "react";
import {
  GoodsReceiptPrintTemplate,
  type GoodsReceiptPrintData,
} from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import {
  GoodsIssuePrintTemplate,
  type GoodsIssuePrintData,
} from "@/shared/components/print-templates/GoodsIssuePrintTemplate";

export interface WarehousePrintSlotProps {
  printGrRef: React.RefObject<HTMLDivElement>;
  printGiRef: React.RefObject<HTMLDivElement>;
  companyProfile?: any;
  printGrData?: {
    id: string;
    data: GoodsReceiptPrintData;
  } | null;
  printGiData?: {
    id: string;
    data: GoodsIssuePrintData;
  } | null;
}

export function WarehousePrintSlot({
  printGrRef,
  printGiRef,
  companyProfile,
  printGrData,
  printGiData,
}: WarehousePrintSlotProps) {
  return (
    <div style={{ display: "none" }}>
      {printGrData && (
        <GoodsReceiptPrintTemplate
          ref={printGrRef}
          companyProfile={companyProfile}
          data={printGrData.data}
        />
      )}
      {printGiData && (
        <GoodsIssuePrintTemplate
          ref={printGiRef}
          companyProfile={companyProfile}
          data={printGiData.data}
        />
      )}
    </div>
  );
}
