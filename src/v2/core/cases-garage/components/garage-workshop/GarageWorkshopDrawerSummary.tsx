import { LogOut } from "lucide-react";
import { V2Button, V2Stack, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { WorkshopCaseStatus, WorkshopCaseView } from "../../workshop";
import { GarageWorkshopClock } from "./GarageWorkshopClock";
import { GarageWorkshopStatusBadge } from "./GarageWorkshopStatusBadge";
import { GarageWorkshopStatusSelect } from "./GarageWorkshopStatusSelect";

export interface GarageWorkshopDrawerSummaryProps {
  item: WorkshopCaseView;
  now: Date;
  canEdit: boolean;
  canMoveStatus?: boolean;
  onChangeStatus?: (status: WorkshopCaseStatus) => void;
  onUntrack?: () => void;
}

/** Đầu drawer: trạng thái + công đoạn, đồng hồ, ô đổi trạng thái, nội dung sửa chữa, nút bỏ khỏi bảng. */
export function GarageWorkshopDrawerSummary(
  p: GarageWorkshopDrawerSummaryProps,
) {
  const { t } = useV2Translation();
  const item = p.item;
  return (
    <V2Stack gap="xs">
      <GarageWorkshopStatusBadge
        status={item.status}
        stage={item.progressStage}
        showEmptyStage
      />
      <GarageWorkshopClock startedAt={item.stageStartedAt} now={p.now} />
      {p.onChangeStatus ? (
        <GarageWorkshopStatusSelect
          status={item.status}
          origin={item.origin}
          canChangeStatus={Boolean(p.canMoveStatus)}
          onChange={p.onChangeStatus}
        />
      ) : null}
      {item.workSummary ? (
        <V2Text variant="body-sm" color="muted">
          {item.workSummary}
        </V2Text>
      ) : null}
      {p.canEdit && p.onUntrack ? (
        <V2Button
          variant="ghost"
          size="sm"
          className="min-h-11 self-start text-destructive"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={p.onUntrack}
        >
          {t("v2.garageCases.workshop.untrack.action", "Bỏ khỏi bảng")}
        </V2Button>
      ) : null}
    </V2Stack>
  );
}
