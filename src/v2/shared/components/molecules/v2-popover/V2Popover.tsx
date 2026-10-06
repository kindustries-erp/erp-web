import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2PopoverDesktop } from "./V2Popover.desktop";
import { V2PopoverMobile } from "./V2Popover.mobile";
import type { V2PopoverProps } from "./V2Popover.type";

export const V2Popover: React.FC<V2PopoverProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2PopoverMobile {...props} />
  ) : (
    <V2PopoverDesktop {...props} />
  );
};
V2Popover.displayName = "V2Popover";

// Alias tiện dụng cho lập trình viên
export const AppPopover = V2Popover;
