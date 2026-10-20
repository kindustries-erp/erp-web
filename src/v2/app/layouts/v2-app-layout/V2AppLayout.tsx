import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2AppLayoutDesktop } from "./V2AppLayout.desktop";
import { V2AppLayoutMobile } from "./V2AppLayout.mobile";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const V2AppLayout: React.FC<V2AppLayoutProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2AppLayoutMobile {...props} />
  ) : (
    <V2AppLayoutDesktop {...props} />
  );
};
