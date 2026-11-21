import type { V2KanbanLaneData } from "./V2KanbanBoard.type";

export function findItemAndLane<T>(
  lanes: V2KanbanLaneData<T>[],
  itemId: string,
  getItemId: (item: T) => string,
): { item: T; lane: V2KanbanLaneData<T>; index: number } | null {
  for (const lane of lanes) {
    const idx = lane.items.findIndex((item) => getItemId(item) === itemId);
    if (idx !== -1) {
      return { item: lane.items[idx], lane, index: idx };
    }
  }
  return null;
}

export function findLaneById<T>(
  lanes: V2KanbanLaneData<T>[],
  laneId: string,
): V2KanbanLaneData<T> | null {
  return lanes.find((l) => l.id === laneId) || null;
}

export function moveItemBetweenLanes<T>(
  lanes: V2KanbanLaneData<T>[],
  sourceLaneId: string,
  targetLaneId: string,
  itemId: string,
  targetIndex: number,
  getItemId: (item: T) => string,
): V2KanbanLaneData<T>[] {
  const sourceLane = findLaneById(lanes, sourceLaneId);
  const targetLane = findLaneById(lanes, targetLaneId);

  if (!sourceLane || !targetLane) return lanes;

  const itemIdx = sourceLane.items.findIndex((i) => getItemId(i) === itemId);
  if (itemIdx === -1) return lanes;

  const [movedItem] = sourceLane.items.splice(itemIdx, 1);

  if (sourceLaneId === targetLaneId) {
    const insertIdx = Math.max(
      0,
      Math.min(targetIndex, sourceLane.items.length),
    );
    sourceLane.items.splice(insertIdx, 0, movedItem);
    return [...lanes];
  }

  const insertIdx = Math.max(0, Math.min(targetIndex, targetLane.items.length));
  targetLane.items.splice(insertIdx, 0, movedItem);

  return lanes.map((l) => {
    if (l.id === sourceLaneId)
      return { ...sourceLane, items: [...sourceLane.items] };
    if (l.id === targetLaneId)
      return { ...targetLane, items: [...targetLane.items] };
    return l;
  });
}
