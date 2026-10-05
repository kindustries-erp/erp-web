import React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2DropdownDesktop } from "./V2Dropdown.desktop";
import { V2DropdownMobile } from "./V2Dropdown.mobile";
import type { V2DropdownProps } from "./V2Dropdown.type";

export const V2Dropdown: React.FC<V2DropdownProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2DropdownMobile {...props} />
  ) : (
    <V2DropdownDesktop {...props} />
  );
};
V2Dropdown.displayName = "V2Dropdown";

export const AppDropdown = V2Dropdown;
