import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { formatGMT7 } from "@/shared/utils/format";
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
        key: "item_code",
        header: t("inventoryMasters.columns.sku"),
        className: "align-middle min-w-[160px] text-right",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_code",
        cell: (row) => {
          const expanded = !!expandedStockItemIds[row.inventory_item_id];
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(row);
              }}
              className="font-medium text-foreground hover:underline focus:outline-none flex items-center justify-end w-full gap-1.5 text-right text-sm"
            >
              <Tooltip content={row.item_code || "—"} side="top">
                <span className="truncate max-w-[120px] inline-block">
                  {row.item_code || "—"}
                </span>
              </Tooltip>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform text-[color:var(--muted-fg)] shrink-0",
                  expanded && "rotate-90",
                )}
              />
            </button>
          );
        },
      },
      {
        key: "item_name",
        header: t("inventoryMasters.columns.itemName"),
        className: "align-middle min-w-[180px] text-right",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_name",
        cell: (row) => {
          const itemName = row.item_name || t("inventory.table.unnamed");
          return (
            <div className="w-full text-right overflow-hidden">
              <Tooltip content={itemName} side="top">
                <span className="text-sm truncate block w-full">
                  {itemName}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "item_type",
        header: t("inventory.table.columns.type"),
        className: "align-middle min-w-[150px] text-right",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "item_type",
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
            <div className="w-full text-right">
              <Tooltip content={typeText} side="top">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold truncate max-w-[120px] ${cls}`}
                >
                  {typeText}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "received_qty",
        header: t("inventory.table.columns.in"),
        className: "align-middle min-w-[100px] text-right",
        headerClassName: "text-center",
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {Number(row.received_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: t("inventory.table.columns.out"),
        className: "align-middle min-w-[100px] text-right",
        headerClassName: "text-center",
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: t("inventory.table.columns.onHand"),
        className: "align-middle min-w-[110px] text-right",
        headerClassName: "text-center",
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums">
            {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "unit",
        header: t("inventory.table.columns.unit"),
        className: "align-middle min-w-[80px] text-center",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "unit",
        cell: (row) => (
          <span className="text-sm block w-full text-center">
            {row.unit || "—"}
          </span>
        ),
      },
      {
        key: "last",
        header: t("inventory.table.columns.lastTx"),
        className: "align-middle min-w-[300px] whitespace-nowrap text-right",
        headerClassName: "text-center",
        cell: (row) => {
          if (!row.last_transaction_date) return "—";
          return (
            <div className="w-full text-right">
              <Tooltip content={formatGMT7(row.last_transaction_date, "datetime-sec")} side="top">
                <span className="cursor-help inline-block border-b border-dotted border-gray-400">
                  {formatGMT7(row.last_transaction_date, "date")}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("inventory.table.columns.status"),
        className: "align-middle min-w-[100px] text-center",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "status",
        cell: (row) => (
          <div className="w-full text-center">
            <span
              className={
                row.status === "ACTIVE" || !row.status
                  ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                  : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
              }
            >
              {row.status || "ACTIVE"}
            </span>
          </div>
        ),
      },
    ],
    [expandedStockItemIds, onToggleExpand, t],
  );
}
