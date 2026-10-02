import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type {
  CustomerDebtItem,
  useGarageCustomersList,
} from "@/modules/garage/hooks/useGarageCustomersList";
import { CaseCountCell, PaymentProgressCell } from "./GarageDebtsTable.cells";

interface CreateBaseColumnsProps {
  createFilterProps: (columnKey: string, queryPrefix: string) => any;
  getSortState: (key: string) => "asc" | "desc" | "none";
  listHook: ReturnType<typeof useGarageCustomersList>;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail: (customer: { code: string; name: string }) => void;
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
      key: "customerName",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.customerName", "Tên khách hàng")}
          {...createFilterProps("customerName", "garage-customer-name-options")}
          showBlankOption={true}
          align="center"
        />
      ),
      size: 260,
      minSize: 220,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => (
        <TableText
          text={row.customerName || "—"}
          tooltip={true}
          enableCopy={true}
          textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
          onDetailClick={(e) => {
            e?.stopPropagation();
            onOpenCustomerDetail({
              code: row.customerCode,
              name: row.customerName,
            });
          }}
        />
      ),
    },
    {
      key: "customerCode",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.customerCode", "Mã KH")}
          {...createFilterProps("customerCode", "garage-customer-code-options")}
          showBlankOption={true}
          align="center"
        />
      ),
      size: 160,
      minSize: 130,
      enableResizing: true,
      cell: (row: CustomerDebtItem) => (
        <TableText
          text={row.customerCode || "— (Chưa có mã)"}
          enableCopy={Boolean(row.customerCode)}
          tooltip={true}
          className="font-mono text-muted-foreground font-normal text-xs"
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
      cell: (row: CustomerDebtItem) => {
        const bal = Number(row.balanceAmount) || 0;
        return (
          <span
            className={cn(
              "font-semibold tabular-nums font-mono text-xs",
              bal === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive font-bold",
            )}
          >
            {money(bal)}
          </span>
        );
      },
    },
  ];
}
