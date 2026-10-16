import { useMemo } from "react";
import type { TFunction } from "i18next";

interface UseCustomerSubTabsParams {
  isPayables: boolean;
  totalCount: number;
  t: TFunction;
}

export function useCustomerSubTabs({
  totalCount,
  t,
}: UseCustomerSubTabsParams) {
  return useMemo(
    () => [
      {
        value: "cases",
        label: t("customers.drawer.tabAllCases", "1. Danh sách phiếu dịch vụ"),
        badge: totalCount,
      },
      {
        value: "analytics",
        label: `2. ${t("customers.drawer.analyticsTabShort", "Biến động & Phân tích")}`,
      },
    ],
    [totalCount, t],
  );
}
