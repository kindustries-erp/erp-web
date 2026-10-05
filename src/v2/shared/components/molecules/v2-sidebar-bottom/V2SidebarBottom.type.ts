import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SidebarBottomProps extends V2BaseProps {
  collapsed?: boolean;
  avatarInitials?: string;
  displayName?: string;
  unreadCount?: number;
  onUserClick?: () => void;
  onNotificationClick?: () => void;
}
