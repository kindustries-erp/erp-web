import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Tooltip } from "@/v2/shared/components/atoms/v2-tooltip";
import { cn } from "@/v2/shared/utils/cn";
import {
  type V2ActivityItem,
  V2ActivityVariant,
  type V2ActivityVariantType,
} from "./V2ActivityTimeline.type";

const VARIANT_ROW_ICONS: Record<string, string> = {
  [V2ActivityVariant.DEFAULT]: "text-muted-fg dark:text-zinc-400",
  [V2ActivityVariant.SUCCESS]: "text-emerald-600 dark:text-emerald-400",
  [V2ActivityVariant.WARNING]: "text-amber-600 dark:text-amber-400",
  [V2ActivityVariant.DANGER]: "text-rose-600 dark:text-rose-400",
};

function DefaultRowIcon({ variant }: { variant: V2ActivityVariantType }) {
  const cls = cn(
    "w-3.5 h-3.5 shrink-0",
    VARIANT_ROW_ICONS[variant] || VARIANT_ROW_ICONS[V2ActivityVariant.DEFAULT],
  );
  switch (variant) {
    case V2ActivityVariant.SUCCESS:
    case "success":
      return <CheckCircle2 className={cls} />;
    case V2ActivityVariant.WARNING:
    case "warning":
      return <AlertTriangle className={cls} />;
    case V2ActivityVariant.DANGER:
    case "danger":
      return <XCircle className={cls} />;
    default:
      return <Activity className={cls} />;
  }
}

export interface V2ActivityItemRowProps {
  item: V2ActivityItem;
  className?: string;
  tooltipTime?: string;
}

/**
 * Dòng sự kiện tinh giản (Streamline Activity Row) lấy cảm hứng từ nửa dưới Hình 1.
 * Thiết kế gọn nhẹ, chia 2 hàng:
 * - Hàng 1: [Icon] + [Badge trạng thái] ở bên trái, [Timestamp] ở bên phải.
 * - Hàng 2: Tác nhân (email, name) + Hành động bên dưới (thụt lề pl-[22px]).
 */
export const V2ActivityItemRow: React.FC<V2ActivityItemRowProps> = ({
  item,
  className,
  tooltipTime,
}) => {
  const variant = item.variant || "default";
  const displayTime = tooltipTime || item.timestamp;

  return (
    <div
      data-testid="v2-activity-item-row"
      className={cn(
        "group relative -mx-1.5 px-1.5 py-1.5 rounded-md transition-colors",
        "hover:bg-muted/30 dark:hover:bg-white/[0.02]",
        className,
      )}
    >
      {/* Hàng 1: Icon + Badge bên trái, Timestamp bên phải */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center shrink-0">
            {item.icon || <DefaultRowIcon variant={variant} />}
          </div>
          {item.badge}
        </div>

        <V2Tooltip content={displayTime}>
          <div className="shrink-0 cursor-default">
            <V2Text
              variant="caption"
              color="muted"
              className="whitespace-nowrap text-[11px] leading-none text-zinc-500 dark:text-zinc-400"
            >
              {item.timestamp}
            </V2Text>
          </div>
        </V2Tooltip>
      </div>

      {/* Hàng 2: Tác nhân (email, name) + Hành động + Details bên dưới (thụt lề pl-[22px]) */}
      <div className="mt-1 pl-[22px] min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0 leading-snug">
          {item.actor && (
            <V2Text
              variant="body-sm"
              weight="medium"
              className="text-foreground dark:text-zinc-200 break-words"
            >
              {item.actor}
            </V2Text>
          )}
          <V2Text
            variant="body-sm"
            color="muted"
            className="text-zinc-500 dark:text-zinc-400"
          >
            {item.action}
          </V2Text>
        </div>

        {item.details && (
          <V2Text
            variant="caption"
            color="muted"
            className="mt-0.5 block italic text-[11px] leading-relaxed dark:text-zinc-400 break-words"
          >
            {item.details}
          </V2Text>
        )}
      </div>
    </div>
  );
};

V2ActivityItemRow.displayName = "V2ActivityItemRow";
