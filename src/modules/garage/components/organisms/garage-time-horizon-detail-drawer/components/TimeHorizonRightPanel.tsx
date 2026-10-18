import React from "react";
import { money } from "@/shared/utils/format";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { MonthPayerKpiGrid } from "../../garage-month-detail-drawer/components/MonthPayerKpiGrid";
import { MonthCostPayableKpiCard } from "../../garage-month-detail-drawer/components/MonthCostPayableKpiCard";
import type { GarageTimeHorizonCasesSummary } from "@/modules/garage/api/garageDebtsAnalyticsApi";
import type {
  MonthlyReceivablesSummary,
  ReceivablesVatWarningSummary,
  GarageTrendItem,
} from "@/modules/garage/api/garageDashboardApi";

export interface TimeHorizonRightPanelProps {
  summary?: GarageTimeHorizonCasesSummary;
  breakdownSummary?: MonthlyReceivablesSummary;
  trendItem?: GarageTrendItem;
  vatWarningInfo?: ReceivablesVatWarningSummary;
  isReceipt?: boolean;
}

export const TimeHorizonRightPanel: React.FC<TimeHorizonRightPanelProps> = ({
  summary,
  breakdownSummary,
  trendItem,
  vatWarningInfo,
  isReceipt = true,
}) => {
  const recBal = summary?.receivableAmount || 0;

  return (
    <div className="flex flex-col gap-3.5 w-full text-xs">
      {/* 1. Cảnh báo VAT chưa xuất HĐ */}
      {vatWarningInfo?.hasVatWithoutInvoice && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Cảnh báo hóa đơn VAT:</span>
            <span>
              Có <strong>{vatWarningInfo.casesWithVatNoInvoiceCount}</strong> vụ
              việc chưa xuất hoặc đính kèm hóa đơn điện tử.
            </span>
          </div>
        </div>
      )}

      {/* 2. Cơ cấu Thu KH vs Thu BH */}
      {isReceipt && breakdownSummary && (
        <DrawerSection
          title="Cơ cấu Thu KH vs Thu BH"
          collapsible
          defaultCollapsed={false}
        >
          <MonthPayerKpiGrid summary={breakdownSummary} />
        </DrawerSection>
      )}

      {/* 3. Chi phí phát sinh & Còn nợ (Phải trả) */}
      {trendItem && (
        <DrawerSection
          title="Chi phí phát sinh & Còn nợ"
          collapsible
          defaultCollapsed={false}
        >
          <MonthCostPayableKpiCard item={trendItem} />
        </DrawerSection>
      )}

      {/* 4. Đánh giá rủi ro mốc thời gian */}
      <DrawerSection
        title="Đánh giá rủi ro mốc thời gian"
        collapsible
        defaultCollapsed={false}
      >
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
