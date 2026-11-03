import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2NotificationPopoverDesktop } from "./V2NotificationPopover.desktop";
import { V2NotificationPopoverMobile } from "./V2NotificationPopover.mobile";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export const V2NotificationPopover: React.FC<V2NotificationPopoverProps> = (
  props,
) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2NotificationPopoverMobile {...props} />
  ) : (
    <V2NotificationPopoverDesktop {...props} />
  );
};

V2NotificationPopover.displayName = "V2NotificationPopover";
