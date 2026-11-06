import * as React from "react";
import type { V2MultiSelectOption } from "./V2MultiSelect.type";

interface UseV2MultiSelectParams {
  options: V2MultiSelectOption[];
  value: string[];
  onValueChange?: (value: string[]) => void;
  onChange?: (value: string[]) => void;
}

export function useV2MultiSelect({
  options,
  value,
  onValueChange,
  onChange,
}: UseV2MultiSelectParams) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commitChange = React.useCallback(
    (nextValue: string[]) => {
      onValueChange?.(nextValue);
      onChange?.(nextValue);
    },
    [onValueChange, onChange],
  );

  const selected = React.useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [options, query]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const toggle = React.useCallback(
    (optValue: string) => {
      const exists = value.includes(optValue);
      const next = exists
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      commitChange(next);
    },
    [value, commitChange],
  );

  const removeTag = React.useCallback(
    (optValue: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const next = value.filter((v) => v !== optValue);
      commitChange(next);
    },
    [value, commitChange],
  );

  const clearAll = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      commitChange([]);
    },
    [commitChange],
  );

  return {
    open,
    setOpen,
    query,
    setQuery,
    inputRef,
    selected,
    filtered,
    toggle,
    removeTag,
    clearAll,
  };
}
