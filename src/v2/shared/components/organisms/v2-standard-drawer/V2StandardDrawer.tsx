import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawerDesktop } from "./V2StandardDrawer.desktop";
import { V2StandardDrawerMobile } from "./V2StandardDrawer.mobile";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

export const V2StandardDrawer: React.FC<V2StandardDrawerProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2StandardDrawerMobile {...props} />
  ) : (
    <V2StandardDrawerDesktop {...props} />
  );
};
