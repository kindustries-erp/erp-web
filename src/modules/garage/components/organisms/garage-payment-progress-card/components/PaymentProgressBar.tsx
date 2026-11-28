import React from "react";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import {
  getBadgeVariant,
  getProgressColor,
} from "../GaragePaymentProgressCard.helper";

export interface ProgressMetric {
  rate: number;
  paid: number;
  total: number;
}

interface PaymentProgressBarProps {
  collection: ProgressMetric;
  payment: ProgressMetric;
  loading?: boolean;
}

function SingleProgressItem({
  title,
  paidLabel,
  metric,
  isReceipt,
  loading,
}: {
  title: string;
  paidLabel: string;
  metric: ProgressMetric;
  isReceipt: boolean;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <Badge
            variant="outline"
            className={`font-semibold px-2 py-0.5 text-xs border ${getBadgeVariant(metric.rate, isReceipt)}`}
          >
            {metric.rate.toFixed(1)}% Hoàn tất
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {paidLabel}{" "}
          <strong className="text-foreground font-bold font-mono">
            {money(metric.paid)}
          </strong>{" "}
          <span className="text-muted-foreground/75 font-normal font-mono">
            / Tổng {money(metric.total)}
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(metric.rate, isReceipt)}`}
          style={{
            width: `${loading ? 0 : Math.min(100, Math.max(0, metric.rate))}%`,
          }}
        />
      </div>
    </div>
  );
}

export function PaymentProgressBar({
  collection,
  payment,
  loading = false,
}: PaymentProgressBarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <SingleProgressItem
        title="Tỷ lệ hoàn tất thu tiền dịch vụ"
        paidLabel="Đã thu"
        metric={collection}
        isReceipt={true}
        loading={loading}
      />
      <SingleProgressItem
        title="Tỷ lệ hoàn tất chi trả chi phí / NCC"
        paidLabel="Đã trả"
        metric={payment}
        isReceipt={false}
        loading={loading}
      />
    </div>
  );
}
