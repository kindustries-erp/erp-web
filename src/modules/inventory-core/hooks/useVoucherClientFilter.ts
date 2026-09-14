import { useState, useMemo, useCallback, useEffect } from "react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { getDefaultPageSize } from "@/shared/components/DataTable";
import {
  evaluateTextFilter,
  evaluateNumberFilter,
} from "@/shared/components/DataTable/createColumnHeaderFilter";
import {
  NumberFilterOperator,
  TextFilterOperator,
} from "@/shared/components/DataTable/types";
import { fmtQty } from "@/shared/utils/format";

export interface UseVoucherClientFilterProps<T> {
  tableId: string;
  lines: T[];
  getCode: (line: T) => string;
  getName: (line: T) => string;
  customExtractors?: Record<string, (line: T) => any>;
  customSort?: (a: T, b: T, field: string, isDesc: boolean) => number | null;
  isOpen?: boolean;
}

export function matchNumericFilter(
  rawVal: any,
  searchVal: string,
  operator?: NumberFilterOperator,
): boolean {
  if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
    return false;
  }
  const cleanSearch = searchVal.trim();
  if (!cleanSearch) return true;

  // Multi-value search separated by semicolon: e.g. "250; 500"
  const keywords = cleanSearch
    .split(";")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywords.length > 1) {
    return keywords.some((kw) => matchNumericFilter(rawVal, kw, operator));
  }

  const num =
    typeof rawVal === "number"
      ? rawVal
      : Number(String(rawVal).replace(/[^0-9.-]+/g, ""));

  if (Number.isNaN(num)) {
    return String(rawVal).toLowerCase().includes(cleanSearch.toLowerCase());
  }

  // Check inline comparison operators
  if (cleanSearch.startsWith(">=")) {
    const target = Number(cleanSearch.slice(2).trim().replace(/,/g, "."));
    return !Number.isNaN(target) ? num >= target : true;
  }
  if (cleanSearch.startsWith("<=")) {
    const target = Number(cleanSearch.slice(2).trim().replace(/,/g, "."));
    return !Number.isNaN(target) ? num <= target : true;
  }
  if (cleanSearch.startsWith(">")) {
    const target = Number(cleanSearch.slice(1).trim().replace(/,/g, "."));
    return !Number.isNaN(target) ? num > target : true;
  }
  if (cleanSearch.startsWith("<")) {
    const target = Number(cleanSearch.slice(1).trim().replace(/,/g, "."));
    return !Number.isNaN(target) ? num < target : true;
  }
  if (cleanSearch.startsWith("!=") || cleanSearch.startsWith("<>")) {
    const target = Number(
      cleanSearch
        .replace(/^(!=|<>)/, "")
        .trim()
        .replace(/,/g, "."),
    );
    return !Number.isNaN(target) ? num !== target : true;
  }
  if (cleanSearch.startsWith("=")) {
    const target = Number(cleanSearch.slice(1).trim().replace(/,/g, "."));
    return !Number.isNaN(target) ? num === target : true;
  }

  // Check range "A..B" or "A - B"
  if (cleanSearch.includes("..")) {
    const [minStr, maxStr] = cleanSearch.split("..");
    const min = Number(minStr.trim().replace(/,/g, "."));
    const max = Number(maxStr.trim().replace(/,/g, "."));
    const hasMin = !Number.isNaN(min) && minStr.trim() !== "";
    const hasMax = !Number.isNaN(max) && maxStr.trim() !== "";
    if (hasMin && hasMax) return num >= min && num <= max;
    if (hasMin) return num >= min;
    if (hasMax) return num <= max;
    return true;
  }

  // Check if explicit operator is set from UI dropdown
  if (operator) {
    return evaluateNumberFilter(num, cleanSearch, operator);
  }

  // Default behavior when user types plain number/text:
  // 1. Exact numeric equality (e.g. typing "250" matches 250.000)
  const targetNum = Number(cleanSearch.replace(/,/g, "."));
  if (!Number.isNaN(targetNum) && num === targetNum) {
    return true;
  }

  // 2. Substring matching on raw string or formatted number (e.g. typing "25" matches "250,00")
  const strVal = String(rawVal).toLowerCase();
  const formattedVal = fmtQty(num).toLowerCase();
  const kwLower = cleanSearch.toLowerCase();

  return strVal.includes(kwLower) || formattedVal.includes(kwLower);
}

export function useVoucherClientFilter<T>({
  tableId,
  lines,
  getCode,
  getName,
  customExtractors,
  customSort,
  isOpen,
}: UseVoucherClientFilterProps<T>) {
  const listHook = useTableColumnState(tableId);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);

  // Clear filters & reset page on open to keep state independent per document instance
  useEffect(() => {
    if (isOpen) {
      listHook.resetFilters();
      setPage(1);
    }
  }, [isOpen]);

  // Reset to page 1 whenever filters, search, or sorts change
  useEffect(() => {
    setPage(1);
  }, [listHook.columnFilters, listHook.columnSearch, listHook.sorts]);

  const getValue = useCallback(
    (line: T, field: string) => {
      if (customExtractors?.[field]) {
        return customExtractors[field](line);
      }
      if (field === "itemCode" || field === "item_code") return getCode(line);
      if (field === "itemName") return getName(line);

      const l = line as any;
      if (field === "ordered" || field === "qtyOrdered") {
        const val = l.qtyOrdered ?? l.ordered;
        return val !== undefined && val !== null ? String(val) : "";
      }
      if (field === "remaining") {
        const ord = Number(l.qtyOrdered ?? l.ordered ?? 0);
        const rec = Number(l.qtyReceived ?? l.qtyInput ?? 0);
        return String(Math.max(0, ord - rec));
      }
      if (
        field === "qtyInput" ||
        field === "qtyReceived" ||
        field === "qtyIssued" ||
        field === "qtyAdjusted"
      ) {
        const val =
          l[field] ??
          l.qtyReceived ??
          l.qtyIssued ??
          l.qtyAdjusted ??
          l.qtyInput;
        return val !== undefined && val !== null ? String(val) : "";
      }
      if (field === "serials" || field === "tracking") {
        if (Array.isArray(l.declaredSerials)) {
          return l.declaredSerials.length > 0
            ? `${l.declaredSerials.length} serial`
            : "";
        }
        if (l.serialId) return String(l.serialId);
      }

      const raw = l?.[field];
      return raw !== undefined && raw !== null ? String(raw) : "";
    },
    [getCode, getName, customExtractors],
  );

  const isNumericField = useCallback((field: string) => {
    const f = field.toLowerCase();
    return (
      f === "ordered" ||
      f === "remaining" ||
      f === "qtyinput" ||
      f === "qtyreceived" ||
      f === "qtyissued" ||
      f === "qtyadjusted" ||
      f.includes("qty") ||
      f.includes("price") ||
      f.includes("amount") ||
      f.includes("cost")
    );
  }, []);

  const buildFilterOptions = useCallback(
    (field: string, source: T[] = lines) => {
      return async ({ search: optionSearch }: { search?: string } = {}) => {
        // Cascading filter logic: apply other filters before building options
        let filteredSource = source;

        filteredSource = filteredSource.filter((line) => {
          // Check exact match filters
          for (const f in listHook.columnFilters) {
            if (f === field) continue;
            const filterVals = listHook.columnFilters[f] || [];
            if (filterVals.length === 0) continue;

            const val = String(getValue(line, f) ?? "");
            if (filterVals.includes("__BLANK__") && (!val || val === "")) {
              continue;
            }
            if (!filterVals.includes(val)) return false;
          }

          // Check search filters
          for (const s in listHook.columnSearch) {
            if (s === field) continue;
            const searchVal = listHook.columnSearch[s]?.trim();
            if (!searchVal) continue;

            const val = getValue(line, s);
            const operator = (listHook as any).columnOperators?.[s];

            if (isNumericField(s)) {
              if (
                !matchNumericFilter(
                  val,
                  searchVal,
                  operator as NumberFilterOperator,
                )
              ) {
                return false;
              }
            } else {
              if (
                !evaluateTextFilter(
                  String(val ?? ""),
                  searchVal,
                  (operator as TextFilterOperator) ||
                    TextFilterOperator.CONTAINS,
                )
              ) {
                return false;
              }
            }
          }

          return true;
        });

        const unique = new Set<string>();
        filteredSource.forEach((line) => {
          const val = getValue(line, field);
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            unique.add(String(val));
          }
        });

        const isNum = isNumericField(field);
        let items = Array.from(unique)
          .filter(Boolean)
          .map((val) => ({
            label: isNum && !isNaN(Number(val)) ? fmtQty(Number(val)) : val,
            value: val,
          }));

        if (isNum) {
          items.sort((a, b) => Number(a.value) - Number(b.value));
        } else {
          items.sort((a, b) => a.label.localeCompare(b.label, "vi-VN"));
        }

        if (optionSearch && optionSearch.trim()) {
          const kw = optionSearch.trim().toLowerCase();
          items = items.filter(
            (it) =>
              it.label.toLowerCase().includes(kw) ||
              it.value.toLowerCase().includes(kw),
          );
        }

        return { items, total: items.length, next: null };
      };
    },
    [getValue, listHook.columnFilters, listHook.columnSearch, isNumericField],
  );

  const processedLines = useMemo(() => {
    let result = [...lines];

    // 1. Filter by columnSearch
    if (listHook.columnSearch) {
      Object.entries(listHook.columnSearch).forEach(([colKey, search]) => {
        if (!search || search.trim() === "") return;
        const searchVal = search.trim();
        const operator = (listHook as any).columnOperators?.[colKey];
        const isNum = isNumericField(colKey);

        result = result.filter((line) => {
          const val = getValue(line, colKey);

          if (isNum) {
            return matchNumericFilter(
              val,
              searchVal,
              operator as NumberFilterOperator,
            );
          }

          if (operator && operator !== TextFilterOperator.CONTAINS) {
            return evaluateTextFilter(
              String(val ?? ""),
              searchVal,
              operator as TextFilterOperator,
            );
          }

          // Multi-keyword and exact search support
          const keywords = searchVal
            .split(";")
            .map((k) => k.trim())
            .filter(Boolean);
          if (keywords.length === 0) return true;

          const strVal = String(val ?? "").toLowerCase();
          return keywords.some((kw) => {
            let isExact = false;
            let cleanKw = kw;
            if (kw.startsWith('"') && kw.endsWith('"') && kw.length >= 2) {
              isExact = true;
              cleanKw = kw.slice(1, -1);
            }
            const kwLower = cleanKw.toLowerCase();
            return isExact ? strVal === kwLower : strVal.includes(kwLower);
          });
        });
      });
    }

    // 2. Filter by columnFilters (Dropdown selection)
    if (listHook.columnFilters) {
      Object.entries(listHook.columnFilters).forEach(([colKey, selected]) => {
        if (selected && selected.length > 0) {
          const isNum = isNumericField(colKey);
          result = result.filter((line) => {
            const rawVal = getValue(line, colKey);
            const val = String(rawVal ?? "");

            if (selected.includes("__ALL_MATCHING__")) {
              const searchPart = selected[1]
                ? String(selected[1]).toLowerCase().trim()
                : "";
              if (!searchPart) return true;
              return val.toLowerCase().includes(searchPart);
            }
            if (selected.includes("__BLANK__") && (!val || val === "")) {
              return true;
            }
            if (selected.includes(val)) {
              return true;
            }
            if (isNum && val !== "") {
              const numVal = Number(val);
              return selected.some(
                (s) => !isNaN(Number(s)) && Number(s) === numVal,
              );
            }
            return false;
          });
        }
      });
    }

    // 3. Sort by sorts
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

        if (isNumericField(field)) {
          const numA = Number(valA || 0);
          const numB = Number(valB || 0);
          return isDesc ? numB - numA : numA - numB;
        }

        const strA = String(valA ?? "");
        const strB = String(valB ?? "");
        return isDesc
          ? strB.localeCompare(strA, "vi-VN")
          : strA.localeCompare(strB, "vi-VN");
      });
    }

    return result;
  }, [
    lines,
    listHook.columnFilters,
    listHook.columnSearch,
    listHook.sorts,
    getValue,
    isNumericField,
    customSort,
  ]);

  const total = processedLines.length;
  const totalPages = Math.max(1, Math.ceil(total / (pageSize || 20)));

  const paginatedLines = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedLines.slice(start, start + pageSize);
  }, [processedLines, page, pageSize]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  const handlePageSizeChange = useCallback((ps: number) => {
    setPageSize(ps);
    setPage(1);
  }, []);

  return {
    listHook,
    processedLines,
    paginatedLines,
    page,
    pageSize,
    total,
    totalPages,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    buildFilterOptions,
  };
}
