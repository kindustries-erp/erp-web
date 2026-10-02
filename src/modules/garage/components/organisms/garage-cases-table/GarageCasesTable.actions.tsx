import React from "react";
import {
  FileSpreadsheet,
  TrendingUp,
  Eye,
  Users,
  Pencil,
  SlidersHorizontal,
  Scale,
} from "lucide-react";
import type { GarageCasesTableProps } from "./GarageCasesTable.type";

export function buildGarageCaseCreateActions(
  props: GarageCasesTableProps,
  t: (key: string, def?: string) => string,
) {
  return [
    {
      groupLabel: t("cases.actions.exportGroup", "Báo cáo & Xuất file"),
      items: [
        {
          label: t("cases.actions.exportExcel", "Xuất Excel"),
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
          onClick: () => props.onExportExcel?.(),
        },
      ],
    },
    ...(props.canSyncGarage
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
                onClick: () => props.onSyncGrossProfit?.(),
              },
            ],
          },
        ]
      : []),
  ];
}

export function buildGarageCaseRowActions(
  props: GarageCasesTableProps,
  t: (key: string, def?: string) => string,
) {
  return (item: any) => [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: t("cases.actions.viewDetail", "Xem chi tiết"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => props.onOpenDetail(item.soChungTu || item.id),
        },
        {
          label: t(
            "cases.actions.viewPartnerDetail",
            "Chi tiết theo đối tượng",
          ),
          icon: <Users className="w-4 h-4" />,
          onClick: () => props.onOpenDetail(item.soChungTu || item.id),
        },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        {
          label: t("cases.actions.editCase", "Chỉnh sửa"),
          icon: <Pencil className="w-4 h-4" />,
          onClick: () => props.onOpenEditNotes?.(item),
        },
        {
          label: t("cases.actions.configure", "Phân loại"),
          icon: <SlidersHorizontal className="w-4 h-4" />,
          onClick: () => props.onOpenConfig?.(item),
        },
        {
          label: t("cases.actions.reconcile", "Đối soát"),
          icon: <Scale className="w-4 h-4" />,
          onClick: () => props.onOpenFinancials(item.soChungTu || item.id),
        },
      ],
    },
  ];
}
