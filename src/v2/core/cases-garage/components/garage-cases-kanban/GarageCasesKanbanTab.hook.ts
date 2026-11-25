import * as React from "react";
import { toast } from "react-hot-toast";
import type { V2KanbanDropEvent } from "@/v2/shared/components/organisms/v2-kanban-board";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  GARAGE_KANBAN_LANES,
  GARAGE_LANE_STATUS,
  type GarageCaseStage,
  type GarageCaseStatus,
  type GarageKanbanLaneKey,
  type GarageVehicleKanbanItem,
} from "../../kanban";

export interface GarageKanbanActionsParams {
  editable: boolean;
  onMoveStatus?: (
    item: GarageVehicleKanbanItem,
    status: GarageCaseStatus,
  ) => Promise<unknown>;
  onChangeStage?: (
    item: GarageVehicleKanbanItem,
    stage: GarageCaseStage | null,
  ) => Promise<unknown>;
  onRevertStatus?: (item: GarageVehicleKanbanItem) => Promise<unknown>;
}

const reasonOf = (e: unknown): string =>
  e instanceof Error && e.message ? e.message : "";

const plateOf = (item: GarageVehicleKanbanItem) => item.licensePlate || item.id;

/** Gọi callback lưu v2 rồi báo toast thành công/lỗi theo i18n; board giữ nguyên khi lỗi. */
export function useGarageKanbanActions({
  editable,
  onMoveStatus,
  onChangeStage,
  onRevertStatus,
}: GarageKanbanActionsParams) {
  const { t } = useV2Translation();

  const run = React.useCallback(
    async (
      item: GarageVehicleKanbanItem,
      action: () => Promise<unknown>,
      okKey: string,
      failKey: string,
      extra: Record<string, string> = {},
    ) => {
      const plate = plateOf(item);
      try {
        await action();
        toast.success(t(okKey, { defaultValue: plate, plate, ...extra }));
      } catch (e) {
        toast.error(
          t(failKey, {
            defaultValue: plate,
            plate,
            reason: reasonOf(e),
            ...extra,
          }),
        );
      }
    },
    [t],
  );

  const handleCardDrop = async (
    event: V2KanbanDropEvent<GarageVehicleKanbanItem>,
  ) => {
    const targetKey = event.targetLaneId as GarageKanbanLaneKey;
    if (!editable || !onMoveStatus) {
      toast.error(
        t(
          "v2.garageCases.kanban.noPermission",
          "Bạn không có quyền đổi trạng thái",
        ),
      );
      return;
    }
    if (event.sourceLaneId === targetKey) return;

    const lane = GARAGE_KANBAN_LANES.find((l) => l.key === targetKey);
    const status = lane ? t(lane.titleKey, lane.defaultTitle) : targetKey;
    await run(
      event.item,
      () => onMoveStatus(event.item, GARAGE_LANE_STATUS[targetKey]),
      "v2.garageCases.kanban.movedToStatus",
      "v2.garageCases.kanban.moveFailed",
      { status },
    );
  };

  const handleChangeStage = React.useMemo(
    () =>
      onChangeStage
        ? (item: GarageVehicleKanbanItem, stage: GarageCaseStage | null) =>
            void run(
              item,
              () => onChangeStage(item, stage),
              "v2.garageCases.kanban.stageChanged",
              "v2.garageCases.kanban.stageFailed",
            )
        : undefined,
    [onChangeStage, run],
  );

  const handleRevert = React.useMemo(
    () =>
      onRevertStatus
        ? (item: GarageVehicleKanbanItem) =>
            void run(
              item,
              () => onRevertStatus(item),
              "v2.garageCases.kanban.revertDone",
              "v2.garageCases.kanban.revertFailed",
            )
        : undefined,
    [onRevertStatus, run],
  );

  return { handleCardDrop, handleChangeStage, handleRevert };
}
