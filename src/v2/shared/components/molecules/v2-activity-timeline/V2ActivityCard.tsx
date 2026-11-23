import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import {
  type V2ActivityItem,
  V2ActivityVariant,
  type V2ActivityVariantType,
} from "./V2ActivityTimeline.type";

const VARIANT_ICON_STYLES: Record<string, string> = {
  [V2ActivityVariant.DEFAULT]: "text-muted-fg dark:text-zinc-400",
  [V2ActivityVariant.SUCCESS]: "text-emerald-600 dark:text-emerald-400",
  [V2ActivityVariant.WARNING]: "text-amber-600 dark:text-amber-400",
  [V2ActivityVariant.DANGER]: "text-rose-600 dark:text-rose-400",
};

function DefaultActivityIcon({ variant }: { variant: V2ActivityVariantType }) {
  const cls = cn(
    "w-4 h-4 shrink-0",
    VARIANT_ICON_STYLES[variant] ||
      VARIANT_ICON_STYLES[V2ActivityVariant.DEFAULT],
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

export interface V2ActivityCardProps {
  item: V2ActivityItem;
  className?: string;
}

/**
 * Thẻ hiển thị sự kiện nổi bật (Featured Activity Card) lấy cảm hứng từ Hình 1.
 * Thiết kế bo góc mềm mại, hiển thị nhánh cây nối chi tiết lý do và trạng thái.
 */
export const V2ActivityCard: React.FC<V2ActivityCardProps> = ({
  item,
  className,
}) => {
  const variant = item.variant || "default";

  // Tổng hợp toàn bộ sub-items thành một danh sách phẳng duy nhất
  const allSubItems = React.useMemo(() => {
    const list = [...(item.subItems || [])];
    if (
      item.details &&
      !list.some((s) => s.key === "reason" || s.label.includes("Lý do"))
    ) {
      list.push({ key: "details", label: "", value: item.details });
    }
    return list;
  }, [item.subItems, item.details]);

  const totalSub = allSubItems.length;

  return (
    <div
      data-testid="v2-activity-card"
      className={cn(
        "rounded-xl border border-border/70 dark:border-white/[0.08] bg-surface/90 dark:bg-white/[0.03] p-3 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header dòng 1: Icon + Badge trạng thái bên trái, Timestamp bên phải */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center shrink-0">
            {item.icon || <DefaultActivityIcon variant={variant} />}
          </div>
          {item.badge}
        </div>

        <V2Text
          variant="caption"
          color="muted"
          className="whitespace-nowrap shrink-0 text-[11px] leading-none text-zinc-500 dark:text-zinc-400"
        >
          {item.timestamp}
        </V2Text>
      </div>

      {/* Header dòng 2: Tác nhân + Hành động căn lề trái thẳng hàng với icon */}
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap min-w-0">
        {item.actor && (
          <V2Text
            variant="body-sm"
            weight="semibold"
            className="text-foreground dark:text-zinc-100 break-words"
          >
            {item.actor}
          </V2Text>
        )}
        <V2Text variant="body-sm" color="muted" className="dark:text-zinc-300">
          {item.action}
        </V2Text>
      </div>

      {/* Nhánh cây chi tiết: Dot đầu tiên ở đỉnh, Dot cuối dừng chuẩn không lố divider */}
      {totalSub > 0 && (
        <div className="mt-2 space-y-1 text-xs">
          {allSubItems.map((sub, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === totalSub - 1;

            return (
              <div
                key={sub.key || idx}
                className="relative flex items-center min-w-0 py-0.5 pl-5"
              >
                {/* Trục divider dọc: Dot đầu bắt đầu từ tâm, Dot cuối dừng tại tâm */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-4 flex justify-center pointer-events-none"
                >
                  {totalSub >= 2 && (
                    <span
                      className={cn(
                        "w-[1.5px] bg-zinc-300 dark:bg-white/15",
                        isFirst && "absolute top-2 bottom-0",
                        isLast && "absolute top-0 h-2",
                        !isFirst && !isLast && "absolute top-0 bottom-0",
                      )}
                    />
                  )}
                  {/* Dot bullet tại tâm y = 8px */}
                  <span className="absolute top-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                </div>

                <V2Text variant="caption" className="break-words min-w-0">
                  {sub.key === "reason" ? (
                    `${sub.label}: ${sub.value}`
                  ) : sub.key === "details" ? (
                    <span className="italic text-zinc-500 dark:text-zinc-400">
                      {sub.value}
                    </span>
                  ) : (
                    <>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {sub.label}:{" "}
                      </span>
                      <span className="font-medium text-foreground dark:text-zinc-200">
                        {sub.value}
                      </span>
                    </>
                  )}
                </V2Text>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

V2ActivityCard.displayName = "V2ActivityCard";
