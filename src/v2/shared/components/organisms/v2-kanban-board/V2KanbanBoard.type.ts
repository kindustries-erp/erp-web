import type React from "react";

export interface V2KanbanLaneData<T = any> {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badgeCount?: number;
  subtotalLabel?: string;
  accentColor?: string;
  accentClassName?: string;
  headerClassName?: string;
  items: T[];
  isDropDisabled?: boolean;
}

export interface V2KanbanDropEvent<T = any> {
  itemId: string;
  item: T;
  sourceLaneId: string;
  targetLaneId: string;
  targetIndex: number;
}

export interface V2KanbanBoardProps<T = any> {
  id?: string;
  lanes: V2KanbanLaneData<T>[];
  getItemId: (item: T) => string;
  renderCard: (item: T, laneId: string, isOverlay?: boolean) => React.ReactNode;
  onCardDrop?: (event: V2KanbanDropEvent<T>) => void;
  className?: string;
  isDragDisabled?: boolean;
  emptyLaneMessage?: string;
  headerRight?: React.ReactNode;
}

export interface V2KanbanLaneProps<T = any> {
  lane: V2KanbanLaneData<T>;
  getItemId: (item: T) => string;
  renderCard: (item: T, laneId: string, isOverlay?: boolean) => React.ReactNode;
  isDragDisabled?: boolean;
  emptyMessage?: string;
}

export interface V2KanbanCardWrapperProps {
  id: string;
  isDragDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
}
