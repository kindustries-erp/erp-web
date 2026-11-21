import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/v2/shared/utils/cn";
import type { V2KanbanCardWrapperProps } from "./V2KanbanBoard.type";

export const V2KanbanCardWrapper: React.FC<V2KanbanCardWrapperProps> = ({
  id,
  isDragDisabled = false,
  children,
  className,
}) => {
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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-shadow rounded-xl",
        isDragDisabled
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing",
        isDragging &&
          "opacity-30 scale-[0.98] pointer-events-none ring-2 ring-primary/40",
        className,
      )}
      {...(isDragDisabled ? {} : attributes)}
      {...(isDragDisabled ? {} : listeners)}
    >
      {children}
    </div>
  );
};
