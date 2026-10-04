import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarHeader } from "@/v2/shared/components/molecules/v2-sidebar-header";
import { V2SidebarSection } from "@/v2/shared/components/molecules/v2-sidebar-section";
import { V2SidebarNavItem } from "@/v2/shared/components/molecules/v2-sidebar-nav-item";
import { V2SidebarBottom } from "@/v2/shared/components/molecules/v2-sidebar-bottom";
import { V2SidebarProps, V2SidebarSectionData } from "./V2Sidebar.type";
import { useV2Sidebar } from "./V2Sidebar.hook";

export const V2Sidebar: React.FC<V2SidebarProps> = ({
  sections,
  items,
  activeId,
  onNavigate,
  user,
  collapsed,
  onToggleCollapse,
  className,
  ...props
}) => {
  const { isCollapsed, openSections, toggleCollapse, toggleSection } =
    useV2Sidebar(false, collapsed, onToggleCollapse);

  const effectiveSections: V2SidebarSectionData[] = React.useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (items && items.length > 0) {
      return [{ id: "default", items }];
    }
    return [];
  }, [sections, items]);

  return (
    <aside
      data-testid="v2-sidebar"
      className={cn(
        "v2-sidebar relative flex flex-col h-full rounded-2xl border border-border shadow-sm bg-[color:var(--sidebar-bg,hsl(var(--card)))] text-card-foreground transition-all duration-200 ease-in-out select-none flex-shrink-0",
        isCollapsed ? "w-[58px]" : "w-[210px]",
        className,
      )}
      {...props}
    >
      <V2SidebarHeader isCollapsed={isCollapsed} onToggle={toggleCollapse} />

      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-1",
          isCollapsed
            ? "scrollbar-none [&::-webkit-scrollbar]:hidden"
            : "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:var(--scrollbar-thumb,#cbd5e1)_transparent]",
        )}
        aria-label="Sidebar Navigation"
      >
        {effectiveSections.map((section) => (
          <V2SidebarSection
            key={section.id}
            label={section.label}
            isCollapsed={isCollapsed}
            defaultOpen={openSections[section.id] !== false}
            onToggle={() => toggleSection(section.id)}
          >
            {section.items.map((item) => (
              <V2SidebarNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeId === item.id}
                badgeCount={item.badgeCount}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate?.(item)}
              />
            ))}
          </V2SidebarSection>
        ))}
      </nav>

      <V2SidebarBottom
        collapsed={isCollapsed}
        avatarInitials={user?.avatarInitials ?? "U"}
        displayName={user?.displayName}
        unreadCount={user?.unreadCount ?? 0}
      />
    </aside>
  );
};
