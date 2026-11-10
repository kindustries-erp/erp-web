import * as React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { V2FilterGroupList } from "./V2ViewModeCombobox.filter";
import { V2ViewModeCreateButton } from "./V2ViewModeCombobox.create";
import { V2ViewModeSectionHeader } from "./V2ViewModeCombobox.header";
import { getTriggerLabel } from "./V2ViewModeCombobox.helper";
import { V2ViewModeList } from "./V2ViewModeCombobox.list";
import { cn } from "@/v2/shared/utils/cn";
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
  customFilters,
  className,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);
  const active = items.find((i) => i.key === activeKey) ?? items[0];
  const activePreset = customFilters?.items.find(
    (i) => i.key === customFilters.activeKey,
  );
  const label = getTriggerLabel(
    active?.label,
    filterGroup,
    activePreset?.label,
  );
  const hasViews = items.length > 0;
  const showViewSection = hasViews || Boolean(onCreate);

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
          className={cn(
            "bg-surface hover:bg-surface-hover dark:hover:bg-white/[0.05] border-border/80 dark:border-white/[0.06] text-foreground rounded-lg shadow-2xs font-medium",
            className,
          )}
          leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          rightIcon={<ChevronDown className="h-3 w-3 opacity-60" />}
        >
          <V2Text as="span" truncate className="max-w-56">
            {label}
          </V2Text>
        </V2Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-1.5">
        {filterGroup && (
          <>
            <V2FilterGroupList
              {...filterGroup}
              close={() => setOpen(false)}
              custom={customFilters}
              action={
                customFilters && (
                  <V2ViewModeCreateButton
                    label={t("v2.table.createFilterPreset", "Tạo bộ lọc mới")}
                    disabled={!customFilters.canCreate}
                    onClick={() => {
                      customFilters.onCreate();
                      setOpen(false);
                    }}
                  />
                )
              }
            />
            {showViewSection && (
              <div className="my-1 border-t border-border/60" />
            )}
          </>
        )}
        {showViewSection && (
          <>
            <V2ViewModeSectionHeader
              title={t("v2.table.viewModeSection", "Chế độ xem")}
              action={
                onCreate && (
                  <V2ViewModeCreateButton
                    label={t("v2.table.createView", "Tạo chế độ xem mới")}
                    onClick={() => {
                      onCreate();
                      setOpen(false);
                    }}
                  />
                )
              }
            />
            {hasViews && (
              <V2ViewModeList
                items={items}
                activeKey={activeKey}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                close={() => setOpen(false)}
              />
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
