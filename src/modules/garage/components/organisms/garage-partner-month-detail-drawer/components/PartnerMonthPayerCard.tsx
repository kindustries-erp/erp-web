import React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { PayerCategoryMetrics } from "../GaragePartnerMonthDetailDrawer.type";

interface PartnerMonthPayerCardProps {
  title: string;
  subTitle: string;
  icon: any;
  iconClass: string;
  payer: PayerCategoryMetrics;
  hasVatWarning?: boolean;
}

export function PartnerMonthPayerCard({
  title,
  subTitle,
  icon: Icon,
  iconClass,
  payer,
  hasVatWarning,
}: PartnerMonthPayerCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border/70 bg-gradient-to-br from-slate-500/[0.04] to-transparent p-3.5 gap-2.5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              iconClass,
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {title} ({payer.caseCount} vụ việc)
            </h4>
            <p className="text-[11px] text-muted-foreground">{subTitle}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="font-bold text-xs tabular-nums px-2 py-0.5 bg-background border-border"
        >
          {payer.rate.toFixed(1)}% Thu
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 bg-background/50 rounded-lg px-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Phát sinh
          </span>
          <span className="text-xs font-bold font-mono text-foreground tabular-nums">
            {money(payer.billed)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Đã thu
          </span>
          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {money(payer.paid)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Còn nợ
          </span>
          <span
            className={cn(
              "text-xs font-bold font-mono tabular-nums",
              payer.remaining > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/60",
            )}
          >
            {payer.remaining > 0 ? money(payer.remaining) : "0 đ"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-1.5 pt-0.5">
        <div className="flex items-center gap-2">
          <span>
            Có HĐ:{" "}
            <strong className="text-foreground font-mono">
              {money(payer.withInvoiceAmount)}
            </strong>
          </span>
          <span>•</span>
          <span>
            Không HĐ:{" "}
            <strong className="text-foreground font-mono">
              {money(payer.noInvoiceAmount)}
            </strong>
          </span>
        </div>
        {hasVatWarning && (
          <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Có VAT chưa xuất HĐ
          </span>
        )}
      </div>
    </div>
  );
}
