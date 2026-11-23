import React, { useMemo } from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { GarageCaseCodeCell } from "@/modules/garage/components/molecules/garage-case-code-cell";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";
import {
  CasePayerTypeBadge,
  CaseInvoiceStatusBadge,
} from "./MonthInvoiceCaseTable.cells";

interface UseInvoiceCaseColumnsParams {
  debtType?: "receivables" | "payables";
  onOpenCaseDetail?: (caseCode: string) => void;
  onSelectGroup?: (group: any) => void;
}

export function useInvoiceCaseColumns({
  debtType = "receivables",
  onOpenCaseDetail,
  onSelectGroup,
}: UseInvoiceCaseColumnsParams): V2Column<MonthInvoiceCaseRow>[] {
  const isPayable = debtType === "payables";

  return useMemo(
    () => [
      {
        key: "caseCode",
        label: "SỐ CHỨNG TỪ",
        size: 185,
        align: TableColumnAlign.LEFT,
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
        label: "KHÁCH HÀNG & ĐỐI TƯỢNG HĐ",
        size: 240,
        align: TableColumnAlign.LEFT,
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
        summary: {
          variant: "label",
          label: "TỔNG CỘNG:",
        },
      },
      {
        key: "payerType",
        label: isPayable ? "LOẠI CHI" : "LOẠI THU",
        size: 85,
        align: TableColumnAlign.CENTER,
        cell: (row: MonthInvoiceCaseRow) => (
          <CasePayerTypeBadge payerType={row.payerType} />
        ),
      },
      {
        key: "invoiceStatus",
        label: "HÓA ĐƠN & VAT",
        size: 180,
        align: TableColumnAlign.CENTER,
        cell: (row: MonthInvoiceCaseRow) => (
          <CaseInvoiceStatusBadge row={row} />
        ),
      },
      {
        key: "billed",
        label: isPayable ? "CHI PHÍ" : "PHÁT SINH",
        size: 130,
        align: TableColumnAlign.RIGHT,
        className:
          "text-right font-mono tabular-nums font-semibold text-xs text-foreground",
        cell: (row: MonthInvoiceCaseRow) => money(row.billed),
        summary: {
          variant: "amount",
          accessor: (r) => r.billed,
        },
      },
      {
        key: "paid",
        label: isPayable ? "ĐÃ CHI" : "ĐÃ THU",
        size: 115,
        align: TableColumnAlign.RIGHT,
        className:
          "text-right font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthInvoiceCaseRow) =>
          row.paid > 0 ? money(row.paid) : "—",
        summary: {
          variant: "amount",
          accessor: (r) => r.paid,
        },
      },
      {
        key: "remaining",
        label: isPayable ? "CÒN PHẢI CHI" : "CÒN PHẢI THU",
        size: 130,
        align: TableColumnAlign.RIGHT,
        className: "text-right font-mono font-bold text-xs tabular-nums",
        cell: (row: MonthInvoiceCaseRow) => (
          <span
            className={
              row.remaining > 0
                ? isPayable
                  ? "text-orange-600 dark:text-orange-400 font-extrabold"
                  : "text-amber-600 dark:text-amber-400 font-extrabold"
                : "text-muted-foreground/60"
            }
          >
            {row.remaining > 0 ? money(row.remaining) : "—"}
          </span>
        ),
        summary: {
          variant: "amount",
          accessor: (r) => r.remaining,
        },
      },
      {
        key: "shareRate",
        label: "TỶ TRỌNG",
        size: 80,
        align: TableColumnAlign.CENTER,
        className:
          "text-center font-mono tabular-nums text-xs text-foreground font-medium",
        cell: (row: MonthInvoiceCaseRow) => `${row.shareRate.toFixed(1)}%`,
      },
    ],
    [isPayable, onOpenCaseDetail, onSelectGroup],
  );
}
