import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2UserMenuDesktop } from "./V2UserMenu.desktop";
import { V2UserMenuMobile } from "./V2UserMenu.mobile";
import type { V2UserMenuProps } from "./V2UserMenu.type";

export const V2UserMenu: React.FC<V2UserMenuProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2UserMenuMobile {...props} />
  ) : (
    <V2UserMenuDesktop {...props} />
  );
};

V2UserMenu.displayName = "V2UserMenu";
