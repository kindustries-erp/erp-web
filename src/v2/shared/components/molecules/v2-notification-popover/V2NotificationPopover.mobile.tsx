import * as React from "react";
import { BellRing } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2BottomSheet } from "../v2-bottom-sheet";
import { V2NotificationItem } from "./V2NotificationItem";
import { useV2NotificationPopover } from "./useV2NotificationPopover.hook";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export const V2NotificationPopoverMobile: React.FC<
  V2NotificationPopoverProps
> = ({
  notifications: externalNotifications,
  children,
  trigger,
  refetchInterval = 30000,
  onNotificationClick,
}) => {
  const {
    t,
    notifications,
    mobileOpen,
    setMobileOpen,
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    deleteAllMutation,
    handleNotificationItemClick,
  } = useV2NotificationPopover({
    notifications: externalNotifications,
    refetchInterval,
    onNotificationClick,
  });

  const headerActions = (
    <div className="flex items-center gap-1.5">
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
  );

  const triggerNode = trigger ?? children;
  const triggerElement = React.isValidElement(triggerNode) ? (
    React.cloneElement(
      triggerNode as React.ReactElement<{ onClick?: React.MouseEventHandler }>,
      {
        onClick: (e: React.MouseEvent) => {
          (
            triggerNode.props as { onClick?: React.MouseEventHandler }
          )?.onClick?.(e);
          setMobileOpen(true);
        },
      },
    )
  ) : triggerNode ? (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setMobileOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setMobileOpen(true);
        }
      }}
      className="inline-flex cursor-pointer"
    >
      {triggerNode}
    </div>
  ) : null;

  return (
    <>
      {triggerElement}
      <V2BottomSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={t("v2.notifications.title", "Thông báo")}
        icon={<BellRing className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        headerAction={headerActions}
        bodyClassName="p-0 flex flex-col min-h-0"
        maxHeightClass="h-[100dvh] max-h-[100dvh]"
      >
        <div className="overflow-y-auto p-2.5 custom-scrollbar flex-1 min-h-0">
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
      </V2BottomSheet>
    </>
  );
};

V2NotificationPopoverMobile.displayName = "V2NotificationPopoverMobile";
