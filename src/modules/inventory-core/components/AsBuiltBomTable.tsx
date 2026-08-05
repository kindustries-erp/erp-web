import { useMemo, useCallback } from "react";
import { DataTable } from "@/shared/components/DataTable";
import { useT } from "@/core/i18n";
import type { AsBuiltBomItem } from "@/modules/manufacturing/api/manufacturingApi";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export interface AsBuiltBomTableProps {
  items: AsBuiltBomItem[];
  loading?: boolean;
}

export function AsBuiltBomTable({ items, loading }: AsBuiltBomTableProps) {
  const t = useT();
  const listHook = useTableColumnState("as-built-bom-table");

  const processedItems = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    const searchItemName =
      listHook.columnSearch["itemName"]?.toLowerCase() || "";
    const searchSku = listHook.columnSearch["sku"]?.toLowerCase() || "";
    const searchSerialNo =
      listHook.columnSearch["serialNo"]?.toLowerCase() || "";

    const filterItemName = listHook.columnFilters["itemName"] || [];
    const filterSku = listHook.columnFilters["sku"] || [];
    const filterSerialNo = listHook.columnFilters["serialNo"] || [];

    result = result.filter((item) => {
      const name = item.serial?.item_name || item.serial?.sku || "";
      const sku = item.serial?.sku || "";
      const serialNo = item.serial?.serial_no || "";

      if (searchItemName && !name.toLowerCase().includes(searchItemName))
        return false;
      if (searchSku && !sku.toLowerCase().includes(searchSku)) return false;
      if (searchSerialNo && !serialNo.toLowerCase().includes(searchSerialNo))
        return false;

      if (filterItemName.length > 0 && !filterItemName.includes(name))
        return false;
      if (filterSku.length > 0 && !filterSku.includes(sku)) return false;
      if (filterSerialNo.length > 0 && !filterSerialNo.includes(serialNo))
        return false;

      return true;
    });

    if (listHook.sorts.length > 0) {
      const sort = listHook.sorts[0];
      const isDesc = sort.startsWith("-");
      const field = sort.replace("-", "");

      result.sort((a, b) => {
        let valA = "";
        let valB = "";

        if (field === "itemName") {
          valA = a.serial?.item_name || a.serial?.sku || "";
          valB = b.serial?.item_name || b.serial?.sku || "";
        } else if (field === "sku") {
          valA = a.serial?.sku || "";
          valB = b.serial?.sku || "";
        } else if (field === "serialNo") {
          valA = a.serial?.serial_no || "";
          valB = b.serial?.serial_no || "";
        }

        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    return result;
  }, [items, listHook.columnFilters, listHook.columnSearch, listHook.sorts]);

  const buildFilterOptions = useCallback(
    (field: "itemName" | "sku" | "serialNo") => {
      const unique = new Set<string>();
      (items || []).forEach((item) => {
        if (field === "itemName") {
          const name = item.serial?.item_name || item.serial?.sku || "";
          if (name) unique.add(name);
        } else if (field === "sku") {
          const sku = item.serial?.sku || "";
          if (sku) unique.add(sku);
        } else if (field === "serialNo") {
          const serialNo = item.serial?.serial_no || "";
          if (serialNo) unique.add(serialNo);
        }
      });
      const options = Array.from(unique)
        .filter(Boolean)
        .map((val) => ({ label: val, value: val }));
      return async () => ({
        items: options,
        total: options.length,
        next: null,
      });
    },
    [items],
  );

  return (
    <DataTable
      items={processedItems}
      getRowKey={(item) => item.id}
      variant="spreadsheet"
      emptyLabel={t("Chưa có linh kiện nào được lắp ráp.")}
      loading={loading}
      columns={[
        {
          key: "index",
          header: "#",
          size: 40,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_, idx) => (
            <span className="text-muted-foreground">{idx}</span>
          ),
        },
        {
          key: "itemName",
          header: (
            <TableColumnHeaderFilter
              title={t("Tên linh kiện")}
              sortState={
                listHook.sorts.includes("itemName")
                  ? "asc"
                  : listHook.sorts.includes("-itemName")
                    ? "desc"
                    : "none"
              }
              onSortChange={(state) => listHook.setSort("itemName", state)}
              searchValue={listHook.columnSearch["itemName"] || ""}
              onSearchChange={(val) =>
                listHook.setColumnSearch("itemName", val)
              }
              selectedFilters={listHook.columnFilters["itemName"] || []}
              onFilterChange={(vals) =>
                listHook.setColumnFilter("itemName", vals)
              }
              align="center"
              columnKey="itemName"
              queryKeyPrefix="asbuilt-bom-itemname"
              allFilters={listHook.columnFilters}
              fetchOptions={buildFilterOptions("itemName")}
            />
          ),
          minSize: 200,
          headerClassName: "w-[200px] min-w-[200px]",
          className: "w-[200px] min-w-[200px]",
          cell: (item) => (
            <div
              className="font-medium text-foreground truncate max-w-[260px]"
              title={item.serial?.item_name || item.serial?.sku || "-"}
            >
              {item.serial?.item_name || item.serial?.sku || "-"}
            </div>
          ),
        },
        {
          key: "sku",
          header: (
            <TableColumnHeaderFilter
              title={t("Mã linh kiện")}
              sortState={
                listHook.sorts.includes("sku")
                  ? "asc"
                  : listHook.sorts.includes("-sku")
                    ? "desc"
                    : "none"
              }
              onSortChange={(state) => listHook.setSort("sku", state)}
              searchValue={listHook.columnSearch["sku"] || ""}
              onSearchChange={(val) => listHook.setColumnSearch("sku", val)}
              selectedFilters={listHook.columnFilters["sku"] || []}
              onFilterChange={(vals) => listHook.setColumnFilter("sku", vals)}
              align="center"
              columnKey="sku"
              queryKeyPrefix="asbuilt-bom-sku"
              allFilters={listHook.columnFilters}
              fetchOptions={buildFilterOptions("sku")}
            />
          ),
          minSize: 140,
          headerClassName: "w-[140px] min-w-[140px]",
          className: "w-[140px] min-w-[140px]",
          cell: (item) => <span>{item.serial?.sku || "-"}</span>,
        },
        {
          key: "serialNo",
          header: (
            <TableColumnHeaderFilter
              title={t("Số seri")}
              sortState={
                listHook.sorts.includes("serialNo")
                  ? "asc"
                  : listHook.sorts.includes("-serialNo")
                    ? "desc"
                    : "none"
              }
              onSortChange={(state) => listHook.setSort("serialNo", state)}
              searchValue={listHook.columnSearch["serialNo"] || ""}
              onSearchChange={(val) =>
                listHook.setColumnSearch("serialNo", val)
              }
              selectedFilters={listHook.columnFilters["serialNo"] || []}
              onFilterChange={(vals) =>
                listHook.setColumnFilter("serialNo", vals)
              }
              align="center"
              columnKey="serialNo"
              queryKeyPrefix="asbuilt-bom-serialno"
              allFilters={listHook.columnFilters}
              fetchOptions={buildFilterOptions("serialNo")}
            />
          ),
          minSize: 160,
          headerClassName: "w-[160px] min-w-[160px]",
          className: "w-[160px] min-w-[160px]",
          cell: (item) => (
            <span className="font-medium">{item.serial?.serial_no || "-"}</span>
          ),
        },
      ]}
    />
  );
}
