import * as React from "react";
import { Check } from "lucide-react";
import { V2Icon } from "@/v2/shared/components/atoms/v2-icon";
import { V2Spinner } from "@/v2/shared/components/atoms/v2-spinner";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Tooltip } from "@/v2/shared/components/atoms/v2-tooltip/V2Tooltip";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ComboboxOption } from "./V2Combobox.type";

export interface V2ComboboxListProps {
  options: V2ComboboxOption[];
  value: string | null;
  activeIndex: number;
  loading?: boolean;
  isMobile?: boolean;
  emptyLabel: string;
  loadingText: string;
  onSelect: (option: V2ComboboxOption) => void;
  onHoverIndex: (index: number) => void;
  onScroll?: (e: React.UIEvent<HTMLUListElement>) => void;
}

export const V2ComboboxList: React.FC<V2ComboboxListProps> = ({
  options,
  value,
  activeIndex,
  loading = false,
  isMobile = false,
  emptyLabel,
  loadingText,
  onSelect,
  onHoverIndex,
  onScroll,
}) => (
  <ul
    role="listbox"
    aria-busy={loading}
    onScroll={onScroll}
    className={cn(
      "overflow-y-auto",
      isMobile ? "max-h-[55dvh] space-y-1" : "max-h-60",
    )}
  >
    {loading && (
      <li className="flex items-center justify-center gap-2 px-2 py-3 text-sm">
        <V2Spinner size="sm" />
        <V2Text color="muted" className="text-sm">
          {loadingText}
        </V2Text>
      </li>
    )}
    {!loading && options.length === 0 && (
      <li className="px-2 py-3 text-center text-sm">
        <V2Text color="muted" className="text-sm">
          {emptyLabel}
        </V2Text>
      </li>
    )}
    {options.map((option, index) => {
      const isSelected = option.value === value;
      const row = (
        <li
          key={option.value}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
          onMouseEnter={() => onHoverIndex(index)}
          onClick={() => onSelect(option)}
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-md",
            isMobile
              ? "min-h-[44px] rounded-xl px-3 py-2.5 text-base"
              : "px-2 py-1.5 text-sm",
            index === activeIndex && "bg-accent",
            isMobile && isSelected && "bg-primary/10 text-primary font-medium",
            option.disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <V2Icon
            icon={Check}
            size={16}
            className={cn("shrink-0", isSelected ? "opacity-100" : "opacity-0")}
          />
          <div className="min-w-0 flex-1">
            <V2Text
              as="span"
              variant={isMobile ? "body" : "body-sm"}
              truncate={!isMobile}
              className={cn(
                "block",
                isMobile && "whitespace-normal leading-snug",
                isMobile && isSelected && "text-primary font-medium",
              )}
            >
              {option.label}
            </V2Text>
            {option.description && (
              <V2Text
                color="muted"
                variant="body-sm"
                className={cn(
                  "block leading-tight",
                  isMobile ? "whitespace-normal mt-0.5" : "truncate",
                )}
              >
                {option.description}
              </V2Text>
            )}
            {isMobile && option.tooltip && (
              <div className="mt-0.5 whitespace-normal text-xs leading-snug text-muted-foreground">
                {option.tooltip}
              </div>
            )}
          </div>
        </li>
      );
      if (!option.tooltip) return row;
      return (
        <V2Tooltip
          key={option.value}
          content={option.tooltip}
          side="right"
          align="start"
          asChild
        >
          {row}
        </V2Tooltip>
      );
    })}
  </ul>
);
V2ComboboxList.displayName = "V2ComboboxList";
