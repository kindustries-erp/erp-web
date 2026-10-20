import React, { useEffect, useMemo, useCallback } from "react";
import { format, isValid } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

export function usePartnerInvoiceDrawer({
  open,
  taxCode,
  filterState,
}: {
  open: boolean;
  taxCode?: string;
  filterState?: any;
}) {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "partner-invoice-stats",
      taxCode,
      filterState?.dateFrom,
      filterState?.dateTo,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartnerStats(taxCode!, {
        date_from: filterState?.dateFrom || undefined,
        date_to: filterState?.dateTo || undefined,
      }),
    enabled: !!taxCode && open,
  });

  const listHook = useErpInvoicesList("ALL", taxCode);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);

  useEffect(() => {
    if (open && taxCode) {
      listHook.setPage(1);
      void listHook.loadInvoices();
    }
  }, [open, taxCode]);

  const barIn = "#ea580c"; // Orange 600 (Đầu vào - Chi phí)
  const barOut = "#059669"; // Emerald 600 (Đầu ra - Doanh thu)

  const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashOut) || [];
  const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashIn) || [];

  const getSortState = (key: string) => {
    if (listHook.tableState.sorts.includes(key)) return "asc";
    if (listHook.tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    listHook.tableState.setSort(key, state);
    listHook.setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    listHook.tableState.setColumnSearch(key, val);
    listHook.setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    listHook.tableState.setColumnFilter(key, vals);
    listHook.setPage(1);
  };

  const fetchInvoiceOptions = useCallback(
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
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (taxCode) {
        currentFilters["taxCode"] = [taxCode];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        newFiltersStr,
        undefined, // direction undefined to search both IN and OUT
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          const labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "invoiceDate" && valStr) {
            const dateVal = valStr.substring(0, 10); // ensure YYYY-MM-DD
            try {
              const parsed = new Date(dateVal);
              const label = isValid(parsed)
                ? format(parsed, "dd-MM-yyyy")
                : dateVal;
              return { label, value: dateVal };
            } catch {
              return { label: valStr, value: valStr };
            }
          }
          return { label: labelStr, value: valStr };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [taxCode],
  );

  const formatAmtOption = (val: string | number) => {
    const n = Number(val || 0);
    if (isNaN(n)) return String(val);
    return n.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columns = useMemo(() => {
    return [
      {
        key: "direction",
        header: "Loại HĐ",
        size: 80,
        className: "text-center",
        cell: (inv: any) => (
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              inv.direction === "IN"
                ? "bg-orange-100 text-orange-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {inv.direction === "IN" ? "Đầu vào" : "Đầu ra"}
          </span>
        ),
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title="Ngày HĐ"
            sortState={getSortState("invoiceDate")}
            onSortChange={(state) => handleSortChange("invoiceDate", state)}
            searchValue={listHook.tableState.columnSearch["invoiceDate"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceDate", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceDate"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceDate", vals)}
            align="center"
            columnKey="invoiceDate"
            hideFilter={true}
            hideFooter={true}
            dateRangeSlot={({ close }) => {
              const val = listHook.tableState.columnSearch["invoiceDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    handleSearchChange("invoiceDate", next);
                  }}
                  onClose={close}
                />
              );
            }}
          />
        ),
        size: 100,
        className: "text-right",
        cell: (inv: any) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd-MM-yyyy")
            : "",
      },
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title="Ký hiệu"
            sortState={getSortState("serialNo")}
            onSortChange={(state) => handleSortChange("serialNo", state)}
            searchValue={listHook.tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => handleSearchChange("serialNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["serialNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("serialNo", vals)}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        className: "text-left text-muted-foreground",
        cell: (inv: any) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title="Số HĐ"
            sortState={getSortState("invoiceNo")}
            onSortChange={(state) => handleSortChange("invoiceNo", state)}
            searchValue={listHook.tableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceNo", vals)}
            align="center"
            columnKey="invoiceNo"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            enableSelectAllMatching={true}
          />
        ),
        size: 100,
        className: "text-primary text-left",
        cell: (inv: any) => (
          <TableText
            text={inv.invoiceNo || ""}
            onDrawerClick={(e) => {
              e.stopPropagation();
              formHook.openInternal(inv);
            }}
            tooltip={true}
            enableCopy={true}
          />
        ),
      },
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title="Trước thuế"
            sortState={getSortState("preVatAmount")}
            onSortChange={(state) => handleSortChange("preVatAmount", state)}
            searchValue={listHook.tableState.columnSearch["preVatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("preVatAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["preVatAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("preVatAmount", vals)}
            align="center"
            columnKey="preVatAmount"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.preVatAmount || 0),
      },
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title="Tiền thuế"
            sortState={getSortState("vatAmount")}
            onSortChange={(state) => handleSortChange("vatAmount", state)}
            searchValue={listHook.tableState.columnSearch["vatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("vatAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["vatAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("vatAmount", vals)}
            align="center"
            columnKey="vatAmount"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.vatAmount || 0),
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title="Tổng tiền"
            sortState={getSortState("totalAmount")}
            onSortChange={(state) => handleSortChange("totalAmount", state)}
            searchValue={listHook.tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["totalAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("totalAmount", vals)}
            align="center"
            columnKey="totalAmount"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.totalAmount || 0),
      },
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title="Trạng thái"
            sortState={getSortState("status")}
            onSortChange={(state) => handleSortChange("status", state)}
            searchValue={listHook.tableState.columnSearch["status"] || ""}
            onSearchChange={(val) => handleSearchChange("status", val)}
            selectedFilters={listHook.tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={async () => ({
              items: [
                { value: "DRAFT", label: "Nháp" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "CANCELLED", label: "Đã hủy" },
              ],
              total: 3,
              next: null,
            })}
          />
        ),
        size: 100,
        className: "text-center",
        cell: (inv: any) => (
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
              inv.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : inv.status === "DRAFT"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {inv.status === "CANCELLED"
              ? "Đã hủy"
              : inv.status === "DRAFT"
                ? "Nháp"
                : "Đã xác nhận"}
          </span>
        ),
      },
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title="Diễn giải"
            sortState={getSortState("description")}
            onSortChange={(state) => handleSortChange("description", state)}
            searchValue={listHook.tableState.columnSearch["description"] || ""}
            onSearchChange={(val) => handleSearchChange("description", val)}
            selectedFilters={
              listHook.tableState.columnFilters["description"] || []
            }
            onFilterChange={(vals) => handleFilterChange("description", vals)}
            align="center"
            columnKey="description"
            queryKeyPrefix={`partner-invoice-options-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 250,
        cell: (inv: any) => (
          <Tooltip content={inv.description || ""}>
            <div className="truncate max-w-[250px]">
              {inv.description || "—"}
            </div>
          </Tooltip>
        ),
      },
    ];
  }, [formHook, listHook.tableState, taxCode, fetchInvoiceOptions]);

  return {
    statsData,
    isLoadingStats,
    listHook,
    formHook,
    columns,
    barIn,
    barOut,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
  };
}
