import * as React from "react";
import { Check } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2FilterGroup } from "./V2ViewModeCombobox.type";

type FilterListProps = V2FilterGroup & { close: () => void };

/** Số đếm trên mục lọc: ẩn khi 0, cắt "99+" */
const badgeText = (count?: number): string | null => {
  if (!count || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
};

/** Nhóm lọc nhanh trong popover: tick một mục, popover đóng */
export const V2FilterGroupList: React.FC<FilterListProps> = ({
  title,
  items,
  activeKey,
  onChange,
  close,
}) => {
  const { t } = useV2Translation();
  const heading = title ?? t("v2.table.filterGroupTitle", "Bộ lọc dữ liệu");
  return (
    <div className="flex flex-col gap-0.5 pb-1">
      <div className="px-2 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
        {heading}
      </div>
      <ul role="listbox" aria-label={heading} className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <li key={item.key}>
              <V2Button
                type="button"
                role="option"
                aria-selected={active}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(item.key);
                  close();
                }}
                className={cn(
                  "h-7 w-full justify-start gap-2 px-2 text-xs",
                  active && "font-semibold text-primary",
                )}
              >
                <Check className={cn("h-3.5 w-3.5", !active && "opacity-0")} />
                {item.dotColor && (
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.dotColor }}
                  />
                )}
                <span className="flex-1 truncate text-left">{item.label}</span>
                {badgeText(item.badgeCount) && (
                  <span className="ml-auto text-[11px] tabular-nums text-muted-fg">
                    {badgeText(item.badgeCount)}
                  </span>
                )}
              </V2Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
