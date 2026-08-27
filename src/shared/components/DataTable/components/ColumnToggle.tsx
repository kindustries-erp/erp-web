import React, { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Settings2, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useT } from "@/core/i18n";
import type { SortableItemProps, DataTableRowMeta } from "../types";

export function SortableColumnItem<T>({ id, column }: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = column.columnDef.meta as DataTableRowMeta;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px] hover:bg-[color:var(--popup-bg-hover)] bg-surface"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-foreground text-muted-foreground transition-colors outline-none"
      >
        <GripVertical size={14} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
        <div
          className="flex items-center justify-center w-4 h-4 rounded-[4px] border border-border bg-surface data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
          data-state={column.getIsVisible() ? "checked" : "unchecked"}
        >
          {column.getIsVisible() && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-fg"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={column.getIsVisible()}
          onChange={(e) => column.toggleVisibility(e.target.checked)}
        />
        <span className="truncate">{meta?.label as ReactNode}</span>
      </label>
    </div>
  );
}

export interface ColumnToggleProps<T> {
  table: TanstackTable<T>;
  _visibility?: VisibilityState;
  _order?: string[];
  onReset?: () => void;
}

export function ColumnToggle<T>({ table, onReset }: ColumnToggleProps<T>) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const hideableColumns = table.getAllLeafColumns().filter((col) => {
    const meta = col.columnDef.meta as DataTableRowMeta;
    return (
      meta?.hideable !== false &&
      col.id !== "__actions" &&
      col.id !== "__hover_actions"
    );
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentOrder = table.getAllLeafColumns().map((c) => c.id);
      const oldOrderIndex = currentOrder.findIndex((id) => id === active.id);
      const newOrderIndex = currentOrder.findIndex((id) => id === over.id);

      const newOrder = arrayMove(currentOrder, oldOrderIndex, newOrderIndex);
      table.setColumnOrder(newOrder);
    }
  };

  if (hideableColumns.length === 0) return null;

  return (
    <Popover.Root modal={false} open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 px-0"
          title={t("table.columnVisibility", "Tùy chỉnh cột")}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[9999] min-w-[210px] max-w-[280px] rounded-lg p-1.5 popup-content border border-border shadow-md"
        >
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60 mb-1">
            <span className="text-xs font-semibold text-muted-foreground select-none">
              {t("table.columnVisibility", "Tùy chỉnh cột")}
            </span>
            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1 -mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                title={t("table.resetColumns", "Khôi phục mặc định")}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t("table.reset", "Khôi phục")}</span>
              </Button>
            )}
          </div>
          <div className="max-h-[min(360px,75vh)] overflow-y-auto overflow-x-hidden space-y-0.5 pr-0.5">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={hideableColumns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {hideableColumns.map((column) => (
                  <SortableColumnItem<T>
                    key={column.id}
                    id={column.id}
                    column={column}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
