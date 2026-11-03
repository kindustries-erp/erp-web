import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { CoreNotification } from "@/core/api/notifications";

export interface V2NotificationItemProps {
  notification: CoreNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: CoreNotification) => void;
}

const renderNotificationIcon = (type: string) => {
  switch (type) {
    case "ERROR":
      return <AlertCircle className="w-5 h-5 text-destructive shrink-0" />;
    case "SUCCESS":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    case "WARNING":
      return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
    default:
      return (
        <Info className="w-5 h-5 text-teal-500 dark:text-teal-400 shrink-0" />
      );
  }
};

export const V2NotificationItem: React.FC<V2NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const { t, locale } = useV2Translation();
  const dateLocale = locale === "en" ? enUS : vi;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors relative",
        notification.isRead
          ? "opacity-60 hover:bg-surface-hover dark:hover:bg-white/[0.04]"
          : "bg-primary/5 hover:bg-primary/10 dark:bg-teal-500/[0.08] dark:hover:bg-teal-500/[0.12] dark:border dark:border-teal-500/20",
      )}
    >
      <div className="shrink-0 mt-0.5">
        {renderNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <V2Text
          as="h4"
          variant="body-sm"
          weight={notification.isRead ? "normal" : "semibold"}
          className={cn(
            "mb-1 truncate block",
            notification.isRead
              ? "text-muted-fg dark:text-slate-400"
              : "text-foreground dark:text-zinc-100",
          )}
        >
          {notification.title}
        </V2Text>
        <V2Text
          variant="caption"
          color="muted"
          className="mb-2 line-clamp-2 block leading-relaxed"
        >
          {notification.message}
        </V2Text>
        <V2Text
          variant="caption"
          className="text-[10px] text-faint dark:text-slate-500 font-medium block"
        >
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: dateLocale,
          })}
        </V2Text>
      </div>

      <V2Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label={t("v2.notifications.deleteItem", "Xóa thông báo")}
        title={t("v2.notifications.deleteItem", "Xóa thông báo")}
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 h-auto rounded-md text-muted-fg opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:text-destructive dark:hover:text-rose-400 transition-all border-none shadow-none"
      >
        <Trash2 className="w-4 h-4" />
      </V2Button>

      {!notification.isRead && (
        <div
          data-testid="unread-indicator"
          className="w-2 h-2 rounded-full bg-primary dark:bg-teal-400 dark:shadow-[0_0_6px_rgba(45,212,191,0.6)] shrink-0 absolute bottom-3 right-3"
        />
      )}
    </div>
  );
};

V2NotificationItem.displayName = "V2NotificationItem";
