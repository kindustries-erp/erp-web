import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { V2KanbanCardWrapper } from "./V2KanbanCardWrapper";
import type { V2KanbanLaneProps } from "./V2KanbanBoard.type";

export function V2KanbanLane<T = any>({
  lane,
  getItemId,
  renderCard,
  isDragDisabled = false,
  emptyMessage = "Chưa có mục nào",
}: V2KanbanLaneProps<T>) {
  const { setNodeRef, isOver } = useDroppable({
    id: lane.id,
    disabled: lane.isDropDisabled,
  });

  const itemIds = React.useMemo(
    () => lane.items.map((item) => getItemId(item)),
    [lane.items, getItemId],
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-shrink-0 w-80 rounded-2xl border transition-colors duration-200",
        "bg-surface/50 dark:bg-zinc-950/40 border-border/50 dark:border-white/[0.08] shadow-xs backdrop-blur-xs",
        isOver &&
          !lane.isDropDisabled &&
          "bg-primary/5 border-primary/40 ring-2 ring-primary/20",
      )}
    >
      {/* ── Lane Header ── */}
      <div
        className={cn(
          "flex items-center justify-between px-3.5 py-2.5 border-b border-border/40 dark:border-white/[0.06] rounded-t-2xl bg-surface/80 dark:bg-zinc-900/70 backdrop-blur-xs",
          lane.headerClassName,
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {lane.accentColor && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: lane.accentColor }}
            />
          )}
          {lane.icon && (
            <span className="shrink-0 text-muted-fg">{lane.icon}</span>
          )}
          <V2Text
            variant="section-title"
            className="text-xs font-bold text-foreground truncate"
          >
            {lane.title}
          </V2Text>
          {lane.badgeCount !== undefined && (
            <V2Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 font-bold font-mono bg-surface dark:bg-zinc-900 border-border/60 dark:border-white/[0.08]"
            >
              {lane.badgeCount}
            </V2Badge>
          )}
        </div>

        {lane.subtotalLabel && (
          <V2Text
            variant="caption"
            className="text-[11px] font-mono font-semibold text-muted-fg tabular-nums shrink-0"
          >
            {lane.subtotalLabel}
          </V2Text>
        )}
      </div>

      {/* ── Lane Body (Scrollable List) ── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[320px] max-h-[calc(100vh-240px)]">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {lane.items.map((item) => {
            const id = getItemId(item);
            return (
              <V2KanbanCardWrapper
                key={id}
                id={id}
                isDragDisabled={isDragDisabled}
              >
                {renderCard(item, lane.id, false)}
              </V2KanbanCardWrapper>
            );
          })}
        </SortableContext>

        {lane.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border/40 dark:border-white/[0.06] text-center">
            <V2Text variant="caption" className="text-muted-fg/70 text-xs">
              {emptyMessage}
            </V2Text>
          </div>
        )}
      </div>
    </div>
  );
}
