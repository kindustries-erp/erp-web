import type { V2BaseProps } from "@/v2/shared/types";

export type V2UserMenuRenderProp =
  | React.ReactNode
  | ((props: { collapsed: boolean }) => React.ReactNode);

export interface V2SidebarBottomProps extends V2BaseProps {
  collapsed?: boolean;
  avatarInitials?: string;
  displayName?: string;
  unreadCount?: number;
  onUserClick?: () => void;
  onNotificationClick?: () => void;
  userMenuNode?: V2UserMenuRenderProp;
  notificationNode?: React.ReactNode;
}
