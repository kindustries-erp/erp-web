import * as React from "react";
import { BellRing } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2Popover } from "../v2-popover";
import { V2NotificationItem } from "./V2NotificationItem";
import { useV2NotificationPopover } from "./useV2NotificationPopover.hook";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export const V2NotificationPopoverDesktop: React.FC<
  V2NotificationPopoverProps
> = ({
  notifications: externalNotifications,
  children,
  trigger,
  side = "top",
  align = "start",
  sideOffset = 8,
  refetchInterval = 30000,
  onNotificationClick,
  className,
}) => {
  const {
    t,
    notifications,
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    deleteAllMutation,
    handleNotificationItemClick,
    desktopOpen,
    setDesktopOpen,
  } = useV2NotificationPopover({
    notifications: externalNotifications,
    refetchInterval,
    onNotificationClick,
  });

  const content = (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BellRing className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <V2Text
            as="h3"
            variant="body-sm"
            weight="semibold"
            className="m-0 text-foreground"
          >
            {t("v2.notifications.title", "Thông báo")}
          </V2Text>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {notifications.length > 0 && (
            <V2Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => deleteAllMutation.mutate()}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 px-1.5 py-0.5 rounded h-auto"
            >
              {t("v2.notifications.deleteAll", "Xóa tất cả")}
            </V2Button>
          )}
          {notifications.some((n) => !n.isRead) && (
            <V2Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-500/10 px-1.5 py-0.5 rounded h-auto"
            >
              {t("v2.notifications.markAllAsRead", "Đánh dấu đã đọc tất cả")}
            </V2Button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh] p-2.5 custom-scrollbar flex-1 min-h-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
              <BellRing className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <V2Text variant="body-sm" color="muted" className="m-0">
              {t("v2.notifications.empty", "Chưa có thông báo nào")}
            </V2Text>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {notifications.map((notif) => (
              <V2NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onClick={handleNotificationItemClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <V2Popover
      open={desktopOpen}
      onOpenChange={setDesktopOpen}
      side={side}
      align={align}
      sideOffset={sideOffset}
      glass
      arrow={false}
      hideCloseButton
      trigger={trigger}
      className={
        className ??
        "w-[360px] max-w-[calc(100vw-24px)] p-0 overflow-hidden bg-[color:color-mix(in_srgb,var(--surface)_95%,transparent)] dark:bg-[var(--popup-bg)] border-slate-200/90 dark:border-transparent"
      }
      content={content}
    >
      {children}
    </V2Popover>
  );
};

V2NotificationPopoverDesktop.displayName = "V2NotificationPopoverDesktop";
