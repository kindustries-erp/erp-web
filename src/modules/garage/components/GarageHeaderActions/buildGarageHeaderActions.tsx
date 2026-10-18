import React from "react";
import { FileSpreadsheet, TrendingUp } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export interface GarageHeaderActionsConfig {
  canSyncGarage?: boolean;
  onExportExcel?: () => void;
  onSyncGrossProfit?: () => void;
}

/**
 * Dropdown của nút chính "Đồng bộ" dùng chung cho tab Tổng quan và Hoạt động garage:
 * nhóm "Báo cáo & Xuất file" và (khi có quyền) nhóm "Tùy chọn đồng bộ".
 */
export function buildGarageHeaderActions(
  config: GarageHeaderActionsConfig,
  t: (key: string, def?: string) => string,
): ActionDropdownItem[] {
  return [
    {
      groupLabel: t("cases.actions.exportGroup", "Báo cáo & Xuất file"),
      items: [
        {
          label: t("cases.actions.exportExcel", "Xuất Excel"),
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
          onClick: () => config.onExportExcel?.(),
        },
      ],
    },
    ...(config.canSyncGarage
      ? [
          {
            groupLabel: t("cases.actions.syncOptions", "Tùy chọn đồng bộ"),
            items: [
              {
                label: t(
                  "cases.actions.syncGrossProfit",
                  "Đồng bộ Lợi nhuận gộp",
                ),
                icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
                onClick: () => config.onSyncGrossProfit?.(),
              },
            ],
          },
        ]
      : []),
  ];
}
