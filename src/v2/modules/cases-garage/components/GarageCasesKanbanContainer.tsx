import * as React from "react";
import {
  GarageCasesKanbanTab,
  type GarageCaseStage,
  type GarageCaseStatus,
  type GarageCaseV2InfoMap,
  type GarageVehicleKanbanItem,
} from "@/v2/core/cases-garage";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useCaseProgressAllQuery } from "../api/queries/useCaseProgressAllQuery";
import { useCaseProgressMutations } from "../api/queries/useCaseProgressMutations";

export interface GarageCasesKanbanContainerProps {
  cases: GarageCaseDetailRow[];
  /** Chi nhánh ERP (header `x-erp-branch-id`); bỏ trống là mọi chi nhánh. */
  branchId?: string;
  onOpenCaseDetail?: (caseCode: string) => void;
  className?: string;
}

const idsOf = (item: GarageVehicleKanbanItem) =>
  item.cases.map((c) => c.id).filter(Boolean);

/** Nối Kanban (core) với API v2 `cases-garage`: đọc status/công đoạn, ghi qua mutation. */
export const GarageCasesKanbanContainer: React.FC<
  GarageCasesKanbanContainerProps
> = ({ cases, branchId, onOpenCaseDetail, className }) => {
  const canUpdate = useV2HasPermission({
    collection: "garage",
    action: "update",
  });
  const { data } = useCaseProgressAllQuery({ status: "ALL" }, true, branchId);
  const { updateStatus, updateProgress, revert } =
    useCaseProgressMutations(branchId);

  const v2Info = React.useMemo<GarageCaseV2InfoMap | undefined>(
    () =>
      data &&
      Object.fromEntries(
        data.map((it) => [
          it.id,
          {
            status: it.status as GarageCaseStatus,
            progressStage: it.progressStage as GarageCaseStage | null,
            statusOverridden: it.overriddenFields.includes("status"),
          },
        ]),
      ),
    [data],
  );

  return (
    <GarageCasesKanbanTab
      cases={cases}
      v2Info={v2Info}
      canEdit={canUpdate && Boolean(v2Info)}
      className={className}
      onOpenCaseDetail={onOpenCaseDetail}
      onMoveStatus={(item, status) =>
        Promise.all(
          idsOf(item).map((id) => updateStatus.mutateAsync({ id, status })),
        )
      }
      onChangeStage={(item, stage) =>
        Promise.all(
          idsOf(item).map((id) =>
            updateProgress.mutateAsync({
              id,
              payload: { progressStage: stage },
            }),
          ),
        )
      }
      onRevertStatus={(item) =>
        Promise.all(
          idsOf(item).map((id) =>
            revert.mutateAsync({ id, fields: ["status"] }),
          ),
        )
      }
    />
  );
};
