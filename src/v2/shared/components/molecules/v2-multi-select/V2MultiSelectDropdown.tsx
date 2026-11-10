import * as React from "react";
import { Check, Search } from "lucide-react";
import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2MultiSelectOption } from "./V2MultiSelect.type";

export interface V2MultiSelectDropdownProps {
  searchable?: boolean;
  searchHint: string;
  emptyText: string;
  query: string;
  setQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  filtered: V2MultiSelectOption[];
  value: string[];
  toggle: (v: string) => void;
  clearable?: boolean;
  clearAll: (e?: React.MouseEvent) => void;
}

export const V2MultiSelectDropdown: React.FC<V2MultiSelectDropdownProps> = ({
  searchable,
  searchHint,
  emptyText,
  query,
  setQuery,
  inputRef,
  filtered,
  value,
  toggle,
  clearable,
  clearAll,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="flex flex-col max-h-[280px] w-full min-w-[240px]">
      {searchable && (
        <div className="p-2 border-b border-border shrink-0 bg-surface">
          <V2Input
            ref={inputRef}
            sizeVariant="xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchHint}
            leftIcon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
            clearable
            onClear={() => setQuery("")}
            className="w-full bg-transparent"
          />
        </div>
      )}

      <div className="overflow-y-auto flex-1 p-1 space-y-0.5" role="listbox">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <V2Text variant="body-sm" color="muted">
              {emptyText}
            </V2Text>
          </div>
        ) : (
          filtered.map((o) => {
            const checked = value.includes(o.value);
            return (
              <V2Button
                key={o.value}
                type="button"
                role="option"
                variant="ghost"
                fullWidth
                aria-selected={checked}
                disabled={o.disabled}
                onClick={() => !o.disabled && toggle(o.value)}
                className={cn(
                  "justify-start h-auto px-2.5 py-1.5 text-xs rounded-md font-normal gap-2 select-none",
                  checked
                    ? "bg-primary/10 text-foreground font-medium hover:bg-primary/15"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-background",
                  )}
                >
                  {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                </div>
                {o.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {o.icon}
                  </span>
                )}
                <V2Text
                  variant="body-sm"
                  className="min-w-0 flex-1 truncate text-inherit"
                >
                  {o.label}
                </V2Text>
                {o.description && (
                  <V2Badge
                    variant={V2BadgeVariant.SECONDARY}
                    size={V2BadgeSize.XS}
                    className="shrink-0 font-normal"
                  >
                    {o.description}
                  </V2Badge>
                )}
              </V2Button>
            );
          })
        )}
      </div>

      {clearable && value.length > 0 && (
        <div className="shrink-0 border-t border-border px-3 py-1.5 flex justify-between items-center bg-surface">
          <V2Text variant="caption" color="muted">
            {t("v2.multiSelect.selectedCount", {
              count: value.length,
              defaultValue: `${value.length} đã chọn`,
            })}
          </V2Text>
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearAll}
            className="h-auto p-0 text-[11px] text-muted-foreground hover:text-destructive hover:bg-transparent font-medium"
          >
            {t("v2.multiSelect.clearAll", "Xóa hết")}
          </V2Button>
        </div>
      )}
    </div>
  );
};
