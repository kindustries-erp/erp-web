import React from "react";
import { GarageCasesDetailDrawer } from "./organisms/garage-cases-detail-drawer";

export interface GarageCheckpointDrawerProps {
  open: boolean;
  onClose: () => void;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
  branchId?: string;
}

/**
 * Wrapper dành riêng cho mảng Doanh thu / P&L theo kỳ (Tháng này, Tuần này, Hôm nay).
 * Bọc component lõi GarageCasesDetailDrawer với scope checkpoint và showProfitMetrics={true}.
 */
export function GarageCheckpointDrawer({
  open,
  onClose,
  dateFrom,
  dateTo,
  periodLabel,
  branchId,
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
      }}
      showProfitMetrics={true}
    />
  );
}
