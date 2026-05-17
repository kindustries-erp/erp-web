import { useRef, useEffect, useState } from "react";
import {
  useAppStore,
  STATIC_TABS,
  SECTION_ROOTS,
} from "@/core/config/appStore";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { useT } from "@/core/i18n";

function TabItem({ 
  tabKey, 
  active, 
  onMount 
}: { 
  tabKey: PageKey; 
  active: boolean;
  onMount: (el: HTMLDivElement | null) => void;
}) {
  const { navigate, closeTab } = useAppStore();
  const t = useT();
  const labelKey = STATIC_TABS[tabKey]?.labelKey ?? SECTION_ROOTS[tabKey]?.labelKey;
  const label = labelKey ? t(labelKey) : tabKey;
  const closable = !STATIC_TABS[tabKey];
  const onContextMenu = usePageContextMenu(tabKey, label);
  
  return (
    <div
      ref={onMount}
      className={cn(
        "flex items-center gap-[6px] px-[16px] py-[8px] text-xs cursor-pointer whitespace-nowrap flex-shrink-0 relative z-10 transition-colors duration-200 rounded-full",
        active
          ? "text-foreground font-medium"
          : "text-[color:var(--muted-fg)] hover:text-foreground",
      )}
      onClick={() => navigate(tabKey)}
      onContextMenu={onContextMenu}
    >
      {label}
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
  const { openTabs, currentPage } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[90%]">
        <div 
          ref={containerRef}
          className="backdrop-blur-xl bg-white/50 dark:bg-black/50 flex items-center p-1 gap-1 rounded-full shadow-[0_-2px_10px_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/20 relative overflow-x-auto scrollbar-none w-full"
        >
        {/* Sliding background */}
        <div 
          className="absolute top-1 bottom-1 bg-white dark:bg-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full transition-all duration-300 ease-in-out z-0"
          style={{
            left: `${bgStyle.left}px`,
            width: `${bgStyle.width}px`,
          }}
        />
        
        {openTabs.map((key) => (
          <TabItem
            key={key}
            tabKey={key as PageKey}
            active={key === currentPage}
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
