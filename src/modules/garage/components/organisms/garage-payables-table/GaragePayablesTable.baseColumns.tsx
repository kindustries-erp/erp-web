import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { useGarageSuppliersList } from "@/modules/garage/hooks/useGarageSuppliersList";
import type { SupplierDebtItem } from "./GaragePayablesTable.type";

interface CreateBaseColumnsProps {
  createFilterProps: (columnKey: string, queryPrefix: string) => any;
  getSortState: (key: string) => "asc" | "desc" | "none";
  listHook: ReturnType<typeof useGarageSuppliersList>;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail?: (customer: { code: string; name: string }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
}

export function createBaseColumns({
  createFilterProps,
  t,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
}: CreateBaseColumnsProps): DataTableColumn<SupplierDebtItem>[] {
  const handleOpenDetail = (row: SupplierDebtItem) => {
    if (onOpenCustomerDetail) {
      onOpenCustomerDetail({ code: row.customerCode, name: row.customerName });
    } else if (onOpenSupplierDetail) {
      onOpenSupplierDetail({
        id: row.id,
        code: row.customerCode,
        name: row.customerName,
      });
    }
  };

  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      cell: (_: SupplierDebtItem, idx: number) => <span>{idx}</span>,
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
      cell: (row: SupplierDebtItem) => (
        <TableText
          text={row.customerName || "—"}
          tooltip={true}
          enableCopy={true}
          textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
          onDetailClick={(e) => {
            e?.stopPropagation();
            handleOpenDetail(row);
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
      size: 150,
      minSize: 120,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => (
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
      size: 110,
      minSize: 95,
      enableResizing: true,
      className: "text-center",
      cell: (row: SupplierDebtItem) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row)}
          className="inline-flex items-center justify-center font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          {row.caseCount || 0}
        </button>
      ),
    },
    {
      key: "costAmount",
      className: "text-right",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.costAmount", "Chi phí báo giá")}
          {...createFilterProps("costAmount", "garage-cost-options")}
          align="right"
        />
      ),
      size: 150,
      minSize: 130,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => (
        <span className="font-mono text-xs font-medium tabular-nums text-foreground">
          {money(Number(row.costAmount) || 0)}
        </span>
      ),
    },
    {
      key: "balanceAmount",
      className: "text-right",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.balanceAmount", "Còn phải chi")}
          {...createFilterProps("balanceAmount", "garage-bal-options")}
          align="right"
        />
      ),
      size: 150,
      minSize: 130,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => {
        const bal = Number(row.balanceAmount) || 0;
        return (
          <span
            className={cn(
              "font-mono text-xs tabular-nums font-semibold",
              bal === 0
                ? "text-muted-foreground/60"
                : "text-amber-800 dark:text-amber-300",
            )}
          >
            {money(bal)}
          </span>
        );
      },
    },
  ];
}
