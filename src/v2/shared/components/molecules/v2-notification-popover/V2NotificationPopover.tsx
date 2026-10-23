import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { useT } from "@/core/i18n";
import { notificationsApi } from "@/core/api/notifications";
import { V2Popover } from "../v2-popover";
import { V2NotificationItem } from "./V2NotificationItem";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export const V2NotificationPopover: React.FC<V2NotificationPopoverProps> = ({
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
  const t = useT();
  const queryClient = useQueryClient();

  const { data: internalNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.findAll,
    refetchInterval,
    enabled: externalNotifications === undefined,
  });

  const notifications = externalNotifications ?? internalNotifications;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const content = (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between p-3.5 pb-2 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground dark:text-zinc-100 flex items-center gap-2 m-0">
          <BellRing className="w-4 h-4 text-primary dark:text-teal-400" />
          {t("v2.notifications.title", "Thông báo")}
        </h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => deleteAllMutation.mutate()}
              className="text-xs text-destructive dark:text-rose-400 dark:hover:text-rose-300 hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              {t("v2.notifications.deleteAll", "Xóa tất cả")}
            </button>
          )}
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs text-primary dark:text-teal-400 dark:hover:text-teal-300 hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              {t("v2.notifications.markAllAsRead", "Đánh dấu đã đọc tất cả")}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh] p-2 custom-scrollbar flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/[0.04] flex items-center justify-center mb-3">
              <BellRing className="w-6 h-6 text-faint dark:text-slate-500" />
            </div>
            <p className="text-sm text-muted-fg dark:text-slate-400 m-0">
              {t("v2.notifications.empty", "Chưa có thông báo nào")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((notif) => (
              <V2NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <V2Popover
      side={side}
      align={align}
      sideOffset={sideOffset}
      glass
      arrow={false}
      hideCloseButton
      trigger={trigger}
      className={className ?? "w-80 p-0 overflow-hidden"}
      content={content}
    >
      {children}
    </V2Popover>
  );
};
V2NotificationPopover.displayName = "V2NotificationPopover";
