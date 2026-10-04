import * as React from "react";

export type DrawerActionVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost";

export interface DrawerAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  align?: "left" | "right";
  variant?: DrawerActionVariant;
  type?: "button" | "submit" | "reset";
}

export interface DrawerFooterProps {
  actions?: DrawerAction[];
  footerLeft?: React.ReactNode;
  className?: string;
}
