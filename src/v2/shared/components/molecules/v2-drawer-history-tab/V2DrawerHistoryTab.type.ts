import type { DrawerAuditItem } from "../v2-drawer-audit-timeline/DrawerAuditTimeline.type";

export type { DrawerAuditItem };

export interface V2DrawerHistoryTabProps {
  items: DrawerAuditItem[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}
