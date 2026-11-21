import * as React from "react";
import { Car, Layers, CircleDollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import {
  V2KanbanBoard,
  type V2KanbanDropEvent,
} from "@/v2/shared/components/organisms/v2-kanban-board";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { money } from "@/shared/utils/format";
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

  // Nhóm danh sách phiếu theo từng xe
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

    return items.filter((item) => {
      if (item.licensePlate.toLowerCase().includes(q)) return true;
      if (item.customerName.toLowerCase().includes(q)) return true;
      return item.cases.some((c) =>
        (c.soChungTu || "").toLowerCase().includes(q),
      );
    });
  }, [items, search]);

  const lanes = React.useMemo(
    () => buildGarageKanbanLanes(filteredItems, t),
    [filteredItems, t],
  );

  const totalVehiclesCount = filteredItems.length;
  const totalCasesCount = filteredItems.reduce(
    (acc, curr) => acc + curr.caseCount,
    0,
  );
  const totalRevenue = filteredItems.reduce(
    (acc, curr) => acc + curr.totalBilled,
    0,
  );

  // Xử lý kéo thả chuyển mốc tiến độ
  const handleCardDrop = (
    event: V2KanbanDropEvent<GarageVehicleKanbanItem>,
  ) => {
    const targetLaneKey = event.targetLaneId as GarageKanbanLaneKey;
    if (event.sourceLaneId === targetLaneKey) return;

    setItems((prev) => moveVehicleToLane(prev, event.itemId, targetLaneKey));

    const targetLaneConfig = GARAGE_KANBAN_LANES.find(
      (l) => l.key === targetLaneKey,
    );
    const targetName = targetLaneConfig
      ? t(targetLaneConfig.titleKey, targetLaneConfig.defaultTitle)
      : targetLaneKey;

    toast.success(
      t(
        "v2.garageCases.kanban.movedToStatus",
        `Đã chuyển xe ${event.item.licensePlate || event.itemId} sang trạng thái ${targetName}`,
      ),
    );
  };

  return (
    <div
      className={cn("flex flex-col h-full w-full min-h-0 space-y-3", className)}
    >
      {/* ── Toolbar: Tìm kiếm realtime & Thống kê nhanh ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
        <div className="w-full sm:w-80">
          <V2SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t(
              "v2.garageCases.kanban.searchPlaceholder",
              "Tìm kiếm biển số xe, khách hàng, số phiếu...",
            )}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <V2Badge
            variant="outline"
            className="h-7 px-2.5 bg-surface border-border/80 text-foreground font-medium gap-1.5"
          >
            <Car className="w-3.5 h-3.5 text-muted-fg" />
            <V2Text variant="caption" className="font-semibold text-foreground">
              {totalVehiclesCount}{" "}
              {t("v2.garageCases.kanban.totalVehicles", "xe")}
            </V2Text>
          </V2Badge>

          <V2Badge
            variant="outline"
            className="h-7 px-2.5 bg-surface border-border/80 text-foreground font-medium gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-muted-fg" />
            <V2Text variant="caption" className="font-semibold text-foreground">
              {totalCasesCount} {t("v2.garageCases.kanban.totalCases", "phiếu")}
            </V2Text>
          </V2Badge>

          {totalRevenue > 0 && (
            <V2Badge
              variant="outline"
              className="h-7 px-2.5 bg-surface border-border/80 text-foreground font-mono font-bold gap-1.5"
            >
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{money(totalRevenue)}</span>
            </V2Badge>
          )}
        </div>
      </div>

      {/* ── Kanban Board Container ── */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <V2KanbanBoard<GarageVehicleKanbanItem>
          id="garage-cases-kanban-board"
          lanes={lanes}
          getItemId={(item) => item.id}
          onCardDrop={handleCardDrop}
          renderCard={(item, laneId, isOverlay) => (
            <GarageVehicleKanbanCard
              item={item}
              laneId={laneId}
              isOverlay={isOverlay}
              onOpenCaseDetail={onOpenCaseDetail}
            />
          )}
        />
      </div>
    </div>
  );
};
