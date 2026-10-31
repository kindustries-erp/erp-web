import type { LucideIcon } from "lucide-react";
import type { V2ButtonBaseProps } from "@/v2/shared/types";

export enum V2HeroButtonSize {
  DEFAULT = "default",
  SM = "sm",
  LG = "lg",
}

export type V2HeroButtonSizeType = V2HeroButtonSize | `${V2HeroButtonSize}`;

export interface V2BottomNavHeroButtonProps extends V2ButtonBaseProps {
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
  isActive?: boolean;
  size?: V2HeroButtonSizeType;
}
