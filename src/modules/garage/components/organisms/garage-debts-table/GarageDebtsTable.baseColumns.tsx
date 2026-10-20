import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import type {
  CustomerDebtItem,
  useGarageCustomersList,
} from "@/modules/garage/hooks/useGarageCustomersList";
import { GarageCaseCustomerCell } from "../../molecules/garage-case-customer-cell";
import { LicensePlateCell } from "@/modules/garage/components/atoms/license-plate-cell";
import {
  CaseCountCell,
  PaymentProgressCell,
  CustomerBalanceCell,
} from "./GarageDebtsTable.cells";

interface CreateBaseColumnsProps {
  createFilterProps: (columnKey: string, queryPrefix: string) => any;
  getSortState: (key: string) => "asc" | "desc" | "none";
  listHook: ReturnType<typeof useGarageCustomersList>;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
  }) => void;
}

export function createBaseColumns({
  createFilterProps,
  getSortState,
  listHook,
  t,
  onOpenCustomerDetail,
}: CreateBaseColumnsProps): DataTableColumn<CustomerDebtItem>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      cell: (_: CustomerDebtItem, idx: number) => <span>{idx}</span>,
    },
    {
      key: "licensePlate",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.licensePlate", "Biển số xe")}
          {...createFilterProps(
            "licensePlate",
            "garage-debts-license-plate-options",
          )}
          showBlankOption={true}
          enableSelectAllMatching={true}
          align="center"
        />
      ),
      size: 130,
      minSize: 110,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => (
        <button
          type="button"
          onClick={() =>
            onOpenCustomerDetail({
              code: row.customerCode,
              name: row.customerName,
              licensePlate: row.licensePlate,
            })
          }
          className="text-left w-full hover:opacity-85 cursor-pointer focus:outline-none"
          title={t(
            "customers.viewDetailByPlate",
            "Xem chi tiết công nợ xe này",
          )}
        >
          <LicensePlateCell licensePlate={row.licensePlate} />
        </button>
      ),
    },
    {
      key: "customer",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.customer", "Khách hàng")}
          {...createFilterProps("customer", "garage-debts-customer-options")}
          showBlankOption={true}
          enableSelectAllMatching={true}
          align="center"
        />
      ),
      size: 260,
      minSize: 220,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => (
        <GarageCaseCustomerCell
          item={{
            customerName: row.customerName,
            customerCode: row.customerCode,
          }}
          onOpenDetail={(cust) =>
            onOpenCustomerDetail({
              code: cust.code,
              name: cust.name,
              licensePlate: row.licensePlate,
            })
          }
        />
      ),
    },
    {
      key: "caseCount",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.caseCount", "SL Phiếu DV")}
          {...createFilterProps(
            "caseCount",
            "garage-customer-casecount-options",
          )}
          align="center"
        />
      ),
      size: 120,
      minSize: 105,
      enableResizing: true,
      className: "text-center",
      cell: (row: CustomerDebtItem) => (
        <CaseCountCell
          row={row}
          onClick={() =>
            onOpenCustomerDetail({
              code: row.customerCode,
              name: row.customerName,
              licensePlate: row.licensePlate,
            })
          }
        />
      ),
    },
    {
      key: "paymentProgress",
      className: "text-right",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.totalReceivable", "Tổng phải thu")}
          columnKey="paymentProgress"
          sortState={getSortState("totalAmount")}
          onSortChange={(s) => listHook.setSort("totalAmount", s)}
          searchValue={listHook.columnSearch["paymentProgress"] || ""}
          onSearchChange={(v) => listHook.setColumnSearch("paymentProgress", v)}
          selectedFilters={listHook.columnFilters["paymentProgress"] || []}
          onFilterChange={(v) => listHook.setColumnFilter("paymentProgress", v)}
          isActive={Boolean(
            listHook.columnFilters["paymentProgress"]?.length ||
            listHook.columnSearch["paymentProgress"],
          )}
          align="right"
          enableSelectAllMatching={true}
          fetchOptions={async () => ({
            items: [
              { label: t("customers.filter.paid", "Đã thu đủ"), value: "PAID" },
              {
                label: t("customers.filter.partial", "Thu một phần"),
                value: "PARTIAL",
              },
              {
                label: t("customers.filter.unpaid", "Chưa thu"),
                value: "UNPAID",
              },
            ],
            total: 3,
            next: null,
          })}
        />
      ),
      size: 190,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => <PaymentProgressCell row={row} />,
    },
    {
      key: "balanceAmount",
      className: "text-right",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.remainingReceivable", "Còn phải thu")}
          {...createFilterProps("balanceAmount", "garage-customer-bal-options")}
          align="right"
        />
      ),
      size: 170,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => <CustomerBalanceCell row={row} />,
    },
  ];
}
