import { useRef, useState, DragEvent } from "react";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import {
  useAppStore,
  STATIC_TABS,
  SECTION_ROOTS,
} from "@/core/config/appStore";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { useT } from "@/core/i18n";
import {
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Car,
  ClipboardList,
  Network,
  Factory,
  Package,
  Barcode,
  ReceiptText,
  Shield,
} from "lucide-react";

const TAB_ICONS: Partial<Record<PageKey, React.ElementType>> = {
  dashboard: LayoutDashboard,

  "erp-sales-orders": Boxes,
  "erp-customers": Users,
  "after-sales": Shield,
  purchasing: FileText,
  "erp-suppliers": Building2,
  "inventory-dashboard": LayoutDashboard,
  "erp-inventory-stock": Package,
  "erp-inventory-tracking": Barcode,
  "erp-inventory-vouchers": ReceiptText,
  "erp-goods-issues": ClipboardList,
  "erp-inventory-items": Layers,
  "erp-inventory-uom": Layers,
  "erp-inventory-item-types": Layers,
  "erp-inventory-tracking-categories": Layers,
  "mfg-items": Layers,
  "mfg-purchase-orders": FileText,
  "mfg-vehicles": Car,
  "erp-bom": Network,
  "erp-production": Factory,
};

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

  const Icon = TAB_ICONS[tabKey] || FileText;

  return (
    <div
      ref={onMount}
      data-tab-page={tabKey}
      data-tab-label={label}
      draggable={closable && !isMobile}
      className={cn(
        "tab-item flex items-center gap-[5px] px-[14px] py-[7px] text-[11px] cursor-pointer whitespace-nowrap flex-shrink-0 relative z-10 border-b-2 border-transparent",
        "transition-all duration-150 ease-out",
        active
          ? "text-foreground font-semibold border-b-[color:var(--primary)]"
          : "text-[color:var(--muted-fg)] hover:text-foreground hover:border-b-black/10",
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
      <Icon className="w-3.5 h-3.5 opacity-70" />
      <span>{label}</span>
      {closable && (
        <span
          className="inline-flex items-center justify-center w-4 h-4 text-[color:var(--faint)] text-sm leading-none cursor-pointer rounded-sm hover:bg-surface-hover hover:text-[color:var(--muted-fg)] ml-1"
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
  const isMobile = useIsMobile();
  const tabsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
        .custom-scrollbar::-webkit-scrollbar {
          height: 1px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .theme-orcaq .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
        }
        .theme-orcaq .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
          overflow-x: overlay;
        }
        .theme-orcaq .custom-scrollbar {
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
      `}</style>
      <div className="tab-bar-wrapper relative z-50 shrink-0">
        <div
          ref={containerRef}
          className="tab-bar-inner flex items-center px-6 gap-0 bg-[color:var(--background)] border-t border-[color:var(--glass-border)] relative overflow-x-auto overflow-y-hidden custom-scrollbar w-full h-9"
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
