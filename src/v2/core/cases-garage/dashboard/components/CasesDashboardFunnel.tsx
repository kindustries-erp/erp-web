import {
  V2Button,
  V2Progress,
  V2Stack,
  V2Text,
} from "@/v2/shared/components/atoms";
import type { V2ProgressTone } from "@/v2/shared/components/atoms/v2-progress/V2Progress.type";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type {
  CasesDashboardFunnelRowView,
  CasesDashboardFunnelStageKey,
} from "../casesDashboard.type";

export interface CasesDashboardFunnelProps {
  rows: CasesDashboardFunnelRowView[];
  /** Có hàm này thì mỗi giai đoạn bấm được (mở danh sách lệnh của giai đoạn). */
  onStageClick?: (key: CasesDashboardFunnelStageKey) => void;
}

const STAGE_TONE: Record<CasesDashboardFunnelStageKey, V2ProgressTone> = {
  quotation: "amber",
  inProgress: "neutral",
  completed: "emerald",
  cancelled: "rose",
};

const STAGE_FALLBACK: Record<CasesDashboardFunnelStageKey, string> = {
  quotation: "Báo giá",
  inProgress: "Đang làm",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

/** Phễu giai đoạn: số xe, tiền và thanh tỷ lệ cho mỗi giai đoạn. */
export function CasesDashboardFunnel({
  rows,
  onStageClick,
}: CasesDashboardFunnelProps) {
  const { t } = useV2Translation();

  return (
    <V2Stack gap="sm" data-testid="cases-dashboard-funnel">
      {rows.map((row) => {
        const label = t(
          `v2.garageCasesDashboard.stage.${row.key}`,
          STAGE_FALLBACK[row.key],
        );
        const head = (
          <V2Text variant="label" color="default">
            {label}
          </V2Text>
        );
        return (
          <V2Stack key={row.key} gap="xs" data-testid={`funnel-row-${row.key}`}>
            {onStageClick ? (
              <V2Button
                variant="ghost"
                className="justify-start px-0"
                onClick={() => onStageClick(row.key)}
              >
                {head}
              </V2Button>
            ) : (
              head
            )}
            <V2Progress
              value={row.rate}
              tone={STAGE_TONE[row.key]}
              label={`${row.vehicles} · ${formatAmount(row.amount)}`}
              showValue
            />
          </V2Stack>
        );
      })}
    </V2Stack>
  );
}
