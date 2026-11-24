import * as React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2KanbanBoard } from "@/v2/shared/components/organisms/v2-kanban-board";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import {
  groupCasesByVehicle,
  buildGarageKanbanLanes,
  type GarageVehicleKanbanItem,
  type GarageCaseStage,
  type GarageCaseStatus,
  type GarageCaseV2InfoMap,
} from "../../kanban";
import { GarageVehicleKanbanCard } from "./GarageVehicleKanbanCard";
import { GarageCasesKanbanToolbar } from "./GarageCasesKanbanToolbar";
import { useGarageKanbanActions } from "./GarageCasesKanbanTab.hook";

export interface GarageCasesKanbanTabProps {
  cases: GarageCaseDetailRow[];
  /** Thông tin v2 (status, công đoạn, đã ghi đè) tra theo `case.id`; thiếu thì dùng mã KGara. */
  v2Info?: GarageCaseV2InfoMap;
  /** Có quyền sửa: không có thì khóa kéo thả, đổi công đoạn và hoàn về KGara. */
  canEdit?: boolean;
  /** Lưu `status` v2 cho mọi phiếu của thẻ; reject khi lỗi để tab báo và board giữ nguyên. */
  onMoveStatus?: (
    item: GarageVehicleKanbanItem,
    status: GarageCaseStatus,
  ) => Promise<unknown>;
  onChangeStage?: (
    item: GarageVehicleKanbanItem,
    stage: GarageCaseStage | null,
  ) => Promise<unknown>;
  onRevertStatus?: (item: GarageVehicleKanbanItem) => Promise<unknown>;
  onOpenCaseDetail?: (caseCode: string) => void;
  className?: string;
}

export const GarageCasesKanbanTab: React.FC<GarageCasesKanbanTabProps> = ({
  cases,
  v2Info,
  canEdit = false,
  onMoveStatus,
  onChangeStage,
  onRevertStatus,
  onOpenCaseDetail,
  className,
}) => {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");
  const editable = canEdit && Boolean(onMoveStatus);

  const items = React.useMemo(
    () => groupCasesByVehicle(cases, v2Info),
    [cases, v2Info],
  );

  // Lọc theo từ khóa tìm kiếm
  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.licensePlate.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.cases.some((c) => (c.soChungTu || "").toLowerCase().includes(q)),
    );
  }, [items, search]);

  const lanes = React.useMemo(
    () => buildGarageKanbanLanes(filteredItems, t),
    [filteredItems, t],
  );

  const { totalVehiclesCount, totalCasesCount, totalRevenue } = React.useMemo(
    () => ({
      totalVehiclesCount: filteredItems.length,
      totalCasesCount: filteredItems.reduce((acc, c) => acc + c.caseCount, 0),
      totalRevenue: filteredItems.reduce((acc, c) => acc + c.totalBilled, 0),
    }),
    [filteredItems],
  );

  const { handleCardDrop, handleChangeStage, handleRevert } =
    useGarageKanbanActions({
      editable,
      onMoveStatus,
      onChangeStage,
      onRevertStatus,
    });

  const renderCard = React.useCallback(
    (item: GarageVehicleKanbanItem, laneId: string, isOverlay?: boolean) => (
      <GarageVehicleKanbanCard
        item={item}
        laneId={laneId}
        isOverlay={isOverlay}
        onOpenCaseDetail={onOpenCaseDetail}
        canEdit={canEdit}
        onChangeStage={handleChangeStage}
        onRevertStatus={handleRevert}
      />
    ),
    [onOpenCaseDetail, canEdit, handleChangeStage, handleRevert],
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full min-h-0 space-y-2.5",
        className,
      )}
    >
      <GarageCasesKanbanToolbar
        search={search}
        onSearchChange={setSearch}
        totalVehiclesCount={totalVehiclesCount}
        totalCasesCount={totalCasesCount}
        totalRevenue={totalRevenue}
      />

      <DrawerSection
        title={t(
          "v2.garageCases.kanban.boardTitle",
          "Tiến độ xe theo quy trình dịch vụ",
        )}
        count={totalVehiclesCount}
        collapsible={false}
        fillHeight={true}
        className="mb-0 flex-1 min-h-0 flex flex-col h-full"
        bodyClassName="flex-1 min-h-0 flex flex-col p-1.5 sm:p-2 overflow-hidden h-full"
      >
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <V2KanbanBoard<GarageVehicleKanbanItem>
            id="garage-cases-kanban-board"
            lanes={lanes}
            getItemId={(item) => item.id}
            isDragDisabled={!editable}
            onCardDrop={handleCardDrop}
            renderCard={renderCard}
          />
        </div>
      </DrawerSection>
    </div>
  );
};
