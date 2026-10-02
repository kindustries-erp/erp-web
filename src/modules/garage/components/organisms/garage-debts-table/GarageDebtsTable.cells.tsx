import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { FileText } from "lucide-react";
import type { CustomerDebtItem } from "@/modules/garage/hooks/useGarageCustomersList";
export { AgingDaysCell } from "./GarageDebtsAgingCell";

export const CaseCountCell: React.FC<{
  row: CustomerDebtItem;
  onClick: () => void;
}> = ({ row, onClick }) => {
  if (!row.caseCount || row.caseCount <= 0) {
    return (
      <span className="text-muted-foreground/30 font-mono text-xs select-none">
        0
      </span>
    );
  }
  return (
    <Tooltip
      content={`${row.caseCount} phiếu dịch vụ phát sinh • Click xem chi tiết`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="inline-flex items-center justify-center gap-1 px-2 py-0 h-[20px] rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
      >
        <FileText className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
          {row.caseCount.toLocaleString("vi-VN")}
        </span>
        <span className="text-[10px] text-muted-foreground font-normal">
          phiếu
        </span>
      </button>
    </Tooltip>
  );
};

export const PaymentProgressCell: React.FC<{ row: CustomerDebtItem }> = ({
  row,
}) => {
  const total = Number(row.totalAmount) || 0;
  const paid = Number(row.paidAmount) || 0;
  const bal = Number(row.balanceAmount) || 0;

  if (total <= 0 && bal <= 0 && paid <= 0) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }

  const isAllPaid = bal <= 0 && paid > 0;
  const isUnpaid = paid <= 0 && bal > 0;
  const rate =
    total > 0
      ? Math.min(100, Math.round((paid / total) * 100))
      : isAllPaid
        ? 100
        : 0;

  const tooltipText = isAllPaid
    ? `Đã thu đủ 100%: ${money(paid)}`
    : isUnpaid
      ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
      : `Đã thu: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải thu: ${money(bal)}`;

  return (
    <Tooltip content={tooltipText}>
      <div className="flex flex-col gap-0.5 w-full py-0 justify-center cursor-default">
        <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
          <span className="font-semibold text-foreground font-mono">
            {money(total)}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isAllPaid
                ? "bg-emerald-500 dark:bg-emerald-400"
                : isUnpaid
                  ? "bg-transparent"
                  : "bg-emerald-600 dark:bg-emerald-500",
            )}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
