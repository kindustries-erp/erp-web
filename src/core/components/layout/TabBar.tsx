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
  "garage-dashboard": LayoutDashboard,
  "garage-cases": Car,
  "garage-customers": Users,
  "garage-receivables": ReceiptText,
  "garage-payables": ReceiptText,
};

function TabItem({
  tab,
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
  tab: {
    instanceId: string;
    pageKey: PageKey;
    instanceIndex: 1 | 2;
    customLabel?: string;
  };
  active: boolean;
  onMount: (el: HTMLDivElement | null) => void;
  dragging: boolean;
  dragOver: boolean;
  isMobile: boolean;
  onDragStart: (instanceId: string) => void;
  onDragEnd: () => void;
  onDragOver: (instanceId: string) => void;
  onDrop: (instanceId: string) => void;
}) {
  const { navigate, closeTab } = useAppStore();
  const t = useT();
  const labelKey =
    STATIC_TABS[tab.pageKey]?.labelKey ?? SECTION_ROOTS[tab.pageKey]?.labelKey;
  const baseLabel = labelKey ? t(labelKey) : tab.pageKey;
  const label = tab.customLabel || baseLabel;
  const closable = !STATIC_TABS[tab.pageKey];
  const onContextMenu = usePageContextMenu(
    tab.pageKey,
    label,
    undefined,
    "tabbar",
    tab.instanceId,
  );

  const Icon = TAB_ICONS[tab.pageKey] || FileText;

  return (
    <div
      ref={onMount}
      data-tab-page={tab.pageKey}
      data-tab-instance-id={tab.instanceId}
      data-tab-label={label}
      draggable={closable && !isMobile}
      className={cn(
        "tab-item flex items-center gap-[5px] px-[14px] py-[7px] text-[11px] cursor-pointer whitespace-nowrap flex-shrink-0 relative z-10 border-b-2 border-transparent select-none",
        "transition-all duration-150 ease-out",
        active
          ? "text-foreground font-semibold border-b-[color:var(--primary)]"
          : "text-[color:var(--muted-fg)] hover:text-foreground hover:border-b-black/10",
        dragging && "opacity-40 scale-95",
        dragOver && "bg-[color:var(--surface-hover)] scale-105",
      )}
      onClick={() => navigate(tab.pageKey, tab.instanceIndex)}
      onContextMenu={onContextMenu}
      onDragStart={(e) => {
        if (!closable || isMobile) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", tab.instanceId);
        onDragStart(tab.instanceId);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!closable || isMobile) return;
        e.preventDefault();
        onDragOver(tab.instanceId);
      }}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        if (!closable || isMobile) return;
        e.preventDefault();
        onDrop(tab.instanceId);
      }}
    >
      <Icon className="w-3.5 h-3.5 opacity-70" />
      <span>{label}</span>
      {tab.instanceIndex === 2 && (
        <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-muted text-muted-foreground ml-0.5">
          #2
        </span>
      )}
      {closable && (
        <span
          className="inline-flex items-center justify-center w-4 h-4 text-[color:var(--faint)] text-sm leading-none cursor-pointer rounded-sm hover:bg-surface-hover hover:text-[color:var(--muted-fg)] ml-1"
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.instanceId);
          }}
        >
          ×
        </span>
      )}
    </div>
  );
}

export function TabBar() {
  const { openTabs, currentInstanceId, currentPage, reorderTabs } =
    useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTab, setDraggingTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const tabsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleDragStart = (instanceId: string) => {
    setDraggingTab(instanceId);
    setDragOverTab(instanceId);
  };

  const handleDragEnd = () => {
    setDraggingTab(null);
    setDragOverTab(null);
  };

  const handleDragOver = (instanceId: string) => {
    if (!draggingTab || draggingTab === instanceId) return;
    setDragOverTab(instanceId);
  };

  const handleDrop = (targetId: string) => {
    if (!draggingTab || draggingTab === targetId) {
      handleDragEnd();
      return;
    }

    reorderTabs(draggingTab, targetId);
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

  const normalizedTabs = openTabs.map((tab) =>
    typeof tab === "string"
      ? { instanceId: tab, pageKey: tab as PageKey, instanceIndex: 1 as const }
      : tab,
  );
  const activeInstanceId =
    currentInstanceId ||
    (typeof currentPage === "string" ? currentPage : "dashboard");
  const draggableTabCount = normalizedTabs.filter(
    (tab) => !STATIC_TABS[tab.pageKey],
  ).length;

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
          {normalizedTabs.map((tab) => (
            <TabItem
              key={tab.instanceId}
              tab={tab}
              active={tab.instanceId === activeInstanceId}
              dragging={draggingTab === tab.instanceId}
              dragOver={
                dragOverTab === tab.instanceId && draggingTab !== tab.instanceId
              }
              isMobile={isMobile}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onMount={(el) => {
                tabsRefs.current[tab.instanceId] = el;
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
