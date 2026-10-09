import { useCallback, useMemo, useState } from "react";
import type * as React from "react";
import { filterV2ComboboxOptions, nextEnabledIndex } from "./V2Combobox.helper";
import type { V2ComboboxOption } from "./V2Combobox.type";

interface UseV2ComboboxParams {
  options: V2ComboboxOption[];
  value: string | null;
  searchable: boolean;
  onValueChange: (value: string | null) => void;
}

export function useV2Combobox({
  options,
  value,
  searchable,
  onValueChange,
}: UseV2ComboboxParams) {
  const [open, setOpenState] = useState(false);
  const [query, setQueryState] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => filterV2ComboboxOptions(options, searchable ? query : ""),
    [options, query, searchable],
  );
  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      setQueryState("");
      if (next) {
        const index = options.findIndex((option) => option.value === value);
        setActiveIndex(Math.max(0, index));
      }
    },
    [options, value],
  );

  const setQuery = useCallback((text: string) => {
    setQueryState(text);
    setActiveIndex(0);
  }, []);

  const select = useCallback(
    (option: V2ComboboxOption) => {
      if (option.disabled) return;
      onValueChange(option.value);
      setOpen(false);
    },
    [onValueChange, setOpen],
  );

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
        if (option) select(option);
      }
    },
    [filtered, activeIndex, select],
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
    select,
    onKeyDown,
  };
}
