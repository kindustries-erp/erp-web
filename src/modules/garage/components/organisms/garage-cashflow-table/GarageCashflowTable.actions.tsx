import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { Eye, Pencil, Trash2, FileSpreadsheet } from "lucide-react";

export const getGarageCashflowRowActions = (
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onDelete?: (row: GarageCashflowVoucher) => void,
  canEdit: boolean = true,
  canDelete: boolean = true,
  t?: (key: string, def?: string) => string,
) => {
  const tr = t || ((_: string, def?: string) => def || "");
  const showDelete = Boolean(canDelete && onDelete);
  return (row: GarageCashflowVoucher) => [
    {
      groupLabel: tr("garage.cashflow.actions.mainActions", "Thao tác chính"),
      items: [
        {
          key: "view",
          label: tr("garage.cashflow.actions.viewDetail", "Xem chi tiết"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => openDetail(row, "view"),
        },
        ...(canEdit
          ? [
              {
                key: "edit",
                label: tr("garage.cashflow.actions.edit", "Chỉnh sửa"),
                icon: <Pencil className="w-4 h-4" />,
                onClick: () => openDetail(row, "edit"),
              },
            ]
          : []),
      ],
    },
    ...(showDelete
      ? [
          {
            groupLabel: tr("garage.cashflow.actions.other", "Khác"),
            items: [
              {
                key: "delete",
                label: tr("garage.cashflow.actions.deleteVoucher", "Xóa phiếu"),
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => onDelete!(row),
              },
            ],
          },
        ]
      : []),
  ];
};

export function buildGarageCashflowCreateActions(
  onExportExcel?: (filterState: any) => void,
  tableHook?: any,
  t?: (key: string, def?: string) => string,
) {
  const tr = t || ((_: string, def?: string) => def || "");
  return [
    {
      groupLabel: tr("groupThaoTac", "Thao tác"),
      items: [
        {
          label: tr("garage.cashflow.actions.exportExcel", "Xuất Excel"),
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
          onClick: () => {
            onExportExcel?.({
              column_filters: Object.keys(tableHook?.serverFilters || {}).length
                ? JSON.stringify(tableHook.serverFilters)
                : undefined,
              column_search: Object.keys(tableHook?.columnSearch || {}).length
                ? JSON.stringify(tableHook.columnSearch)
                : undefined,
              sorts: tableHook?.sorts,
              activeFilterCount: tableHook?.activeFilterCount,
              serverFilters: tableHook?.serverFilters,
            });
          },
        },
      ],
    },
  ];
}
