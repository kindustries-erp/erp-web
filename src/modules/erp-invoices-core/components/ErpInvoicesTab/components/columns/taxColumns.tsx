import React, { useMemo } from "react";
import { type TFunction } from "i18next";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { formatTaxInvoiceType } from "../../utils";
import {
  TaxInvoiceStatusBadge,
  TaxProcessStatusBadge,
  InvoiceValidBadge,
} from "../cells/InvoiceStatusBadge";

export interface TaxColumnsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
  listHook: ReturnType<typeof useErpInvoicesList>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
}

export function useTaxColumns({
  direction,
  t,
  listHook,
  getSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
}: TaxColumnsOptions) {
  return useMemo(() => {
    return {
      taxInvoiceType: {
        key: "taxInvoiceType",
        header: (
          <TableColumnHeaderFilter
            title={t("taxInvoiceType", "Loại HĐ")}
            sortState={getSortState("taxInvoiceType")}
            onSortChange={(state) => handleSortChange("taxInvoiceType", state)}
            searchValue={
              listHook.tableState.columnSearch["taxInvoiceType"] || ""
            }
            onSearchChange={(val) => handleSearchChange("taxInvoiceType", val)}
            selectedFilters={
              listHook.tableState.columnFilters["taxInvoiceType"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxInvoiceType", vals)
            }
            filterOptions={[
              { label: "HĐ Máy tính tiền", value: "CASH_REGISTER" },
              { label: "HĐ Điện tử", value: "STANDARD" },
            ]}
            align="center"
            columnKey="taxInvoiceType"
          />
        ),
        size: 150,
        className: "text-center text-xs",
        cell: (inv: ErpInvoice) => formatTaxInvoiceType(inv.taxInvoiceType),
      },
      taxInvoiceStatus: {
        key: "taxInvoiceStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("taxInvoiceStatus", "Trạng thái (GDT)")}
            sortState={getSortState("taxInvoiceStatus")}
            onSortChange={(state) =>
              handleSortChange("taxInvoiceStatus", state)
            }
            searchValue={
              listHook.tableState.columnSearch["taxInvoiceStatus"] || ""
            }
            onSearchChange={(val) =>
              handleSearchChange("taxInvoiceStatus", val)
            }
            selectedFilters={
              listHook.tableState.columnFilters["taxInvoiceStatus"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxInvoiceStatus", vals)
            }
            filterOptions={[
              { label: "Mới", value: "1" },
              { label: "Thay thế", value: "2" },
              { label: "Điều chỉnh", value: "3" },
              { label: "Bị thay thế", value: "4" },
              { label: "Bị điều chỉnh", value: "5" },
              { label: "Bị hủy", value: "6" },
            ]}
            align="center"
            columnKey="taxInvoiceStatus"
          />
        ),
        size: 150,
        className: "text-center",
        cell: (inv: ErpInvoice) => (
          <TaxInvoiceStatusBadge status={inv.taxInvoiceStatus} />
        ),
      },
      taxProcessStatus: {
        key: "taxProcessStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("taxProcessStatus", "KQ Kiểm tra")}
            sortState={getSortState("taxProcessStatus")}
            onSortChange={(state) =>
              handleSortChange("taxProcessStatus", state)
            }
            searchValue={
              listHook.tableState.columnSearch["taxProcessStatus"] || ""
            }
            onSearchChange={(val) =>
              handleSearchChange("taxProcessStatus", val)
            }
            selectedFilters={
              listHook.tableState.columnFilters["taxProcessStatus"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxProcessStatus", vals)
            }
            filterOptions={[
              { label: "Cục Thuế đã nhận", value: "0" },
              {
                label: "Đang tiến hành kiểm tra điều kiện cấp mã",
                value: "1",
              },
              {
                label: "CQT từ chối hóa đơn theo từng lần phát sinh",
                value: "2",
              },
              { label: "Hóa đơn đủ điều kiện cấp mã", value: "3" },
              { label: "Hóa đơn không đủ điều kiện cấp mã", value: "4" },
              { label: "Đã cấp mã hóa đơn", value: "5" },
              { label: "Cục Thuế đã nhận không mã", value: "6" },
              { label: "Đã kiểm tra định kỳ HĐĐT không có mã", value: "7" },
              {
                label:
                  "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền",
                value: "8",
              },
            ]}
            align="center"
            columnKey="taxProcessStatus"
          />
        ),
        size: 150,
        className: "text-center text-xs whitespace-normal",
        cell: (inv: ErpInvoice) => (
          <TaxProcessStatusBadge status={inv.taxProcessStatus} />
        ),
      },
      inboundCols:
        direction === "IN"
          ? ([
              {
                key: "isValid",
                header: (
                  <TableColumnHeaderFilter
                    title={t("invoice.columns.isValid", "HĐ hợp lệ")}
                    sortState="none"
                    onSortChange={() => {}}
                    searchValue=""
                    onSearchChange={() => {}}
                    selectedFilters={
                      listHook.tableState.columnFilters["isValid"] || []
                    }
                    onFilterChange={(vals) =>
                      handleFilterChange("isValid", vals)
                    }
                    align="center"
                    columnKey="isValid"
                    queryKeyPrefix="erp-invoice-options"
                    allFilters={listHook.tableState.columnFilters}
                    fetchOptions={async ({ search }: { search: string }) => {
                      const options = [
                        {
                          value: "true",
                          label: t("invoice.isValid.true", "Hợp lệ"),
                        },
                        {
                          value: "false",
                          label: t("invoice.isValid.false", "Chưa hợp lệ"),
                        },
                      ];
                      const filtered = options.filter((o) =>
                        o.label.toLowerCase().includes(search.toLowerCase()),
                      );
                      return {
                        items: filtered,
                        total: filtered.length,
                        next: null,
                      };
                    }}
                  />
                ),
                size: 150,
                headerClassName: "text-center",
                className: "text-center",
                cell: (inv: any) => (
                  <InvoiceValidBadge
                    isValid={inv.isValid}
                    validLabel={t("invoice.isValid.true", "Hợp lệ")}
                    invalidLabel={t("invoice.isValid.false", "Chưa hợp lệ")}
                  />
                ),
              } as DataTableColumn<ErpInvoice>,
            ] as DataTableColumn<ErpInvoice>[])
          : [],
    };
  }, [
    direction,
    t,
    listHook.tableState.columnFilters,
    listHook.tableState.columnSearch,
    listHook.tableState.sorts,
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
  ]);
}
