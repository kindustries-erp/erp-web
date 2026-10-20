import React from "react";
import type {
  DataTableColumn,
  ColumnFilterBuilder,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { LicensePlateCell } from "@/modules/garage/components/atoms/license-plate-cell";
import { GarageCaseClassificationBadge } from "@/modules/garage/components/GarageCaseClassificationBadge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { extractCaseFinancials } from "../GaragePartnerMonthDetailDrawer.helper";
import { CaseInvoiceStatusBadge } from "./PartnerMonthCasesTable.cells";

interface UsePartnerMonthCasesColumnsParams {
  headerFilter: ColumnFilterBuilder;
  isPayable: boolean;
  onOpenCaseDetail?: (caseCode: string, editMode?: boolean) => void;
  t: (key: string, fallback: string) => string;
}

export function createPartnerMonthCasesColumns({
  headerFilter,
  isPayable,
  onOpenCaseDetail,
  t,
}: UsePartnerMonthCasesColumnsParams): DataTableColumn<any>[] {
  return [
    {
      key: "index",
      header: "#",
      size: 40,
      headerClassName: "text-center font-semibold",
      className: "text-center font-mono text-xs text-muted-foreground",
      cell: (_: any, idx: number) => idx + 1,
    },
    {
      key: "soChungTu",
      header: headerFilter(
        "soChungTu",
        t("cases.columns.soChungTu", "Số phiếu"),
        { align: "left" },
      ),
      size: 150,
      className:
        "font-mono font-bold text-xs text-primary cursor-pointer hover:underline",
      cell: (row: any) => (
        <span
          onClick={() => onOpenCaseDetail?.(row.soChungTu || row.id, false)}
        >
          {row.soChungTu || row.soPhieu || row.caseNumber}
        </span>
      ),
    },
    {
      key: "ngayHoanThanhCongViec",
      header: headerFilter(
        "ngayHoanThanhCongViec",
        t("cases.columns.completedDate", "Ngày HT"),
        { align: "center" },
      ),
      size: 110,
      headerClassName: "text-center font-semibold",
      className: "text-center text-xs font-mono",
      cell: (row: any) => (
        <TableDateCell
          date={row.ngayHoanThanhCongViec || row.createdAt}
          format="date"
        />
      ),
    },
    {
      key: "bienSoXe",
      header: headerFilter(
        "bienSoXe",
        t("cases.columns.licensePlate", "Biển số xe"),
        { align: "center" },
      ),
      size: 130,
      headerClassName: "text-center font-semibold",
      className: "text-center",
      cell: (row: any) => <LicensePlateCell licensePlate={row.bienSoXe} />,
    },
    {
      key: "classification",
      header: headerFilter(
        "classification",
        t("cases.columns.classification", "Nghiệp vụ"),
        { align: "center" },
      ),
      size: 140,
      headerClassName: "text-center font-semibold",
      className: "text-center",
      cell: (row: any) => (
        <GarageCaseClassificationBadge classification={row.classification} />
      ),
    },
    {
      key: "invoiceStatus",
      header: t("cases.columns.invoiceStatus", "Hóa đơn & VAT"),
      size: 170,
      headerClassName: "font-semibold",
      cell: (row: any) => <CaseInvoiceStatusBadge row={row} />,
    },
    {
      key: "billed",
      header: headerFilter.amount(
        "billed",
        isPayable ? "Chi phí" : "Phát sinh",
        { align: "right" },
      ),
      size: 130,
      headerClassName: "text-right font-semibold",
      className:
        "text-right font-mono font-bold text-xs tabular-nums text-foreground",
      cell: (row: any) => money(extractCaseFinancials(row, isPayable).billed),
    },
    {
      key: "paid",
      header: headerFilter.amount("paid", isPayable ? "Đã chi" : "Đã thu", {
        align: "right",
      }),
      size: 120,
      headerClassName: "text-right font-semibold",
      className:
        "text-right font-mono font-semibold text-xs tabular-nums text-emerald-600 dark:text-emerald-400",
      cell: (row: any) => {
        const p = extractCaseFinancials(row, isPayable).paid;
        return p > 0 ? money(p) : "—";
      },
    },
    {
      key: "remaining",
      header: headerFilter.amount(
        "remaining",
        isPayable ? "Còn phải chi" : "Còn nợ",
        { align: "right" },
      ),
      size: 120,
      headerClassName: "text-right font-semibold",
      className: "text-right font-mono font-bold text-xs tabular-nums",
      cell: (row: any) => {
        const rem = extractCaseFinancials(row, isPayable).remaining;
        return (
          <span
            className={cn(
              rem > 0
                ? isPayable
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/60",
            )}
          >
            {rem > 0 ? money(rem) : "—"}
          </span>
        );
      },
    },
  ];
}
