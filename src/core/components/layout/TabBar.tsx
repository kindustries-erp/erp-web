import {
  useAppStore,
  STATIC_TABS,
  SECTION_ROOTS,
} from "@/core/config/appStore";
import { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { usePageContextMenu } from "@/shared/components/ContextMenu";

function TabItem({ tabKey, active }: { tabKey: PageKey; active: boolean }) {
  const { navigate, closeTab } = useAppStore();
  const label =
    STATIC_TABS[tabKey]?.label ?? SECTION_ROOTS[tabKey]?.label ?? tabKey;
  const closable = !STATIC_TABS[tabKey];
  const onContextMenu = usePageContextMenu(tabKey, label);
  return (
    <div
      className={cn(
        "flex items-center gap-[6px] px-[14px] py-[10px] text-xs cursor-pointer border-t-2 -mt-px whitespace-nowrap flex-shrink-0",
        active
          ? "text-foreground font-medium border-t-foreground"
          : "text-[color:var(--muted-fg)] border-t-transparent hover:text-foreground",
      )}
      onClick={() => navigate(tabKey)}
      onContextMenu={onContextMenu}
    >
      {label}
      {closable && (
        <span
          className="text-[color:var(--faint)] text-sm leading-none cursor-pointer px-[3px] py-[1px] rounded-sm hover:bg-surface-hover hover:text-[color:var(--muted-fg)]"
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
  return (
    <div className="tab-bar">
      {openTabs.map((key) => (
        <TabItem
          key={key}
          tabKey={key as PageKey}
          active={key === currentPage}
        />
      ))}
    </div>
  );
}
