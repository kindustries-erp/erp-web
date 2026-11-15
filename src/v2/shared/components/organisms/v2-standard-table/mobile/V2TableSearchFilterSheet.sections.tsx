import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
  V2Icon,
  V2Input,
  V2Text,
} from "@/v2/shared/components/atoms";
import { Check, Search } from "@/v2/shared/components/atoms/v2-icon/icons";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Size } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";

export interface SearchSectionProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  value,
  placeholder,
  onChange,
  onClear,
  onSubmit,
}) => {
  const { t } = useV2Translation();
  const label = placeholder ?? t("v2.table.search", "Tìm kiếm...");

  return (
    <section className="flex flex-col gap-2">
      <V2Text as="h3" variant="label" color="muted" weight="semibold">
        {t("v2.table.searchSectionTitle", "Tìm kiếm")}
      </V2Text>
      <V2Input
        type="text"
        size={V2Size.LG}
        clearable
        leftIcon={<V2Icon icon={Search} size={16} />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClear={onClear}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        placeholder={label}
        aria-label={label}
        inputClassName="h-11 rounded-xl"
      />
    </section>
  );
};

export interface FilterGroupSectionProps {
  filterGroup: NonNullable<V2TableToolbarConfig["filterGroup"]>;
}

export const FilterGroupSection: React.FC<FilterGroupSectionProps> = ({
  filterGroup,
}) => {
  const { t } = useV2Translation();
  return (
    <section className="flex flex-col gap-2">
      <V2Text as="h3" variant="label" color="muted" weight="semibold">
        {filterGroup.title ?? t("v2.table.filterGroupSectionTitle", "Nhóm lọc")}
      </V2Text>
      <div role="listbox" className="grid grid-cols-2 gap-2">
        {filterGroup.items.map((item) => {
          const active = item.key === filterGroup.activeKey;
          return (
            <V2Button
              key={item.key}
              type="button"
              role="option"
              aria-selected={active}
              variant="outline"
              onClick={() => filterGroup.onChange(item.key)}
              className={cn(
                "h-11 justify-between rounded-xl px-3 text-xs shadow-none",
                active
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary hover:bg-primary/15 hover:text-primary"
                  : "border-border/70 bg-card hover:bg-surface/80 text-foreground",
              )}
            >
              <V2Text as="span" variant="caption" truncate>
                {item.label}
              </V2Text>
              <div className="flex shrink-0 items-center gap-1">
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <V2Badge
                    variant={
                      active ? V2BadgeVariant.SECONDARY : V2BadgeVariant.OUTLINE
                    }
                    size={V2BadgeSize.XS}
                  >
                    {item.badgeCount}
                  </V2Badge>
                )}
                {active && <V2Icon icon={Check} size={14} />}
              </div>
            </V2Button>
          );
        })}
      </div>
    </section>
  );
};
