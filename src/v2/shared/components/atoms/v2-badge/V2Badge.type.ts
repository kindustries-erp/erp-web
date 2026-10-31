import type { BadgeProps } from "@/v2/shared/ui";

export enum V2BadgeVariant {
  DEFAULT = "default",
  SECONDARY = "secondary",
  DESTRUCTIVE = "destructive",
  OUTLINE = "outline",
  SUCCESS = "success",
  WARNING = "warning",
  PRO = "pro",
}

export enum V2BadgeSize {
  DEFAULT = "default",
  SM = "sm",
  XS = "xs",
}

export type V2BadgeVariantType = V2BadgeVariant | `${V2BadgeVariant}`;
export type V2BadgeSizeType = V2BadgeSize | `${V2BadgeSize}`;

export interface V2BadgeProps extends Omit<BadgeProps, "variant" | "size"> {
  variant?: V2BadgeVariantType;
  size?: V2BadgeSizeType;
}
