import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { DrawerSection } from "@/shared/components/DrawerModal";
import type { DataTableColumn } from "@/shared/components/DataTable";

export interface VoucherLine {
  id?: string;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  description?: string;
  [key: string]: any;
}

interface VoucherDetailTableProps<T extends VoucherLine> {
  tableId: string;
  title: string;
  items: T[];
  itemsDict?: Record<
    string,
    { sku?: string; itemName?: string; [key: string]: any }
  >;
  extraColumns:
    | DataTableColumn<T>[]
    | ((
        listHook: ReturnType<typeof useTableColumnState>,
      ) => DataTableColumn<T>[]);
  summaryRow?: Record<string, React.ReactNode>;
  titleExtra?: React.ReactNode;
  viewOnly?: boolean;
  emptyLabel?: string;
  renderItemCodeCell?: (line: T, index: number) => React.ReactNode;
  renderItemNameCell?: (line: T, index: number) => React.ReactNode;
  containerClassName?: string;
  getRowKey: (item: T) => string;
}

export function VoucherDetailTable<T extends VoucherLine>({
  tableId,
  title,
  items,
  itemsDict = {},
  extraColumns,
  summaryRow,
  titleExtra,
  emptyLabel,
  renderItemCodeCell,
  renderItemNameCell,
  containerClassName = "max-h-[calc(100vh-280px)] overflow-y-auto",
  getRowKey,
}: VoucherDetailTableProps<T>) {
  const { t } = useTranslation();
  const listHook = useTableColumnState(tableId);

  const buildProcessedLines = useCallback(
    (lines: T[], excludeField?: "itemCode" | "itemName") => {
      if (!lines) return [];
      let result = [...lines];

      const searchItemCode =
        excludeField === "itemCode"
          ? ""
          : listHook.columnSearch["itemCode"]?.toLowerCase() || "";
      const searchItemName =
        excludeField === "itemName"
          ? ""
          : listHook.columnSearch["itemName"]?.toLowerCase() || "";
      const filterItemCode =
        excludeField === "itemCode"
          ? []
          : listHook.columnFilters["itemCode"] || [];
      const filterItemName =
        excludeField === "itemName"
          ? []
          : listHook.columnFilters["itemName"] || [];

      result = result.filter((line) => {
        const code =
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].sku
            : line.itemCode) || "";
        const name =
          line.itemName ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].itemName
            : "") ||
          line.description ||
          "";

        if (searchItemCode && !code.toLowerCase().includes(searchItemCode))
          return false;
        if (searchItemName && !name.toLowerCase().includes(searchItemName))
          return false;
        if (filterItemCode.length > 0 && !filterItemCode.includes(code))
          return false;
        if (filterItemName.length > 0 && !filterItemName.includes(name))
          return false;
        return true;
      });

      if (listHook.sorts.length > 0) {
        const sort = listHook.sorts[0];
        const isDesc = sort.startsWith("-");
        const field = sort.replace("-", "");

        result.sort((a, b) => {
          if (field === "itemCode" || field === "itemName") {
            const getVal = (l: T, f: string) => {
              if (f === "itemCode")
                return (
                  (l.itemId && itemsDict[l.itemId]
                    ? itemsDict[l.itemId].sku
                    : l.itemCode) || ""
                );
              return (
                l.itemName ||
                (l.itemId && itemsDict[l.itemId]
                  ? itemsDict[l.itemId].itemName
                  : "") ||
                l.description ||
                ""
              );
            };
            const valA = getVal(a, field);
            const valB = getVal(b, field);
            return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          // Fallback cho các field đặc thù nếu không nằm trong component này
          // Sẽ không hoạt động đúng nếu field là số và được sort trong component con
          return 0;
        });
      }

      return result;
    },
    [itemsDict, listHook.columnFilters, listHook.columnSearch, listHook.sorts],
  );

  const processedItems = useMemo(
    () => buildProcessedLines(items),
    [items, buildProcessedLines],
  );

  const itemsForCodeOptions = useMemo(
    () => buildProcessedLines(items, "itemCode"),
    [items, buildProcessedLines],
  );

  const itemsForNameOptions = useMemo(
    () => buildProcessedLines(items, "itemName"),
    [items, buildProcessedLines],
  );

  const buildFilterOptions = useCallback(
    (field: "itemCode" | "itemName", source: T[]) => {
      const unique = new Set<string>();
      source.forEach((line) => {
        if (field === "itemCode") {
          const code =
            (line.itemId && itemsDict[line.itemId]
              ? itemsDict[line.itemId].sku
              : line.itemCode) || "";
          if (code) unique.add(code);
        } else {
          const name =
            line.itemName ||
            (line.itemId && itemsDict[line.itemId]
              ? itemsDict[line.itemId].itemName
              : "") ||
            "";
          if (name) unique.add(name);
        }
      });
      const arr = Array.from(unique)
        .filter(Boolean)
        .map((val) => ({ label: val, value: val }));
      return async () => ({ items: arr, total: arr.length, next: null });
    },
    [itemsDict],
  );

  const baseColumns: DataTableColumn<T>[] = [
    {
      key: "index",
      header: "#",
      size: 40,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => (
        <span className="text-muted-foreground">{idx}</span>
      ),
    },
    {
      key: "itemCode",
      header: (
        <TableColumnHeaderFilter
          title={t("Mã vật tư")}
          sortState={
            listHook.sorts.includes("itemCode")
              ? "asc"
              : listHook.sorts.includes("-itemCode")
                ? "desc"
                : "none"
          }
          onSortChange={(state) => listHook.setSort("itemCode", state)}
          searchValue={listHook.columnSearch["itemCode"] || ""}
          onSearchChange={(val) => listHook.setColumnSearch("itemCode", val)}
          selectedFilters={listHook.columnFilters["itemCode"] || []}
          onFilterChange={(vals) => listHook.setColumnFilter("itemCode", vals)}
          align="center"
          columnKey="itemCode"
          queryKeyPrefix={`${tableId}-itemcode`}
          allFilters={listHook.columnFilters}
          fetchOptions={buildFilterOptions("itemCode", itemsForCodeOptions)}
        />
      ),
      minSize: 140,
      headerClassName: "w-[140px] min-w-[140px]",
      className: "w-[140px] min-w-[140px]",
      cell: (line: any, idx: number) => {
        if (renderItemCodeCell) return renderItemCodeCell(line, idx);
        const code =
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].sku
            : line.itemCode) ||
          line.itemName?.split(" — ")[0] ||
          "—";
        return <span className="font-medium text-foreground">{code}</span>;
      },
    },
    {
      key: "itemName",
      header: (
        <TableColumnHeaderFilter
          title={t("Tên vật tư")}
          sortState={
            listHook.sorts.includes("itemName")
              ? "asc"
              : listHook.sorts.includes("-itemName")
                ? "desc"
                : "none"
          }
          onSortChange={(state) => listHook.setSort("itemName", state)}
          searchValue={listHook.columnSearch["itemName"] || ""}
          onSearchChange={(val) => listHook.setColumnSearch("itemName", val)}
          selectedFilters={listHook.columnFilters["itemName"] || []}
          onFilterChange={(vals) => listHook.setColumnFilter("itemName", vals)}
          align="center"
          columnKey="itemName"
          queryKeyPrefix={`${tableId}-itemname`}
          allFilters={listHook.columnFilters}
          fetchOptions={buildFilterOptions("itemName", itemsForNameOptions)}
        />
      ),
      minSize: 260,
      headerClassName: "w-[260px] min-w-[260px]",
      className: "w-[260px] min-w-[260px]",
      cell: (line: any, idx: number) => {
        if (renderItemNameCell) return renderItemNameCell(line, idx);
        const name =
          line.itemName ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].itemName
            : "") ||
          line.description ||
          line.itemId ||
          "—";
        return (
          <div
            className="font-medium text-foreground truncate max-w-[260px]"
            title={name}
          >
            {name}
          </div>
        );
      },
    },
  ];

  return (
    <DrawerSection
      title={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full justify-between pr-4 mt-2 sm:mt-0 uppercase">
          <div className="flex items-center gap-3">
            <span className="shrink-0 mb-2 sm:mb-0 text-sm font-semibold text-gray-700">
              {title} ({processedItems.length})
            </span>
          </div>
        </div>
      }
      titleExtra={
        <div className="flex items-center gap-2">
          {titleExtra}
          <FilterButton
            onClick={() => {}}
            activeCount={listHook.activeFilterCount}
            onClear={() => listHook.resetFilters()}
          />
        </div>
      }
    >
      <DataTable
        items={processedItems}
        columns={[
          ...baseColumns,
          ...(typeof extraColumns === "function"
            ? extraColumns(listHook)
            : extraColumns),
        ]}
        getRowKey={getRowKey}
        variant="spreadsheet"
        emptyLabel={emptyLabel || t("Không có dữ liệu")}
        containerClassName={containerClassName}
        summaryRow={summaryRow}
      />
    </DrawerSection>
  );
}
