import * as React from "react";
import { ChevronDown, Plus, SlidersHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { V2ViewModeList } from "./V2ViewModeCombobox.list";
import type { V2ViewModeComboboxProps } from "./V2ViewModeCombobox.type";

export const V2ViewModeCombobox: React.FC<V2ViewModeComboboxProps> = ({
  items,
  activeKey,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  className,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const active = items.find((i) => i.key === activeKey) ?? items[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <V2Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t("v2.table.viewMode", "Chế độ xem")}
          className={className}
          leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          rightIcon={<ChevronDown className="h-3 w-3 opacity-60" />}
        >
          {active?.label}
        </V2Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <V2ViewModeList
          items={items}
          activeKey={activeKey}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          close={() => setOpen(false)}
        />
        {onCreate && (
          <V2Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            className="mt-1 h-7 w-full justify-start border-t border-border/60 px-2 text-xs"
          >
            {t("v2.table.createView", "Tạo chế độ xem")}
          </V2Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
