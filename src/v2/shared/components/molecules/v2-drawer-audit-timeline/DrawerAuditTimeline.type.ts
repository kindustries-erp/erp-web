import * as React from "react";

export type DrawerAuditVariant = "default" | "success" | "warning" | "danger";

/**
 * inline: hành động, tác nhân, thời gian trên một hàng (mặc định).
 * stacked: cho cột hẹp, tác nhân và thời gian xuống dòng riêng.
 */
export type DrawerAuditLayout = "inline" | "stacked";

export interface DrawerAuditItem {
  id: string | number;
  action: string;
  actor?: string;
  timestamp: string;
  details?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: DrawerAuditVariant;
}

export interface DrawerAuditTimelineProps {
  items: DrawerAuditItem[];
  emptyMessage?: string;
  className?: string;
  layout?: DrawerAuditLayout;
}
