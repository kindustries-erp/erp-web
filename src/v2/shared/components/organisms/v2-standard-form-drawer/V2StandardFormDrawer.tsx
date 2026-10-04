import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2StandardFormDrawerDesktop } from "./V2StandardFormDrawer.desktop";
import { V2StandardFormDrawerMobile } from "./V2StandardFormDrawer.mobile";
import type { V2StandardFormDrawerProps } from "./V2StandardFormDrawer.type";

export const V2StandardFormDrawer: React.FC<V2StandardFormDrawerProps> = (
  props,
) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2StandardFormDrawerMobile {...props} />
  ) : (
    <V2StandardFormDrawerDesktop {...props} />
  );
};
