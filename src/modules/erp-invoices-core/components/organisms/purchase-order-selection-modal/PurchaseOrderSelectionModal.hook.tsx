import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { formatGMT7 } from "@/shared/utils/format";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils";

export function usePurchaseOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingPoIds = [],
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (po: ErpPurchaseOrder) => void;
  existingPoIds?: string[];
}) {
  const { t } = useTranslation("erpInvoices");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPo, setSelectedPo] = useState<ErpPurchaseOrder | null>(null);

  const tableState = useTableColumnState("purchase-order-selection-table");
  const sortBy = tableState.sorts[0]?.replace("-", "") || "orderDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "desc" : "asc";

  const { data, isLoading } = useQuery({
    queryKey: [
      "purchase-orders-selection",
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      purchaseOrdersCoreApi.list({
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: tableState.columnSearch["poNo"] || undefined,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open,
  });

  const orders = data?.items || [];

  useEffect(() => {
    if (open) {
      setSelectedPo(null);
    }
  }, [open]);

  const handleSelect = (po: ErpPurchaseOrder) => {
    setSelectedPo(po);
  };

  const handleConfirm = () => {
    if (selectedPo) {
      onSelect(selectedPo);
      onClose();
    }
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const renderHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={getSortState(key)}
        onSortChange={(state) => tableState.setSort(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          tableState.setColumnSearch(key, val);
          setPage(1);
        }}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          tableState.setColumnFilter(key, vals);
          setPage(1);
        }}
        columnKey={key}
        allFilters={tableState.columnFilters}
        queryKeyPrefix="purchase-order-selection-column-options"
      />
    );
  };

  const columns = useMemo<DataTableColumn<ErpPurchaseOrder>[]>(() => {
    return [
      {
        key: "select",
        header: "",
        size: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (row: ErpPurchaseOrder) => {
          const isSelected = selectedPo?.id === row.id;
          const isExisting = existingPoIds.includes(row.id);
          return (
            <div className="flex items-center justify-center">
              <input
                type="radio"
                name="po_select"
                disabled={isExisting}
                checked={isSelected}
                onChange={() => handleSelect(row)}
                className="cursor-pointer text-primary focus:ring-primary h-4 w-4"
              />
            </div>
          );
        },
      },
      {
        key: "poNo",
        header: renderHeaderFilter("poNo", t("Số PO", "Số PO")),
        size: 150,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => (
          <span className="font-mono font-semibold text-primary">
            {row.poNo}
          </span>
        ),
      },
      {
        key: "orderDate",
        header: renderHeaderFilter("orderDate", t("Ngày đặt", "Ngày đặt")),
        size: 130,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => (
          <span className="text-slate-600 dark:text-slate-300 font-sans">
            {row.orderDate ? formatGMT7(row.orderDate, "date") : "--"}
          </span>
        ),
      },
      {
        key: "supplierName",
        header: renderHeaderFilter(
          "supplierName",
          t("Nhà cung cấp", "Nhà cung cấp"),
        ),
        size: 260,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => (
          <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
            {row.supplierName || "--"}
          </span>
        ),
      },
      {
        key: "supplierInvoiceNo",
        header: renderHeaderFilter(
          "supplierInvoiceNo",
          t("Hóa đơn NCC", "Hóa đơn NCC"),
        ),
        size: 140,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => (
          <span className="font-mono text-xs text-slate-500">
            {row.supplierInvoiceNo || "--"}
          </span>
        ),
      },
      {
        key: "status",
        header: renderHeaderFilter("status", t("Trạng thái", "Trạng thái")),
        size: 130,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => {
          const isExisting = existingPoIds.includes(row.id);
          if (isExisting) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Check className="w-3 h-3" />
                {t("Đã liên kết", "Đã liên kết")}
              </span>
            );
          }
          return (
            <span
              className={cn(
                "inline-block text-[11px] px-2 py-0.5 rounded-full font-medium",
                row.status === "COMPLETED" || row.status === "RECEIVED"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : row.status === "CANCELLED"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {row.status || "DRAFT"}
            </span>
          );
        },
      },
      {
        key: "remarks",
        header: renderHeaderFilter("remarks", t("Ghi chú", "Ghi chú")),
        size: 200,
        enableResizing: true,
        cell: (row: ErpPurchaseOrder) => (
          <span className="text-xs text-slate-500 line-clamp-1">
            {row.remarks || "--"}
          </span>
        ),
      },
    ];
  }, [selectedPo, existingPoIds, tableState, t]);

  return {
    t,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedPo,
    orders,
    data,
    isLoading,
    columns,
    handleSelect,
    handleConfirm,
  };
}
