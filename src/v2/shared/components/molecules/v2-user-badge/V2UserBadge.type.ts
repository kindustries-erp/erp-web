import type { V2BaseProps } from "@/v2/shared/types";

export interface V2UserBadgeProps extends V2BaseProps {
  name: string;
  role?: string;
  tenantName?: string;
  avatarUrl?: string;
  isCompact?: boolean;
}
