import * as React from "react";
import { ChevronDown, Plus, SlidersHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { V2FilterGroupList } from "./V2ViewModeCombobox.filter";
import { getTriggerLabel } from "./V2ViewModeCombobox.helper";
import { V2ViewModeList } from "./V2ViewModeCombobox.list";
import type { V2ViewModeComboboxProps } from "./V2ViewModeCombobox.type";

const NO_ITEMS: NonNullable<V2ViewModeComboboxProps["items"]> = [];
const noop = () => {};

export const V2ViewModeCombobox: React.FC<V2ViewModeComboboxProps> = ({
  items = NO_ITEMS,
  activeKey = "",
  onSelect = noop,
  onCreate,
  onEdit,
  onDelete,
  filterGroup,
  className,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const active = items.find((i) => i.key === activeKey) ?? items[0];
  const label = getTriggerLabel(active?.label, filterGroup);
  const hasViews = items.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <V2Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={
            hasViews
              ? t("v2.table.viewMode", "Chế độ xem")
              : (filterGroup?.title ??
                t("v2.table.filterGroupTitle", "Bộ lọc dữ liệu"))
          }
          title={label}
          className={className}
          leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          rightIcon={<ChevronDown className="h-3 w-3 opacity-60" />}
        >
          <span className="max-w-56 truncate">{label}</span>
        </V2Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-1.5">
        {filterGroup && (
          <>
            <V2FilterGroupList {...filterGroup} close={() => setOpen(false)} />
            {hasViews && <div className="my-1 border-t border-border/60" />}
          </>
        )}
        {hasViews && (
          <>
            <div className="px-2 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
              {t("v2.table.viewModeSection", "Chế độ xem")}
            </div>
            <V2ViewModeList
              items={items}
              activeKey={activeKey}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              close={() => setOpen(false)}
            />
          </>
        )}
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
            className="mt-1 h-7 w-full justify-start border-t border-border/60 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {t("v2.table.createView", "Tạo chế độ xem mới")}
          </V2Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
