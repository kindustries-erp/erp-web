import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { ArrowUpRight, CheckCheck, Trash2 } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type {
  CoreNotification,
  NotificationTarget,
} from "@/core/api/notifications";
import { resolveNotificationIconMeta } from "./V2NotificationItem.config";

export interface V2NotificationItemProps {
  notification: CoreNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: CoreNotification) => void;
}

const renderNotificationIcon = (
  type: string,
  target: NotificationTarget | null | undefined,
  isRead: boolean,
) => {
  const { Icon, iconClass, badgeClass } = resolveNotificationIconMeta(
    type,
    target,
  );

  return (
    <div
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all",
        isRead
          ? "bg-transparent text-muted-fg opacity-60"
          : cn(badgeClass, "shadow-2xs"),
      )}
    >
      <Icon
        className={cn(
          "w-[19px] h-[19px] shrink-0",
          isRead ? "text-muted-fg" : iconClass,
        )}
      />
    </div>
  );
};

export const V2NotificationItem: React.FC<V2NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const { t, locale } = useV2Translation();
  const dateLocale = locale === "en" ? enUS : vi;

  // Click vào nội dung: kích hoạt onClick (useV2NotificationPopover sẽ tự động markAsRead và điều hướng).
  const handleClick = () => {
    onClick?.(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const markAsReadLabel = t("v2.notifications.markAsRead", "Đánh dấu đã đọc");
  const deleteLabel = t("v2.notifications.deleteItem", "Xóa thông báo");

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all relative border",
        notification.isRead
          ? "bg-surface-hover/25 border-item-border hover:bg-surface-hover/60 hover:border-item-border text-muted-fg opacity-75 hover:opacity-100"
          : "bg-item-bg-unread border-item-border-unread border-l-[3px] border-l-primary shadow-card-item hover:shadow-card-item-hover hover:bg-surface-hover/60 text-foreground",
      )}
    >
      {renderNotificationIcon(
        notification.type,
        notification.target,
        notification.isRead,
      )}

      <div
        className={cn(
          "flex-1 min-w-0",
          notification.isRead ? "pr-12 md:pr-9" : "pr-24 md:pr-16",
        )}
      >
        <V2Text
          as="h4"
          variant="body-sm"
          weight={notification.isRead ? "normal" : "semibold"}
          className={cn(
            "mb-1 truncate block",
            notification.isRead
              ? "text-muted-fg font-medium"
              : "text-foreground font-semibold",
          )}
        >
          {notification.title}
        </V2Text>
        <V2Text
          variant="caption"
          color="muted"
          className="mb-2 line-clamp-2 block leading-relaxed text-muted-fg"
        >
          {notification.message}
        </V2Text>
        <div className="flex items-center gap-1.5">
          <V2Text
            variant="caption"
            className="text-[10px] text-faint block font-medium"
          >
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </V2Text>
          {Boolean(notification.target?.id) && (
            <ArrowUpRight className="w-3 h-3 text-faint group-hover:text-primary transition-colors shrink-0" />
          )}
        </div>
      </div>

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        {!notification.isRead && (
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={markAsReadLabel}
            title={markAsReadLabel}
            onClick={handleMarkAsRead}
            data-testid="mark-as-read-button"
            className="h-11 w-11 md:h-7 md:w-7 p-0 rounded-md text-primary hover:text-primary-hover hover:bg-primary/15 transition-colors border-none shadow-none flex items-center justify-center shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
          </V2Button>
        )}

        <V2Button
          type="button"
          variant="ghost"
          size="xs"
          aria-label={deleteLabel}
          title={deleteLabel}
          onClick={handleDelete}
          className="h-11 md:h-7 p-0 rounded-md text-faint hover:bg-destructive/10 hover:text-destructive border-none shadow-none flex items-center justify-center shrink-0 overflow-hidden transition-all duration-200 w-11 md:w-0 md:opacity-0 md:pointer-events-none md:group-hover:w-7 md:group-hover:opacity-100 md:group-hover:pointer-events-auto"
        >
          <Trash2 className="w-4 h-4 shrink-0" />
        </V2Button>
      </div>

      {!notification.isRead && (
        <div
          data-testid="unread-indicator"
          className="w-2 h-2 rounded-full bg-primary ring-2 ring-background shrink-0 absolute bottom-3 right-3 shadow-[0_0_6px_rgba(var(--primary-rgb),0.5)]"
        />
      )}
    </div>
  );
};

V2NotificationItem.displayName = "V2NotificationItem";
