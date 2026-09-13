import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { formatGMT7 } from "@/shared/utils/format";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { FileSpreadsheet, Check } from "lucide-react";
import { cn } from "@/shared/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (so: ErpSalesOrder) => void;
  existingSoIds?: string[];
}

export function SalesOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingSoIds = [],
}: Props) {
  const { t } = useTranslation("erpInvoices");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSo, setSelectedSo] = useState<ErpSalesOrder | null>(null);

  const tableState = useTableColumnState("sales-order-selection-table");
  const sortBy = tableState.sorts[0]?.replace("-", "") || "orderDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "desc" : "asc";

  const { data, isLoading } = useQuery({
    queryKey: [
      "sales-orders-selection",
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      salesOrdersCoreApi.list({
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: tableState.columnSearch["soNo"] || undefined,
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
      setSelectedSo(null);
    }
  }, [open]);

  const handleSelect = (so: ErpSalesOrder) => {
    setSelectedSo(so);
  };

  const handleConfirm = () => {
    if (selectedSo) {
      onSelect(selectedSo);
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
        queryKeyPrefix="sales-order-selection-column-options"
      />
    );
  };

  const columns = useMemo<DataTableColumn<ErpSalesOrder>[]>(() => {
    return [
      {
        key: "select",
        header: "",
        size: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (row: ErpSalesOrder) => {
          const isSelected = selectedSo?.id === row.id;
          const isExisting = existingSoIds.includes(row.id);
          return (
            <div className="flex items-center justify-center">
              <input
                type="radio"
                name="so_select"
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
        key: "soNo",
        header: renderHeaderFilter("soNo", t("Số SO", "Số SO")),
        size: 150,
        enableResizing: true,
        cell: (row: ErpSalesOrder) => (
          <span className="font-mono font-semibold text-primary">
            {row.soNo}
          </span>
        ),
      },
      {
        key: "orderDate",
        header: renderHeaderFilter("orderDate", t("Ngày đặt", "Ngày đặt")),
        size: 130,
        enableResizing: true,
        cell: (row: ErpSalesOrder) => (
          <span className="text-slate-600 dark:text-slate-300 font-sans">
            {row.orderDate ? formatGMT7(row.orderDate, "date") : "--"}
          </span>
        ),
      },
      {
        key: "customerName",
        header: renderHeaderFilter(
          "customerName",
          t("Khách hàng", "Khách hàng"),
        ),
        size: 260,
        enableResizing: true,
        cell: (row: ErpSalesOrder) => (
          <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
            {row.customerName || "--"}
          </span>
        ),
      },
      {
        key: "status",
        header: renderHeaderFilter("status", t("Trạng thái", "Trạng thái")),
        size: 130,
        enableResizing: true,
        cell: (row: ErpSalesOrder) => {
          const isExisting = existingSoIds.includes(row.id);
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
                row.status === "COMPLETED" || row.status === "DELIVERED"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : row.status === "CANCELLED"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
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
        cell: (row: ErpSalesOrder) => (
          <span className="text-xs text-slate-500 line-clamp-1">
            {row.remarks || "--"}
          </span>
        ),
      },
    ];
  }, [selectedSo, existingSoIds, tableState, t]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<FileSpreadsheet className="w-5 h-5 text-primary" />}
      title={t(
        "Chọn đơn bán hàng (SO) để ghép nối",
        "Chọn đơn bán hàng (SO) để ghép nối",
      )}
      panelClassName="w-full md:w-[95vw] lg:w-[1100px] xl:w-[1100px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Ghép nối"),
          primary: true,
          disabled: !selectedSo,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[480px]">
        <StandardTable<ErpSalesOrder>
          tableId="sales-order-selection-table"
          items={orders}
          columns={columns}
          getRowKey={(row) => row.id}
          variant="spreadsheet"
          enableColumnResizing={true}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setPageSize}
          minWidth={850}
          onRowClick={(row) => {
            if (!existingSoIds.includes(row.id)) {
              handleSelect(row);
            }
          }}
        />
      </div>
    </DrawerModal>
  );
}
