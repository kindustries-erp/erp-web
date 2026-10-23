import React, { useMemo } from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import type {
  VinfastPartsStockRow,
  VehicleStockType,
} from "./VinfastPartsStockTable.type";

interface UseVinfastPartsStockColumnsParams {
  headerFilter: any;
  t: TFunction;
  vehicleType: VehicleStockType;
  onSelectSku: (sku: string, row: VinfastPartsStockRow) => void;
}

export function useVinfastPartsStockColumns({
  headerFilter,
  t,
  vehicleType,
  onSelectSku,
}: UseVinfastPartsStockColumnsParams): DataTableColumn<VinfastPartsStockRow>[] {
  return useMemo<DataTableColumn<VinfastPartsStockRow>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "sku",
        header: headerFilter("sku", t("vinfastParts:PART_SKU", "Mã phụ tùng")),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.sku}
            enableCopy={true}
            tooltip={true}
            onDetailClick={(e) => {
              e.stopPropagation();
              onSelectSku(row.sku, row);
            }}
          />
        ),
      },
      {
        key: "name",
        header: headerFilter(
          "name",
          t("vinfastParts:PART_NAME", "Tên phụ tùng"),
        ),
        size: 300,
        enableResizing: true,
        headerClassName: "text-center",
        cell: (row) => (
          <div className="truncate w-full max-w-[280px]" title={row.name || ""}>
            {row.name || "—"}
          </div>
        ),
      },
      {
        key: "uom",
        header: headerFilter("uom", t("vinfastParts:UOM", "ĐVT"), {
          showBlankOption: true,
        }),
        size: 100,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        cell: (row) => row.uom || "—",
      },
      {
        key: "qtyIn",
        header: headerFilter.numeric(
          "qtyIn",
          t("vinfastParts:TOTAL_IN", "Tổng Nhập"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-medium text-emerald-700 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyIn || 0).toLocaleString("vi-VN"),
      },
      {
        key: "qtyOut",
        header: headerFilter.numeric(
          "qtyOut",
          t("vinfastParts:TOTAL_OUT", "Tổng Xuất"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-medium text-rose-700 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyOut || 0).toLocaleString("vi-VN"),
      },
      {
        key: "qtyBalance",
        header: headerFilter.numeric(
          "qtyBalance",
          t("vinfastParts:BALANCE", "Tồn cuối"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-bold text-slate-800 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyBalance || 0).toLocaleString("vi-VN"),
      },
    ],
    [headerFilter, t, vehicleType, onSelectSku],
  );
}
