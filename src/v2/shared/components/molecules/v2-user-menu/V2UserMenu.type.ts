import * as React from "react";

export interface V2UserMenuProps {
  children: React.ReactNode;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenChangelog?: () => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}
