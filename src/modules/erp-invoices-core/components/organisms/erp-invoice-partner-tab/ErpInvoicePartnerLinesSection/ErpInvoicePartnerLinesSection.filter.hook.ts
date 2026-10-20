import { useState, useCallback, useMemo } from "react";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useErpInvoicePartnerLinesFilter() {
  const [itemPage, setItemPage] = useState(1);
  const [itemPageSize, setItemPageSize] = useState<number>(getDefaultPageSize);
  const [itemSorts, setItemSorts] = useState<string[]>([]);
  const [itemDateFrom, setItemDateFrom] = useState<string>("");
  const [itemDateTo, setItemDateTo] = useState<string>("");
  const [itemColumnFilters, setItemColumnFilters] = useState<
    Record<string, string[]>
  >({});
  const [itemColumnSearch, setItemColumnSearchState] = useState<
    Record<string, string>
  >({});

  const setItemSort = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      setItemSorts((prev) => {
        const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
        if (state === "asc") return [...filtered, key];
        if (state === "desc") return [...filtered, `-${key}`];
        return filtered;
      });
      setItemPage(1);
    },
    [],
  );

  const setItemColumnFilter = useCallback((key: string, vals: string[]) => {
    setItemColumnFilters((prev) => {
      if (!vals || vals.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: vals };
    });
    setItemPage(1);
  }, []);

  const setItemColumnSearch = useCallback((key: string, val: string) => {
    setItemColumnSearchState((prev) => {
      if (!val || val.trim().length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: val };
    });
    setItemPage(1);
  }, []);

  const setItemDateRange = useCallback((from?: string, to?: string) => {
    setItemDateFrom(from || "");
    setItemDateTo(to || "");
    setItemPage(1);
  }, []);

  const itemActiveFilterCount = useMemo(() => {
    let count = 0;
    Object.values(itemColumnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(itemColumnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (itemDateFrom || itemDateTo) count += 1;
    return count;
  }, [itemColumnFilters, itemColumnSearch, itemDateFrom, itemDateTo]);

  const clearItemAllFilters = useCallback(() => {
    setItemColumnFilters({});
    setItemColumnSearchState({});
    setItemDateFrom("");
    setItemDateTo("");
    setItemPage(1);
  }, []);

  return {
    itemPage,
    setItemPage,
    itemPageSize,
    setItemPageSize,
    itemSorts,
    setItemSort,
    itemDateFrom,
    itemDateTo,
    setItemDateRange,
    itemColumnFilters,
    setItemColumnFilter,
    itemColumnSearch,
    setItemColumnSearch,
    itemActiveFilterCount,
    clearItemAllFilters,
  };
}
