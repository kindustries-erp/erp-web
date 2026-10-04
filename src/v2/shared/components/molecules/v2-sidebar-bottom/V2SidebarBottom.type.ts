export interface V2SidebarBottomProps {
  collapsed?: boolean;
  avatarInitials?: string;
  displayName?: string;
  unreadCount?: number;
  onUserClick?: () => void;
  onNotificationClick?: () => void;
  className?: string;
}
