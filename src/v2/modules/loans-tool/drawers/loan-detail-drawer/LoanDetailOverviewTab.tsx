import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  AmortizationScheduleTable,
  LoanCashflowChart,
  type LoanSchedulePeriod,
  type LoanKpiSummaryProps,
} from "@/v2/core/loans";

interface LoanDetailOverviewTabProps {
  schedule: LoanSchedulePeriod[];
  contractSchedule?: LoanSchedulePeriod[];
  kpiSummary: LoanKpiSummaryProps;
  paidPeriodNumbers: Set<number>;
  onRecordPeriod: (period?: LoanSchedulePeriod) => void;
  chartHeight?: number;
}

export const LoanDetailOverviewTab: React.FC<LoanDetailOverviewTabProps> = ({
  schedule,
  contractSchedule,
  kpiSummary,
  paidPeriodNumbers,
  onRecordPeriod,
  chartHeight = 280,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-6">
      <LoanKpiSummary {...kpiSummary} />

      <div className="rounded-xl border border-border p-4 bg-card">
        <V2Text variant="h3" className="text-base font-semibold mb-3">
          {t(
            "v2.loans.charts.cashflowTitle",
            "Dòng Chảy Tiền Vay & Dư Nợ Theo Kỳ",
          )}
        </V2Text>
        <LoanCashflowChart schedule={schedule} height={chartHeight} />
      </div>

      <div>
        <V2Text variant="h3" className="text-base font-semibold mb-3">
          {t("v2.loans.table.scheduleTitle", "Bảng Tính Lịch Trả Nợ Chi Tiết")}
        </V2Text>
        <AmortizationScheduleTable
          schedule={schedule}
          contractSchedule={contractSchedule}
          paidPeriodNumbers={paidPeriodNumbers}
          onRecordPeriod={onRecordPeriod}
        />
      </div>
    </div>
  );
};
LoanDetailOverviewTab.displayName = "LoanDetailOverviewTab";
