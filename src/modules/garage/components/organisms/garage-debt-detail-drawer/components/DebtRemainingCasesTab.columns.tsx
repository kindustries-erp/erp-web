import React from "react";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { LicensePlateCell } from "@/modules/garage/components/atoms/license-plate-cell";
import { Badge } from "@/shared/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { DebtRemainingCaseRow } from "./DebtRemainingCasesTab.type";

interface UseDebtRemainingCasesColumnsParams {
  isPayable: boolean;
  onOpenCaseDetail?: (caseCode: string) => void;
  t: (key: string, fallback: string) => string;
}

export function createDebtRemainingCasesColumns({
  isPayable,
  onOpenCaseDetail,
  t,
}: UseDebtRemainingCasesColumnsParams): V2Column<DebtRemainingCaseRow>[] {
  return [
    {
      key: "soChungTu",
      label: t("cases.columns.soChungTu", "Số phiếu"),
      size: 140,
      align: TableColumnAlign.LEFT,
      className:
        "font-mono font-bold text-xs text-primary cursor-pointer hover:underline",
      cell: (row) => (
        <span
          onClick={() => onOpenCaseDetail?.(row.soChungTu || row.id)}
          title={row.soChungTu}
        >
          {row.soChungTu}
        </span>
      ),
      summary: {
        variant: "label",
        label: t("common.total", "Tổng cộng:"),
      },
    },
    {
      key: "ngayHoanThanh",
      label: t("cases.columns.completedDate", "Ngày HT"),
      size: 105,
      align: TableColumnAlign.CENTER,
      className: "text-center text-xs font-mono",
      cell: (row) => <TableDateCell date={row.ngayHoanThanh} format="date" />,
    },
    {
      key: "bienSoXe",
      label: t("cases.columns.licensePlate", "Biển số xe"),
      size: 125,
      align: TableColumnAlign.CENTER,
      className: "text-center",
      cell: (row) => <LicensePlateCell licensePlate={row.bienSoXe} />,
    },
    {
      key: "khachHangName",
      label: t("customers.detail", "Khách hàng"),
      size: 160,
      align: TableColumnAlign.LEFT,
      className: "text-xs font-medium truncate",
      cell: (row) => (
        <span title={row.khachHangName}>{row.khachHangName || "—"}</span>
      ),
    },
    {
      key: "debtorName",
      label: isPayable ? "Nhà cung cấp / Đối tác" : "Đối tượng chịu nợ",
      size: 170,
      align: TableColumnAlign.LEFT,
      className: "text-xs font-medium",
      cell: (row) => {
        const isBH = row.payerType === "BH";
        const isEnt = row.partnerType === "enterprise";
        const badgeCls = isBH
          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
          : isEnt
            ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-border";
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1 py-0 shrink-0 font-medium",
                badgeCls,
              )}
            >
              {isBH ? "Bảo hiểm" : isEnt ? "DN" : "Cá nhân"}
            </Badge>
            <span className="truncate" title={row.debtorName}>
              {row.debtorName}
            </span>
          </div>
        );
      },
    },
    {
      key: "invoiceStatus",
      label: t("cases.columns.invoiceStatus", "Hóa đơn VAT"),
      size: 140,
      align: TableColumnAlign.CENTER,
      className: "text-center",
      cell: (row) => {
        if (row.vatWarning) {
          return (
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 text-[10px] font-bold gap-1 px-1.5 py-0.5"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>Thiếu HĐ</span>
            </Badge>
          );
        }
        if (row.invoiceNo) {
          return (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] font-mono px-1.5 py-0"
            >
              #{row.invoiceNo}
            </Badge>
          );
        }
        return <span className="text-muted-foreground/60 text-xs">—</span>;
      },
    },
    {
      key: "billed",
      label: isPayable ? "Chi phí" : "Phát sinh",
      size: 120,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-mono font-bold text-xs tabular-nums text-foreground",
      cell: (row) => money(isPayable ? row.cost : row.billed),
      summary: {
        variant: "amount",
        accessor: (r) => (isPayable ? r.cost : r.billed),
      },
    },
    {
      key: "paid",
      label: isPayable ? "Đã chi" : "Đã thu",
      size: 110,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-mono font-semibold text-xs tabular-nums text-emerald-600 dark:text-emerald-400",
      cell: (row) => {
        const p = isPayable ? row.paidCost : row.paid;
        return p > 0 ? money(p) : "—";
      },
      summary: {
        variant: "amount",
        accessor: (r) => (isPayable ? r.paidCost : r.paid),
      },
    },
    {
      key: "remaining",
      label: isPayable ? "Còn phải chi" : "Còn nợ",
      size: 120,
      align: TableColumnAlign.RIGHT,
      className: "text-right font-mono font-bold text-xs tabular-nums",
      cell: (row) => {
        const rem = isPayable ? row.remainingCost : row.remaining;
        const color = isPayable
          ? "text-orange-600 dark:text-orange-400 font-extrabold"
          : "text-amber-600 dark:text-amber-400 font-extrabold";
        return (
          <span className={rem > 0 ? color : "text-muted-foreground/60"}>
            {rem > 0 ? money(rem) : "—"}
          </span>
        );
      },
      summary: {
        variant: "amount",
        accessor: (r) => (isPayable ? r.remainingCost : r.remaining),
      },
    },
  ];
}
