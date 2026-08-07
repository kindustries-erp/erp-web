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

  const buildFilterOptions = useCallback(
    (field: "itemCode" | "itemName", source: T[]) => {
      // Cascading filter logic: apply other filters before building options
      let filteredSource = source;
      const filterItemCode = listHook.columnFilters["itemCode"] || [];
      const filterItemName = listHook.columnFilters["itemName"] || [];
      const searchItemCode =
        listHook.columnSearch["itemCode"]?.toLowerCase() || "";
      const searchItemName =
        listHook.columnSearch["itemName"]?.toLowerCase() || "";

      filteredSource = filteredSource.filter((line) => {
        const code = getCode(line);
        const name = getName(line);

        if (field !== "itemCode") {
          if (searchItemCode && !code.toLowerCase().includes(searchItemCode))
            return false;
          if (filterItemCode.length > 0 && !filterItemCode.includes(code))
            return false;
        }
        if (field !== "itemName") {
          if (searchItemName && !name.toLowerCase().includes(searchItemName))
            return false;
          if (filterItemName.length > 0 && !filterItemName.includes(name))
            return false;
        }
        return true;
      });

      const unique = new Set<string>();
      filteredSource.forEach((line) => {
        if (field === "itemCode") {
          const code = getCode(line);
          if (code) unique.add(code);
        } else {
          const name = getName(line);
          if (name) unique.add(name);
        }
      });
      const items = Array.from(unique)
        .filter(Boolean)
        .map((val) => ({ label: val, value: val }));
      return async () => ({ items, total: items.length, next: null });
    },
    [getCode, getName, listHook.columnFilters, listHook.columnSearch],
  );

  const processedLines = useMemo(() => {
    let result = [...lines];

    const searchItemCode =
      listHook.columnSearch["itemCode"]?.toLowerCase() || "";
    const searchItemName =
      listHook.columnSearch["itemName"]?.toLowerCase() || "";
    const filterItemCode = listHook.columnFilters["itemCode"] || [];
    const filterItemName = listHook.columnFilters["itemName"] || [];

    result = result.filter((line) => {
      const code = getCode(line);
      const name = getName(line);

      if (searchItemCode && !code.toLowerCase().includes(searchItemCode))
        return false;
      if (searchItemName && !name.toLowerCase().includes(searchItemName))
        return false;
      if (filterItemCode.length > 0 && !filterItemCode.includes(code))
        return false;
      if (filterItemName.length > 0 && !filterItemName.includes(name))
        return false;
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

        if (field === "itemCode") {
          const valA = getCode(a);
          const valB = getCode(b);
          return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        if (field === "itemName") {
          const valA = getName(a);
          const valB = getName(b);
          return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return 0;
      });
    }

    return result;
  }, [
    lines,
    listHook.columnFilters,
    listHook.columnSearch,
    listHook.sorts,
    getCode,
    getName,
    customSort,
  ]);

  return {
    listHook,
    processedLines,
    buildFilterOptions,
  };
}
