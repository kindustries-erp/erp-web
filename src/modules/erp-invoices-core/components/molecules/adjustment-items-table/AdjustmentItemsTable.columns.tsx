import React from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { cn } from "@/shared/utils";
import type { ItemReconciliationDto } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export function getAdjustmentItemsColumns(
  t: TFunction<"erpInvoices", undefined>,
): DataTableColumn<ItemReconciliationDto>[] {
  return [
    // 1. Cột STT: 40px, căn giữa, trực tiếp {idx} (CẤM idx + 1 theo chuẩn /standardize-table)
    {
      key: "index",
      header: <span className="w-full block text-center font-semibold">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px] font-semibold",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: ItemReconciliationDto, idx: number) => (
        <span className="w-full block text-center text-xs text-muted-foreground">
          {idx}
        </span>
      ),
    },

    // 2. Mặt hàng & Mã phụ tùng/dịch vụ
    {
      key: "description",
      header: (
        <span className="uppercase font-semibold">
          {t("itemDescription", "Mặt hàng / Diễn giải")}
        </span>
      ),
      size: 260,
      enableResizing: true,
      headerClassName: "uppercase font-semibold",
      cell: (row: ItemReconciliationDto) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <TableText
            text={row.description || "—"}
            className="font-medium text-foreground text-xs min-w-0"
            tooltip={true}
            enableCopy={Boolean(row.description)}
          />
          {row.itemCode && (
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {row.itemCode}
            </span>
          )}
        </div>
      ),
    },

    // 3. Đơn vị tính (ĐVT)
    {
      key: "unit",
      header: (
        <span className="w-full block text-center uppercase font-semibold">
          {t("unit", "ĐVT")}
        </span>
      ),
      size: 65,
      enableResizing: false,
      headerClassName: "text-center uppercase font-semibold",
      cell: (row: ItemReconciliationDto) => (
        <span className="w-full block text-center text-xs text-muted-foreground">
          {row.unit || "—"}
        </span>
      ),
    },

    // 4. Số lượng gốc
    {
      key: "originalQty",
      header: (
        <span className="w-full block text-right uppercase font-semibold">
          {t("originalQty", "SL Gốc")}
        </span>
      ),
      size: 85,
      headerClassName: "text-right uppercase font-semibold",
      cell: (row: ItemReconciliationDto) => (
        <span className="w-full block text-right font-mono text-xs text-muted-foreground">
          {row.originalQty}
        </span>
      ),
    },

    // 5. Chênh lệch điều chỉnh
    {
      key: "adjustedDeltaQty",
      header: (
        <span className="w-full block text-right uppercase font-semibold">
          {t("adjustedDeltaQty", "Đ/Chỉnh")}
        </span>
      ),
      size: 90,
      headerClassName: "text-right uppercase font-semibold",
      cell: (row: ItemReconciliationDto) => {
        const isNegative = row.adjustedDeltaQty < 0;
        const isPositive = row.adjustedDeltaQty > 0;
        return (
          <span
            className={cn(
              "w-full block text-right font-mono text-xs font-semibold",
              isNegative
                ? "text-rose-600 dark:text-rose-400"
                : isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground/60",
            )}
          >
            {isPositive ? `+${row.adjustedDeltaQty}` : row.adjustedDeltaQty}
          </span>
        );
      },
    },

    // 6. Số lượng hiệu lực (Net Effective)
    {
      key: "netEffectiveQty",
      header: (
        <span className="w-full block text-right uppercase font-semibold text-foreground">
          {t("netEffectiveQty", "Hiệu lực")}
        </span>
      ),
      size: 95,
      headerClassName: "text-right uppercase font-semibold",
      cell: (row: ItemReconciliationDto) => (
        <span className="w-full block text-right font-mono text-xs font-bold text-foreground">
          {row.netEffectiveQty}
        </span>
      ),
    },
  ];
}
