import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { cn } from "@/v2/shared/utils/cn";
import { V2KanbanLane } from "./V2KanbanLane";
import { findItemAndLane } from "./V2KanbanBoard.helper";
import type { V2KanbanBoardProps } from "./V2KanbanBoard.type";

export function V2KanbanBoard<T = any>({
  id = "v2-kanban-board",
  lanes,
  getItemId,
  renderCard,
  onCardDrop,
  className,
  isDragDisabled = false,
  emptyLaneMessage,
  headerRight,
}: V2KanbanBoardProps<T>) {
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px buffer: Click popover/link không bị kéo nhầm card!
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeItemInfo = React.useMemo(() => {
    if (!activeItemId) return null;
    return findItemAndLane(lanes, activeItemId, getItemId);
  }, [activeItemId, lanes, getItemId]);

  const handleDragStart = (event: DragStartEvent) => {
    if (isDragDisabled) return;
    setActiveItemId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItemId(null);

    if (!over || isDragDisabled || !onCardDrop) return;

    const sourceInfo = findItemAndLane(lanes, String(active.id), getItemId);
    if (!sourceInfo) return;

    const overId = String(over.id);
    let targetLaneId: string | null = null;
    let targetIndex = 0;

    // Trường hợp 1: Thả trực tiếp vào container của một Lane
    const directLane = lanes.find((l) => l.id === overId);
    if (directLane) {
      targetLaneId = directLane.id;
      targetIndex = directLane.items.length;
    } else {
      // Trường hợp 2: Thả đè lên một Card khác trong Lane
      const targetCardInfo = findItemAndLane(lanes, overId, getItemId);
      if (targetCardInfo) {
        targetLaneId = targetCardInfo.lane.id;
        targetIndex = targetCardInfo.index;
      }
    }

    if (!targetLaneId) return;

    onCardDrop({
      itemId: String(active.id),
      item: sourceInfo.item,
      sourceLaneId: sourceInfo.lane.id,
      targetLaneId,
      targetIndex,
    });
  };

  return (
    <div
      id={id}
      className={cn("flex flex-col w-full h-full min-h-0", className)}
    >
      {headerRight && (
        <div className="flex items-center justify-end pb-3">{headerRight}</div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-4 overflow-x-auto pb-4 pt-1 w-full flex-1 min-h-0 scrollbar-thin">
          {lanes.map((lane) => (
            <V2KanbanLane<T>
              key={lane.id}
              lane={lane}
              getItemId={getItemId}
              renderCard={renderCard}
              isDragDisabled={isDragDisabled}
              emptyMessage={emptyLaneMessage}
            />
          ))}
        </div>

        {/* ── Drag Overlay Preview (Card nổi khi đang kéo) ── */}
        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeItemInfo ? (
            <div className="transform-gpu rotate-1.5 scale-102 opacity-95 shadow-2xl ring-2 ring-primary/50 rounded-xl cursor-grabbing pointer-events-none">
              {renderCard(activeItemInfo.item, activeItemInfo.lane.id, true)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
