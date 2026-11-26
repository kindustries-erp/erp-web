import * as React from "react";
import {
  V2KanbanBoard,
  type V2KanbanDropEvent,
  type V2KanbanLaneData,
} from "@/v2/shared/components/organisms/v2-kanban-board";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_STATUSES,
  allowedStatuses,
  casesOfStatus,
  type WorkshopCaseStatus,
  type WorkshopCaseView,
} from "../../workshop";
import { GarageWorkshopCard } from "./GarageWorkshopCard";

export interface GarageWorkshopBoardProps<C extends WorkshopCaseView> {
  items: C[];
  now: Date;
  /** Quyền đổi status cha (`garage:update`): không có thì khóa kéo thả. */
  canMoveStatus: boolean;
  onMoveStatus?: (item: C, status: WorkshopCaseStatus) => void;
  /** Thả vào cột không hợp lệ theo bảng chuyển (xe ERP): thẻ giữ nguyên, trang báo lý do. */
  onInvalidMove?: (item: C, status: WorkshopCaseStatus) => void;
  onOpen: (item: C) => void;
}

/** Board desktop: 5 cột status v2, trong cột xếp theo status nhỏ; kéo thẻ sang cột khác để đổi status cha. */
export function GarageWorkshopBoard<C extends WorkshopCaseView>({
  items,
  now,
  canMoveStatus,
  onMoveStatus,
  onInvalidMove,
  onOpen,
}: GarageWorkshopBoardProps<C>) {
  const { t } = useV2Translation();

  const lanes = React.useMemo<V2KanbanLaneData<C>[]>(
    () =>
      WORKSHOP_STATUSES.map((s) => {
        const laneItems = casesOfStatus(items, s.key);
        return {
          id: s.key,
          title: t(s.labelKey, s.defaultLabel),
          badgeCount: laneItems.length,
          accentColor: s.accentColor,
          accentClassName: s.accentClassName,
          items: laneItems,
        };
      }),
    [items, t],
  );

  const handleDrop = (event: V2KanbanDropEvent<C>) => {
    if (event.sourceLaneId === event.targetLaneId) return;
    const target = event.targetLaneId as WorkshopCaseStatus;
    if (!allowedStatuses(event.item, canMoveStatus).has(target)) {
      onInvalidMove?.(event.item, target);
      return;
    }
    onMoveStatus?.(event.item, target);
  };

  return (
    <V2KanbanBoard<C>
      id="garage-workshop-board"
      lanes={lanes}
      getItemId={(item) => item.id}
      isDragDisabled={!canMoveStatus}
      onCardDrop={handleDrop}
      emptyLaneMessage={t("v2.garageCases.workshop.emptyLane", "Không có xe")}
      renderCard={(item, _laneId, isOverlay) => (
        <GarageWorkshopCard
          item={item}
          now={now}
          isOverlay={isOverlay}
          onOpen={() => onOpen(item)}
        />
      )}
    />
  );
}
