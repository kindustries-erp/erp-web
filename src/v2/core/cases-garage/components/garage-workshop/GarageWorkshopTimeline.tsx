import { MessageSquareText, Pencil, Trash2, Wrench } from "lucide-react";
import {
  V2ActivityTimeline,
  V2Badge,
  V2Button,
  V2Stack,
  V2Text,
  type V2ActivityItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_STAGE_DEFAULT_LABELS,
  formatDayTime,
  formatDuration,
  minutesSince,
  workshopStageLabelKey,
  type WorkshopLogView,
} from "../../workshop";

export interface GarageWorkshopTimelineProps {
  logs: WorkshopLogView[];
  now: Date;
  canEdit?: boolean;
  editingId?: string | null;
  onEdit?: (log: WorkshopLogView) => void;
  onRemove?: (log: WorkshopLogView) => void;
}

/**
 * Nhật ký tiến độ mới nhất trước trên `V2ActivityTimeline`: công đoạn (giờ bắt đầu → kết thúc, thời lượng)
 * hoặc ghi chú, người làm, nút sửa/xóa khi có quyền.
 */
export function GarageWorkshopTimeline({
  logs,
  now,
  canEdit = false,
  editingId,
  onEdit,
  onRemove,
}: GarageWorkshopTimelineProps) {
  const { t } = useV2Translation();

  const items: V2ActivityItem[] = logs.map((log) => {
    const isStage = log.kind === "STAGE";
    const running = isStage && !log.endedAt;
    const minutes = running
      ? minutesSince(log.startedAt, now)
      : log.durationMinutes;
    const Icon = isStage ? Wrench : MessageSquareText;
    const action =
      isStage && log.stage
        ? t(
            workshopStageLabelKey(log.stage),
            WORKSHOP_STAGE_DEFAULT_LABELS[log.stage] ?? log.stage,
          )
        : t("v2.garageCases.workshop.form.kindNote", "Ghi chú");
    return {
      id: log.id,
      action,
      actor: log.workerName ?? undefined,
      timestamp: `${formatDayTime(log.startedAt)}${
        isStage && log.endedAt ? ` → ${formatDayTime(log.endedAt)}` : ""
      }`,
      icon: <Icon className="h-4 w-4 shrink-0 text-muted-fg" aria-hidden />,
      variant: running ? "success" : "default",
      featured: editingId === log.id,
      badge: isStage ? (
        <V2Badge variant={running ? "default" : "outline"} size="sm">
          {running
            ? `${t("v2.garageCases.workshop.log.running", "Đang làm")} · `
            : ""}
          {formatDuration(minutes, t)}
        </V2Badge>
      ) : undefined,
      details: (
        <V2Stack gap="xs" data-testid={`workshop-log-${log.id}`}>
          {log.note ? (
            <V2Text variant="body-sm" className="whitespace-pre-line">
              {log.note}
            </V2Text>
          ) : null}
          {editingId === log.id ? (
            <V2Text variant="caption" color="primary">
              {t(
                "v2.garageCases.workshop.log.editingRow",
                "Đang chỉnh dòng này",
              )}
            </V2Text>
          ) : null}
          {canEdit ? (
            <V2Stack className="flex-row justify-end gap-2">
              <V2Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => onEdit?.(log)}
              >
                {t("v2.garageCases.workshop.log.edit", "Sửa")}
              </V2Button>
              <V2Button
                variant="ghost"
                size="sm"
                className="min-h-11 text-destructive"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => onRemove?.(log)}
              >
                {t("v2.garageCases.workshop.log.remove", "Xóa")}
              </V2Button>
            </V2Stack>
          ) : null}
        </V2Stack>
      ),
    };
  });

  return (
    <V2Stack data-testid="workshop-timeline">
      <V2ActivityTimeline
        items={items}
        emptyMessage={t(
          "v2.garageCases.workshop.drawer.emptyTimeline",
          "Chưa có nhật ký.",
        )}
      />
    </V2Stack>
  );
}
