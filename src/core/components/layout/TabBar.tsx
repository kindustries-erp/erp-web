import {
  useRef,
  useEffect,
  useState,
  DragEvent,
  TouchEvent,
  MouseEvent,
} from "react";
import {
  useAppStore,
  STATIC_TABS,
  SECTION_ROOTS,
} from "@/core/config/appStore";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import {
  openPageContextMenu,
  usePageContextMenu,
} from "@/shared/components/ContextMenu";
import { useT } from "@/core/i18n";

const MOBILE_BREAKPOINT = 768;
const LONG_PRESS_MS = 300;
const MOVE_THRESHOLD_PX = 8;

type DragPhase = "idle" | "pending" | "dragging";

function TabItem({
  tabKey,
  active,
  onMount,
  dragging,
  dragOver,
  isMobile,
  dragPhase,
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
  dragPhase: DragPhase;
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
  const onContextMenu = usePageContextMenu(tabKey, label);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const menuButtonTouchRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !closable || menuButtonTouchRef.current) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      onDragStart(tabKey);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !closable) return;
    const touch = e.touches[0];
    const start = touchStartRef.current;
    if (!start) return;

    const movedX = Math.abs(touch.clientX - start.x);
    const movedY = Math.abs(touch.clientY - start.y);
    if (movedX > MOVE_THRESHOLD_PX || movedY > MOVE_THRESHOLD_PX) {
      if (dragPhase !== "dragging") {
        clearLongPressTimer();
      }
    }

    if (dragPhase === "dragging") {
      e.preventDefault();
      onDragOver(tabKey);
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    touchStartRef.current = null;
    if (menuButtonTouchRef.current) {
      menuButtonTouchRef.current = false;
      return;
    }
    if (isMobile && dragPhase === "dragging") {
      onDrop(tabKey);
    }
  };

  const handleTouchCancel = () => {
    clearLongPressTimer();
    touchStartRef.current = null;
    menuButtonTouchRef.current = false;
    if (isMobile && dragPhase === "dragging") {
      onDragEnd();
    }
  };

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

  const handleMenuOpen = (
    e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    clearLongPressTimer();
    menuButtonTouchRef.current = true;
    if (e.currentTarget instanceof HTMLElement) {
      openPageContextMenu(tabKey, label, e.currentTarget);
    }
  };

  return (
    <div
      ref={(el) => {
        rootRef.current = el;
        onMount(el);
      }}
      draggable={closable && !isMobile}
      className={cn(
        "flex items-center gap-[6px] px-[16px] py-[8px] text-xs cursor-pointer whitespace-nowrap flex-shrink-0 relative z-10 transition-colors duration-200 rounded-full touch-pan-x",
        active
          ? "text-foreground dark:text-white font-medium"
          : "text-[color:var(--muted-fg)] dark:text-zinc-400 hover:text-foreground dark:hover:text-white",
        closable && !isMobile && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-50",
        dragOver && "ring-1 ring-black/10 dark:ring-white/20",
        isMobile && dragPhase === "pending" && "select-none",
      )}
      onClick={() => {
        if (isMobile && dragPhase === "dragging") return;
        navigate(tabKey);
      }}
      onContextMenu={isMobile ? undefined : onContextMenu}
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <span>{label}</span>
      {isMobile && closable && (
        <button
          type="button"
          className="inline-flex md:hidden items-center justify-center w-5 h-5 rounded-full text-[color:var(--faint)] hover:bg-surface-hover hover:text-[color:var(--muted-fg)]"
          aria-label={`Mở menu ${label}`}
          onClick={handleMenuOpen}
          onTouchStart={(e) => {
            menuButtonTouchRef.current = true;
            handleMenuOpen(e);
          }}
        >
          ⋯
        </button>
      )}
      {closable && (
        <span
          className="text-[color:var(--faint)] text-sm leading-none cursor-pointer px-[3px] py-[1px] rounded-sm hover:bg-surface-hover hover:text-[color:var(--muted-fg)] ml-1 hidden md:inline"
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
  const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
  const [draggingTab, setDraggingTab] = useState<PageKey | null>(null);
  const [dragOverTab, setDragOverTab] = useState<PageKey | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dragPhase, setDragPhase] = useState<DragPhase>("idle");
  const tabsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const activeTabEl = tabsRefs.current[currentPage];
    if (activeTabEl) {
      setBgStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }
  }, [currentPage, openTabs]);

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
    setDragPhase(isMobile ? "dragging" : "dragging");
  };

  const handleDragEnd = () => {
    setDraggingTab(null);
    setDragOverTab(null);
    setDragPhase("idle");
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

  useEffect(() => {
    if (dragPhase !== "dragging") return;

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isMobile || !draggingTab) return;
      const touch = e.touches[0];
      if (!touch) return;
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const tabElement = element?.closest(
        "[data-tab-key]",
      ) as HTMLElement | null;
      const targetKey = tabElement?.dataset.tabKey as PageKey | undefined;
      if (targetKey && targetKey !== draggingTab && !STATIC_TABS[targetKey]) {
        setDragOverTab(targetKey);
      }
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      if (draggingTab && dragOverTab && draggingTab !== dragOverTab) {
        reorderTabs(draggingTab, dragOverTab);
      }
      handleDragEnd();
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleDragEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleDragEnd);
    };
  }, [dragPhase, dragOverTab, draggingTab, isMobile, reorderTabs]);

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
      <div className="absolute bottom-6 md:bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[90%]">
        <div
          ref={containerRef}
          className="backdrop-blur-xl bg-white/50 dark:bg-black/50 flex items-center p-1 gap-1 rounded-full shadow-[0_-2px_10px_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/20 relative overflow-x-auto scrollbar-none w-full"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
          onDragLeave={handleContainerDragLeave}
          title={draggableTabCount > 1 ? "Kéo để đổi vị trí tab" : undefined}
        >
          <div
            className="absolute top-1 bottom-1 bg-white dark:bg-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full transition-all duration-300 ease-in-out z-0"
            style={{
              left: `${bgStyle.left}px`,
              width: `${bgStyle.width}px`,
            }}
          />

          {openTabs.map((key) => (
            <div key={key} data-tab-key={key}>
              <TabItem
                tabKey={key as PageKey}
                active={key === currentPage}
                dragging={draggingTab === key}
                dragOver={dragOverTab === key && draggingTab !== key}
                isMobile={isMobile}
                dragPhase={dragPhase}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMount={(el) => {
                  tabsRefs.current[key] = el;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
