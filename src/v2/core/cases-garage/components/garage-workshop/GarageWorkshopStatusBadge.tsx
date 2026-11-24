import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  WORKSHOP_STAGE_DEFAULT_LABELS,
  statusConfigOf,
  workshopStageLabelKey,
} from "../../workshop";

export interface GarageWorkshopStatusBadgeProps {
  /** Status v2 của xe. */
  status: string;
  /** Status nhỏ; null hiện nhãn "Chưa chọn công đoạn" khi `showEmptyStage`. */
  stage?: string | null;
  showEmptyStage?: boolean;
  className?: string;
}

/** Badge status v2 kèm status nhỏ. Nguồn duy nhất là status v2 (không dùng nhãn KGara). */
export function GarageWorkshopStatusBadge({
  status,
  stage,
  showEmptyStage = false,
  className,
}: GarageWorkshopStatusBadgeProps) {
  const { t } = useV2Translation();
  const cfg = statusConfigOf(status);
  const stageLabel = stage
    ? t(
        workshopStageLabelKey(stage),
        WORKSHOP_STAGE_DEFAULT_LABELS[stage] ?? stage,
      )
    : showEmptyStage
      ? t("v2.garageCases.workshop.card.noStage", "Chưa chọn công đoạn")
      : null;

  return (
    <V2Stack className={cn("flex-row flex-wrap items-center gap-1", className)}>
      <V2Badge
        variant={cfg.badge}
        size="sm"
        data-testid="workshop-status-badge"
      >
        {t(cfg.labelKey, cfg.defaultLabel)}
      </V2Badge>
      {stageLabel ? (
        <V2Badge
          variant="outline"
          size="sm"
          data-testid="workshop-stage-badge"
          className={cn(!stage && "text-muted-fg")}
        >
          {stageLabel}
        </V2Badge>
      ) : null}
    </V2Stack>
  );
}
