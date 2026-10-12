import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { FileText } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { AgingDaysCell } from "../garage-debts-table/GarageDebtsAgingCell";
import type { SupplierDebtItem } from "./GaragePayablesTable.type";

interface PaymentProgressCellProps {
  row: SupplierDebtItem;
}

export const SupplierPaymentProgressCell: React.FC<
  PaymentProgressCellProps
> = ({ row }) => {
  const total = Number(row.psCo) || 0;
  const paid = Number(row.psNo) || 0;
  const percent =
    total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 100;

  return (
    <div className="flex flex-col items-end gap-1 w-full justify-center">
      <div className="flex items-center justify-between w-full text-[11px] tabular-nums">
        <span className="text-muted-foreground font-mono">{money(paid)}</span>
        <span className="font-semibold font-mono text-foreground">
          {money(total)}
        </span>
      </div>
      <div className="w-full bg-muted/60 dark:bg-muted/30 rounded-full h-1.5 overflow-hidden flex">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            percent === 100
              ? "bg-emerald-500"
              : percent >= 50
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

interface CaseCountCellProps {
  row: SupplierDebtItem;
  onClick?: () => void;
}

export const SupplierCaseCountCell: React.FC<CaseCountCellProps> = ({
  row,
  onClick,
}) => {
  const count = Number(row.caseCount) || 0;
  if (count <= 0) {
    return (
      <span className="text-muted-foreground/30 font-mono text-xs select-none">
        0
      </span>
    );
  }

  return (
    <Tooltip content={`${count} phiếu dịch vụ phát sinh • Click xem chi tiết`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="inline-flex items-center justify-center gap-1 px-2 py-0 h-[20px] rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
      >
        <FileText className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
          {count.toLocaleString("vi-VN")}
        </span>
        <span className="text-[10px] text-muted-foreground font-normal">
          phiếu
        </span>
      </button>
    </Tooltip>
  );
};

interface AgingDaysCellProps {
  row: SupplierDebtItem;
  t: (key: string, fallback: string) => string;
}

export const SupplierAgingDaysCell: React.FC<AgingDaysCellProps> = ({
  row,
  t,
}) => {
  return <AgingDaysCell row={row} t={t} />;
};

export const SupplierCostCell: React.FC<{ row: SupplierDebtItem }> = ({
  row,
}) => (
  <span className="font-mono text-xs font-medium tabular-nums text-foreground">
    {money(Number(row.costAmount) || 0)}
  </span>
);

export const SupplierBalanceCell: React.FC<{ row: SupplierDebtItem }> = ({
  row,
}) => {
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
};
