import { useRef, useEffect, useState, DragEvent } from "react";
import {
  useAppStore,
  STATIC_TABS,
  SECTION_ROOTS,
} from "@/core/config/appStore";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { useT } from "@/core/i18n";

const MOBILE_BREAKPOINT = 768;

function TabItem({
  tabKey,
  active,
  onMount,
  dragging,
  dragOver,
  isMobile,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  tabKey: PageKey;
  active: boolean;
  onMount: (el: HTMLDivElement | null) => void;
  dragging: boolean;
  dragOver: boolean;
  isMobile: boolean;
  onDragStart: (tabKey: PageKey) => void;
  onDragEnd: () => void;
  onDragOver: (tabKey: PageKey) => void;
  onDrop: (tabKey: PageKey) => void;
}) {
  const { navigate, closeTab } = useAppStore();
  const t = useT();
  const labelKey =
    STATIC_TABS[tabKey]?.labelKey ?? SECTION_ROOTS[tabKey]?.labelKey;
  const label = labelKey ? t(labelKey) : tabKey;
  const closable = !STATIC_TABS[tabKey];
  const onContextMenu = usePageContextMenu(tabKey, label, undefined, "tabbar");

  return (
    <div
      ref={onMount}
      data-tab-page={tabKey}
      data-tab-label={label}
      draggable={closable && !isMobile}
      className={cn(
        "tab-item flex items-center gap-[5px] px-[12px] py-[5px] text-[11px] cursor-pointer whitespace-nowrap flex-shrink-0 relative z-10 border-b-2 border-transparent",
        "transition-all duration-150 ease-out",
        active
          ? "text-foreground font-semibold border-b-[color:var(--primary)]"
          : "text-[color:var(--muted-fg)] hover:text-foreground",
        closable && !isMobile && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40 scale-95",
        dragOver && "bg-[color:var(--surface-hover)] scale-105",
      )}
      onClick={() => navigate(tabKey)}
      onContextMenu={onContextMenu}
      onDragStart={(e) => {
        if (!closable || isMobile) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", tabKey);
        onDragStart(tabKey);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!closable || isMobile) return;
        e.preventDefault();
        onDragOver(tabKey);
      }}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        if (!closable || isMobile) return;
        e.preventDefault();
        onDrop(tabKey);
      }}
    >
      <span>{label}</span>
      {closable && (
        <span
          className="text-[color:var(--faint)] text-sm leading-none cursor-pointer px-[3px] py-[1px] rounded-sm hover:bg-surface-hover hover:text-[color:var(--muted-fg)] ml-1"
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tabKey);
          }}
        >
          ×
        </span>
      )}
    </div>
  );
}

export function TabBar() {
  const { openTabs, currentPage, reorderTabs } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTab, setDraggingTab] = useState<PageKey | null>(null);
  const [dragOverTab, setDragOverTab] = useState<PageKey | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const tabsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const syncMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    syncMobile();
    window.addEventListener("resize", syncMobile);
    return () => window.removeEventListener("resize", syncMobile);
  }, []);

  const handleDragStart = (tabKey: PageKey) => {
    setDraggingTab(tabKey);
    setDragOverTab(tabKey);
  };

  const handleDragEnd = () => {
    setDraggingTab(null);
    setDragOverTab(null);
  };

  const handleDragOver = (tabKey: PageKey) => {
    if (!draggingTab || draggingTab === tabKey) return;
    setDragOverTab(tabKey);
  };

  const handleDrop = (targetKey: PageKey) => {
    if (!draggingTab || draggingTab === targetKey) {
      handleDragEnd();
      return;
    }

    reorderTabs(draggingTab, targetKey);
    handleDragEnd();
  };

  const handleContainerDrop = () => {
    handleDragEnd();
  };

  const handleContainerDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggingTab || isMobile) return;
    e.preventDefault();
  };

  const handleContainerDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      setDragOverTab(null);
    }
  };

  const draggableTabCount = openTabs.filter((tab) => !STATIC_TABS[tab]).length;

  return (
    <>
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="tab-bar-wrapper absolute bottom-0 left-0 right-0 z-50">
        <div
          ref={containerRef}
          className="tab-bar-inner flex items-center px-2 gap-0 bg-[color:var(--background)] border-t border-[color:var(--glass-border)] relative overflow-x-auto scrollbar-none w-full h-8"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
          onDragLeave={handleContainerDragLeave}
          title={draggableTabCount > 1 ? "Kéo để đổi vị trí tab" : undefined}
        >
          {openTabs.map((key) => (
            <TabItem
              key={key}
              tabKey={key as PageKey}
              active={key === currentPage}
              dragging={draggingTab === key}
              dragOver={dragOverTab === key && draggingTab !== key}
              isMobile={isMobile}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onMount={(el) => {
                tabsRefs.current[key] = el;
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
