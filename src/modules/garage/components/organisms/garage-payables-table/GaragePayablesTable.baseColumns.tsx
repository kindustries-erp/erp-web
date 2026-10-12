import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { LicensePlateCell } from "@/modules/garage/components/atoms/license-plate-cell";
import {
  SupplierCaseCountCell,
  SupplierCostCell,
  SupplierBalanceCell,
} from "./GaragePayablesTable.cells";
import type {
  SupplierDebtItem,
  CreateBaseColumnsProps,
} from "./GaragePayablesTable.type";

export function createBaseColumns({
  createFilterProps,
  t,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
}: CreateBaseColumnsProps): DataTableColumn<SupplierDebtItem>[] {
  const handleOpenDetail = (row: SupplierDebtItem) => {
    if (onOpenCustomerDetail) {
      onOpenCustomerDetail({ code: row.customerCode, name: row.customerName });
    } else {
      onOpenSupplierDetail?.({
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
      key: "licensePlate",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.licensePlate", "Biển số xe")}
          {...createFilterProps(
            "licensePlate",
            "garage-payables-license-plate-options",
          )}
          showBlankOption={true}
          enableSelectAllMatching={true}
          align="center"
        />
      ),
      size: 160,
      minSize: 140,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => (
        <LicensePlateCell licensePlate={row.licensePlate} />
      ),
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
        <SupplierCaseCountCell
          row={row}
          onClick={() => handleOpenDetail(row)}
        />
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
      cell: (row: SupplierDebtItem) => <SupplierCostCell row={row} />,
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
      cell: (row: SupplierDebtItem) => <SupplierBalanceCell row={row} />,
    },
  ];
}
