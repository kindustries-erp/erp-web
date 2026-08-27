import { cn } from "@/shared/utils";
import { UserMenuPopover } from "./UserMenuPopover";
import { NotificationPopover } from "./NotificationPopover";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/core/api/notifications";

export function SidebarBottom({
  c,
  av,
  displayName,
  setProfileOpen,
  setSettingsOpen,
  setChangelogOpen,
}: {
  c: boolean;
  av: string;
  displayName: string;
  setProfileOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setChangelogOpen?: (v: boolean) => void;
}) {
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.findAll,
    refetchInterval: 30000, // refresh every 30s
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="sidebar-bottom flex flex-col flex-shrink-0 border-t border-border px-[10px] py-[4px]">
      <div
        className={cn(
          "overflow-hidden",
          c
            ? "flex flex-col items-center gap-[6px]"
            : "flex items-center gap-[6px]",
        )}
      >
        <UserMenuPopover
          onOpenProfile={() => setProfileOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenChangelog={() => setChangelogOpen?.(true)}
        >
          <div
            className={cn(
              "flex items-center gap-2 px-1 py-[7px] rounded-lg hover:bg-surface-hover cursor-pointer",
              c ? "justify-center" : "flex-1 min-w-0",
            )}
          >
            <div className="w-[22px] h-[22px] min-w-[22px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[8px] font-semibold flex-shrink-0">
              {av}
            </div>
            <span className="hide-on-collapse text-xs font-medium text-[color:var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
              {displayName}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="hide-on-collapse text-[color:var(--faint)] flex-shrink-0"
            >
              <polyline points="7 10 12 5 17 10" />
              <polyline points="7 14 12 19 17 14" />
            </svg>
          </div>
        </UserMenuPopover>

        <NotificationPopover notifications={notifications}>
          <button className="relative flex items-center justify-center w-[26px] h-[26px] min-w-[26px] rounded-md text-[color:var(--faint)] hover:text-foreground hover:bg-surface-hover border-none bg-transparent cursor-pointer flex-shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-[2px] right-[2px] w-[6px] h-[6px] bg-red-500 rounded-full"></span>
            )}
          </button>
        </NotificationPopover>
      </div>
    </div>
  );
}
