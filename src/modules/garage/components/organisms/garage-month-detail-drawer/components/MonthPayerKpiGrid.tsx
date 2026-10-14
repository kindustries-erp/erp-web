import React from "react";
import { User, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { MonthlyReceivablesSummary } from "../../../../api/garageDashboardApi";

interface MonthPayerKpiGridProps {
  summary?: MonthlyReceivablesSummary;
}

export const MonthPayerKpiGrid: React.FC<MonthPayerKpiGridProps> = ({
  summary,
}) => {
  if (!summary) return null;

  const { customer, insurance } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {/* 👤 Card: Thu Khách Hàng */}
      <div className="flex flex-col rounded-xl border border-border/70 bg-gradient-to-br from-slate-500/[0.04] to-transparent p-3.5 gap-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Thu Khách Hàng ({customer.caseCount} vụ việc)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Phần chi trả do khách hàng tự thanh toán
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="font-bold text-xs tabular-nums px-2 py-0.5 bg-background border-border"
          >
            {customer.rate.toFixed(1)}% Thu
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 bg-background/50 rounded-lg px-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Phát sinh
            </span>
            <span className="text-xs font-bold font-mono text-foreground tabular-nums">
              {money(customer.billed)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Đã thu
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(customer.paid)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Còn nợ
            </span>
            <span
              className={cn(
                "text-xs font-bold font-mono tabular-nums",
                customer.remaining > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground/60",
              )}
            >
              {customer.remaining > 0 ? money(customer.remaining) : "0 đ"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <span>
              Có HĐ:{" "}
              <strong className="text-foreground font-mono">
                {money(customer.withInvoiceAmount)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Chưa HĐ:{" "}
              <strong className="text-foreground font-mono">
                {money(customer.noInvoiceAmount)}
              </strong>
            </span>
          </div>
          {customer.vatWithoutInvoiceAmount > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-semibold gap-1 px-1.5 py-0"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
              VAT chưa HĐ: {money(customer.vatWithoutInvoiceAmount)}
            </Badge>
          )}
        </div>
      </div>

      {/* 🛡️ Card: Thu Bảo Hiểm */}
      <div className="flex flex-col rounded-xl border border-border/70 bg-gradient-to-br from-indigo-500/[0.04] to-transparent p-3.5 gap-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Thu Bảo Hiểm ({insurance.caseCount} vụ việc)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Phần được công ty bảo hiểm duyệt bồi thường
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="font-bold text-xs tabular-nums px-2 py-0.5 bg-background border-border"
          >
            {insurance.rate.toFixed(1)}% Thu
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 bg-background/50 rounded-lg px-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Phát sinh
            </span>
            <span className="text-xs font-bold font-mono text-foreground tabular-nums">
              {money(insurance.billed)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Đã thu
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(insurance.paid)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Còn nợ
            </span>
            <span
              className={cn(
                "text-xs font-bold font-mono tabular-nums",
                insurance.remaining > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground/60",
              )}
            >
              {insurance.remaining > 0 ? money(insurance.remaining) : "0 đ"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <span>
              Có HĐ:{" "}
              <strong className="text-foreground font-mono">
                {money(insurance.withInvoiceAmount)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Chưa HĐ:{" "}
              <strong className="text-foreground font-mono">
                {money(insurance.noInvoiceAmount)}
              </strong>
            </span>
          </div>
          {insurance.vatWithoutInvoiceAmount > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-semibold gap-1 px-1.5 py-0"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
              VAT chưa HĐ: {money(insurance.vatWithoutInvoiceAmount)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
