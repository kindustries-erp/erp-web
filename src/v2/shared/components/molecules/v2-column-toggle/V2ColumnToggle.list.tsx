import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Checkbox } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { reorderKeys } from "./V2ColumnToggle.helper";
import type { V2ColumnToggleItem } from "./V2ColumnToggle.type";

interface RowProps {
  item: V2ColumnToggleItem;
  onToggle: (columnKey: string) => void;
}

const SortableRow: React.FC<RowProps> = ({ item, onToggle }) => {
  const { t } = useV2Translation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-surface-hover",
        isDragging && "relative z-10 bg-surface-hover opacity-70",
      )}
    >
      <V2Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("v2.table.dragColumn", "Kéo để đổi vị trí cột")}
        className="h-5 w-5 shrink-0 cursor-grab touch-none text-muted-fg hover:bg-transparent"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </V2Button>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <Checkbox
          checked={item.visible}
          disabled={item.canHide === false}
          onCheckedChange={() => onToggle(item.key)}
        />
        <span className="truncate">{item.label}</span>
      </label>
    </li>
  );
};

interface ListProps {
  columns: V2ColumnToggleItem[];
  onToggle: (columnKey: string) => void;
  onReorder: (orderedKeys: string[]) => void;
}

export const V2ColumnToggleList: React.FC<ListProps> = ({
  columns,
  onToggle,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const keys = columns.map((column) => column.key);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(reorderKeys(keys, String(active.id), String(over.id)));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        <ul className="flex max-h-[min(360px,75vh)] flex-col gap-0.5 overflow-y-auto">
          {columns.map((item) => (
            <SortableRow key={item.key} item={item} onToggle={onToggle} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
