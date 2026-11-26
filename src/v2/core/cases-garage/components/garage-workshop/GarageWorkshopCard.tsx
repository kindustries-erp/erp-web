import * as React from "react";
import { Car, UserRound } from "lucide-react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { formatDuration, type WorkshopCaseView } from "../../workshop";
import { GarageVoucherNameText } from "../../customer";
import { GarageWorkshopClock } from "./GarageWorkshopClock";
import { GarageWorkshopStatusBadge } from "./GarageWorkshopStatusBadge";

export interface GarageWorkshopCardProps {
  item: WorkshopCaseView;
  now: Date;
  onOpen?: (item: WorkshopCaseView) => void;
  isOverlay?: boolean;
  className?: string;
}

/** Thẻ xe xưởng: biển số, status v2 + status nhỏ, đồng hồ công đoạn, người làm, ghi chú mới nhất. Chạm để cập nhật. */
export const GarageWorkshopCard = React.memo(function GarageWorkshopCard({
  item,
  now,
  onOpen,
  isOverlay = false,
  className,
}: GarageWorkshopCardProps) {
  const { t } = useV2Translation();
  const plate = item.licensePlate || item.caseCode;
  const vehicle = [item.vehicleBrandName, item.vehicleModelName]
    .filter(Boolean)
    .join(" ");
  const worker = item.stageWorkerName || item.assigneeName;
  const open = () => onOpen?.(item);

  return (
    <V2Stack
      gap="xs"
      role="button"
      tabIndex={0}
      aria-label={t("v2.garageCases.workshop.card.open", {
        defaultValue: plate,
        plate,
      })}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      data-testid={`workshop-card-${item.id}`}
      className={cn(
        "min-h-[88px] cursor-pointer rounded-xl border p-3 text-left outline-none",
        "bg-kanban-card border-kanban-card-border shadow-card-item",
        "transition-[border-color,box-shadow] hover:border-border hover:shadow-card-item-hover",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isOverlay &&
          "shadow-kanban-drag border-kanban-drag-border bg-kanban-drag",
        className,
      )}
    >
      <V2Stack className="flex-row items-start justify-between gap-2">
        <V2Stack className="min-w-0">
          <V2Text variant="body" weight="bold" className="font-mono" truncate>
            {plate}
          </V2Text>
          <V2Text variant="caption" color="muted" truncate>
            {item.customerName || item.caseCode}
          </V2Text>
          <GarageVoucherNameText
            customerName={item.customerName}
            voucherName={item.voucherCustomerName}
          />
        </V2Stack>
        {item.isOverdue ? (
          <V2Badge variant="destructive" size="xs">
            {t("v2.garageCases.workshop.card.overdue", "Trễ hẹn")}
          </V2Badge>
        ) : null}
      </V2Stack>

      {vehicle ? (
        <V2Text
          variant="caption"
          color="muted"
          className="inline-flex items-center gap-1"
          truncate
        >
          <Car className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {vehicle}
        </V2Text>
      ) : null}

      <GarageWorkshopStatusBadge
        status={item.status}
        stage={item.progressStage}
        showEmptyStage
      />
      <GarageWorkshopClock startedAt={item.stageStartedAt} now={now} />

      {worker ? (
        <V2Text
          variant="caption"
          className="inline-flex items-center gap-1"
          truncate
        >
          <UserRound
            className="h-3.5 w-3.5 shrink-0 text-muted-fg"
            aria-hidden
          />
          {worker}
        </V2Text>
      ) : null}
      {item.lastNote ? (
        <V2Text variant="caption" color="muted" truncate={2}>
          {item.lastNote}
        </V2Text>
      ) : null}
      {item.totalElapsedMinutes !== null ? (
        <V2Text variant="caption" color="faint">
          {t("v2.garageCases.workshop.card.total", "Tổng")}{" "}
          {formatDuration(item.totalElapsedMinutes, t)}
        </V2Text>
      ) : null}
    </V2Stack>
  );
});
