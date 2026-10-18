import React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerRelatedTabItem } from "./DrawerRelatedDeck.type";

export function DeckBadge({
  count,
  variant,
  isActive,
}: {
  count: number;
  variant?: DrawerRelatedTabItem["badgeVariant"];
  isActive: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full transition-all",
        isActive
          ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary shadow-xs"
          : "bg-muted text-muted-foreground group-hover:text-foreground",
        variant === "danger" && "bg-destructive/20 text-destructive",
        variant === "warning" && "bg-warning/20 text-warning",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
