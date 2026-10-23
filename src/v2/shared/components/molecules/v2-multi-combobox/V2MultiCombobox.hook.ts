import { useCallback, useMemo, useState } from "react";
import type * as React from "react";
import {
  filterV2ComboboxOptions,
  nextEnabledIndex,
} from "../v2-combobox/V2Combobox.helper";
import type { V2ComboboxOption } from "../v2-combobox/V2Combobox.type";

interface UseV2MultiComboboxParams {
  options: V2ComboboxOption[];
  value: string[];
  searchable: boolean;
  onValueChange: (value: string[]) => void;
}

export function useV2MultiCombobox({
  options,
  value,
  searchable,
  onValueChange,
}: UseV2MultiComboboxParams) {
  const [open, setOpenState] = useState(false);
  const [query, setQueryState] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => filterV2ComboboxOptions(options, searchable ? query : ""),
    [options, query, searchable],
  );
  const selected = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    setQueryState("");
    setActiveIndex(0);
  }, []);

  const setQuery = useCallback((text: string) => {
    setQueryState(text);
    setActiveIndex(0);
  }, []);

  const toggle = useCallback(
    (option: V2ComboboxOption) => {
      if (option.disabled) return;
      const next = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value];
      onValueChange(next);
    },
    [value, onValueChange],
  );

  const clear = useCallback(() => onValueChange([]), [onValueChange]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => nextEnabledIndex(filtered, i, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => nextEnabledIndex(filtered, i, -1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) toggle(option);
      }
    },
    [filtered, activeIndex, toggle],
  );

  return {
    open,
    setOpen,
    query,
    setQuery,
    filtered,
    selected,
    activeIndex,
    setActiveIndex,
    toggle,
    clear,
    onKeyDown,
  };
}
