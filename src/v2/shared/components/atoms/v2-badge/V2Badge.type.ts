import type { BadgeProps } from "@/v2/shared/ui";

export enum V2BadgeVariant {
  DEFAULT = "default",
  SECONDARY = "secondary",
  DESTRUCTIVE = "destructive",
  OUTLINE = "outline",
  SUCCESS = "success",
  WARNING = "warning",
}

export type V2BadgeVariantType = V2BadgeVariant | `${V2BadgeVariant}`;

export interface V2BadgeProps extends Omit<BadgeProps, "variant"> {
  variant?: V2BadgeVariantType;
}
