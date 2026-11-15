import { AlertCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

export interface NotificationTypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
}

export const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  ERROR: {
    Icon: AlertCircle,
    iconClass: "text-rose-600 dark:text-destructive",
    badgeClass:
      "bg-rose-50 border-rose-200/80 dark:bg-rose-500/10 dark:border-rose-500/20",
  },
  SUCCESS: {
    Icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-50 border-emerald-200/80 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  WARNING: {
    Icon: AlertCircle,
    iconClass: "text-amber-600 dark:text-amber-400",
    badgeClass:
      "bg-amber-50 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20",
  },
};

export const DEFAULT_NOTIFICATION_META: NotificationTypeMeta = {
  Icon: Info,
  iconClass: "text-teal-600 dark:text-teal-400",
  badgeClass:
    "bg-teal-50 border-teal-200/80 dark:bg-teal-500/10 dark:border-teal-500/20",
};
