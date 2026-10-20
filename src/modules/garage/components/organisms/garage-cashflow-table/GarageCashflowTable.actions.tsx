import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { Eye, Pencil, Trash2 } from "lucide-react";

export const getGarageCashflowRowActions = (
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onDelete?: (row: GarageCashflowVoucher) => void,
  canEdit: boolean = true,
  canDelete: boolean = true,
) => {
  const showDelete = Boolean(canDelete && onDelete);
  return (row: GarageCashflowVoucher) => [
    {
      groupLabel: "Thao tác chính",
      items: [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye className="w-4 h-4" />,
          onClick: () => openDetail(row, "view"),
        },
        ...(canEdit
          ? [
              {
                key: "edit",
                label: "Chỉnh sửa",
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
            groupLabel: "Khác",
            items: [
              {
                key: "delete",
                label: "Xóa phiếu",
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => onDelete!(row),
              },
            ],
          },
        ]
      : []),
  ];
};
