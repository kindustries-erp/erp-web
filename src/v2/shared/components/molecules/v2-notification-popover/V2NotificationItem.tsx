import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { CheckCheck, Trash2 } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { CoreNotification } from "@/core/api/notifications";
import {
  DEFAULT_NOTIFICATION_META,
  NOTIFICATION_TYPE_META,
} from "./V2NotificationItem.config";

export interface V2NotificationItemProps {
  notification: CoreNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: CoreNotification) => void;
}

const renderNotificationIcon = (type: string, isRead: boolean) => {
  const { Icon, iconClass, badgeClass } =
    NOTIFICATION_TYPE_META[type] ?? DEFAULT_NOTIFICATION_META;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-opacity",
        badgeClass,
        isRead && "opacity-75 dark:opacity-100",
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", iconClass)} />
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

  // Click vào nội dung chỉ điều hướng; đánh dấu đã đọc dùng icon riêng.
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
          ? "bg-slate-50/75 border-slate-200/75 hover:bg-slate-100/85 hover:border-slate-300/70 dark:bg-transparent dark:border-transparent dark:opacity-60 dark:hover:bg-[color:var(--popup-bg-hover)]"
          : "bg-teal-50/70 border-teal-500/25 shadow-2xs hover:bg-teal-50 hover:border-teal-500/35 dark:shadow-none dark:border-[color:color-mix(in_srgb,var(--primary)_20%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] dark:hover:bg-[color:var(--popup-bg-hover)]",
      )}
    >
      {renderNotificationIcon(notification.type, notification.isRead)}

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
              ? "text-slate-700 font-medium dark:text-slate-400 dark:font-normal"
              : "text-slate-900 dark:text-zinc-100",
          )}
        >
          {notification.title}
        </V2Text>
        <V2Text
          variant="caption"
          color="muted"
          className={cn(
            "mb-2 line-clamp-2 block leading-relaxed",
            notification.isRead
              ? "text-slate-500 dark:text-muted-fg"
              : "text-slate-600 dark:text-muted-fg",
          )}
        >
          {notification.message}
        </V2Text>
        <V2Text
          variant="caption"
          className={cn(
            "text-[10px] font-medium block",
            notification.isRead
              ? "text-slate-400 dark:text-slate-500"
              : "text-slate-500 dark:text-slate-400",
          )}
        >
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: dateLocale,
          })}
        </V2Text>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-0.5">
        {!notification.isRead && (
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={markAsReadLabel}
            title={markAsReadLabel}
            onClick={handleMarkAsRead}
            data-testid="mark-as-read-button"
            className="h-11 w-11 md:h-7 md:w-7 p-0 rounded-md text-teal-600 hover:text-teal-700 hover:bg-teal-500/15 dark:text-primary dark:hover:text-teal-300 dark:hover:bg-primary/10 transition-colors border-none shadow-none flex items-center justify-center"
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
          className="h-11 w-11 md:h-7 md:w-7 p-0 rounded-md text-slate-400 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 hover:bg-rose-500/10 hover:text-rose-600 dark:text-muted-fg dark:hover:bg-white/[0.08] dark:hover:text-rose-400 transition-all border-none shadow-none flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </V2Button>
      </div>

      {!notification.isRead && (
        <div
          data-testid="unread-indicator"
          className="w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white dark:ring-0 dark:bg-teal-400 dark:shadow-[0_0_6px_rgba(45,212,191,0.6)] shrink-0 absolute bottom-3 right-3"
        />
      )}
    </div>
  );
};

V2NotificationItem.displayName = "V2NotificationItem";
