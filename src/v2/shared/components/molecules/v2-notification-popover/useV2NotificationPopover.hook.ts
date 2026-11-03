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

  const handleNotificationItemClick = React.useCallback(
    (notif: CoreNotification) => {
      markAsReadMutation.mutate(notif.id);
      onNotificationClick?.(notif);
      setMobileOpen(false);
    },
    [markAsReadMutation, onNotificationClick],
  );

  return {
    t,
    notifications,
    mobileOpen,
    setMobileOpen,
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    deleteAllMutation,
    handleNotificationItemClick,
  };
}
