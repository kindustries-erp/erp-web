import React from "react";
import { GarageCaseCodeCell } from "../../molecules/garage-case-code-cell";
import { GarageCaseCustomerCell } from "../../molecules/garage-case-customer-cell";
import { GarageCaseClassificationDropdown } from "../garage-case-classification-dropdown";
import { GarageCaseExclusionDropdown } from "../garage-case-exclusion-dropdown";
import { KgaraCaseStatusBadge } from "../../KgaraCaseStatusBadge";
import { buildDateColumns } from "./GarageCasesTable.date-columns";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildGeneralColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const {
    t,
    tableState,
    onOpenDetail,
    onOpenFinancials,
    onOpenConfig,
    canUpdateGarage,
    branches,
  } = ctx;

  const dateCols = buildDateColumns(ctx, makeHdr);

  return [
    {
      key: "index",
      label: "#",
      header: <span className="w-full block text-center">#</span>,
      size: 50,
      enableResizing: false,
      hideable: false,
      className: "text-center font-mono text-xs text-muted-foreground",
      cell: (_: any, idx: number) => <span>{idx}</span>,
    },
    dateCols.caseDate,
    dateCols.completionDate,
    {
      key: "caseCode",
      label: t("cases.columns.caseCode", "Số chứng từ"),
      header: makeHdr("caseCode", t("cases.columns.caseCode", "Số chứng từ"), {
        isActive: Boolean(tableState.columnFilters.caseCode?.length),
      }),
      size: 180,
      cell: (item: any) => (
        <GarageCaseCodeCell
          item={item}
          onOpenDetail={(c) => onOpenDetail(c)}
          onOpenFinancials={(c) => onOpenFinancials(c)}
        />
      ),
    },
    {
      key: "customer",
      label: t("cases.columns.customer", "Khách hàng"),
      header: makeHdr("customer", t("cases.columns.customer", "Khách hàng"), {
        align: "left",
        showBlankOption: true,
      }),
      size: 200,
      cell: (item: any) => <GarageCaseCustomerCell item={item} />,
    },
    {
      key: "statusName",
      label: t("cases.columns.status", "Trạng thái"),
      header: makeHdr("statusName", t("cases.columns.status", "Trạng thái")),
      size: 130,
      className: "text-center",
      cell: (item: any) => (
        <div className="w-full flex justify-center">
          <KgaraCaseStatusBadge
            status={
              item.tenTinhTrangDichVu ||
              t("cases.common.unknown", "Chưa xác định")
            }
          />
        </div>
      ),
    },
    {
      key: "classification",
      label: t("cases.columns.classificationErp", "Phân loại ERP"),
      header: makeHdr(
        "classification",
        t("cases.columns.classificationErp", "Phân loại ERP"),
      ),
      size: 170,
      className: "text-center",
      cell: (item: any) => (
        <div className="w-full flex items-center justify-center py-0.5">
          <GarageCaseClassificationDropdown
            caseItem={item}
            canUpdate={canUpdateGarage}
            onOpenDrawer={() => onOpenConfig?.(item)}
          />
        </div>
      ),
    },
    {
      key: "exclusionRules",
      label: t("cases.columns.exclusionRules", "Quy tắc loại trừ"),
      header: makeHdr(
        "exclusionRules",
        t("cases.columns.exclusionRules", "Quy tắc loại trừ"),
      ),
      size: 150,
      className: "text-center",
      cell: (item: any) => (
        <div className="w-full flex items-center justify-center py-0.5">
          <GarageCaseExclusionDropdown
            caseItem={item}
            canUpdate={canUpdateGarage}
            onOpenDrawer={() => onOpenConfig?.(item)}
          />
        </div>
      ),
    },
    {
      key: "branchName",
      label: t("cases.columns.branchName", "Chi nhánh"),
      header: makeHdr(
        "branchName",
        t("cases.columns.branchName", "Chi nhánh"),
        { align: "left" },
      ),
      size: 160,
      className: "text-left",
      cell: (item: any) => {
        const b = branches?.find(
          (br: any) => br.externalId === item.branchExternalId,
        );
        return b?.name || "-";
      },
    },
    dateCols.createdAt,
    dateCols.updatedAt,
    dateCols.dataAsOf,
  ];
}
