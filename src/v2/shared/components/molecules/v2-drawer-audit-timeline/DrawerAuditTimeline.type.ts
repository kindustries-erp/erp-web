import * as React from "react";

export type DrawerAuditVariant = "default" | "success" | "warning" | "danger";

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
}
