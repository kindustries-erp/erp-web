import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarIcon } from "@/v2/shared/components/atoms/v2-sidebar-icon";
import { V2Icon, ChevronRight } from "@/v2/shared/components/atoms/v2-icon";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { Badge } from "@/v2/shared/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/v2/shared/ui/dropdown-menu";
import { V2SidebarSubGroupProps } from "./V2SidebarSubGroup.type";

export const V2SidebarSubGroup: React.FC<V2SidebarSubGroupProps> = ({
  item,
  activeId,
  isCollapsed = false,
  onNavigate,
  className,
  ...props
}) => {
  const children = item.children ?? [];
  const hasActiveChild = children.some((child) => child.id === activeId);

  return (
    <div
      data-testid={`v2-sidebar-subgroup-${item.id}`}
      className={cn(isCollapsed ? "px-1 py-0.5" : "my-0.5", className)}
      {...props}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {isCollapsed ? (
            <button
              type="button"
              data-testid={`v2-sidebar-subgroup-trigger-${item.id}`}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "group relative flex h-9 w-full items-center justify-center rounded-lg transition-colors outline-none cursor-pointer",
                "text-muted-fg hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.04))] hover:text-foreground dark:hover:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))]",
                "data-[state=open]:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))] data-[state=open]:text-foreground",
                hasActiveChild &&
                  "!text-[color:var(--sidebar-active-fg,var(--foreground))] font-semibold bg-[color:var(--sidebar-active-bg,rgba(0,0,0,0.06))] shadow-xs",
              )}
            >
              <V2SidebarIcon icon={item.icon} isActive={hasActiveChild} />
              {hasActiveChild && (
                <span className="absolute right-1 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ) : (
            <div
              role="button"
              tabIndex={0}
              data-testid={`v2-sidebar-subgroup-trigger-${item.id}`}
              aria-label={item.label}
              className={cn(
                "group flex min-h-[34px] items-center gap-2 mx-2 px-2 py-[7px] rounded-md cursor-pointer whitespace-nowrap overflow-hidden text-[12px] font-medium transition-colors select-none outline-none",
                "text-muted-fg dark:text-zinc-400 opacity-80 hover:opacity-100 hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.04))] hover:text-[color:var(--sidebar-hover-fg,var(--foreground))] dark:hover:text-[color:var(--sidebar-hover-fg,var(--foreground))] dark:hover:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))]",
                "data-[state=open]:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))] data-[state=open]:text-foreground data-[state=open]:opacity-100",
                hasActiveChild &&
                  "!text-[color:var(--sidebar-active-fg,var(--foreground))] font-semibold opacity-100 bg-[color:var(--sidebar-active-bg,rgba(0,0,0,0.06))] shadow-xs",
              )}
            >
              <V2SidebarIcon icon={item.icon} isActive={hasActiveChild} />

              <V2Text
                as="span"
                variant="body-sm"
                truncate
                className="nav-label flex-1 text-left text-[12px] text-inherit font-inherit"
              >
                {item.label}
              </V2Text>

              <span className="nav-arrow-el ml-auto text-[10px] opacity-60 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-100">
                <V2Icon icon={ChevronRight} size={13} strokeWidth={2} />
              </span>
            </div>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={isCollapsed ? 12 : 8}
          className={cn(
            "z-50 min-w-[210px] rounded-xl p-1.5 backdrop-blur-md select-none",
            "border border-border/80 dark:border-[color:var(--sidebar-border,rgba(255,255,255,0.08))]",
            "shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]",
            "bg-[color:var(--sidebar-bg,hsl(var(--card)))] dark:bg-[color:var(--sidebar-bg,#16181e)] text-card-foreground",
          )}
        >
          <DropdownMenuLabel className="px-2.5 pt-1.5 pb-2 border-b border-border/40 dark:border-white/5 select-none">
            <V2Text
              as="span"
              variant="label"
              className="text-[10.5px] font-semibold text-sidebar-label dark:text-zinc-400 uppercase tracking-[0.08em]"
            >
              {item.label}
            </V2Text>
          </DropdownMenuLabel>
          <div className="py-1 space-y-0.5">
            {children.map((child) => {
              const isChildActive = activeId === child.id;
              return (
                <DropdownMenuItem
                  key={child.id}
                  data-testid={`v2-subgroup-item-${child.id}`}
                  onClick={() => onNavigate?.(child)}
                  className={cn(
                    "group flex min-h-[32px] items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer whitespace-nowrap overflow-hidden text-[12px] font-medium transition-colors select-none outline-none",
                    "text-muted-fg dark:text-zinc-400 opacity-80 hover:opacity-100",
                    "hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.04))] hover:text-[color:var(--sidebar-hover-fg,var(--foreground))] dark:hover:text-[color:var(--sidebar-hover-fg,var(--foreground))] dark:hover:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))]",
                    isChildActive &&
                      "!text-[color:var(--sidebar-active-fg,var(--foreground))] font-semibold opacity-100 bg-[color:var(--sidebar-active-bg,rgba(0,0,0,0.06))] shadow-xs",
                  )}
                >
                  <V2SidebarIcon icon={child.icon} isActive={isChildActive}>
                    {!child.icon && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          isChildActive
                            ? "bg-[color:var(--sidebar-active-fg)]"
                            : "bg-muted-foreground/50",
                        )}
                      />
                    )}
                  </V2SidebarIcon>
                  <V2Text
                    as="span"
                    variant="body-sm"
                    truncate
                    className="nav-label flex-1 text-left text-[12px] text-inherit font-inherit"
                  >
                    {child.label}
                  </V2Text>
                  {typeof child.badgeCount === "number" &&
                    child.badgeCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-4 px-1 text-[9px] font-semibold"
                      >
                        {child.badgeCount > 99 ? "99+" : child.badgeCount}
                      </Badge>
                    )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
