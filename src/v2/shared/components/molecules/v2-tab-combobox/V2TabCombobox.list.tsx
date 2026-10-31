import * as React from "react";
import { Check } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { Badge } from "@/v2/shared/ui/badge";
import { cn } from "@/v2/shared/utils/cn";
import { getItemKey } from "./V2TabCombobox.helper";
import type { V2TabComboboxItem } from "./V2TabCombobox.type";

export interface V2TabComboboxListProps {
  items: V2TabComboboxItem[];
  activeKey?: string;
  onSelect: (key: string) => void;
}

export const V2TabComboboxList: React.FC<V2TabComboboxListProps> = ({
  items,
  activeKey,
  onSelect,
}) => {
  return (
    <ul role="listbox" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const itemKey = getItemKey(item);
        const isSelected = itemKey === activeKey;

        return (
          <li key={itemKey} className="w-full">
            <V2Button
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={item.disabled}
              variant="ghost"
              size="sm"
              onClick={() => onSelect(itemKey)}
              className={cn(
                "h-8 w-full justify-between rounded-md px-2.5 text-xs font-normal transition-colors",
                isSelected
                  ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15"
                  : "text-foreground hover:bg-surface-hover",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {item.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {item.icon}
                  </span>
                )}
                <V2Text
                  as="span"
                  variant="body-sm"
                  truncate
                  className={cn(isSelected && "font-semibold text-primary")}
                >
                  {item.label}
                </V2Text>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 px-1 text-[10px] font-normal"
                  >
                    {item.badgeCount}
                  </Badge>
                )}
                <Check
                  className={cn(
                    "h-3.5 w-3.5 text-primary",
                    !isSelected && "opacity-0",
                  )}
                />
              </div>
            </V2Button>
          </li>
        );
      })}
    </ul>
  );
};

V2TabComboboxList.displayName = "V2TabComboboxList";
