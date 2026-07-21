import React, { useState, useEffect, useMemo } from "react";
import { useT } from "@/core/i18n";
import {
  inventoryCoreApi,
  type InventorySerialRow,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

export interface SoSelectedSerialsTableProps {
  serialIds: string[];
}

const STATUS_MAP: Record<string, string> = {
  SOLD: "Đã bán",
  IN_STOCK: "Tồn kho",
  DELIVERED: "Đã giao",
  RESERVED: "Đã giữ chỗ",
  DELIVERING: "Đang giao",
};

export function SoSelectedSerialsTable({
  serialIds,
}: SoSelectedSerialsTableProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [serials, setSerials] = useState<InventorySerialRow[]>([]);

  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [sortBy, setSortBy] = useState<string>("serialNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("asc");

  const loadData = async () => {
    if (!serialIds || serialIds.length === 0) {
      setSerials([]);
      return;
    }
    try {
      setLoading(true);
      const res = await inventoryCoreApi.listSerials({
        ids: serialIds,
        pageSize: 1000,
      });
      setSerials(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [serialIds]);

  const getOptions = (key: string) => {
    const values = new Set<string>();
    serials.forEach((s) => {
      let val = s[key as keyof InventorySerialRow] as string;
      if (key === "color") val = s.attributes?.color as string;
      if (val) values.add(val);
    });
    return Array.from(values)
      .sort()
      .map((v) => ({
        label: key === "status" ? STATUS_MAP[v] || t(v) : v,
        value: v,
      }));
  };

  const renderHeader = (title: string, key: string) => {
    return (
      <TableColumnHeaderFilter
        title={title}
        align="center"
        sortState={sortBy === key ? sortOrder : "none"}
        onSortChange={(state) => {
          if (state === "none") {
            setSortBy("");
            setSortOrder("none");
          } else {
            setSortBy(key);
            setSortOrder(state);
          }
        }}
        searchValue={columnSearch[key] || ""}
        onSearchChange={(v) =>
          setColumnSearch((prev) => ({ ...prev, [key]: v }))
        }
        filterOptions={getOptions(key)}
        selectedFilters={columnFilters[key] || []}
        onFilterChange={(v) =>
          setColumnFilters((prev) => ({ ...prev, [key]: v }))
        }
      />
    );
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...serials];

    // Apply filters
    Object.keys(columnFilters).forEach((key) => {
      const filters = columnFilters[key];
      if (filters && filters.length > 0) {
        result = result.filter((s) => {
          let val = s[key as keyof InventorySerialRow] as string;
          if (key === "color") val = s.attributes?.color as string;
          return val && filters.includes(val);
        });
      }
    });

    // Apply column search
    Object.keys(columnSearch).forEach((key) => {
      const search = columnSearch[key];
      if (search) {
        const q = search.toLowerCase();
        result = result.filter((s) => {
          let val = s[key as keyof InventorySerialRow] as string;
          if (key === "color") val = s.attributes?.color as string;
          return val && val.toLowerCase().includes(q);
        });
      }
    });

    // Sort
    if (sortBy && sortOrder !== "none") {
      result.sort((a, b) => {
        let valA = a[sortBy as keyof InventorySerialRow] || "";
        let valB = b[sortBy as keyof InventorySerialRow] || "";

        if (sortBy === "color") {
          valA = a.attributes?.color || "";
          valB = b.attributes?.color || "";
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
    }

    return result;
  }, [serials, columnFilters, columnSearch, sortBy, sortOrder]);

  const columns: DataTableColumn<InventorySerialRow>[] = [
    {
      key: "index",
      header: "STT",
      size: 80,
      headerClassName: "text-center w-[80px] min-w-[80px]",
      className: "text-center w-[80px] min-w-[80px]",
      cell: (_, idx) => <span>{idx}</span>,
    },
    {
      key: "serialNo",
      header: renderHeader(t("Số seri"), "serialNo"),
      sortable: false, // disabled default sorting to use custom header
      dataIndex: "serialNo",
      valueType: "text",
      size: 150,
      headerClassName: "text-center w-[150px] min-w-[150px]",
      className: "w-[150px] min-w-[150px]",
    },
    {
      key: "vinNo",
      header: renderHeader(t("Số khung (VIN)"), "vinNo"),
      sortable: false,
      size: 150,
      headerClassName: "text-center w-[150px] min-w-[150px]",
      className: "w-[150px] min-w-[150px]",
      cell: (item) => <span>{item.vinNo || "-"}</span>,
    },
    {
      key: "engineNo",
      header: renderHeader(t("Số máy"), "engineNo"),
      sortable: false,
      size: 150,
      headerClassName: "text-center w-[150px] min-w-[150px]",
      className: "w-[150px] min-w-[150px]",
      cell: (item) => <span>{item.engineNo || "-"}</span>,
    },
    {
      key: "color",
      header: renderHeader(t("Màu sắc"), "color"),
      sortable: false,
      size: 120,
      headerClassName: "text-center w-[120px] min-w-[120px]",
      className: "w-[120px] min-w-[120px]",
      cell: (item) => <span>{item.attributes?.color || "-"}</span>,
    },
    {
      key: "deliveredDate",
      header: renderHeader(t("Ngày đã giao"), "deliveredDate"),
      sortable: false,
      size: 150,
      headerClassName: "text-center w-[150px] min-w-[150px]",
      className: "text-center w-[150px] min-w-[150px]",
      cell: (item) => {
        if (item.status === "DELIVERED" || item.status === "SOLD") {
          const dateStr = (item as any).deliveryDate;
          if (!dateStr) return "—";
          try {
            return new Date(dateStr).toLocaleDateString("vi-VN");
          } catch {
            return "—";
          }
        }
        return "—";
      },
    },
    {
      key: "status",
      header: renderHeader(t("Trạng thái"), "status"),
      sortable: false,
      valueType: "status",
      size: 120,
      headerClassName: "text-center w-[120px] min-w-[120px]",
      className: "text-center w-[120px] min-w-[120px]",
      cell: (item) => t(STATUS_MAP[item.status || ""] || item.status || "-"),
    },
  ];

  if (!serialIds || serialIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        variant="spreadsheet"
        items={filteredAndSorted}
        columns={columns}
        getRowKey={(item) => item.id}
        emptyLabel={t("Không có dữ liệu")}
        loading={loading}
      />
    </div>
  );
}
