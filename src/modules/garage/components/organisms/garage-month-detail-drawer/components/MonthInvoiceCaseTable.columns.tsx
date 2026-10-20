import React, { useMemo } from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type {
  DataTableColumn,
  ColumnFilterBuilder,
} from "@/shared/components/DataTable";
import { GarageCaseCodeCell } from "@/modules/garage/components/molecules/garage-case-code-cell";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";
import {
  CasePayerTypeBadge,
  CaseInvoiceStatusBadge,
} from "./MonthInvoiceCaseTable.cells";

interface UseInvoiceCaseColumnsParams {
  headerFilter: ColumnFilterBuilder;
  debtType?: "receivables" | "payables";
  onOpenCaseDetail?: (caseCode: string) => void;
  onSelectGroup?: (group: any) => void;
}

export function useInvoiceCaseColumns({
  headerFilter,
  debtType = "receivables",
  onOpenCaseDetail,
  onSelectGroup,
}: UseInvoiceCaseColumnsParams): DataTableColumn<MonthInvoiceCaseRow>[] {
  const isPayable = debtType === "payables";

  return useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: MonthInvoiceCaseRow, index: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "caseCode",
        header: headerFilter("soChungTu", "SỐ CHỨNG TỪ", { align: "left" }),
        size: 185,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        cell: (row: MonthInvoiceCaseRow) => (
          <GarageCaseCodeCell
            item={{
              id: row.caseId,
              soChungTu: row.soChungTu,
              bienSoXe: row.bienSoXe,
              tenTinhTrangDichVu: row.tenTinhTrangDichVu,
            }}
            onOpenDetail={(targetId) => onOpenCaseDetail?.(targetId)}
          />
        ),
      },
      {
        key: "partner",
        header: headerFilter("khachHangName", "KHÁCH HÀNG & ĐỐI TƯỢNG HĐ", {
          align: "left",
        }),
        size: 240,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        cell: (row: MonthInvoiceCaseRow) => (
          <div className="flex flex-col py-0.5 max-w-full">
            <span
              onClick={() =>
                row.parentGroup && onSelectGroup?.(row.parentGroup)
              }
              className={cn(
                "font-semibold text-xs text-foreground truncate",
                row.parentGroup &&
                  "cursor-pointer hover:underline hover:text-primary",
              )}
            >
              {row.khachHangName}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono truncate">
              {row.partnerTitle}
              {row.taxCode ? ` • MST: ${row.taxCode}` : ""}
            </span>
          </div>
        ),
      },
      {
        key: "payerType",
        header: isPayable ? "LOẠI CHI" : "LOẠI THU",
        size: 85,
        headerClassName: "text-center font-semibold",
        className: "text-center",
        cell: (row: MonthInvoiceCaseRow) => (
          <CasePayerTypeBadge payerType={row.payerType} />
        ),
      },
      {
        key: "invoiceStatus",
        header: "HÓA ĐƠN & VAT",
        size: 180,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        cell: (row: MonthInvoiceCaseRow) => (
          <CaseInvoiceStatusBadge row={row} />
        ),
      },
      {
        key: "billed",
        header: headerFilter.amount(
          "billed",
          isPayable ? "CHI PHÍ" : "PHÁT SINH",
          { align: "right" },
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums font-semibold text-xs text-foreground",
        cell: (row: MonthInvoiceCaseRow) => money(row.billed),
      },
      {
        key: "paid",
        header: headerFilter.amount("paid", isPayable ? "ĐÃ CHI" : "ĐÃ THU", {
          align: "right",
        }),
        size: 115,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthInvoiceCaseRow) =>
          row.paid > 0 ? money(row.paid) : "—",
      },
      {
        key: "remaining",
        header: headerFilter.amount(
          "remaining",
          isPayable ? "CÒN PHẢI CHI" : "CÒN PHẢI THU",
          { align: "right" },
        ),
        size: 130,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (row: MonthInvoiceCaseRow) => (
          <span
            className={
              row.remaining > 0
                ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                : "font-mono text-muted-foreground/60 text-[11px]"
            }
          >
            {row.remaining > 0 ? money(row.remaining) : "—"}
          </span>
        ),
      },
      {
        key: "shareRate",
        header: headerFilter.numeric("shareRate", "TỶ TRỌNG", {
          align: "center",
        }),
        size: 80,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className:
          "text-center font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthInvoiceCaseRow) => `${row.shareRate.toFixed(1)}%`,
      },
    ],
    [headerFilter, isPayable, onOpenCaseDetail, onSelectGroup],
  );
}
