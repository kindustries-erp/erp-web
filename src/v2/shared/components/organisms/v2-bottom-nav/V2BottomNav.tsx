import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2NavItem } from "@/v2/shared/components/molecules/v2-nav-item";
import { V2BottomNavProps } from "./V2BottomNav.type";

export const V2BottomNav: React.FC<V2BottomNavProps> = ({
  items = [],
  activeId,
  onNavigate,
  className,
}) => {
  return (
    <nav
      data-testid="v2-bottom-nav"
      aria-label="Mobile Navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-card/95 px-2 pb-safe backdrop-blur-md select-none",
        className,
      )}
    >
      {items.map((item) => (
        <V2NavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          href={item.href}
          isActive={activeId === item.id}
          badgeCount={item.badgeCount}
          variant="bottom-nav"
          onClick={() => onNavigate?.(item)}
        />
      ))}
    </nav>
  );
};
