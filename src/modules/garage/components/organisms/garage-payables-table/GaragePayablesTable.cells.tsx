import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors",
        count > 0
          ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
          : "text-muted-foreground/50 cursor-default",
      )}
    >
      <FileText className="w-3 h-3" />
      <span>{count}</span>
    </button>
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
  const days = Number(row.maxAgingDays) || 0;
  const bal = Number(row.balanceAmount) || 0;

  if (bal <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
        <CheckCircle2 className="w-3 h-3" />
        {t("payables.noDebt", "Đã tất toán")}
      </span>
    );
  }

  let badgeColor =
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60";
  let label = t("payables.agingNormal", "Trong hạn");

  if (days > 90) {
    badgeColor =
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60";
    label = t("payables.agingCritical", "Quá hạn nặng");
  } else if (days > 60) {
    badgeColor =
      "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/60";
    label = t("payables.agingWarning", "Cần chi trả");
  } else if (days > 30) {
    badgeColor =
      "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/60";
    label = t("payables.agingNotice", "Sắp đến hạn");
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs tabular-nums font-semibold text-foreground">
        {days} {t("common:days", "ngày")}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
          badgeColor,
        )}
      >
        {days > 60 && <AlertTriangle className="w-2.5 h-2.5" />}
        {label}
      </span>
    </div>
  );
};
