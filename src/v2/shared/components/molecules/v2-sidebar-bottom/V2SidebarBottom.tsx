import React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2SidebarBottomProps } from "./V2SidebarBottom.type";

export const V2SidebarBottom: React.FC<V2SidebarBottomProps> = ({
  collapsed = false,
  avatarInitials = "U",
  displayName,
  unreadCount = 0,
  onUserClick,
  onNotificationClick,
  className,
  ...props
}) => {
  const { t } = useV2Translation();
  const effectiveDisplayName =
    displayName ?? t("v2.sidebar.userFallback", "Quản trị viên");
  const notificationLabel = t("v2.sidebar.notifications", "Thông báo");

  return (
    <div
      className={cn(
        "v2-sidebar-bottom flex flex-col flex-shrink-0 border-t border-border px-[10px] py-[4px]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "overflow-hidden",
          collapsed
            ? "flex flex-col items-center gap-[6px]"
            : "flex items-center gap-[6px]",
        )}
      >
        <V2Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onUserClick}
          className={cn(
            "h-auto flex items-center gap-2 px-1 py-[7px] rounded-lg hover:bg-accent/50 cursor-pointer border-none bg-transparent transition-colors text-left",
            collapsed ? "justify-center w-full" : "flex-1 min-w-0",
          )}
          aria-label={effectiveDisplayName}
        >
          <div className="w-[22px] h-[22px] min-w-[22px] bg-primary rounded-full flex items-center justify-center text-primary-foreground text-[8px] font-semibold flex-shrink-0">
            {avatarInitials}
          </div>
          {!collapsed && (
            <>
              <V2Text
                as="span"
                variant="body-sm"
                truncate
                className="text-muted-fg font-medium flex-1 min-w-0"
              >
                {effectiveDisplayName}
              </V2Text>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-faint flex-shrink-0 opacity-70"
                aria-hidden="true"
              >
                <polyline points="7 10 12 5 17 10" />
                <polyline points="7 14 12 19 17 14" />
              </svg>
            </>
          )}
        </V2Button>

        <V2Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onNotificationClick}
          className="relative flex items-center justify-center w-[26px] h-[26px] min-w-[26px] rounded-md text-faint hover:text-foreground hover:bg-accent/50 border-none bg-transparent cursor-pointer flex-shrink-0 transition-colors p-0"
          aria-label={notificationLabel}
          title={notificationLabel}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span
              data-testid="notification-dot"
              className="absolute top-[2px] right-[2px] w-[6px] h-[6px] bg-destructive rounded-full"
            />
          )}
        </V2Button>
      </div>
    </div>
  );
};
