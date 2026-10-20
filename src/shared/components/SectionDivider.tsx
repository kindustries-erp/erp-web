import React from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface SectionDividerProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  actions?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SectionDivider({
  title,
  icon,
  badge,
  badgeVariant = "outline",
  actions,
  collapsible = false,
  collapsed = false,
  onToggle,
  className,
  children,
}: SectionDividerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex items-center justify-between pb-1 border-b border-border/60 select-none",
          collapsible &&
            "cursor-pointer hover:border-primary/40 transition-colors",
        )}
        onClick={collapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-2 min-w-0">
          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}

          {icon && <span className="text-primary shrink-0">{icon}</span>}

          <span className="text-xs font-semibold tracking-tight text-foreground uppercase truncate">
            {title}
          </span>

          {badge !== undefined && (
            <Badge
              variant={badgeVariant}
              className="text-[10px] px-1.5 py-0 font-mono font-medium h-4"
            >
              {badge}
            </Badge>
          )}
        </div>

        {actions && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {!collapsed && children && <div className="pt-1">{children}</div>}
    </div>
  );
}
