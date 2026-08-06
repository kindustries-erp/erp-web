import { useMemo } from "react";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { InventoryStockRow } from "@/modules/operational/api/operationalApi";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
interface UseStockColumnsOptions {
  stockItems: InventoryStockRow[];
  onViewItem: (id: string) => void;
}

/**
 * Hook trả về columns cho bảng tồn kho (variant="inventory").
 * Extracted từ OperationalListPage.tsx (dòng 1576–1688).
 */
export function useStockColumns({
  stockItems,
  onViewItem,
}: UseStockColumnsOptions): DataTableColumn<InventoryStockRow>[] {
  const t = useT();
  const store = useOperationalListStore();
  const tableState = useTableColumnState("inventory-stock-table");

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(key)) return "asc";
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    tableState.setSort(key, state);
    store.setPage(1);
  };

  const handleSearchChange = (key: string, val: string) => {
    tableState.setColumnSearch(key, val);
    store.setPage(1);
  };

  const handleFilterChange = (key: string, vals: string[]) => {
    tableState.setColumnFilter(key, vals);
    store.setPage(1);
  };

  const formatQty = (val: string | number) =>
    Number(val || 0).toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return useMemo<DataTableColumn<InventoryStockRow>[]>(
    () => [
      {
        key: "item_code",
        header: (
          <TableColumnHeaderFilter
            title={t("inventoryMasters.columns.sku")}
            sortState={getSortState("item_code")}
            onSortChange={(state) => handleSortChange("item_code", state)}
            searchValue={tableState.columnSearch["item_code"] || ""}
            onSearchChange={(val) => handleSearchChange("item_code", val)}
            selectedFilters={tableState.columnFilters["item_code"] || []}
            onFilterChange={(vals) => handleFilterChange("item_code", vals)}
            align="center"
            columnKey="item_code"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle text-left",
        headerClassName: "px-2",
        sortable: false,
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.item_code || ""}
            onDrawerClick={(e) => {
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
        header: (
          <TableColumnHeaderFilter
            title={t("inventoryMasters.columns.itemName")}
            sortState={getSortState("item_name")}
            onSortChange={(state) => handleSortChange("item_name", state)}
            searchValue={tableState.columnSearch["item_name"] || ""}
            onSearchChange={(val) => handleSearchChange("item_name", val)}
            selectedFilters={tableState.columnFilters["item_name"] || []}
            onFilterChange={(vals) => handleFilterChange("item_name", vals)}
            align="center"
            columnKey="item_name"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle text-left",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        dataIndex: "item_name",
        valueType: "text",
      },

      {
        key: "received_qty",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.in")}
            sortState={getSortState("received_qty")}
            onSortChange={(state) => handleSortChange("received_qty", state)}
            searchValue={tableState.columnSearch["received_qty"] || ""}
            onSearchChange={(val) => handleSearchChange("received_qty", val)}
            selectedFilters={tableState.columnFilters["received_qty"] || []}
            onFilterChange={(vals) => handleFilterChange("received_qty", vals)}
            align="right"
            columnKey="received_qty"
            allFilters={tableState.columnFilters}
            formatOptionLabel={formatQty}
          />
        ),
        className: "align-middle text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {formatQty(row.received_qty)}
          </span>
        ),
      },
      {
        key: "issued_qty",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.out")}
            sortState={getSortState("issued_qty")}
            onSortChange={(state) => handleSortChange("issued_qty", state)}
            searchValue={tableState.columnSearch["issued_qty"] || ""}
            onSearchChange={(val) => handleSearchChange("issued_qty", val)}
            selectedFilters={tableState.columnFilters["issued_qty"] || []}
            onFilterChange={(vals) => handleFilterChange("issued_qty", vals)}
            align="right"
            columnKey="issued_qty"
            allFilters={tableState.columnFilters}
            formatOptionLabel={formatQty}
          />
        ),
        className: "align-middle text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {formatQty(row.issued_qty)}
          </span>
        ),
      },
      {
        key: "adjusted_qty",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.adjusted", "Điều chỉnh")}
            sortState={getSortState("adjusted_qty")}
            onSortChange={(state) => handleSortChange("adjusted_qty", state)}
            searchValue={tableState.columnSearch["adjusted_qty"] || ""}
            onSearchChange={(val) => handleSearchChange("adjusted_qty", val)}
            selectedFilters={tableState.columnFilters["adjusted_qty"] || []}
            onFilterChange={(vals) => handleFilterChange("adjusted_qty", vals)}
            align="right"
            columnKey="adjusted_qty"
            allFilters={tableState.columnFilters}
            formatOptionLabel={formatQty}
          />
        ),
        className: "align-middle text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm tabular-nums">
            {formatQty(row.adjusted_qty)}
          </span>
        ),
      },
      {
        key: "on_hand_qty",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.onHand")}
            sortState={getSortState("on_hand_qty")}
            onSortChange={(state) => handleSortChange("on_hand_qty", state)}
            searchValue={tableState.columnSearch["on_hand_qty"] || ""}
            onSearchChange={(val) => handleSearchChange("on_hand_qty", val)}
            selectedFilters={tableState.columnFilters["on_hand_qty"] || []}
            onFilterChange={(vals) => handleFilterChange("on_hand_qty", vals)}
            align="right"
            columnKey="on_hand_qty"
            allFilters={tableState.columnFilters}
            formatOptionLabel={formatQty}
          />
        ),
        className: "align-middle text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums text-emerald-600">
            {formatQty(row.on_hand_qty)}
          </span>
        ),
      },
      {
        key: "reserved_qty",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.reserved")}
            sortState={getSortState("reserved_qty")}
            onSortChange={(state) => handleSortChange("reserved_qty", state)}
            searchValue={tableState.columnSearch["reserved_qty"] || ""}
            onSearchChange={(val) => handleSearchChange("reserved_qty", val)}
            selectedFilters={tableState.columnFilters["reserved_qty"] || []}
            onFilterChange={(vals) => handleFilterChange("reserved_qty", vals)}
            align="right"
            columnKey="reserved_qty"
            allFilters={tableState.columnFilters}
            formatOptionLabel={formatQty}
          />
        ),
        className: "align-middle text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <span className="inline-block w-full text-right text-sm font-medium tabular-nums text-amber-600">
            {formatQty(row.reserved_qty)}
          </span>
        ),
      },
      {
        key: "unit",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.unit")}
            sortState={getSortState("unit")}
            onSortChange={(state) => handleSortChange("unit", state)}
            searchValue={tableState.columnSearch["unit"] || ""}
            onSearchChange={(val) => handleSearchChange("unit", val)}
            selectedFilters={tableState.columnFilters["unit"] || []}
            onFilterChange={(vals) => handleFilterChange("unit", vals)}
            align="center"
            columnKey="unit"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle text-left",
        headerClassName: "px-2",
        sortable: false,
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
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.lastTx")}
            sortState={getSortState("last")}
            onSortChange={(state) => handleSortChange("last", state)}
            searchValue={tableState.columnSearch["last"] || ""}
            onSearchChange={(val) => handleSearchChange("last", val)}
            selectedFilters={tableState.columnFilters["last"] || []}
            onFilterChange={(vals) => handleFilterChange("last", vals)}
            align="right"
            columnKey="last"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle whitespace-nowrap text-right",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        dataIndex: "last_transaction_date",
        valueType: "date",
        dateFormat: "dd/MM/yyyy",
      },
      {
        key: "item_type",
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.type")}
            sortState={getSortState("item_type")}
            onSortChange={(state) => handleSortChange("item_type", state)}
            searchValue={tableState.columnSearch["item_type"] || ""}
            onSearchChange={(val) => handleSearchChange("item_type", val)}
            selectedFilters={tableState.columnFilters["item_type"] || []}
            onFilterChange={(vals) => handleFilterChange("item_type", vals)}
            align="center"
            columnKey="item_type"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle text-center",
        headerClassName: "px-2",
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
        header: (
          <TableColumnHeaderFilter
            title={t("inventory.table.columns.status")}
            sortState={getSortState("status")}
            onSortChange={(state) => handleSortChange("status", state)}
            searchValue={tableState.columnSearch["status"] || ""}
            onSearchChange={(val) => handleSearchChange("status", val)}
            selectedFilters={tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            allFilters={tableState.columnFilters}
          />
        ),
        className: "align-middle text-center flex justify-center w-full",
        headerClassName: "px-2",
        sortable: false,
        size: 140,
        enableResizing: true,
        dataIndex: "status",
        valueType: "status",
      },
    ],
    [t, store, tableState, stockItems, onViewItem],
  );
}
