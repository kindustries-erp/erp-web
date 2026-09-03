import React, { useMemo } from "react";
import { type TFunction } from "i18next";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { fmtAmt, formatAmtOption } from "../../utils";
import { InvoiceItemsPopover } from "../cells/InvoiceItemsPopover";
import { PostingStatusBadge } from "../cells/InvoiceStatusBadge";

export interface AmountColumnsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
  listHook: ReturnType<typeof useErpInvoicesList>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
  fetchInvoiceOptions: (params: any) => Promise<any>;
}

const TAX_TAB_TO_STATUS: Record<string, string[]> = {
  all: [],
  new: ["1"],
  replacement: ["2", "4"],
  adjustment: ["3", "5"],
};

export function useAmountColumns({
  direction,
  t,
  listHook,
  getSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
  fetchInvoiceOptions,
}: AmountColumnsOptions) {
  const effectiveAllFilters = useMemo(() => {
    const filters = { ...listHook.tableState.columnFilters };
    const userSelectedStatus =
      listHook.tableState.columnFilters?.taxInvoiceStatus;
    if (userSelectedStatus && userSelectedStatus.length > 0) {
      filters.taxInvoiceStatus = userSelectedStatus;
    } else {
      const taxStatusList = TAX_TAB_TO_STATUS[listHook.activeTaxTab || "all"];
      if (taxStatusList && taxStatusList.length > 0) {
        filters._taxTab = [listHook.activeTaxTab];
        filters.taxInvoiceStatus = taxStatusList;
      }
    }
    return filters;
  }, [listHook.tableState.columnFilters, listHook.activeTaxTab]);

  return useMemo(() => {
    return {
      description: {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("description", "Diễn giải")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 250,
        className: "text-left whitespace-normal",
        headerClassName: "text-center",
        cell: (row: ErpInvoice) => (
          <TableText
            text={(row.description || "—").replace(/\\n/g, " ")}
            tooltip={true}
            popoverContent={
              row.items && row.items.length > 0
                ? () => <InvoiceItemsPopover items={row.items} />
                : undefined
            }
            textClassName="line-clamp-2 break-words whitespace-normal text-[11px] leading-[1.4] text-slate-700 dark:text-slate-300 py-0.5"
          />
        ),
      },
      discountAmount: {
        key: "discountAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("discountAmount", "Chiết khấu")}
            sortState={getSortState("discountAmount")}
            onSortChange={(state) => handleSortChange("discountAmount", state)}
            searchValue={
              listHook.tableState.columnSearch["discountAmount"] || ""
            }
            onSearchChange={(val) => handleSearchChange("discountAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["discountAmount"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("discountAmount", vals)
            }
            align="center"
            columnKey="discountAmount"
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv: ErpInvoice) => fmtAmt(inv.discountAmount),
      },
      preVatAmount: {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("preVatAmount", "Trước GTGT")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row: ErpInvoice) => fmtAmt(row.preVatAmount),
      },
      vatRate: {
        key: "vatRate",
        header: (
          <TableColumnHeaderFilter
            title={t("vatRate", "Thuế suất GTGT")}
            sortState={getSortState("vatRate")}
            onSortChange={(state) => handleSortChange("vatRate", state)}
            searchValue={listHook.tableState.columnSearch["vatRate"] || ""}
            onSearchChange={(val) => handleSearchChange("vatRate", val)}
            selectedFilters={listHook.tableState.columnFilters["vatRate"] || []}
            onFilterChange={(vals) => handleFilterChange("vatRate", vals)}
            align="center"
            columnKey="vatRate"
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row: ErpInvoice) =>
          row.vatRate != null ? `${Number(row.vatRate) * 100}%` : "",
      },
      vatAmount: {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("vatAmount", "Thuế GTGT")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv: ErpInvoice) => fmtAmt(inv.vatAmount),
      },
      totalAmount: {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("totalAmount", "Thành tiền")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={effectiveAllFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right font-semibold",
        cell: (inv: ErpInvoice) => fmtAmt(inv.totalAmount),
      },
      outboundCols:
        direction === "OUT"
          ? ([
              {
                key: "settlementOrder",
                header: (
                  <TableColumnHeaderFilter
                    title={t("settlementOrder", "Lệnh quyết toán")}
                    sortState={getSortState("settlementOrder")}
                    onSortChange={(state) =>
                      handleSortChange("settlementOrder", state)
                    }
                    searchValue={
                      listHook.tableState.columnSearch["settlementOrder"] || ""
                    }
                    onSearchChange={(val) =>
                      handleSearchChange("settlementOrder", val)
                    }
                    selectedFilters={
                      listHook.tableState.columnFilters["settlementOrder"] || []
                    }
                    onFilterChange={(vals) =>
                      handleFilterChange("settlementOrder", vals)
                    }
                    align="center"
                    columnKey="settlementOrder"
                    allFilters={effectiveAllFilters}
                    fetchOptions={fetchInvoiceOptions}
                  />
                ),
                headerClassName: "text-center w-[150px]",
                className: "text-left w-[150px]",
                cell: (inv: ErpInvoice) => inv.settlementOrder || "—",
              },
              {
                key: "licensePlate",
                header: (
                  <TableColumnHeaderFilter
                    title={t("licensePlate", "Biển số xe")}
                    sortState={getSortState("licensePlate")}
                    onSortChange={(state) =>
                      handleSortChange("licensePlate", state)
                    }
                    searchValue={
                      listHook.tableState.columnSearch["licensePlate"] || ""
                    }
                    onSearchChange={(val) =>
                      handleSearchChange("licensePlate", val)
                    }
                    selectedFilters={
                      listHook.tableState.columnFilters["licensePlate"] || []
                    }
                    onFilterChange={(vals) =>
                      handleFilterChange("licensePlate", vals)
                    }
                    align="center"
                    columnKey="licensePlate"
                    allFilters={effectiveAllFilters}
                    fetchOptions={fetchInvoiceOptions}
                  />
                ),
                headerClassName: "text-center w-[110px]",
                className: "text-left w-[110px]",
                cell: (inv: ErpInvoice) => inv.licensePlate || "—",
              },
            ] as DataTableColumn<ErpInvoice>[])
          : [],
      netOffAmount: {
        key: "netOffAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("netOffAmount", "Đã cấn trừ")}
            sortState={getSortState("netOffAmount")}
            onSortChange={(state) => handleSortChange("netOffAmount", state)}
            searchValue={listHook.tableState.columnSearch["netOffAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("netOffAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["netOffAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("netOffAmount", vals)}
            align="right"
            filterOptions={[
              { value: "settled_full", label: "Đã cấn trừ hết" },
              { value: "settled_partial", label: "Đã cấn trừ một phần" },
              { value: "unsettled", label: "Chưa cấn trừ" },
            ]}
          />
        ),
        size: 150,
        headerClassName: "text-right bg-blue-50/50 border-l border-blue-200",
        className: "text-right bg-blue-50/50 border-l border-blue-200",
        cell: (inv: any) => {
          const netOff = parseFloat(inv.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="text-blue-600">{fmtAmt(inv.netOffAmount)}</span>
          );
        },
      },
      remainingAmount: {
        key: "remainingAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.columns.remainingAmount", "Còn lại")}
            sortState={getSortState("remainingAmount")}
            onSortChange={(state) => handleSortChange("remainingAmount", state)}
            searchValue={
              listHook.tableState.columnSearch["remainingAmount"] || ""
            }
            onSearchChange={(val) => handleSearchChange("remainingAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["remainingAmount"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("remainingAmount", vals)
            }
            align="right"
            filterOptions={[
              { value: "settled_full", label: "Đã cấn trừ hết" },
              { value: "settled_partial", label: "Đã cấn trừ một phần" },
              { value: "unsettled", label: "Chưa cấn trừ" },
            ]}
          />
        ),
        size: 120,
        headerClassName: "text-center bg-blue-50/50",
        className: "text-right font-semibold bg-blue-50/50",
        cell: (inv: any) => {
          const total = parseFloat(inv.totalAmount) || 0;
          const netOff = parseFloat(inv.netOffAmount) || 0;
          const remaining = total - netOff;
          if (remaining === 0)
            return <span className="text-emerald-600">0</span>;
          return (
            <span className="text-slate-700">
              {fmtAmt(remaining.toString())}
            </span>
          );
        },
      },
      postingStatus: {
        key: "postingStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("postingStatus", "Hạch toán")}
            sortState={getSortState("postingStatus")}
            onSortChange={(state) => handleSortChange("postingStatus", state)}
            searchValue={
              listHook.tableState.columnSearch["postingStatus"] || ""
            }
            onSearchChange={(val) => handleSearchChange("postingStatus", val)}
            selectedFilters={
              listHook.tableState.columnFilters["postingStatus"] || []
            }
            onFilterChange={(vals) => handleFilterChange("postingStatus", vals)}
            filterOptions={[
              { label: "HẠCH TOÁN", value: "POSTED" },
              { label: "CHƯA HẠCH TOÁN", value: "UNPOSTED" },
            ]}
            align="center"
            columnKey="postingStatus"
          />
        ),
        size: 150,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: ErpInvoice) => (
          <PostingStatusBadge status={inv.postingStatus} />
        ),
      },
    };
  }, [
    direction,
    t,
    effectiveAllFilters,
    listHook.tableState.columnFilters,
    listHook.tableState.columnSearch,
    listHook.tableState.sorts,
    fetchInvoiceOptions,
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
  ]);
}
