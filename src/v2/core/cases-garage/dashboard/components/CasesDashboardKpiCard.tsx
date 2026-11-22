import { V2Stack, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { CasesDashboardKpiView } from "../casesDashboard.type";
import { formatVehicleCaseCounts } from "../casesDashboard.format";
import { formatNumber } from "@/v2/shared/utils/v2TableFormat";

export interface CasesDashboardKpiCardProps {
  title: string;
  counts: CasesDashboardKpiView;
  /** Ghi chú nhỏ dưới thẻ (ví dụ phạm vi của dự thu). */
  note?: string;
  testId?: string;
}

/** Thẻ KPI một kỳ: "N xe · M lệnh" và tiền. */
export function CasesDashboardKpiCard({
  title,
  counts,
  note,
  testId,
}: CasesDashboardKpiCardProps) {
  const { t } = useV2Translation();
  const units = {
    vehicles: t("v2.garageCasesDashboard.kpi.vehiclesUnit", "xe"),
    cases: t("v2.garageCasesDashboard.kpi.casesUnit", "lệnh"),
  };

  return (
    <V2Stack
      as="section"
      gap="xs"
      className="rounded-lg border border-border bg-card p-4"
      data-testid={testId}
    >
      <V2Text variant="label" color="muted">
        {title}
      </V2Text>
      <V2Text
        variant="h3"
        data-testid={testId ? `${testId}-counts` : undefined}
      >
        {counts.cases === undefined
          ? `${formatNumber(counts.vehicles)} ${units.vehicles}`
          : formatVehicleCaseCounts(counts.vehicles, counts.cases, units)}
      </V2Text>
      <V2Text variant="currency" color="default">
        {formatAmount(counts.amount)}
      </V2Text>
      {note ? (
        <V2Text variant="caption" color="muted">
          {note}
        </V2Text>
      ) : null}
    </V2Stack>
  );
}
