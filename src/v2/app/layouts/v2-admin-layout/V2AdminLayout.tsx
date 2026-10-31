import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2AdminLayoutDesktop } from "./V2AdminLayout.desktop";
import { V2AdminLayoutMobile } from "./V2AdminLayout.mobile";
import type { V2AdminLayoutProps } from "./V2AdminLayout.type";

export const V2AdminLayout: React.FC<V2AdminLayoutProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2AdminLayoutMobile {...props} />
  ) : (
    <V2AdminLayoutDesktop {...props} />
  );
};
