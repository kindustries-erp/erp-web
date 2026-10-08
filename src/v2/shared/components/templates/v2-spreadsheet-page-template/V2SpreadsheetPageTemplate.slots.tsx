import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";

interface V2ToolbarSlotProps {
  tabKey: string;
  active: boolean;
  register: (key: string, el: HTMLElement | null) => void;
}

export const V2ToolbarSlot: React.FC<V2ToolbarSlotProps> = ({
  tabKey,
  active,
  register,
}) => {
  const ref = React.useCallback(
    (el: HTMLDivElement | null) => register(tabKey, el),
    [register, tabKey],
  );
  return (
    <div
      ref={ref}
      data-toolbar-slot={tabKey}
      className={cn(
        "flex-wrap items-center gap-2 empty:hidden",
        active ? "flex" : "hidden",
      )}
    />
  );
};
