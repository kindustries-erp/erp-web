import { useMemo, useCallback, useEffect } from "react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export interface UseVoucherClientFilterProps<T> {
  tableId: string;
  lines: T[];
  getCode: (line: T) => string;
  getName: (line: T) => string;
  customSort?: (a: T, b: T, field: string, isDesc: boolean) => number | null;
  isOpen?: boolean;
}

export function useVoucherClientFilter<T>({
  tableId,
  lines,
  getCode,
  getName,
  customSort,
  isOpen,
}: UseVoucherClientFilterProps<T>) {
  const listHook = useTableColumnState(tableId);

  // Clear filters on open to keep state independent per document instance
  useEffect(() => {
    if (isOpen) {
      listHook.resetFilters();
    }
  }, [isOpen]);

  const getValue = useCallback(
    (line: T, field: string) => {
      if (field === "itemCode") return getCode(line);
      if (field === "itemName") return getName(line);
      return String((line as any)[field] ?? "");
    },
    [getCode, getName],
  );

  const buildFilterOptions = useCallback(
    (field: string, source: T[]) => {
      // Cascading filter logic: apply other filters before building options
      let filteredSource = source;

      filteredSource = filteredSource.filter((line) => {
        // Check exact match filters
        for (const f in listHook.columnFilters) {
          if (f === field) continue; // Skip the field we're building options for
          const filterVals = listHook.columnFilters[f] || [];
          if (filterVals.length === 0) continue;

          const val = getValue(line, f);
          if (!filterVals.includes(val)) return false;
        }

        // Check search filters
        for (const s in listHook.columnSearch) {
          if (s === field) continue; // Skip the field we're building options for
          const searchVal = listHook.columnSearch[s]?.toLowerCase();
          if (!searchVal) continue;

          const val = getValue(line, s);
          if (!val.toLowerCase().includes(searchVal)) return false;
        }

        return true;
      });

      const unique = new Set<string>();
      filteredSource.forEach((line) => {
        const val = getValue(line, field);
        if (val) unique.add(val);
      });

      const items = Array.from(unique)
        .filter(Boolean)
        .map((val) => ({ label: val, value: val }));
      return async () => ({ items, total: items.length, next: null });
    },
    [getValue, listHook.columnFilters, listHook.columnSearch],
  );

  const processedLines = useMemo(() => {
    let result = [...lines];

    result = result.filter((line) => {
      // Check search filters
      for (const s in listHook.columnSearch) {
        const searchVal = listHook.columnSearch[s]?.toLowerCase();
        if (!searchVal) continue;
        const val = getValue(line, s);
        if (!val.toLowerCase().includes(searchVal)) return false;
      }

      // Check exact match filters
      for (const f in listHook.columnFilters) {
        const filterVals = listHook.columnFilters[f] || [];
        if (filterVals.length === 0) continue;
        const val = getValue(line, f);
        if (!filterVals.includes(val)) return false;
      }

      return true;
    });

    if (listHook.sorts.length > 0) {
      const sort = listHook.sorts[0];
      const isDesc = sort.startsWith("-");
      const field = sort.replace("-", "");

      result.sort((a, b) => {
        if (customSort) {
          const customResult = customSort(a, b, field, isDesc);
          if (customResult !== null) return customResult;
        }

        const valA = getValue(a, field);
        const valB = getValue(b, field);
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    return result;
  }, [
    lines,
    listHook.columnFilters,
    listHook.columnSearch,
    listHook.sorts,
    getValue,
    customSort,
  ]);

  return {
    listHook,
    processedLines,
    buildFilterOptions,
  };
}
