import React from "react";
import { GarageDebtDetailDrawer } from "../garage-debt-detail-drawer";
import type { GarageTimeHorizonDetailDrawerProps } from "./GarageTimeHorizonDetailDrawer.type";

/**
 * Drawer chi tiết một mốc tuổi nợ (thẻ dashboard). Nội dung giống drawer tháng,
 * chỉ khác nguồn lọc: theo mốc tuổi nợ thay vì theo tháng.
 */
export const GarageTimeHorizonDetailDrawer: React.FC<
  GarageTimeHorizonDetailDrawerProps
> = ({ open, onClose, horizon, dateFrom, dateTo, branchId }) => {
  if (!horizon) return null;
  return (
    <GarageDebtDetailDrawer
      open={open}
      onClose={onClose}
      scope={{ kind: "horizon", horizon, branchId, dateFrom, dateTo }}
    />
  );
};
