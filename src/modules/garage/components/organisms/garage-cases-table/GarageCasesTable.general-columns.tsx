import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
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
      key: "kgaraClassification",
      label: t("cases.columns.kgaraClassification", "Phân loại KGara"),
      header: makeHdr(
        "kgaraClassification",
        t("cases.columns.kgaraClassification", "Phân loại KGara"),
      ),
      size: 150,
      className: "text-center",
      cell: (item: any) => {
        const kgaraClass =
          item.kgaraClassification ||
          item.rawData?.PhanLoaiKgara ||
          item.phanLoaiKgara;
        if (!kgaraClass) {
          return (
            <span className="text-muted-foreground/30 select-none font-normal">
              —
            </span>
          );
        }
        const fullTitle = `Nguồn gốc KGara: ${kgaraClass}${item.kgaraClassificationCode ? ` (${item.kgaraClassificationCode})` : ""} - Bất biến`;
        return (
          <div className="w-full flex items-center justify-center">
            <Tooltip content={fullTitle}>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-[135px] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{kgaraClass}</span>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "classification",
      label: t("cases.columns.classificationErp", "Phân loại ERP"),
      header: makeHdr(
        "classification",
        t("cases.columns.classificationErp", "Phân loại ERP"),
      ),
      size: 150,
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
