import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { CoreNotification, notificationsApi } from "@/core/api/notifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  BellRing,
  Trash2,
} from "lucide-react";

export function NotificationPopover({
  children,
  notifications = [],
}: {
  children: React.ReactNode;
  notifications?: CoreNotification[];
}) {
  const t = useT();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: notificationsApi.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "WARNING":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Popover
      content={
        <div className="w-80 flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border shrink-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BellRing className="w-4 h-4" />
              {t("topbar.notifications.title")}
            </h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={() => deleteAllMutation.mutate()}
                  className="text-xs text-destructive hover:underline bg-transparent border-none cursor-pointer"
                >
                  {t("topbar.notifications.deleteAll", "Xóa tất cả")}
                </button>
              )}
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                  <BellRing className="w-6 h-6 text-[color:var(--faint)]" />
                </div>
                <p className="text-sm text-[color:var(--muted-fg)]">
                  {t("topbar.notifications.empty")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "group flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors relative",
                      notif.isRead
                        ? "opacity-60 hover:bg-surface-hover"
                        : "bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    <div
                      className="shrink-0 mt-0.5"
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                      }}
                    >
                      {renderIcon(notif.type)}
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                      }}
                    >
                      <h4
                        className={cn(
                          "text-sm font-medium mb-1 pr-6",
                          notif.isRead
                            ? "text-[color:var(--muted-fg)]"
                            : "text-foreground",
                        )}
                      >
                        {notif.title}
                      </h4>
                      <p className="text-xs text-[color:var(--muted-fg)] mb-2 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-[color:var(--faint)] font-medium">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>

                    {/* Delete Button (visible on hover) */}
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-black/5 hover:text-destructive transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notif.id);
                      }}
                      title="Xoá thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2 absolute bottom-3 right-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      }
      glass
      side="top"
      align="start"
    >
      {children}
    </Popover>
  );
}
