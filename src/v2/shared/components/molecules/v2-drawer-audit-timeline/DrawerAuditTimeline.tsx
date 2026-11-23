import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2ActivityTimeline,
  type V2ActivityItem,
} from "../v2-activity-timeline";
import type { DrawerAuditTimelineProps } from "./DrawerAuditTimeline.type";

/**
 * DrawerAuditTimeline
 * Hiển thị nhật ký thao tác / phê duyệt trong Drawer.
 * 100% sử dụng V2ActivityTimeline chuẩn Activity Feed hiện đại.
 */
export const DrawerAuditTimeline: React.FC<DrawerAuditTimelineProps> = ({
  items,
  emptyMessage,
  className,
  featuredIndex,
}) => {
  const { t } = useV2Translation();
  const displayEmpty =
    emptyMessage || t("v2.drawer.emptyTimeline", "Chưa có lịch sử thao tác");

  const activityItems: V2ActivityItem[] = React.useMemo(() => {
    return (items || []).map((it) => ({
      id: it.id,
      action: it.action,
      actor: it.actor,
      timestamp: it.timestamp,
      details: it.details,
      icon: it.icon,
      badge: it.badge,
      variant: it.variant,
      featured: it.featured,
      subItems: it.subItems,
    }));
  }, [items]);

  return (
    <V2ActivityTimeline
      items={activityItems}
      emptyMessage={displayEmpty}
      className={className}
      featuredIndex={featuredIndex}
    />
  );
};

DrawerAuditTimeline.displayName = "DrawerAuditTimeline";
