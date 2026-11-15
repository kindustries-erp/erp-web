import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationsApi,
  type CoreNotification,
} from "@/core/api/notifications";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2NotificationPopoverProps } from "./V2NotificationPopover.type";

export function useV2NotificationPopover({
  notifications: externalNotifications,
  refetchInterval = 30000,
  onNotificationClick,
}: Pick<
  V2NotificationPopoverProps,
  "notifications" | "refetchInterval" | "onNotificationClick"
>) {
  const { t } = useV2Translation();
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

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<CoreNotification[]>([
        "notifications",
      ]);
      if (previous) {
        queryClient.setQueryData<CoreNotification[]>(
          ["notifications"],
          previous.map((n) =>
            n.id === id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<CoreNotification[]>([
        "notifications",
      ]);
      if (previous) {
        queryClient.setQueryData<CoreNotification[]>(
          ["notifications"],
          previous.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Click nội dung thông báo: tự động đánh dấu đã đọc (nếu chưa đọc), điều hướng và đóng panel.
  const handleNotificationItemClick = React.useCallback(
    (notif: CoreNotification) => {
      if (!notif.isRead) {
        markAsReadMutation.mutate(notif.id);
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
