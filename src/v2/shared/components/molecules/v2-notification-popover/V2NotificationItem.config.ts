import {
  AlertCircle,
  CheckCircle2,
  Info,
  FileText,
  FileCheck2,
  FileClock,
  FileX,
  type LucideIcon,
} from "lucide-react";
import {
  NotificationType,
  NotificationTargetAction,
  type NotificationTarget,
} from "@/core/api/notifications";

export interface NotificationTypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
}

export interface NotificationIconMeta extends NotificationTypeMeta {
  isActionable: boolean;
}

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  NotificationTypeMeta
> = {
  [NotificationType.ERROR]: {
    Icon: AlertCircle,
    iconClass: "text-destructive",
    badgeClass: "bg-destructive/12 text-destructive",
  },
  [NotificationType.SUCCESS]: {
    Icon: CheckCircle2,
    iconClass: "text-up-fg",
    badgeClass: "bg-up-fg/12 text-up-fg",
  },
  [NotificationType.WARNING]: {
    Icon: AlertCircle,
    iconClass: "text-warn-fg",
    badgeClass: "bg-warn-fg/12 text-warn-fg",
  },
  [NotificationType.INFO]: {
    Icon: Info,
    iconClass: "text-primary",
    badgeClass: "bg-primary/12 text-primary",
  },
};

export const DEFAULT_NOTIFICATION_META: NotificationTypeMeta = {
  Icon: Info,
  iconClass: "text-primary",
  badgeClass: "bg-primary/12 text-primary",
};

/**
 * Phân giải icon thông minh:
 * - Noti có target mở Drawer / Modal: Dùng họ icon File* (FileClock, FileCheck2, FileX, FileText)
 * - Noti tĩnh thông thường: Dùng họ icon Circle* (Info, CheckCircle2, AlertCircle)
 */
export function resolveNotificationIconMeta(
  type: NotificationType | string,
  target?: NotificationTarget | null,
): NotificationIconMeta {
  const isActionable = Boolean(target && target.id);

  if (isActionable) {
    if (target?.action === NotificationTargetAction.APPROVE) {
      return {
        Icon: FileClock,
        iconClass: "text-primary",
        badgeClass: "bg-primary/12 text-primary",
        isActionable: true,
      };
    }

    switch (type) {
      case NotificationType.SUCCESS:
        return {
          Icon: FileCheck2,
          iconClass: "text-up-fg",
          badgeClass: "bg-up-fg/12 text-up-fg",
          isActionable: true,
        };
      case NotificationType.ERROR:
        return {
          Icon: FileX,
          iconClass: "text-destructive",
          badgeClass: "bg-destructive/12 text-destructive",
          isActionable: true,
        };
      case NotificationType.WARNING:
        return {
          Icon: FileClock,
          iconClass: "text-warn-fg",
          badgeClass: "bg-warn-fg/12 text-warn-fg",
          isActionable: true,
        };
      case NotificationType.INFO:
      default:
        return {
          Icon: FileText,
          iconClass: "text-primary",
          badgeClass: "bg-primary/12 text-primary",
          isActionable: true,
        };
    }
  }

  const meta =
    NOTIFICATION_TYPE_META[type as NotificationType] ??
    DEFAULT_NOTIFICATION_META;
  return {
    ...meta,
    isActionable: false,
  };
}
