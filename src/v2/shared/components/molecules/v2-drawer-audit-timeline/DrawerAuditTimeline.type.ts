import * as React from "react";
import type { V2ActivitySubItem } from "../v2-activity-timeline";

export type DrawerAuditVariant = "default" | "success" | "warning" | "danger";

/**
 * inline: hành động, tác nhân, thời gian trên một hàng.
 * stacked: cho cột hẹp, tác nhân và thời gian xuống dòng riêng.
 * activity: giao diện Activity Feed hiện đại (Hình 1), có featured card và streamline rows.
 */
export type DrawerAuditLayout = "inline" | "stacked" | "activity";

export interface DrawerAuditItem {
  id: string | number;
  action: string;
  actor?: string;
  timestamp: string;
  details?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: DrawerAuditVariant;
  featured?: boolean;
  subItems?: V2ActivitySubItem[];
}

export interface DrawerAuditTimelineProps {
  items: DrawerAuditItem[];
  emptyMessage?: string;
  className?: string;
  layout?: DrawerAuditLayout;
  featuredIndex?: number;
}
