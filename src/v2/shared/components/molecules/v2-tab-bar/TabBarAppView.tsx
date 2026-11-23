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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { SortableTabItem } from "./SortableTabItem";
import type { V2TabItemData } from "./V2TabBar.type";

interface TabBarAppViewProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
  onTabClose?: (key: string) => void;
  onTabsReorder?: (newTabs: V2TabItemData[]) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const TabBarAppView: React.FC<TabBarAppViewProps> = ({
  tabs: initialTabs,
  activeKey,
  onSelect,
  onTabClose,
  onTabsReorder,
  extra,
  className,
  ariaLabel,
}) => {
  const { t } = useV2Translation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [items, setItems] = React.useState<V2TabItemData[]>(initialTabs);

  React.useEffect(() => {
    setItems(initialTabs);
  }, [initialTabs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setItems((currentItems) => {
          const oldIndex = currentItems.findIndex(
            (item) => ((item.id ?? item.key) || "") === active.id,
          );
          const newIndex = currentItems.findIndex(
            (item) => ((item.id ?? item.key) || "") === over.id,
          );
          if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove(currentItems, oldIndex, newIndex);
            onTabsReorder?.(reordered);
            return reordered;
          }
          return currentItems;
        });
      }
    },
    [onTabsReorder],
  );

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  const tabKeys = React.useMemo(
    () => items.map((tab) => (tab.id ?? tab.key) || ""),
    [items],
  );

  return (
    <div
      data-testid="v2-tab-bar"
      role="tablist"
      aria-label={ariaLabel || t("v2.tabBar.ariaLabel", "Thanh tab đa nhiệm")}
      className={cn(
        "v2-tab-bar flex h-9 min-h-[36px] w-full bg-background/80 dark:bg-[color:var(--main-panel-bg,#181a20)]/85 backdrop-blur-md px-3 sm:px-4 select-none flex-shrink-0 rounded-t-2xl border-b border-border dark:border-white/[0.06] items-center justify-between",
        className,
      )}
    >
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex items-center gap-1.5 flex-1 min-w-0 h-full overflow-x-auto overflow-y-hidden scrollbar-none py-1 mr-2"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabKeys}
            strategy={horizontalListSortingStrategy}
          >
            {items.map((tab) => {
              const tabKey = (tab.id ?? tab.key) || "";
              return (
                <SortableTabItem
                  key={tabKey}
                  tab={tab}
                  isActive={activeKey === tabKey}
                  onSelect={onSelect}
                  onClose={onTabClose}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
      {extra && (
        <div className="flex items-center gap-2 shrink-0 ml-auto z-10 pl-1">
          {extra}
        </div>
      )}
    </div>
  );
};

TabBarAppView.displayName = "TabBarAppView";
