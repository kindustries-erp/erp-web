import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PageToolbarSlotProps } from "./V2PageToolbarSlot.type";

export const V2PageToolbarSlot: React.FC<V2PageToolbarSlotProps> = ({
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
