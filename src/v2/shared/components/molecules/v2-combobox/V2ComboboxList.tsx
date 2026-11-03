import * as React from "react";
import { Check } from "lucide-react";
import { V2Spinner } from "@/v2/shared/components/atoms/v2-spinner";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ComboboxOption } from "./V2Combobox.type";

export interface V2ComboboxListProps {
  options: V2ComboboxOption[];
  value: string | null;
  activeIndex: number;
  loading?: boolean;
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
    className="max-h-60 overflow-y-auto"
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
      return (
        <li
          key={option.value}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
          onMouseEnter={() => onHoverIndex(index)}
          onClick={() => onSelect(option)}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
            index === activeIndex && "bg-accent",
            option.disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Check
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0",
              isSelected ? "opacity-100" : "opacity-0",
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{option.label}</span>
            {option.description && (
              <V2Text
                color="muted"
                variant="body-sm"
                className="block truncate leading-tight"
              >
                {option.description}
              </V2Text>
            )}
          </span>
        </li>
      );
    })}
  </ul>
);
V2ComboboxList.displayName = "V2ComboboxList";
