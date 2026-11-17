import React from "react";
import { GarageDebtDetailDrawer } from "./organisms/garage-debt-detail-drawer";
import type { GarageTrendItem } from "../api/garageDashboardApi";

interface GarageMonthDetailDrawerProps {
  open: boolean;
  item: GarageTrendItem | null;
  activeTab: "RECEIPT" | "PAYMENT";
  onClose: () => void;
}

/** Drawer chi tiết một tháng trong xu hướng công nợ. Nội dung dùng chung với drawer mốc tuổi nợ. */
export function GarageMonthDetailDrawer({
  open,
  item,
  activeTab,
  onClose,
}: GarageMonthDetailDrawerProps) {
  if (!item) return null;
  return (
    <GarageDebtDetailDrawer
      open={open}
      onClose={onClose}
      scope={{ kind: "month", item }}
      activeTab={activeTab}
    />
  );
}
