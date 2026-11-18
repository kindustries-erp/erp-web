import React from "react";
import { GarageCasesDetailDrawer } from "./organisms/garage-cases-detail-drawer";

export interface GarageCheckpointDrawerProps {
  open: boolean;
  onClose: () => void;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
  branchId?: string;
  classification?: string;
  classificationName?: string;
}

/**
 * Wrapper dành riêng cho mảng Doanh thu / P&L theo kỳ (Tháng này, Tuần này, Hôm nay hoặc theo Phân loại ERP).
 * Bọc component lõi GarageCasesDetailDrawer với scope checkpoint và showProfitMetrics={true}.
 */
export function GarageCheckpointDrawer({
  open,
  onClose,
  dateFrom,
  dateTo,
  periodLabel,
  branchId,
  classification,
  classificationName,
}: GarageCheckpointDrawerProps) {
  if (!open) return null;
  return (
    <GarageCasesDetailDrawer
      open={open}
      onClose={onClose}
      scope={{
        kind: "checkpoint",
        dateFrom,
        dateTo,
        periodLabel,
        branchId,
        classification,
        classificationName,
      }}
      showProfitMetrics={true}
    />
  );
}
