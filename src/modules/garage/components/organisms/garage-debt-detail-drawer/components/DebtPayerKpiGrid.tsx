import React from "react";
import { User, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/v2/shared/ui/badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { MonthlyReceivablesSummary } from "@/modules/garage/api/garageDashboardApi";

interface PayerCardData {
  caseCount: number;
  rate: number;
  billed: number;
  paid: number;
  remaining: number;
  withInvoiceAmount: number;
  noInvoiceAmount: number;
  vatWithoutInvoiceAmount: number;
}

interface PayerCardProps {
  data: PayerCardData;
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
}

const PayerKpiCard: React.FC<PayerCardProps> = ({
  data,
  icon,
  iconBgClass,
  title,
}) => {
  const isHighRate = data.rate >= 90;

  return (
    <div className="flex flex-col rounded-lg border border-border/25 dark:border-white/[0.04] bg-surface/30 dark:bg-white/[0.015] p-2.5 gap-2 w-full">
      {/* Header Compact: Icon + Tên nhóm + Badge % Thu */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center shrink-0",
              iconBgClass,
            )}
          >
            {icon}
          </div>
          <V2Text
            variant="caption"
            className="font-bold uppercase tracking-wider text-foreground truncate"
          >
            {title} ({data.caseCount})
          </V2Text>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "font-bold text-[11px] tabular-nums px-1.5 py-0 shrink-0",
            isHighRate
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          )}
        >
          {data.rate.toFixed(1)}% Thu
        </Badge>
      </div>

      {/* Grid 3 chỉ số ngang: Phát sinh | Đã thu | Còn nợ */}
      <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-md bg-muted/20 dark:bg-white/[0.02]">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Phát sinh
          </span>
          <span className="text-xs font-semibold font-mono text-foreground tabular-nums">
            {money(data.billed)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Đã thu
          </span>
          <span className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {money(data.paid)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Còn nợ
          </span>
          <span
            className={cn(
              "text-xs font-bold font-mono tabular-nums",
              data.remaining > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-fg/60",
            )}
          >
            {data.remaining > 0 ? money(data.remaining) : "0 đ"}
          </span>
        </div>
      </div>

      {/* Footer hóa đơn VAT dạng micro-row */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-fg gap-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span>
            Có HĐ:{" "}
            <strong className="text-foreground font-mono">
              {money(data.withInvoiceAmount)}
            </strong>
          </span>
          <span>•</span>
          <span>
            Chưa:{" "}
            <strong className="text-foreground font-mono">
              {money(data.noInvoiceAmount)}
            </strong>
          </span>
        </div>
        {data.vatWithoutInvoiceAmount > 0 && (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/25 text-[10px] font-semibold gap-1 px-1.5 py-0"
          >
            <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
            VAT: {money(data.vatWithoutInvoiceAmount)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export interface DebtPayerKpiGridProps {
  summary?: MonthlyReceivablesSummary;
}

export const DebtPayerKpiGrid: React.FC<DebtPayerKpiGridProps> = ({
  summary,
}) => {
  if (!summary) return null;

  const { customer, insurance } = summary;

  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      <PayerKpiCard
        data={customer}
        icon={<User className="w-3.5 h-3.5 text-primary" />}
        iconBgClass="bg-primary/10"
        title="Thu Khách Hàng"
      />
      <PayerKpiCard
        data={insurance}
        icon={
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        }
        iconBgClass="bg-teal-500/15"
        title="Thu Bảo Hiểm"
      />
    </div>
  );
};
