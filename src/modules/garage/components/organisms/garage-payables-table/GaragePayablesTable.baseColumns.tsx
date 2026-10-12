import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { GarageCaseCustomerCell } from "../../molecules/garage-case-customer-cell";
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
      key: "customer",
      header: (
        <TableColumnHeaderFilter
          title={t("customers.columns.customer", "Khách hàng")}
          {...createFilterProps("customer", "garage-payables-customer-options")}
          showBlankOption={true}
          enableSelectAllMatching={true}
          align="center"
        />
      ),
      size: 260,
      minSize: 220,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => (
        <GarageCaseCustomerCell
          item={{
            customerName: row.customerName,
            customerCode: row.customerCode,
          }}
          onOpenDetail={() => handleOpenDetail(row)}
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
