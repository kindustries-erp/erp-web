import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2NavIconProps extends V2BaseProps<HTMLSpanElement> {
  icon: LucideIcon;
  isActive?: boolean;
  size?: number;
}
