import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { InventoryStockRow } from "@/modules/operational/api/operationalApi";

interface UseStockColumnsOptions {
  expandedStockItemIds: Record<string, boolean>;
  onToggleExpand: (row: InventoryStockRow) => void;
}

/**
 * Hook trả về columns cho bảng tồn kho (variant="inventory").
 * Extracted từ OperationalListPage.tsx (dòng 1576–1688).
 */
export function useStockColumns({
  expandedStockItemIds,
  onToggleExpand,
}: UseStockColumnsOptions): DataTableColumn<InventoryStockRow>[] {
  const t = useT();
  return useMemo<DataTableColumn<InventoryStockRow>[]>(
    () => [
      {
        key: "__expand",
        header: "",
        className:
          "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center align-middle",
        headerClassName: "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center",
        size: 40,
        enableResizing: false,
        cell: (row) => {
          const expanded = !!expandedStockItemIds[row.inventory_item_id];
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(row);
              }}
              className="focus:outline-none flex items-center justify-center w-full"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform text-[color:var(--muted-fg)] shrink-0",
                  expanded && "rotate-90",
                )}
              />
            </button>
          );
        },
      },
      {
        key: "item_code",
        header: t("inventoryMasters.columns.sku"),
        className: "align-middle text-left",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_code",
        size: 140,
        enableResizing: true,
        dataIndex: "item_code",
        valueType: "text",
      },
      {
        key: "item_name",
        header: t("inventoryMasters.columns.itemName"),
        className: "align-middle text-left",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_name",
        size: 140,
        enableResizing: true,
        dataIndex: "item_name",
        valueType: "text",
      },

      {
        key: "received_qty",
        header: t("inventory.table.columns.in"),
        className: "align-middle text-right",
        headerClassName: "text-center",
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {Number(row.received_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: t("inventory.table.columns.out"),
        className: "align-middle text-right",
        headerClassName: "text-center",
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: t("inventory.table.columns.onHand"),
        className: "align-middle text-right",
        headerClassName: "text-center",
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums text-emerald-600">
            {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "unit",
        header: t("inventory.table.columns.unit"),
        className: "align-middle text-left",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "unit",
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="text-sm block w-full text-left">
            {row.unit || "—"}
          </span>
        ),
      },
      {
        key: "last",
        header: t("inventory.table.columns.lastTx"),
        className: "align-middle whitespace-nowrap text-right",
        headerClassName: "text-center",
        size: 140,
        enableResizing: true,
        dataIndex: "last_transaction_date",
        valueType: "date",
        dateFormat: "dd/MM/yyyy",
      },
      {
        key: "item_type",
        header: t("inventory.table.columns.type"),
        className: "align-middle text-center",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_type",
        size: 140,
        enableResizing: true,
        cell: (row) => {
          const itemType = row.item_type;
          let cls = "bg-slate-100 text-slate-600";
          if (itemType === "RAW") cls = "bg-blue-100 text-blue-700";
          else if (itemType === "FG") cls = "bg-emerald-100 text-emerald-700";
          else if (itemType === "WIP") cls = "bg-amber-100 text-amber-700";
          const typeText = itemType
            ? t(
                `inventory.itemTypes.${itemType.toLowerCase() as "raw" | "fg" | "wip"}`,
              )
            : "—";
          return (
            <div className="w-full text-center">
              <Tooltip content={typeText} side="top">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold truncate max-w-full ${cls}`}
                >
                  {typeText}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("inventory.table.columns.status"),
        className: "align-middle text-center",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "status",
        size: 140,
        enableResizing: true,
        dataIndex: "status",
        valueType: "status",
      },
    ],
    [expandedStockItemIds, onToggleExpand, t],
  );
}
