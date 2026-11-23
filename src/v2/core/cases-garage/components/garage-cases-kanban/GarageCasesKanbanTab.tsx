import * as React from "react";
import { toast } from "react-hot-toast";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  V2KanbanBoard,
  type V2KanbanDropEvent,
} from "@/v2/shared/components/organisms/v2-kanban-board";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import {
  groupCasesByVehicle,
  buildGarageKanbanLanes,
  moveVehicleToLane,
  type GarageVehicleKanbanItem,
  type GarageKanbanLaneKey,
  GARAGE_KANBAN_LANES,
} from "../../kanban";
import { GarageVehicleKanbanCard } from "./GarageVehicleKanbanCard";
import { GarageCasesKanbanToolbar } from "./GarageCasesKanbanToolbar";

export interface GarageCasesKanbanTabProps {
  cases: GarageCaseDetailRow[];
  onOpenCaseDetail?: (caseCode: string) => void;
  className?: string;
}

export const GarageCasesKanbanTab: React.FC<GarageCasesKanbanTabProps> = ({
  cases,
  onOpenCaseDetail,
  className,
}) => {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");

  const initialItems = React.useMemo(() => groupCasesByVehicle(cases), [cases]);
  const [items, setItems] =
    React.useState<GarageVehicleKanbanItem[]>(initialItems);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

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

  // Xử lý kéo thả chuyển mốc tiến độ
  const handleCardDrop = (
    event: V2KanbanDropEvent<GarageVehicleKanbanItem>,
  ) => {
    const targetKey = event.targetLaneId as GarageKanbanLaneKey;
    if (event.sourceLaneId === targetKey) return;

    setItems((prev) => moveVehicleToLane(prev, event.itemId, targetKey));

    const targetLane = GARAGE_KANBAN_LANES.find((l) => l.key === targetKey);
    const targetName = targetLane
      ? t(targetLane.titleKey, targetLane.defaultTitle)
      : targetKey;

    toast.success(
      t(
        "v2.garageCases.kanban.movedToStatus",
        `Đã chuyển xe ${event.item.licensePlate || event.itemId} sang trạng thái ${targetName}`,
      ),
    );
  };

  const renderCard = React.useCallback(
    (item: GarageVehicleKanbanItem, laneId: string, isOverlay?: boolean) => (
      <GarageVehicleKanbanCard
        item={item}
        laneId={laneId}
        isOverlay={isOverlay}
        onOpenCaseDetail={onOpenCaseDetail}
      />
    ),
    [onOpenCaseDetail],
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
            onCardDrop={handleCardDrop}
            renderCard={renderCard}
          />
        </div>
      </DrawerSection>
    </div>
  );
};
