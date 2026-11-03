import * as React from "react";
import { ChevronDown } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { useV2TabCombobox } from "./V2TabCombobox.hook";
import { V2TabComboboxList } from "./V2TabCombobox.list";
import type { V2TabComboboxProps } from "./V2TabCombobox.type";

export const V2TabCombobox: React.FC<V2TabComboboxProps> = ({
  items,
  activeKey,
  onSelect,
  labelPrefix,
  menuWidth = "w-60",
  align = "start",
  className,
  ...restProps
}) => {
  const { open, setOpen, activeItem, prefix, handleSelect } = useV2TabCombobox({
    items,
    activeKey,
    onSelect,
    labelPrefix,
  });

  return (
    <div
      data-testid="v2-tab-combobox"
      className={cn("inline-flex shrink-0 items-center", className)}
      {...restProps}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <V2Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={prefix}
            className="h-8 max-w-[260px] gap-1.5 rounded-lg border-border/80 bg-surface px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-surface-hover"
            leftIcon={activeItem?.icon}
            rightIcon={<ChevronDown className="h-3.5 w-3.5 opacity-60" />}
          >
            <span className="truncate">
              {activeItem ? activeItem.label : prefix}
            </span>
            {activeItem?.badgeCount !== undefined &&
              activeItem.badgeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 min-w-4 px-1 text-[10px] font-semibold text-primary bg-primary/10"
                >
                  {activeItem.badgeCount}
                </Badge>
              )}
          </V2Button>
        </PopoverTrigger>

        <PopoverContent align={align} className={cn("p-1.5", menuWidth)}>
          <V2TabComboboxList
            items={items}
            activeKey={activeKey}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

V2TabCombobox.displayName = "V2TabCombobox";
