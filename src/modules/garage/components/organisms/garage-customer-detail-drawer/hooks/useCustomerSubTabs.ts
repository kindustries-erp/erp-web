import { useMemo } from "react";
import type { TFunction } from "i18next";

interface UseCustomerSubTabsParams {
  isPayables: boolean;
  completedCount: number;
  inProgressCount: number;
  vehicleCount: number;
  t: TFunction;
}

export function useCustomerSubTabs({
  isPayables,
  completedCount,
  inProgressCount,
  vehicleCount,
  t,
}: UseCustomerSubTabsParams) {
  return useMemo(
    () => [
      {
        value: "cases",
        label: t("customers.drawer.tabCases", "1. Phiếu DV hoàn thành"),
        badge: completedCount,
      },
      {
        value: "pipeline",
        label: isPayables
          ? t("customers.drawer.tabPipelinePayables", "2. Xe đang làm (Dự chi)")
          : t("customers.drawer.tabPipeline", "2. Xe đang làm (Dự thu)"),
        badge: inProgressCount || undefined,
      },
      {
        value: "vehicles",
        label: `3. ${t("customers.drawer.vehicleTabShort", "Phân bổ theo xe")}`,
        badge: vehicleCount,
      },
      {
        value: "analytics",
        label: `4. ${t("customers.drawer.analyticsTabShort", "Biến động & Phân tích")}`,
      },
    ],
    [isPayables, completedCount, inProgressCount, vehicleCount, t],
  );
}
