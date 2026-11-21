import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/v2/shared/utils/cn";
import type { V2KanbanCardWrapperProps } from "./V2KanbanBoard.type";

export const V2KanbanCardWrapper: React.FC<V2KanbanCardWrapperProps> =
  React.memo(({ id, isDragDisabled = false, children, className }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      disabled: isDragDisabled,
    });

    const style: React.CSSProperties = {
      transform: CSS.Translate.toString(transform),
      transition: isDragging ? undefined : transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative group rounded-xl",
          isDragDisabled
            ? "cursor-default"
            : "cursor-grab active:cursor-grabbing",
          isDragging &&
            "opacity-25 scale-[0.98] pointer-events-none border border-dashed border-kanban-placeholder-border bg-kanban-placeholder",
          className,
        )}
        {...(isDragDisabled ? {} : attributes)}
        {...(isDragDisabled ? {} : listeners)}
      >
        {children}
      </div>
    );
  });

V2KanbanCardWrapper.displayName = "V2KanbanCardWrapper";
