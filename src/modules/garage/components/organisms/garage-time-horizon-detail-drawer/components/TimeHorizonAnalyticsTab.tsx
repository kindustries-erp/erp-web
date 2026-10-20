import React from "react";
import { money } from "@/shared/utils/format";
import { ShieldAlert } from "lucide-react";

export interface TimeHorizonAnalyticsTabProps {
  receivableTotalAmount?: number;
  receivedAmount?: number;
  receivableAmount?: number;
  receivableCount?: number;
  horizon?: string | null;
}

export const TimeHorizonAnalyticsTab: React.FC<
  TimeHorizonAnalyticsTabProps
> = ({
  receivableTotalAmount = 0,
  receivedAmount = 0,
  receivableAmount = 0,
  receivableCount = 0,
  horizon,
}) => {
  const collectionRate =
    receivableTotalAmount > 0
      ? Math.round((receivedAmount / receivableTotalAmount) * 1000) / 10
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border/70 bg-surface">
          <span className="text-[11px] text-muted-foreground block mb-1">
            Tổng giá trị phiếu phát sinh
          </span>
          <span className="font-mono text-base font-bold text-foreground">
            {money(receivableTotalAmount)}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            Tổng cộng {receivableCount} phiếu dịch vụ
          </span>
        </div>

        <div className="p-3 rounded-lg border border-emerald-200/80 bg-emerald-50/20 dark:bg-emerald-950/20">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block mb-1">
            Đã thu hồi
          </span>
          <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
            {money(receivedAmount)}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            Tỷ lệ hoàn tất thu: {collectionRate}%
          </span>
        </div>

        <div className="p-3 rounded-lg border border-rose-200/80 bg-rose-50/20 dark:bg-rose-950/20">
          <span className="text-[11px] text-rose-800 dark:text-rose-300 block mb-1">
            Còn phải thu (Dư nợ)
          </span>
          <span className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">
            {money(receivableAmount)}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            Cần theo dõi & đôn đốc
          </span>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Đánh giá & Khuyến nghị quản trị công nợ mốc {horizon}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Tỷ lệ thu hồi đạt {collectionRate}%. Đối với các vụ việc còn nợ kéo
          dài, khuyến nghị bộ phận dịch vụ đối soát ngay với khách hàng và kiểm
          tra các phiếu chưa được cấn trừ sao kê ngân hàng hoặc hóa đơn VAT đầu
          ra.
        </p>
      </div>
    </div>
  );
};
