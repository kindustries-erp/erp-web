import React from "react";
import { money } from "@/shared/utils/format";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Calendar, AlertTriangle, ShieldCheck } from "lucide-react";
import type { GarageTimeHorizonCasesSummary } from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface TimeHorizonRightPanelProps {
  summary?: GarageTimeHorizonCasesSummary;
}

export const TimeHorizonRightPanel: React.FC<TimeHorizonRightPanelProps> = ({
  summary,
}) => {
  const recBal = summary?.receivableAmount || 0;
  const recTotal = summary?.receivableTotalAmount || 0;
  const recPaid = summary?.receivedAmount || 0;
  const count = summary?.receivableCount || 0;
  const rate = recTotal > 0 ? Math.round((recPaid / recTotal) * 1000) / 10 : 0;

  return (
    <div className="space-y-4 text-xs">
      <DrawerSection title="TỔNG QUAN MỐC THỜI GIAN">
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-surface border border-border/70 flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Mốc:
            </span>
            <span className="font-semibold text-foreground">
              {summary?.horizonLabel || "Mốc thời gian"}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface border border-border/70 flex justify-between items-center">
            <span className="text-muted-foreground">Số vụ việc:</span>
            <span className="font-mono font-bold text-foreground">
              {count} phiếu DV
            </span>
          </div>
        </div>
      </DrawerSection>

      <DrawerSection title="VỊ THẾ DÒNG TIỀN">
        <div className="space-y-2 tabular-nums">
          <div className="flex justify-between items-center p-2 rounded bg-surface border border-border/60">
            <span className="text-muted-foreground">Tổng phát sinh:</span>
            <span className="font-mono font-semibold text-foreground">
              {money(recTotal)}
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-surface border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-emerald-700 dark:text-emerald-400">
              Đã thu:
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {money(recPaid)}
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-surface border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-rose-700 dark:text-rose-400">
              Còn phải thu:
            </span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {money(recBal)}
            </span>
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Tiến độ thu hồi:</span>
              <span className="font-mono font-bold text-primary">{rate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </div>
      </DrawerSection>

      <DrawerSection title="ĐÁNH GIÁ RỦI RO">
        <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-start gap-2">
          {recBal > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          )}
          <p className="text-[11px] text-muted-foreground leading-normal">
            {recBal > 0
              ? `Còn ${money(recBal)} dư nợ chưa thu hồi. Cần theo dõi tiến độ cấn trừ sao kê hoặc liên hệ khách hàng.`
              : "Toàn bộ công nợ trong mốc thời gian này đã được tất toán 100%."}
          </p>
        </div>
      </DrawerSection>
    </div>
  );
};
