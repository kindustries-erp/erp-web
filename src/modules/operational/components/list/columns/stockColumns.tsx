import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { normalizeDateTimeGMT7 } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
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
        key: "item",
        header: t("inventory.table.columns.item"),
        className: "align-middle min-w-[220px]",
        cell: (row) => {
          const expanded = !!expandedStockItemIds[row.inventory_item_id];
          return (
            <div className="space-y-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(row);
                }}
                className="font-medium text-foreground hover:underline focus:outline-none flex items-center gap-1.5 text-left text-sm"
              >
                <span>{row.item_code || "—"}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform text-[color:var(--muted-fg)]",
                    expanded && "rotate-90",
                  )}
                />
              </button>
              <div className="text-xs text-[color:var(--muted-fg)]">
                {row.item_name || t("inventory.table.unnamed")}
              </div>
            </div>
          );
        },
      },
      {
        key: "item_type",
        header: t("inventory.table.columns.type"),
        className: "align-middle min-w-[90px]",
        cell: (row) => {
          const itemType = row.item_type;
          let cls = "bg-slate-100 text-slate-600";
          if (itemType === "RAW") cls = "bg-blue-100 text-blue-700";
          else if (itemType === "FG") cls = "bg-emerald-100 text-emerald-700";
          else if (itemType === "WIP") cls = "bg-amber-100 text-amber-700";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}
            >
              {itemType
                ? t(
                    `inventory.itemTypes.${itemType.toLowerCase() as "raw" | "fg" | "wip"}`,
                  )
                : "—"}
            </span>
          );
        },
      },
      {
        key: "received_qty",
        header: t("inventory.table.columns.in"),
        className: "align-middle min-w-[100px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm tabular-nums">
            {Number(row.received_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: t("inventory.table.columns.out"),
        className: "align-middle min-w-[100px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm tabular-nums">
            {Number(row.issued_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: t("inventory.table.columns.onHand"),
        className: "align-middle min-w-[110px] text-left",
        cell: (row) => (
          <span className="inline-block w-full text-left text-sm font-medium tabular-nums">
            {Number(row.on_hand_qty || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "unit",
        header: t("inventory.table.columns.unit"),
        className: "align-middle min-w-[80px]",
        cell: (row) => <span className="text-sm">{row.unit || "—"}</span>,
      },
      {
        key: "last",
        header: t("inventory.table.columns.lastTx"),
        className: "align-middle min-w-[180px]",
        cell: (row) => normalizeDateTimeGMT7(row.last_transaction_date) || "—",
      },
      {
        key: "status",
        header: t("inventory.table.columns.status"),
        className: "align-middle min-w-[100px]",
        cell: (row) => (
          <span
            className={
              row.status === "ACTIVE" || !row.status
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            }
          >
            {row.status || "ACTIVE"}
          </span>
        ),
      },
    ],
    [expandedStockItemIds, onToggleExpand, t],
  );
}
