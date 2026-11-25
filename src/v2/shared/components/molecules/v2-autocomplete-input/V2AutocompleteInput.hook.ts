import * as React from "react";
import {
  filterV2ComboboxOptions,
  nextEnabledIndex,
} from "../v2-combobox/V2Combobox.helper";
import type { V2ComboboxOption } from "../v2-combobox/V2Combobox.type";

export interface UseV2AutocompleteInputParams {
  value: string;
  options: V2ComboboxOption[];
  maxSuggestions: number;
  onChange: (text: string) => void;
  onSelect: (option: V2ComboboxOption) => void;
  onSearchChange?: (query: string) => void;
}

/** State ô gợi ý: mở khi gõ/focus, lọc theo chữ, phím ↑↓ Enter Esc. */
export function useV2AutocompleteInput({
  value,
  options,
  maxSuggestions,
  onChange,
  onSelect,
  onSearchChange,
}: UseV2AutocompleteInputParams) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const suggestions = React.useMemo(
    () => filterV2ComboboxOptions(options, value).slice(0, maxSuggestions),
    [options, value, maxSuggestions],
  );

  const type = (text: string) => {
    onChange(text);
    onSearchChange?.(text);
    setActiveIndex(-1);
    setOpen(true);
  };
  const pick = (option: V2ComboboxOption) => {
    if (option.disabled) return;
    onSelect(option);
    setOpen(false);
    setActiveIndex(-1);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) =>
        nextEnabledIndex(suggestions, i, e.key === "ArrowDown" ? 1 : -1),
      );
    } else if (e.key === "Enter" && open && suggestions[activeIndex]) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return {
    open: open && suggestions.length > 0,
    setOpen,
    suggestions,
    activeIndex,
    setActiveIndex,
    type,
    pick,
    onKeyDown,
  };
}
