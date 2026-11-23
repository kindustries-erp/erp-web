import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { V2TabItem } from "../v2-tab-item";
import type { V2TabItemData } from "./V2TabBar.type";

export interface SortableTabItemProps {
  tab: V2TabItemData;
  isActive: boolean;
  onSelect: (key: string) => void;
  onClose?: (key: string) => void;
}

export const SortableTabItem: React.FC<SortableTabItemProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
}) => {
  const tabKey = (tab.id ?? tab.key) || "";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tabKey });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="shrink-0 touch-none"
    >
      <V2TabItem
        id={tabKey}
        label={typeof tab.label === "string" ? tab.label : String(tabKey)}
        icon={tab.icon as any}
        isActive={isActive}
        isClosable={tab.isClosable ?? true}
        isDragging={isDragging}
        onClick={() => onSelect(tabKey)}
        onClose={() => onClose?.(tabKey)}
      />
    </div>
  );
};

SortableTabItem.displayName = "SortableTabItem";
