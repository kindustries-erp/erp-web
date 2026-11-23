import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  notificationsApi,
  type CoreNotification,
  type NotificationInboxResult,
} from "@/core/api/notifications";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export interface MarkAsReadVariables {
  id: string;
  silent?: boolean;
}

interface CacheBackup {
  prevList?: CoreNotification[];
  prevInbox?: NotificationInboxResult;
}

function updateCaches(
  qc: QueryClient,
  updater: (item: CoreNotification) => CoreNotification,
  unreadCountCalc?: (curr: number) => number,
): CacheBackup {
  const prevList = qc.getQueryData<CoreNotification[]>(["notifications"]);
  const prevInbox = qc.getQueryData<NotificationInboxResult>([
    "notifications",
    "inbox",
  ]);
  if (prevList) qc.setQueryData(["notifications"], prevList.map(updater));
  if (prevInbox) {
    qc.setQueryData(["notifications", "inbox"], {
      items: prevInbox.items.map(updater),
      unreadCount: unreadCountCalc
        ? unreadCountCalc(prevInbox.unreadCount)
        : Math.max(0, prevInbox.unreadCount - 1),
    });
  }
  return { prevList, prevInbox };
}

function restoreCaches(qc: QueryClient, context?: CacheBackup) {
  if (context?.prevList) qc.setQueryData(["notifications"], context.prevList);
  if (context?.prevInbox)
    qc.setQueryData(["notifications", "inbox"], context.prevInbox);
}

export function useV2NotificationPopover({
  notifications: externalNotifications,
  unreadCount: externalUnreadCount,
  refetchInterval = 30000,
  onNotificationClick,
}: Pick<
  V2NotificationPopoverProps,
  "notifications" | "unreadCount" | "refetchInterval" | "onNotificationClick"
>) {
  const { t } = useV2Translation();
  const showToast = useV2ToastStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(false);

  const { data: internalNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.findAll,
    refetchInterval,
    enabled: externalNotifications === undefined,
  });

  const notifications = externalNotifications ?? internalNotifications;
  const unreadCount =
    externalUnreadCount ?? notifications.filter((n) => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (vars: string | MarkAsReadVariables) =>
      notificationsApi.markAsRead(typeof vars === "string" ? vars : vars.id),
    onMutate: async (vars: string | MarkAsReadVariables) => {
      const id = typeof vars === "string" ? vars : vars.id;
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      return updateCaches(
        queryClient,
        (n) =>
          n.id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n,
        (c) => Math.max(0, c - 1),
      );
    },
    onSuccess: (_data, vars) => {
      if (!(typeof vars === "object" && vars.silent)) {
        showToast({
          variant: "success",
          title: t(
            "v2.notifications.markAsReadSuccess",
            "Đã đánh dấu thông báo là đã đọc",
          ),
        });
      }
    },
    onError: (_err, _vars, ctx) => restoreCaches(queryClient, ctx),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const now = new Date().toISOString();
      return updateCaches(
        queryClient,
        (n) => ({ ...n, isRead: true, readAt: now }),
        () => 0,
      );
    },
    onSuccess: () => {
      showToast({
        variant: "success",
        title: t(
          "v2.notifications.markAllAsReadSuccess",
          "Đã đánh dấu tất cả thông báo là đã đọc",
        ),
      });
    },
    onError: (_err, _vars, ctx) => restoreCaches(queryClient, ctx),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleNotificationItemClick = React.useCallback(
    (notif: CoreNotification) => {
      if (!notif.isRead) {
        markAsReadMutation.mutate({ id: notif.id, silent: false });
      }
      onNotificationClick?.(notif);
      setMobileOpen(false);
      setDesktopOpen(false);
    },
    [onNotificationClick, markAsReadMutation],
  );

  return {
    t,
    notifications,
    unreadCount,
    mobileOpen,
    setMobileOpen,
    desktopOpen,
    setDesktopOpen,
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    deleteAllMutation,
    handleNotificationItemClick,
  };
}
