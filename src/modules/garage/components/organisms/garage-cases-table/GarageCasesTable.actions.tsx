import React from "react";
import { Eye, Users, Pencil, SlidersHorizontal, Scale } from "lucide-react";
import { buildGarageHeaderActions } from "../../GarageHeaderActions/buildGarageHeaderActions";
import type { GarageCasesTableProps } from "./GarageCasesTable.type";

export function buildGarageCaseCreateActions(
  props: GarageCasesTableProps,
  t: (key: string, def?: string) => string,
) {
  return buildGarageHeaderActions(
    {
      canSyncGarage: props.canSyncGarage,
      onExportExcel: () => props.onExportExcel?.({}),
      onOpenWorkflow: props.onOpenWorkflow,
      onSyncGrossProfit: props.onSyncGrossProfit,
    },
    t,
  );
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
          onClick: () =>
            props.onOpenFinancials(item.soChungTu || item.id, true),
        },
      ],
    },
  ];
}
