import * as React from "react";
import type {
  V2DropdownGroup,
  V2DropdownEntry,
} from "@/v2/shared/components/molecules/v2-dropdown";

export type DrawerActionVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost";

export interface DrawerAction {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  align?: "left" | "right";
  variant?: DrawerActionVariant;
  type?: "button" | "submit" | "reset";
}

export interface DrawerFooterProps {
  actions?: DrawerAction[];
  actionGroups?: V2DropdownGroup[];
  actionDropdownItems?: V2DropdownEntry[];
  actionDropdownTriggerLabel?: string;
  footerLeft?: React.ReactNode;
  className?: string;
  isScrolledBottom?: boolean;
}
