import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ActivityCard } from "./V2ActivityCard";
import type { V2ActivityTimelineProps } from "./V2ActivityTimeline.type";

/**
 * V2ActivityTimeline Component
 * Trình diễn dòng sự kiện/nhật ký duyệt theo phong cách Activity Feed hiện đại.
 * Toàn bộ các sự kiện đều được bọc trong V2ActivityCard đồng nhất về padding, viền,
 * căn lề trái và hiển thị đầy đủ thông tin chi tiết.
 */
export const V2ActivityTimeline: React.FC<V2ActivityTimelineProps> = ({
  items,
  emptyMessage,
  className,
}) => {
  const { t } = useV2Translation();
  const displayEmpty =
    emptyMessage || t("v2.activityTimeline.empty", "Chưa có sự kiện nào");

  if (!items || items.length === 0) {
    return (
      <div
        data-testid="v2-activity-timeline-empty"
        className="py-6 text-center text-xs text-muted-fg dark:text-zinc-500 italic select-none"
      >
        {displayEmpty}
      </div>
    );
  }

  return (
    <div
      data-testid="v2-activity-timeline"
      className={cn("space-y-2.5 text-xs", className)}
    >
      {items.map((item, idx) => (
        <V2ActivityCard key={item.id || idx} item={item} />
      ))}
    </div>
  );
};

V2ActivityTimeline.displayName = "V2ActivityTimeline";
