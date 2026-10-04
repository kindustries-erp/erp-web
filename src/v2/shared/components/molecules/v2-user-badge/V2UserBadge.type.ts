export interface V2UserBadgeProps {
  name: string;
  role?: string;
  tenantName?: string;
  avatarUrl?: string;
  isCompact?: boolean;
  className?: string;
  onClick?: () => void;
}
