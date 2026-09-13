import React from "react";
import { cn } from "@/shared/utils";

export interface TabSlideTransitionProps {
  /** Key of the active tab */
  activeKey: string;
  /** Ordered list of tab keys to automatically compute slide direction */
  tabKeys?: string[];
  /** Manual direction override: +1 (slide from right), -1 (slide from left) */
  direction?: number;
  /** Active tab content */
  children: React.ReactNode;
  /** ClassName for the outer container */
  className?: string;
  /** ClassName for the inner container */
  contentClassName?: string;
  /** AnimatePresence mode */
  mode?: "wait" | "popLayout" | "sync";
  /** Slide offset distance */
  distance?: number | string;
  /** Animation duration in seconds */
  duration?: number;
  /** If true, disable horizontal slide and only apply fade transition */
  fadeOnly?: boolean;
}

/**
 * Lightweight instant tab wrapper (animations removed for optimal ERP performance).
 */
export function TabSlideTransition({
  children,
  className,
  contentClassName,
}: TabSlideTransitionProps) {
  return (
    <div
      className={cn("w-full flex-1 min-h-0 relative flex flex-col", className)}
    >
      <div
        className={cn(
          "w-full h-full flex flex-col flex-1 min-h-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
