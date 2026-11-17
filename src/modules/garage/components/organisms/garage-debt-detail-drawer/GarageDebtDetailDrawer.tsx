import React from "react";
import { GarageCasesDetailDrawer } from "../garage-cases-detail-drawer";
import type { GarageDebtDetailDrawerProps } from "./GarageDebtDetailDrawer.type";

/**
 * Wrapper dành riêng cho mảng Công nợ / Tuổi nợ / Dòng tiền.
 * Bọc component lõi GarageCasesDetailDrawer với showProfitMetrics={false}.
 */
export const GarageDebtDetailDrawer: React.FC<GarageDebtDetailDrawerProps> = ({
  open,
  onClose,
  scope,
  activeTab = "RECEIPT",
}) => {
  return (
    <GarageCasesDetailDrawer
      open={open}
      onClose={onClose}
      scope={scope}
      showProfitMetrics={false}
      activeTab={activeTab}
    />
  );
};
