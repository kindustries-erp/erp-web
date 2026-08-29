import { useMemo, useCallback } from "react";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import {
  type InventoryStockRow,
  operationalApi,
} from "@/modules/operational/api/operationalApi";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { StatusBadge } from "@/shared/components/badges";
import { fmtQty } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

interface UseStockColumnsOptions {
  stockItems?: InventoryStockRow[];
  onViewItem: (id: string) => void;
}

/**
 * Hook trả về columns cho bảng tồn kho (variant="inventory")
 * Chuẩn hóa theo quy chuẩn /standardize-table
 */
export function useStockColumns({
  onViewItem,
}: UseStockColumnsOptions): DataTableColumn<InventoryStockRow>[] {
  const t = useT();
  const store = useOperationalListStore();
  const tableState = useTableColumnState("inventory-stock-table");

  const fetchStockOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await operationalApi.getInventoryStockColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: (res.items || []).map((i: string | number) => ({
          label: String(i),
          value: String(i),
        })),
        total: res.total || 0,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [],
  );

  const listHookLike = useMemo(
    () => ({
      sorts: tableState.sorts,
      setSort: (key: string, state: "asc" | "desc" | "none") => {
        tableState.setSort(key, state);
      },
      columnFilters: tableState.columnFilters,
      setColumnFilter: (key: string, vals: string[]) => {
        tableState.setColumnFilter(key, vals);
        store.setPage(1);
      },
      columnSearch: tableState.columnSearch,
      setColumnSearch: (key: string, val: string) => {
        tableState.setColumnSearch(key, val);
        store.setPage(1);
      },
      dateFrom: tableState.dateFrom,
      dateTo: tableState.dateTo,
      setDateRange: (from?: string, to?: string) => {
        tableState.setDateRange(from, to);
        store.setPage(1);
      },
    }),
    [tableState, store],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHookLike,
        queryKeyPrefix: "inventory-stock-col-options",
        fetchOptions: fetchStockOptions,
      }),
    [listHookLike, fetchStockOptions],
  );

  return useMemo<DataTableColumn<InventoryStockRow>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        hideable: false,
        sortable: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "item_code",
        header: headerFilter("item_code", t("inventoryMasters.columns.sku")),
        className: "align-middle text-left",
        sortable: false,
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.item_code || ""}
            onDetailClick={(e) => {
              e.stopPropagation();
              onViewItem(row.inventory_item_id);
            }}
            tooltip={true}
            enableCopy={true}
            textClassName="font-medium text-primary"
          />
        ),
      },
      {
        key: "item_name",
        header: headerFilter(
          "item_name",
          t("inventoryMasters.columns.itemName"),
        ),
        className: "align-middle text-left",
        sortable: false,
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <Tooltip content={row.item_name || ""}>
            <span className="truncate block w-full">
              {row.item_name || "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "received_qty",
        header: headerFilter.qty(
          "received_qty",
          t("inventory.table.columns.in"),
        ),
        className: "align-middle text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {fmtQty(row.received_qty)}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: headerFilter.qty(
          "issued_qty",
          t("inventory.table.columns.out"),
        ),
        className: "align-middle text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {fmtQty(row.issued_qty)}
          </span>
        ),
      },
      {
        key: "adjusted_qty",
        header: headerFilter.qty(
          "adjusted_qty",
          t("inventory.table.columns.adjusted", "Điều chỉnh"),
        ),
        className: "align-middle text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => {
          const qty = Number(row.adjusted_qty || 0);
          const colorClass =
            qty > 0
              ? "text-emerald-600"
              : qty < 0
                ? "text-red-600"
                : "text-muted-foreground";
          return (
            <span
              className={cn(
                "inline-block w-full text-right text-sm tabular-nums font-medium",
                colorClass,
              )}
            >
              {qty > 0 ? "+" : ""}
              {fmtQty(qty)}
            </span>
          );
        },
      },
      {
        key: "on_hand_qty",
        header: headerFilter.qty(
          "on_hand_qty",
          t("inventory.table.columns.onHand"),
        ),
        className: "align-middle text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums text-emerald-600">
            {fmtQty(row.on_hand_qty)}
          </span>
        ),
      },
      {
        key: "reserved_qty",
        header: headerFilter.qty(
          "reserved_qty",
          t("inventory.table.columns.reserved"),
        ),
        className: "align-middle text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums text-amber-600">
            {fmtQty(row.reserved_qty)}
          </span>
        ),
      },
      {
        key: "unit",
        header: headerFilter("unit", t("inventory.table.columns.unit"), {
          showBlankOption: true,
        }),
        className: "align-middle text-left",
        sortable: false,
        size: 100,
        enableResizing: true,
        cell: (row) => (
          <span className="text-sm block w-full text-left">
            {row.unit || "—"}
          </span>
        ),
      },
      {
        key: "last",
        header: headerFilter.date("last", t("inventory.table.columns.lastTx")),
        className: "align-middle whitespace-nowrap text-right",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) =>
          row.last_transaction_date ? (
            <TableDateCell
              date={row.last_transaction_date}
              className="justify-end w-full"
            />
          ) : (
            <span className="text-muted-foreground text-sm text-right block w-full">
              —
            </span>
          ),
      },
      {
        key: "item_type",
        header: headerFilter("item_type", t("inventory.table.columns.type"), {
          formatOptionLabel: (val: string) => {
            const v = (val || "").toLowerCase();
            if (v === "raw")
              return t("inventory.itemTypes.raw", "Nguyên vật liệu");
            if (v === "fg") return t("inventory.itemTypes.fg", "Thành phẩm");
            if (v === "wip")
              return t("inventory.itemTypes.wip", "Bán thành phẩm");
            return val;
          },
        }),
        className: "align-middle text-center",
        sortable: false,
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
            <div className="w-full text-center flex justify-center">
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
        header: headerFilter("status", t("inventory.table.columns.status")),
        className: "align-middle text-center",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <div className="w-full flex justify-center">
            <Tooltip content={t(row.status || "")}>
              <StatusBadge
                status={row.status || ""}
                className="w-[88px] inline-flex items-center justify-center text-center truncate"
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, headerFilter, onViewItem],
  );
}
